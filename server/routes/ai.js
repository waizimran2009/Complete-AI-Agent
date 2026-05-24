const express = require("express");
const router  = express.Router();
const { aiComplete, aiChat } = require("../lib/ai");

const ARIA_SYSTEM = `You are Aria, an AI co-worker at a tech company. You help with HR tasks, answer questions, draft emails, analyze data, and support all company operations. You are professional, concise, and helpful. You have access to 9 company automation features: Email, Calls, Posts/LinkedIn, ATS Resume Filtering, AI Interviews, Attendance, Leave Management, HR Analytics, and Settings.`;

// POST /api/ai/complete — generic prompt completion
router.post("/complete", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    const text = history?.length
      ? await aiChat(prompt, history, null)
      : await aiComplete(prompt);
    res.json({ text });
  } catch (err) {
    console.error("AI complete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat — Aria conversation with full history support
router.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  try {
    const text = await aiChat(message, history || [], ARIA_SYSTEM);
    res.json({ text });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
