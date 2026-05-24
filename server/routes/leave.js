const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { aiComplete } = require("../lib/ai");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// POST /api/leave/apply — apply for leave with AI analysis
router.post("/apply", async (req, res) => {
  const { employeeId, employeeName, type, startDate, endDate, reason } = req.body;
  if (!employeeName || !type || !startDate || !endDate) {
    return res.status(400).json({ error: "employeeName, type, startDate, endDate required" });
  }

  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1;

  // AI pattern analysis
  let aiRecommendation = "approved";
  let aiNote = "Leave request looks good.";

  try {
    const sb = getSupabase();
    let history = [];
    if (sb && employeeId) {
      const { data } = await sb.from("leave_requests")
        .select("type, start_date, days")
        .eq("employee_id", employeeId)
        .eq("status", "approved")
        .order("start_date", { ascending: false })
        .limit(10);
      history = data || [];
    }

    const prompt = `Analyze this leave request.\nEmployee: ${employeeName}\nType: ${type}\nDuration: ${days} days (${startDate} to ${endDate})\nReason: ${reason || "Not specified"}\nRecent leave history: ${JSON.stringify(history)}\n\nReturn JSON:\n{\n  "recommendation": "approved|flagged|denied",\n  "note": "<1 sentence explanation>",\n  "pattern_flag": <true|false>\n}`;

    let text = await aiComplete(prompt);
    text = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "");
    const parsed = JSON.parse(text);
    aiRecommendation = parsed.recommendation;
    aiNote = parsed.note;
  } catch (_) {}

  const sb = getSupabase();
  if (!sb) {
    return res.json({
      id: "demo-" + Date.now(),
      days,
      ai_recommendation: aiRecommendation,
      ai_note: aiNote,
      status: "pending",
    });
  }

  const { data, error } = await sb.from("leave_requests").insert({
    employee_id: employeeId,
    employee_name: employeeName,
    type,
    start_date: startDate,
    end_date: endDate,
    days,
    reason,
    status: "pending",
    ai_recommendation: aiRecommendation,
    ai_note: aiNote,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/leave/:id/approve
router.patch("/:id/approve", async (req, res) => {
  const { approvedBy } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ updated: false });

  const { error } = await sb.from("leave_requests")
    .update({ status: "approved", approved_by: approvedBy })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: true });
});

// PATCH /api/leave/:id/reject
router.patch("/:id/reject", async (req, res) => {
  const { rejectedBy, reason } = req.body;
  const sb = getSupabase();
  if (!sb) return res.json({ updated: false });

  const { error } = await sb.from("leave_requests")
    .update({ status: "rejected", approved_by: rejectedBy, rejection_reason: reason })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: true });
});

// GET /api/leave/all
router.get("/all", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ requests: [] });

  const { data, error } = await sb.from("leave_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ requests: data || [] });
});

module.exports = router;
