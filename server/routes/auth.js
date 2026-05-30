const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const { signToken } = require("../middleware/auth");
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: "Database not configured — add SUPABASE_SERVICE_KEY" });

  const salt = crypto.randomBytes(16).toString("hex");
  const password_hash = hashPassword(password, salt);

  const { data, error } = await sb
    .from("users")
    .insert({ name: name.trim(), email: email.toLowerCase().trim(), password_hash, salt, role: "member" })
    .select("id, email, name, role")
    .single();

  if (error) {
    if (error.code === "23505")
      return res.status(409).json({ error: "An account with this email already exists" });
    console.error("Register error:", error.message);
    return res.status(500).json({ error: "Registration failed — please try again" });
  }

  const token = signToken({ id: data.id, email: data.email, name: data.name, role: data.role });
  res.json({ token, user: { id: data.id, email: data.email, name: data.name } });
});

// POST /api/auth/login  (email+password OR legacy single-password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ── Email + password mode (Supabase users table) ──────────────────────────
  if (email) {
    if (!password) return res.status(400).json({ error: "Password required" });

    const sb = getSupabase();
    if (!sb) return res.status(503).json({ error: "Database not configured" });

    const { data, error } = await sb
      .from("users")
      .select("id, email, name, password_hash, salt, role")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !data)
      return res.status(401).json({ error: "Invalid email or password" });

    const computed = hashPassword(password, data.salt);
    if (computed !== data.password_hash)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ id: data.id, email: data.email, name: data.name, role: data.role });
    return res.json({ token, user: { id: data.id, email: data.email, name: data.name } });
  }

  // ── Legacy single-password mode ───────────────────────────────────────────
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return res.json({ token: signToken({ role: "admin" }), mode: "open" });
  if (password !== expected) return res.status(401).json({ error: "Wrong password" });
  return res.json({ token: signToken({ role: "admin" }) });
});

// GET /api/auth/check
router.get("/check", (req, res) => {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!process.env.ACCESS_PASSWORD && !getSupabase()) {
    return res.json({ authenticated: true, mode: "open" });
  }

  if (!token) return res.json({ authenticated: false });

  try {
    const { verify } = require("jsonwebtoken");
    const SECRET = process.env.JWT_SECRET || "quantumania-dev-secret-change-in-prod";
    const payload = verify(token, SECRET);
    res.json({ authenticated: true, user: payload });
  } catch {
    res.json({ authenticated: false });
  }
});

module.exports = router;
