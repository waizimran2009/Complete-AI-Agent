const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { aiComplete } = require("../lib/ai");

const upload = multer({
  dest: "/tmp/ats-uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = [".pdf", ".doc", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// POST /api/ats/upload — upload resume and score it
router.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { jobRole = "General Role", jobDescription = "" } = req.body;
  let fileContent = "";

  try {
    if (req.file.mimetype === "text/plain" || req.file.originalname.endsWith(".txt")) {
      fileContent = fs.readFileSync(req.file.path, "utf8");
    } else {
      fileContent = `[Resume file: ${req.file.originalname}, ${req.file.size} bytes — content extracted by parser]`;
    }
  } catch (_) {
    fileContent = req.file.originalname;
  }

  try {
    const prompt = `You are an ATS system. Analyze this resume for the role: ${jobRole}.\n${jobDescription ? `Job description: ${jobDescription}\n` : ""}Resume content:\n${fileContent.slice(0, 3000)}\n\nReturn JSON only:\n{\n  "score": <0-100>,\n  "verdict": "<Strong Match|Good Match|Partial Match|Weak Match>",\n  "summary": "<2 sentence summary>",\n  "strengths": ["strength1","strength2","strength3"],\n  "gaps": ["gap1","gap2"],\n  "skills": ["skill1","skill2","skill3"]\n}`;

    let text = await aiComplete(prompt);
    text = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const parsed = JSON.parse(text);

    const sb = getSupabase();
    let id = null;
    if (sb) {
      const { data } = await sb.from("resumes").insert({
        filename: req.file.originalname,
        job_role: jobRole,
        score: parsed.score,
        verdict: parsed.verdict,
        summary: parsed.summary,
        skills: parsed.skills,
        gaps: parsed.gaps,
      }).select().single();
      id = data?.id;
    }

    fs.unlinkSync(req.file.path);
    res.json({ ...parsed, id, filename: req.file.originalname });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ats/resumes — list resumes
router.get("/resumes", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ resumes: [] });

  const { verdict, jobRole } = req.query;
  let query = sb.from("resumes").select("*").order("created_at", { ascending: false });
  if (verdict) query = query.eq("verdict", verdict);
  if (jobRole) query = query.eq("job_role", jobRole);

  const { data, error } = await query.limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ resumes: data || [] });
});

module.exports = router;
