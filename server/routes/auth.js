const express = require("express");
const router = express.Router();
const { signToken } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body;
  const expected = process.env.ACCESS_PASSWORD;

  // If no password set in env, auto-approve (dev mode)
  if (!expected) {
    return res.json({ token: signToken({ role: "admin" }), mode: "open" });
  }

  if (password !== expected) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = signToken({ role: "admin" });
  res.json({ token });
});

// GET /api/auth/check
router.get("/check", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!process.env.ACCESS_PASSWORD) {
    return res.json({ authenticated: true, mode: "open" });
  }

  if (!token) return res.json({ authenticated: false });

  try {
    const { verify } = require("jsonwebtoken");
    const SECRET = process.env.JWT_SECRET || "quantumania-dev-secret-change-in-prod";
    verify(token, SECRET);
    res.json({ authenticated: true });
  } catch {
    res.json({ authenticated: false });
  }
});

module.exports = router;
