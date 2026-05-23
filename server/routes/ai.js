const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST /api/ai/complete — generic prompt completion
router.post("/complete", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let text;
    if (history && Array.isArray(history) && history.length > 0) {
      const chat = model.startChat({
        history: history.map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      });
      const result = await chat.sendMessage(prompt);
      text = result.response.text();
    } else {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    res.json({ text });
  } catch (err) {
    console.error("AI complete error:", err.message);
    res.status(500).json({ error: "AI request failed", detail: err.message });
  }
});

// POST /api/ai/chat — streaming not needed for now, same as complete
router.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are Aria, an AI co-worker at a tech company. You help with HR tasks, answer questions, draft emails, analyze data, and support all company operations. You are professional, concise, and helpful. You have access to 9 company automation features: Email, Calls, Posts/LinkedIn, ATS Resume Filtering, AI Interviews, Attendance, Leave Management, HR Analytics, and Settings.`,
    });

    const chat = model.startChat({
      history: (history || []).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    res.json({ text });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "AI request failed", detail: err.message });
  }
});

module.exports = router;
