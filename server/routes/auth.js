const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const https   = require("https");
const { signToken } = require("../middleware/auth");
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// GET /api/auth/config  — expose non-secret config to frontend
router.get("/config", (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: "Database not configured — add SUPABASE_SERVICE_KEY" });

  const salt = crypto.randomBytes(16).toString("hex");
  const password_hash = hashPassword(password, salt);

  const row = { name: name.trim(), email: email.toLowerCase().trim(), password_hash, salt, role: "member" };
  if (company && company.trim()) row.company = company.trim();

  try {
    const { data, error } = await sb
      .from("users")
      .insert(row)
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
  } catch (err) {
    console.error("Register exception:", err.message);
    res.status(500).json({ error: "Registration failed — please try again" });
  }
});

// POST /api/auth/login  (email+password OR legacy single-password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email) {
    if (!password) return res.status(400).json({ error: "Password required" });

    const sb = getSupabase();
    if (!sb) return res.status(503).json({ error: "Database not configured" });

    try {
      const { data, error } = await sb
        .from("users")
        .select("id, email, name, password_hash, salt, role")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error || !data)
        return res.status(401).json({ error: "Invalid email or password" });

      if (!data.password_hash)
        return res.status(401).json({ error: "This account uses Google Sign-In. Please sign in with Google." });

      const computed = hashPassword(password, data.salt);
      if (computed !== data.password_hash)
        return res.status(401).json({ error: "Invalid email or password" });

      const token = signToken({ id: data.id, email: data.email, name: data.name, role: data.role });
      return res.json({ token, user: { id: data.id, email: data.email, name: data.name } });
    } catch (err) {
      console.error("Login exception:", err.message);
      return res.status(500).json({ error: "Sign in failed — please try again" });
    }
  }

  // Legacy single-password mode
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return res.json({ token: signToken({ role: "admin" }), mode: "open" });
  if (password !== expected) return res.status(401).json({ error: "Wrong password" });
  return res.json({ token: signToken({ role: "admin" }) });
});

// POST /api/auth/google  — verify Google ID token, find or create user
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Google credential required" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(503).json({ error: "Google Sign-In is not configured on this server" });

  // Verify the token with Google
  let tokenInfo;
  try {
    tokenInfo = await new Promise((resolve, reject) => {
      https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, (r) => {
        let body = "";
        r.on("data", (chunk) => { body += chunk; });
        r.on("end", () => {
          try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid response")); }
        });
      }).on("error", reject);
    });
  } catch (err) {
    console.error("Google token verify error:", err.message);
    return res.status(401).json({ error: "Could not verify Google token" });
  }

  if (tokenInfo.error) {
    return res.status(401).json({ error: "Invalid Google token" });
  }
  if (tokenInfo.aud !== clientId) {
    return res.status(401).json({ error: "Google token audience mismatch" });
  }

  const { email, name, sub: googleId } = tokenInfo;
  if (!email) return res.status(401).json({ error: "Google account has no email" });

  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: "Database not configured" });

  try {
    // Find existing user
    const { data: existing } = await sb
      .from("users")
      .select("id, email, name, role")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      const token = signToken({ id: existing.id, email: existing.email, name: existing.name, role: existing.role });
      return res.json({ token, user: { id: existing.id, email: existing.email, name: existing.name } });
    }

    // Create new Google user (no password)
    const displayName = name || email.split("@")[0];
    const { data: newUser, error: insertErr } = await sb
      .from("users")
      .insert({ name: displayName, email: email.toLowerCase(), google_id: googleId, role: "member" })
      .select("id, email, name, role")
      .single();

    if (insertErr) {
      console.error("Google user create error:", insertErr.message);
      return res.status(500).json({ error: "Could not create account. Please try again." });
    }

    const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (err) {
    console.error("Google auth exception:", err.message);
    res.status(500).json({ error: "Google sign-in failed — please try again" });
  }
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
