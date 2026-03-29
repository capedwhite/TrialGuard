const db = require('../config/database');
const { redis } = require('../config/redis');

const cacheKey = (userId) => `notifications:user:${userId}`;

const getNotifications = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const key = cacheKey(userId);

    // Cache-aside — same pattern as subscriptions
    const cached = await redis.get(key);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: JSON.parse(cached),
      });
    }

    const notifications = await db('notifications')
      .join('subscriptions', 'notifications.subscription_id', 'subscriptions.id')
      .where('notifications.user_id', userId)
      .orderBy('notifications.reminder_date', 'desc')
      .select(
        'notifications.id',
        'notifications.reminder_date',
        'notifications.sent_status',
        'notifications.sent_at',
        'subscriptions.service_name',
        'subscriptions.trial_end',
        'subscriptions.status as subscription_status'
      );

    await redis.set(key, JSON.stringify(notifications), 'EX', 300);

    return res.status(200).json({
      success: true,
      source: 'database',
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications };