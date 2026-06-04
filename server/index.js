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

// Security headers — CSP allows the CDN scripts and Babel JSX runtime
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://accounts.google.com"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "blob:", "https:"],
      connectSrc:     ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      frameSrc:       ["https://accounts.google.com"],
      objectSrc:      ["'none'"],
      baseUri:        ["'self'"],
    },
  },
}));

// Rate limiting on API
app.use("/api", rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
}));

// CORS — restrict to configured origin(s), or same-origin if not set
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(s => s.trim())
  : null;
app.use(cors(allowedOrigins ? {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(Object.assign(new Error("CORS: origin not allowed"), { status: 403 }));
  },
  credentials: true,
} : {}));
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

// Global error handler — never expose stack traces to clients
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[${status}] ${req.method} ${req.path} —`, err.message);
  if (status >= 500) console.error(err.stack);
  res.status(status).json({ error: status < 500 ? err.message : "Internal server error" });
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
    "Auth":       process.env.REQUIRE_AUTH === "true",
  };
  Object.entries(features).forEach(([k, v]) =>
    console.log(`  ${v ? "✓" : "○"} ${k}`)
  );
});
