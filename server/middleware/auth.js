const jwt = require("jsonwebtoken");

if (process.env.ACCESS_PASSWORD && !process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET is not set. Using insecure fallback — set JWT_SECRET in Railway env vars.");
}
const SECRET = process.env.JWT_SECRET || "quantumania-dev-secret-change-in-prod";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  // Skip auth if ACCESS_PASSWORD not set (open mode)
  if (!process.env.ACCESS_PASSWORD) return next();

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token expired or invalid" });
  }
}

module.exports = { signToken, requireAuth };
