const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Groq client (Llama 3.3 70B) — primary
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
  : null;

// Gemini client — fallback
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-1.5-flash";

const ARIA_SYSTEM = `You are Aria, an AI co-worker at a tech company. You help with HR tasks, answer questions, draft emails, analyze data, and support all company operations. You are professional, concise, and helpful. You have access to 9 company automation features: Email, Calls, Posts/LinkedIn, ATS Resume Filtering, AI Interviews, Attendance, Leave Management, HR Analytics, and Settings.`;

// ── Groq completion ────────────────────────────────────────
async function groqComplete(messages) {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  return res.choices[0].message.content;
}

// ── Gemini completion ──────────────────────────────────────
async function geminiComplete(prompt, history, systemInstruction) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  });

  if (history && history.length > 0) {
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content }],
      })),
    });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// POST /api/ai/complete — generic prompt completion
router.post("/complete", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    let text;

    if (groq) {
      const messages = [];
      if (history && Array.isArray(history)) {
        messages.push(...history.map(m => ({ role: m.role, content: m.content })));
      }
      messages.push({ role: "user", content: prompt });
      text = await groqComplete(messages);
    } else if (genAI) {
      text = await geminiComplete(prompt, history);
    } else {
      return res.status(503).json({ error: "No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY." });
    }

    res.json({ text });
  } catch (err) {
    console.error("AI complete error:", err.message);
    res.status(500).json({ error: "AI request failed", detail: err.message });
  }
});

// POST /api/ai/chat — Aria conversation
router.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  try {
    let text;

    if (groq) {
      const messages = [{ role: "system", content: ARIA_SYSTEM }];
      if (history && Array.isArray(history)) {
        messages.push(...history.map(m => ({
          role: m.role === "model" ? "assistant" : m.role,
          content: m.content,
        })));
      }
      messages.push({ role: "user", content: message });
      text = await groqComplete(messages);
    } else if (genAI) {
      text = await geminiComplete(message, history, ARIA_SYSTEM);
    } else {
      return res.status(503).json({ error: "No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY." });
    }

    res.json({ text });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "AI request failed", detail: err.message });
  }
});

module.exports = router;
