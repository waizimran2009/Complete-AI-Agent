/* ─────────────────────────────────────────────────────
   API Client — replaces window.claude.complete with
   real calls to the Express backend (Gemini AI).
   Loaded BEFORE any page JSX files.
   ───────────────────────────────────────────────────── */

window.claude = {
  async complete(promptOrOptions) {
    let prompt, history;

    if (typeof promptOrOptions === "string") {
      prompt = promptOrOptions;
    } else if (promptOrOptions && typeof promptOrOptions === "object") {
      // Handle { messages: [...] } format from page-chat.jsx
      if (promptOrOptions.messages) {
        const msgs = promptOrOptions.messages;
        const last = msgs[msgs.length - 1];
        prompt = last?.content || last?.text || String(promptOrOptions);
        history = msgs.slice(0, -1).map(m => ({ role: m.role || "user", content: m.content || m.text || "" }));
      } else {
        prompt = String(promptOrOptions);
      }
    }

    const res = await fetch("/api/ai/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "AI request failed");
    }

    const data = await res.json();
    return data.text || "";
  },
};

// Also expose a dedicated Aria chat function
window.ariaChat = async function(message, history) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Chat request failed");
  }

  const data = await res.json();
  return data.text || "";
};
