const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const { aiComplete } = require("../lib/ai");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// POST /api/email/draft — AI writes email, returns draft only
router.post("/draft", async (req, res) => {
  const { to, subject, brief, tone = "professional" } = req.body;
  if (!brief) return res.status(400).json({ error: "brief required" });

  try {
    const prompt = `Write a ${tone} email.\nTo: ${to || "recipient"}\nSubject: ${subject || "Follow-up"}\nBrief: ${brief}\n\nRules: professional tone, concise, no markdown, include subject line at top.`;
    const draft = await aiComplete(prompt);
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/email/send — AI writes and sends email
router.post("/send", async (req, res) => {
  const { to, subject, brief, tone = "professional" } = req.body;
  if (!to || !subject || !brief) return res.status(400).json({ error: "to, subject, brief required" });
  if (!EMAIL_RE.test(to)) return res.status(400).json({ error: "Invalid recipient email address" });

  let body;
  try {
    const prompt = `Write a ${tone} email.\nTo: ${to}\nSubject: ${subject}\nBrief: ${brief}\n\nReturn just the email body, no subject line, no markdown.`;
    body = await aiComplete(prompt);
  } catch (err) {
    return res.status(500).json({ error: "AI draft failed: " + err.message });
  }

  const transporter = getTransporter();
  if (!transporter) {
    // No email credentials — return the draft only
    return res.json({ sent: false, draft: body, note: "Email credentials not configured" });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });

    const sb = getSupabase();
    if (sb) {
      await sb.from("email_logs").insert({ to_email: to, subject, body, status: "sent" });
    }

    res.json({ sent: true, body });
  } catch (err) {
    res.status(500).json({ error: "Send failed: " + err.message, draft: body });
  }
});

// GET /api/email/history
router.get("/history", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ logs: [] });

  const { data, error } = await sb
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data || [] });
});

module.exports = router;
