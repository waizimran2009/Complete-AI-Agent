const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// POST /api/attendance/checkin
router.post("/checkin", async (req, res) => {
  const { employeeId, employeeName, method = "manual", location, wfh = false } = req.body;
  if (!employeeName) return res.status(400).json({ error: "employeeName required" });

  const sb = getSupabase();
  if (!sb) {
    return res.json({
      id: "demo-" + Date.now(),
      message: `Check-in recorded for ${employeeName}`,
      time: new Date().toISOString(),
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await sb
    .from("attendance")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("date", today)
    .single();

  if (existing) {
    return res.status(409).json({ error: "Already checked in today" });
  }

  const { data, error } = await sb.from("attendance").insert({
    employee_id: employeeId,
    employee_name: employeeName,
    date: today,
    check_in: new Date().toISOString(),
    method,
    location,
    is_wfh: wfh,
    status: "present",
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, message: `Check-in recorded for ${employeeName}`, time: data.check_in });
});

// POST /api/attendance/checkout
router.post("/checkout", async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: "employeeId required" });

  const sb = getSupabase();
  if (!sb) return res.json({ updated: false, note: "Supabase not configured" });

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  const { data: record } = await sb
    .from("attendance")
    .select("id, check_in")
    .eq("employee_id", employeeId)
    .eq("date", today)
    .single();

  if (!record) return res.status(404).json({ error: "No check-in found for today" });

  const hoursWorked = record.check_in
    ? ((new Date(now) - new Date(record.check_in)) / 3600000).toFixed(2)
    : null;

  const { error } = await sb.from("attendance")
    .update({ check_out: now, hours_worked: hoursWorked })
    .eq("id", record.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: true, hours_worked: hoursWorked });
});

// GET /api/attendance/report
router.get("/report", async (req, res) => {
  const { month, employeeId } = req.query;
  const sb = getSupabase();
  if (!sb) return res.json({ records: [] });

  let query = sb.from("attendance").select("*").order("date", { ascending: false });

  if (month) {
    const [year, m] = month.split("-");
    const start = `${year}-${m}-01`;
    const end = `${year}-${m}-31`;
    query = query.gte("date", start).lte("date", end);
  }
  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query.limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ records: data || [] });
});

// GET /api/attendance/today
router.get("/today", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ present: [], absent: [] });

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await sb.from("attendance")
    .select("*")
    .eq("date", today);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ records: data || [], date: today });
});

module.exports = router;
