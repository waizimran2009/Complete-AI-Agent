const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/analytics/overview
router.get("/overview", async (req, res) => {
  const sb = getSupabase();
  if (!sb) {
    return res.json({
      headcount: 142,
      openRoles: 9,
      avgAttendance: "94%",
      emailsSent: 284,
      callsHandled: 156,
      resumesProcessed: 412,
      interviewsConducted: 32,
      postsPublished: 18,
      leaveRequests: 47,
      aiDecisions: 1240,
    });
  }

  try {
    const [emp, att, email, calls, resumes, interviews, posts, leave] = await Promise.all([
      sb.from("employees").select("id", { count: "exact", head: true }),
      sb.from("attendance").select("id", { count: "exact", head: true }),
      sb.from("email_logs").select("id", { count: "exact", head: true }),
      sb.from("call_logs").select("id", { count: "exact", head: true }),
      sb.from("resumes").select("id", { count: "exact", head: true }),
      sb.from("interview_sessions").select("id", { count: "exact", head: true }),
      sb.from("post_logs").select("id", { count: "exact", head: true }),
      sb.from("leave_requests").select("id", { count: "exact", head: true }),
    ]);

    res.json({
      headcount: emp.count || 0,
      attendanceRecords: att.count || 0,
      emailsSent: email.count || 0,
      callsHandled: calls.count || 0,
      resumesProcessed: resumes.count || 0,
      interviewsConducted: interviews.count || 0,
      postsPublished: posts.count || 0,
      leaveRequests: leave.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/attendance-trend — last 30 days
router.get("/attendance-trend", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ trend: [] });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const { data, error } = await sb.from("attendance")
    .select("date")
    .gte("date", thirtyDaysAgo)
    .order("date");

  if (error) return res.status(500).json({ error: error.message });

  const grouped = {};
  (data || []).forEach(r => {
    grouped[r.date] = (grouped[r.date] || 0) + 1;
  });

  res.json({ trend: Object.entries(grouped).map(([date, count]) => ({ date, count })) });
});

module.exports = router;
