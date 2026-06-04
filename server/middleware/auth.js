const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set — using insecure fallback. Set JWT_SECRET in Railway env vars.");
}
const SECRET = process.env.JWT_SECRET || "quantumania-dev-secret-change-in-prod";

// Auth is enabled only when REQUIRE_AUTH=true is set in environment.
// Set REQUIRE_AUTH=true on Railway when you are ready to add login back.
const AUTH_ENABLED = process.env.REQUIRE_AUTH === "true";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  if (!AUTH_ENABLED) return next();

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

function decodeToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

module.exports = { signToken, requireAuth, decodeToken };
