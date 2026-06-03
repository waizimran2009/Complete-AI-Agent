const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/employees
router.get("/", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ employees: [] });

  const { data, error } = await sb.from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ employees: data || [] });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/employees
router.post("/", async (req, res) => {
  const { name, email, jobRole, department } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email required" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Invalid email address" });

  const sb = getSupabase();
  if (!sb) return res.json({ id: "demo-" + Date.now(), name, email });

  const { data, error } = await sb.from("employees").insert({
    name,
    email,
    job_role: jobRole,
    department,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/employees/:id
router.delete("/:id", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ deleted: false });

  const { error } = await sb.from("employees").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: true });
});

module.exports = router;
