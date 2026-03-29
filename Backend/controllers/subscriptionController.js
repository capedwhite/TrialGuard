const db = require("../config/database");
const { redis } = require("../config/redis");

// ── Cache key helper ──────────────────────────────────────────────
// Centralised so the key format never drifts between get/invalidate.
// If you change the pattern, you change it in one place.
const cacheKey = (userId) => `subscriptions:user:${userId}`;
const notificationCacheKey = (userId) => `notifications:user:${userId}`;

// ── Helper: Create/update notifications based on preferences ───────
// Deletes old unsent notifications and creates new ones based on trial_end
// and user's notification preferences (days before the trial ends).
const updateNotifications = async (
  subscriptionId,
  userId,
  trialEnd,
  preferences = { 1: true, 3: true, 7: true, 14: false },
) => {
  try {
    // Delete all UNSENT notifications for this subscription.
    // Sent ones stay — we don't want to erase the audit trail.
    await db("notifications")
      .where({ subscription_id: subscriptionId, sent_status: false })
      .delete();

    // Create new notifications for each enabled preference.
    // Calculate reminder_date by subtracting days from trial_end.
    const trialEndDate = new Date(trialEnd);
    const notificationsToCreate = [];

    Object.entries(preferences).forEach(([days, isEnabled]) => {
      if (isEnabled) {
        const reminderDate = new Date(trialEndDate);
        reminderDate.setDate(reminderDate.getDate() - parseInt(days));

        notificationsToCreate.push({
          subscription_id: subscriptionId,
          user_id: userId,
          reminder_date: reminderDate,
          sent_status: false,
          created_at: new Date(),
        });
      }
    });

    // Batch insert all notifications at once — more efficient than looping
    if (notificationsToCreate.length > 0) {
      await db("notifications").insert(notificationsToCreate);
    }

    // Invalidate notification cache so fresh data is fetched
    await redis.del(notificationCacheKey(userId));
  } catch (err) {
    console.error("Error updating notifications:", err);
    throw err;
  }
};

// ── GET all subscriptions (paginated + cached) ────────────────────
const getSubscriptions = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const key = cacheKey(userId);

    // Cache-aside pattern:
    // 1. Check Redis first
    // 2. On hit — return cached data, skip Postgres entirely
    // 3. On miss — query Postgres, store in Redis, return data
    const cached = await redis.get(key);
    console.log("the cached data:", cached);
    if (cached) {
      const result = JSON.parse(cached);
      return res.status(200).json({
        success: true,
        source: "cache",
        ...result,
      });
    }

    // Postgres query — only runs on cache miss
    const [subscriptions, total] = await Promise.all([
      db("subscriptions")
        .where({ user_id: userId })
        .orderBy("trial_end", "asc") // soonest expiring first — most useful order
        .limit(limit)
        .offset(offset),
      db("subscriptions")
        .where({ user_id: userId })
        .count("id as count")
        .first(),
    ]);

    const result = {
      subscriptions,
      pagination: {
        page,
        limit,
        total: parseInt(total.count),
        totalPages: Math.ceil(parseInt(total.count) / limit),
      },
    };

    // Store in Redis with 5 minute TTL.
    // 'EX' = expiry in seconds. After 5 min Redis auto-deletes it.
    await redis.set(key, JSON.stringify(result), "EX", 300);

    return res.status(200).json({
      success: true,
      source: "database",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// ── CREATE subscription ───────────────────────────────────────────
const createSubscription = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { service_name, trial_start, trial_end, price_after_trial } =
      req.validatedData;

    const [subscription] = await db("subscriptions")
      .insert({
        user_id: userId,
        service_name,
        trial_start,
        trial_end,
        price_after_trial,
        status: "active",
      })
      .returning("*");

    // Create default notifications (1, 3, 7 days before)
    const defaultPreferences = { 1: true, 3: true, 7: true, 14: false };
    await updateNotifications(
      subscription.id,
      userId,
      trial_end,
      defaultPreferences,
    );

    // Invalidate cache — data has changed so cached version is stale.
    // Next GET will miss cache and fetch fresh data from Postgres.
    await redis.del(cacheKey(userId));

    return res.status(201).json({
      success: true,
      message: "Subscription created",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE subscription ───────────────────────────────────────────
const updateSubscription = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { notificationPreferences, ...updates } = req.body;

    // Fetch first to confirm it exists AND belongs to this user.
    // Never trust the client to only send their own IDs — always
    // verify ownership in the DB query itself.
    const existing = await db("subscriptions")
      .where({ id, user_id: userId })
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // ── Audit log ─────────────────────────────────────────────────
    // If status is changing, record it in subscription_history.
    // This is the production pattern — never lose the trail of what changed.
    if (updates.status && updates.status !== existing.status) {
      await db("subscription_history").insert({
        subscription_id: id,
        old_status: existing.status,
        new_status: updates.status,
      });
    }

    const [updated] = await db("subscriptions")
      .where({ id, user_id: userId })
      .update({ ...updates, updated_at: new Date() })
      .returning("*");

    // If trial_end changed or notificationPreferences provided, recalculate notifications
    if (
      (updates.trial_end && updates.trial_end !== existing.trial_end) ||
      notificationPreferences
    ) {
      const trialEndToUse = updates.trial_end || existing.trial_end;
      const prefsToUse = notificationPreferences || {
        1: true,
        3: true,
        7: true,
        14: false,
      };
      await updateNotifications(id, userId, trialEndToUse, prefsToUse);
    }

    // Invalidate cache
    await redis.del(cacheKey(userId));

    return res.status(200).json({
      success: true,
      message: "Subscription updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE subscription ───────────────────────────────────────────
const deleteSubscription = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    // Check ownership before deleting — same pattern as update.
    const existing = await db("subscriptions")
      .where({ id, user_id: userId })
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    await db("subscriptions").where({ id, user_id: userId }).delete();

    // Invalidate cache
    await redis.del(cacheKey(userId));

    return res.status(200).json({
      success: true,
      message: "Subscription deleted",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
