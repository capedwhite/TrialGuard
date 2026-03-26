const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendTrialReminder = async ({ to, serviceName, trialEnd, priceAfterTrial }) => {
  const formattedDate = new Date(trialEnd).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPrice = priceAfterTrial
    ? `$${parseFloat(priceAfterTrial).toFixed(2)}/month`
    : 'unknown';

  const { data, error } = await resend.emails.send({
    from: 'TrialGuard <onboarding@resend.dev>', // swap for your domain in production
    to,
    subject: `⚠️ Your ${serviceName} trial ends on ${formattedDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your ${serviceName} trial is ending soon</h2>
        <p>Just a heads up — your free trial ends on <strong>${formattedDate}</strong>.</p>
        <p>After that you'll be charged <strong>${formattedPrice}</strong> unless you cancel.</p>
        <p>
          If you don't want to be charged, make sure to cancel before the trial ends.
        </p>
        <hr />
        <p style="color: #888; font-size: 12px;">
          You're receiving this because you added ${serviceName} to TrialGuard.
        </p>
      </div>
    `,
  });

  if (error) {
    // Throw so BullMQ knows the job failed and should retry
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

module.exports = { sendTrialReminder };