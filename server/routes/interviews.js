const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// POST /api/interviews/generate-questions
router.post("/generate-questions", async (req, res) => {
  const { jobRole = "Software Engineer", jobDescription = "", numQuestions = 5 } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate ${numQuestions} interview questions for: ${jobRole}.\n${jobDescription ? `Job context: ${jobDescription}\n` : ""}Include a mix: technical (systems design, coding), behavioral, and situational.\n\nReturn JSON array:\n[\n  { "num": 1, "text": "question", "topic": "Systems design", "type": "technical" },\n  ...\n]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interviews/score-answer
router.post("/score-answer", async (req, res) => {
  const { question, answer, jobRole = "Software Engineer" } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "question and answer required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Score this interview answer for a ${jobRole} role.\n\nQuestion: ${question}\nAnswer: ${answer}\n\nReturn JSON:\n{\n  "score": <0-10>,\n  "feedback": "<2 sentence evaluation>",\n  "strengths": ["point1","point2"],\n  "improvements": ["point1"]\n}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const scored = JSON.parse(text);
    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interviews/session — create session
router.post("/session", async (req, res) => {
  const { candidateId, candidateName, jobRole } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ id: null, note: "Supabase not configured" });

  const { data, error } = await sb.from("interview_sessions").insert({
    candidate_id: candidateId,
    candidate_name: candidateName,
    job_role: jobRole,
    status: "active",
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id });
});

// PATCH /api/interviews/session/:id/disqualify
router.patch("/session/:id/disqualify", async (req, res) => {
  const { reason = "tab switch" } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ updated: false });

  const { error } = await sb.from("interview_sessions")
    .update({ status: "disqualified", disqualify_reason: reason })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: true });
});

// PATCH /api/interviews/session/:id/complete
router.patch("/session/:id/complete", async (req, res) => {
  const { finalScore, summary } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ updated: false });

  const { error } = await sb.from("interview_sessions")
    .update({ status: "completed", final_score: finalScore, summary })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: true });
});

// GET /api/interviews/sessions
router.get("/sessions", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ sessions: [] });

  const { data, error } = await sb.from("interview_sessions")
    .select("*, employees(name, job_role)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ sessions: data || [] });
});

module.exports = router;
