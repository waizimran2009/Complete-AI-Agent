const express = require("express");
const router  = express.Router();
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/chat-sessions — list all sessions, newest first
router.get("/", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ sessions: [] });
  const { data, error } = await sb
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sessions: data || [] });
});

// POST /api/chat-sessions — create a new session
router.post("/", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ session: { id: `local-${Date.now()}`, title: "New Chat", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
  const { data, error } = await sb
    .from("chat_sessions")
    .insert({ title: "New Chat" })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data });
});

// DELETE /api/chat-sessions/:id — delete session (messages cascade)
router.delete("/:id", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ ok: true });
  const { error } = await sb.from("chat_sessions").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/chat-sessions/:id/messages — load messages for a session
router.get("/:id/messages", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ messages: [] });
  const { data, error } = await sb
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", req.params.id)
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data || [] });
});

// POST /api/chat-sessions/:id/messages — append messages + optionally rename session
router.post("/:id/messages", async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ ok: true });
  const { messages, title } = req.body;
  if (!messages?.length) return res.json({ ok: true });

  const rows = messages.map(m => ({
    session_id: req.params.id,
    role:       m.role,
    content:    m.content,
  }));
  const { error } = await sb.from("chat_messages").insert(rows);
  if (error) return res.status(500).json({ error: error.message });

  const updates = { updated_at: new Date().toISOString() };
  if (title) updates.title = title.slice(0, 80);
  await sb.from("chat_sessions").update(updates).eq("id", req.params.id);

  res.json({ ok: true });
});

module.exports = router;
