/* ─────────────────────────────────────────────────────
   API Client — auth token management + AI helpers
   ───────────────────────────────────────────────────── */

// ── Token storage ────────────────────────────────────
const TOKEN_KEY = "qm_auth_token";
window.__auth = {
  getToken()        { return localStorage.getItem(TOKEN_KEY); },
  setToken(t)       { localStorage.setItem(TOKEN_KEY, t); },
  clearToken()      { localStorage.removeItem(TOKEN_KEY); },
  isLoggedIn()      { return !!localStorage.getItem(TOKEN_KEY); },
};

// ── Authenticated fetch ───────────────────────────────
window.apiFetch = async function(url, opts = {}) {
  const token = window.__auth.getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    window.__auth.clearToken();
    window.location.reload(); // Force re-login
    return;
  }
  return res;
};

// ── Aria chat (POST /api/ai/chat) ─────────────────────
window.ariaChat = async function(message, history) {
  const res = await window.apiFetch("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Chat request failed");
  }
  const data = await res.json();
  return data.text || "";
};

// ── Chat session persistence ──────────────────────────
window.chatSessions = {
  async list() {
    try {
      const res = await window.apiFetch("/api/chat-sessions");
      if (!res || !res.ok) return [];
      return (await res.json()).sessions || [];
    } catch { return []; }
  },
  async create() {
    try {
      const res = await window.apiFetch("/api/chat-sessions", { method: "POST", body: JSON.stringify({}) });
      if (!res || !res.ok) return { id: `local-${Date.now()}`, title: "New Chat", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      return (await res.json()).session;
    } catch { return { id: `local-${Date.now()}`, title: "New Chat", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; }
  },
  async delete(id) {
    try { await window.apiFetch(`/api/chat-sessions/${id}`, { method: "DELETE" }); } catch {}
  },
  async getMessages(id) {
    try {
      const res = await window.apiFetch(`/api/chat-sessions/${id}/messages`);
      if (!res || !res.ok) return [];
      return (await res.json()).messages || [];
    } catch { return []; }
  },
  async saveMessages(id, messages, title) {
    try {
      await window.apiFetch(`/api/chat-sessions/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ messages, title: title || null }),
      });
    } catch {}
  },
};

// ── Generic AI completion (backward compat) ───────────
window.claude = {
  async complete(promptOrOptions) {
    let prompt, history;
    if (typeof promptOrOptions === "string") {
      prompt = promptOrOptions;
    } else if (promptOrOptions?.messages) {
      const msgs = promptOrOptions.messages;
      const last = msgs[msgs.length - 1];
      prompt = last?.content || last?.text || "";
      history = msgs.slice(0, -1).map(m => ({ role: m.role || "user", content: m.content || m.text || "" }));
    } else {
      prompt = String(promptOrOptions);
    }
    const res = await window.apiFetch("/api/ai/complete", {
      method: "POST",
      body: JSON.stringify({ prompt, history }),
    });
    if (!res || !res.ok) throw new Error("AI request failed");
    const data = await res.json();
    return data.text || "";
  },
};
