const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    features: {
      ai: !!(process.env.GROQ_API_KEY || process.env.CLOUDFLARE_API_TOKEN),
      email: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      calls: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      posts_images: !!process.env.OPENAI_API_KEY,
      database: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY),
    },
  });
});

module.exports = router;
