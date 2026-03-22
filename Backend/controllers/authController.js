const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ── Cookie config ─────────────────────────────────────────────────
// Centralised so every auth action uses identical cookie settings.
// Never drift between login and logout cookie options.
const cookieOptions = {
  httpOnly: true,      // JS cannot read this cookie — XSS protection
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'strict',  // Never sent on cross-site requests — CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// ── Register ──────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;

    // Check if email already exists before trying to insert.
    // Gives a clean error instead of a raw DB constraint violation.
    const existing = await db('users').where({ email }).first();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // bcrypt cost factor 12 — high enough to be slow for attackers,
    // fast enough for real users. Never store plain or md5 passwords.
    const password_hash = await bcrypt.hash(password, 12);

    const [user] = await db('users')
      .insert({ email, password_hash })
      .returning(['id', 'email', 'created_at']);

    // Sign JWT with user id + email as payload.
    // Keep payload minimal — it's base64 encoded, not encrypted.
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    // Pass to global error handler — never swallow errors silently
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;

    const user = await db('users').where({ email }).first();

    // Compare against hash — bcrypt handles timing-safe comparison
    // internally. Never do plain string comparison on passwords.
    // Deliberately vague error message — don't tell attackers which
    // field was wrong (email vs password enumeration attack).
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────
const logout = (req, res) => {
  // Overwrite the cookie with an identical name but maxAge=0.
  // This tells the browser to delete it immediately.
  // There's no server-side session to destroy — JWT is stateless.
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ── Me ────────────────────────────────────────────────────────────
// Called on every app load to check if the user is still logged in.
// authMiddleware already verified the JWT before this runs —
// so req.user is guaranteed to exist here.
const me = async (req, res, next) => {
  try {
    // Fetch fresh user data from DB — don't trust stale JWT payload
    // for sensitive display data. JWT just proves identity.
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me };