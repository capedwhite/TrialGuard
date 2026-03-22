const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Read token from httpOnly cookie — never from Authorization header.
  // The browser sends this automatically on every request.
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  try {
    // Verify signature + expiry in one step.
    // If tampered with or expired, jwt.verify throws — caught below.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req so every downstream
    // controller knows who is making the request without
    // hitting the database again.
    req.user = decoded;

    next();
  } catch (err) {
    // Covers both TokenExpiredError and JsonWebTokenError
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;