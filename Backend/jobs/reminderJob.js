const { Worker, Queue } = require('bullmq');

const db = require('../config/database');
const { sendTrialReminder } = require('../services/emailService');
const { bullMQRedis } = require('../config/redis');

// ── Queue ─────────────────────────────────────────────────────────
// The queue is the list of pending jobs stored in Redis.
// Any part of the app can add jobs to this queue.
const reminderQueue = new Queue('reminders', {
  connection: bullMQRedis,
});

// ── Worker ────────────────────────────────────────────────────────
// The worker listens to the queue and processes jobs one by one.
// It runs in the background — completely decoupled from your HTTP server.
const reminderWorker = new Worker(
  'reminders',
  async (job) => {
    const { userId, subscriptionId, serviceName, trialEnd, priceAfterTrial, userEmail } = job.data;

    // Send the email
    await sendTrialReminder({
      to: userEmail,
      serviceName,
      trialEnd,
      priceAfterTrial,
    });

    // Mark notification as sent — idempotency flag.
    // Even if the cron runs again before TTL expires,
    // sent_status=true means this job will never be queued again.
    await db('notifications')
      .where({ subscription_id: subscriptionId, sent_status: false })
      .update({ sent_status: true, sent_at: new Date() });

    console.log(`Reminder sent for ${serviceName} to ${userEmail}`);
  },
  {
    connection: bullMQRedis,
    // Retry config — if job fails, wait before retrying.
    // Exponential backoff: 30s → 2min → 10min
    // Prevents hammering Resend API if it's temporarily down.
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000, // 30 seconds base delay
    },
  }
);

// ── Worker event handlers ─────────────────────────────────────────
reminderWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed after all retries:`, err.message);
});

module.exports = { reminderQueue };