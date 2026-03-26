const cron = require('node-cron');
const db = require('../config/database');
const { reminderQueue } = require('./reminderJob');

const startScheduler = () => {
  // Runs every hour — 0 * * * *
  // Checks for trials ending in the next 3 days
  cron.schedule('0 * * * *', async () => {
    console.log('Running reminder scheduler...');

    try {
      // Find all active subscriptions ending within 3 days
      const upcoming = await db('subscriptions')
        .join('users', 'subscriptions.user_id', 'users.id')
        .join('notifications', 'subscriptions.id', 'notifications.subscription_id')
        .where('subscriptions.status', 'active')
        .where('notifications.sent_status', false)
        .whereBetween('subscriptions.trial_end', [
          db.fn.now(),
          db.raw("NOW() + INTERVAL '3 days'"),
        ])
        .select(
          'subscriptions.id as subscriptionId',
          'subscriptions.service_name as serviceName',
          'subscriptions.trial_end as trialEnd',
          'subscriptions.price_after_trial as priceAfterTrial',
          'subscriptions.user_id as userId',
          'users.email as userEmail',
          'notifications.id as notificationId'
        );

      // Add each result as a job to the BullMQ queue
      for (const sub of upcoming) {
        await reminderQueue.add('send-reminder', sub, {
          // Deduplicate — if this job is already in the queue
          // don't add it again. jobId based on notificationId ensures
          // exactly one job per notification ever exists in the queue.
          jobId: `reminder-${sub.notificationId}`,
        });

        console.log(`Queued reminder for ${sub.serviceName} → ${sub.userEmail}`);
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });

  console.log('Reminder scheduler started');
};

module.exports = { startScheduler };