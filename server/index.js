require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// ── Keep the process alive: log errors instead of crashing ──────────────────
// On Railway a single unhandled rejection (e.g. a failed Supabase/Twilio call)
// would otherwise kill the whole server and trigger an endless restart loop.
process.on("unhandledRejection", (reason) => {
  console.error("⚠ Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("⚠ Uncaught exception:", err);
});

const app = express();

// Railway / Render / any reverse proxy sits in front of us. Trust it so that
// req.ip and express-rate-limit work correctly (and don't throw).
app.set("trust proxy", 1);

// Security headers (relaxed CSP for CDN scripts)
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Rate limiting on API
app.use("/api", rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // don't throw on proxy header validation
}));

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/
app.use(express.static(path.join(__dirname, "../public")));

// Auth + health (no auth required)
app.use("/api/health", require("./routes/health"));
app.use("/api/auth",   require("./routes/auth"));

// Protected API routes
const { requireAuth } = require("./middleware/auth");
app.use("/api/ai",         requireAuth, require("./routes/ai"));
app.use("/api/email",      requireAuth, require("./routes/email"));
app.use("/api/calls",      require("./routes/calls")); // Twilio webhooks must be public
app.use("/api/posts",      requireAuth, require("./routes/posts"));
app.use("/api/ats",        requireAuth, require("./routes/ats"));
app.use("/api/interviews", requireAuth, require("./routes/interviews"));
app.use("/api/attendance", requireAuth, require("./routes/attendance"));
app.use("/api/leave",      requireAuth, require("./routes/leave"));
app.use("/api/analytics",     requireAuth, require("./routes/analytics"));
app.use("/api/employees",     requireAuth, require("./routes/employees"));
app.use("/api/chat-sessions", requireAuth, require("./routes/chat-sessions"));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Complete AI Agent running at http://localhost:${PORT}`);
  const features = {
    "Groq AI":    !!process.env.GROQ_API_KEY,
    "Cloudflare": !!process.env.CLOUDFLARE_API_TOKEN,
    "Supabase":   !!process.env.SUPABASE_URL,
    "Email":      !!process.env.EMAIL_USER,
    "Calls":      !!process.env.TWILIO_ACCOUNT_SID,
    "DALL-E":     !!process.env.OPENAI_API_KEY,
    "Auth":       !!process.env.ACCESS_PASSWORD,
  };
  Object.entries(features).forEach(([k, v]) =>
    console.log(`  ${v ? "✓" : "○"} ${k}`)
  );
});
