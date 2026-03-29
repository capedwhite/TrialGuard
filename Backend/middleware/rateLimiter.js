const rateLimit = require('express-rate-limit');

// ── Auth rate limiter ─────────────────────────────────────────────
// Stricter — prevents brute force attacks on login/register.
// 10 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts, please try again later',
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
});

// ── API rate limiter ──────────────────────────────────────────────
// More lenient — normal usage shouldn't hit this.
// 100 requests per 15 minutes per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };