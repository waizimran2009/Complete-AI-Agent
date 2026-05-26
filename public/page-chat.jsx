/* ─── QuantuMania Chat — Aria AI co-worker ─────────────────────
   Keeps existing app layout & card design.
   Premium features: markdown, editing, spinning input border,
   suggestion pills, voice input, copy buttons.
   API: window.ariaChat(message, history) → Promise<string>
   ─────────────────────────────────────────────────────────────── */

const CHAT_CSS = `
  @keyframes chatSpinBorder {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes chatSpinBorderRev {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  @keyframes chatGlowPulse {
    0%, 100% { box-shadow: 0 0 0 1px rgba(var(--accent), 0.3), 0 0 20px rgba(var(--accent), 0.15); }
    50%       { box-shadow: 0 0 0 1px rgba(var(--accent), 0.5), 0 0 36px rgba(var(--accent), 0.3); }
  }
  @keyframes chatOrbPulse {
    0%, 100% { box-shadow: 0 0 10px rgba(var(--accent), 0.5); }
    50%       { box-shadow: 0 0 22px rgba(var(--accent), 0.8), 0 0 40px rgba(var(--accent), 0.4); }
  }
  @keyframes chatTypingDot {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }
  @keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .chat-msg-in     { animation: chatMsgIn 0.3s ease forwards; }
  .chat-fade-in    { animation: chatFadeIn 0.5s ease forwards; }
  .chat-fade-d1    { animation: chatFadeIn 0.5s 0.1s ease forwards; opacity: 0; }
  .chat-fade-d2    { animation: chatFadeIn 0.5s 0.22s ease forwards; opacity: 0; }
  .chat-fade-d3    { animation: chatFadeIn 0.5s 0.36s ease forwards; opacity: 0; }
  .chat-dot        { animation: chatTypingDot 1.2s infinite; }
  .chat-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-dot:nth-child(3) { animation-delay: 0.4s; }
  .chat-scroll::-webkit-scrollbar { width: 4px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .chat-action-btns { opacity: 0; transition: opacity 0.15s ease; }
  .chat-user-msg:hover .chat-action-btns { opacity: 1; }
`;

const QUICK_PROMPTS = [
  { I: IconMail,      label: "Draft an email to a customer about our SOC2 cert" },
  { I: IconLinkedIn,  label: "Write a LinkedIn post about our latest product" },
  { I: IconBriefcase, label: "Help me reject a candidate politely" },
  { I: IconUsers,     label: "Summarize today's interview scores" },
  { I: IconPhone,     label: "What did the last caller want?" },
  { I: IconBarChart,  label: "How's our hiring funnel performing?" },
];

// ── ChatPage ──────────────────────────────────────────────────────────────────
function ChatPage() {
  const [messages,    setMessages]    = React.useState([]);
  const [input,       setInput]       = React.useState("");
  const [thinking,    setThinking]    = React.useState(false);
  const [aiActive,    setAiActive]    = React.useState(false);
  const [editingId,   setEditingId]   = React.useState(null);
  const [editingText, setEditingText] = React.useState("");
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  async function send(text, priorMessages) {
    const userText = (typeof text === "string" ? text : input).trim();
    if (!userText || thinking) return;
    setInput("");

    const base = priorMessages !== undefined ? priorMessages : messages;
    const newMessages = [...base, { who: "user", text: userText, id: Date.now() }];
    setMessages(newMessages);
    setThinking(true);
    setAiActive(true);

    try {
      const history = newMessages.slice(0, -1).map(m => ({
        role: m.who === "user" ? "user" : "model",
        content: m.text,
      }));
      const reply = await window.ariaChat(userText, history);
      setMessages(prev => [...prev, { who: "ai", text: reply.trim(), id: Date.now() + 1 }]);
    } catch (e) {
      setMessages(prev => [...prev, { who: "ai", text: "Couldn't reach the neural net — try again in a moment.", id: Date.now() + 1, error: true }]);
    }
    setThinking(false);
    setAiActive(false);
  }

  function handleEditSave(id) {
    const trimmed = editingText.trim();
    if (!trimmed) { setEditingId(null); return; }
    const idx = messages.findIndex(m => m.id === id);
    const prior = idx === -1 ? messages : messages.slice(0, idx);
    setEditingId(null);
    setEditingText("");
    send(trimmed, prior);
  }

  const chatStarted = messages.length > 0;

  return (
    <div style={{
      padding: 24,
      display: "grid",
      gridTemplateColumns: "1.4fr 320px",
      gap: 16,
      height: "calc(100vh - 64px)",
      overflow: "hidden",
    }}>
      <style>{CHAT_CSS}</style>

      {/* ── Left: chat stage ── */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />

        {/* Header */}
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <AriaOrb size={36} active={aiActive} />
            <div className="col" style={{ gap: 0 }}>
              <div className="row gap-2">
                <h3 className="h3" style={{ margin: 0 }}>Aria</h3>
                <span className="pill pill-success" style={{ height: 20 }}>
                  <span className="dot dot-success" style={{ animation: "pulse-soft 1.6s infinite" }} />
                  {aiActive ? "Thinking" : "Online"}
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: "0.06em" }}>
                Quantum core · v4.2 · Groq + Cloudflare
              </span>
            </div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm btn-ghost" onClick={() => setMessages([])}><IconPlus size={13} />New chat</button>
          </div>
        </div>

        {/* ── Landing (no messages yet) ── */}
        {!chatStarted && (
          <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, position: "relative", zIndex: 1, gap: 0 }}>
            <div className="chat-fade-in" style={{ marginBottom: 24 }}>
              <AriaOrb size={100} active={false} pulse />
            </div>
            <div className="chat-fade-d1" style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 300, color: "var(--fg-2)", marginBottom: 4 }}>Good to see you.</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: "var(--fg-1)" }}>How can I <em style={{ fontStyle: "italic" }}>help</em> you today?</div>
            </div>
            <div className="chat-fade-d2" style={{ fontSize: 12.5, color: "var(--fg-3)", marginBottom: 32, textAlign: "center" }}>
              I'm available 24/7 — ask me anything about your company.
            </div>
            <div className="chat-fade-d3" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, marginBottom: 32 }}>
              {["Draft an email to a client", "Summarize today's interviews", "Write a LinkedIn post"].map(label => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: "rgba(var(--accent), 0.08)",
                    border: "1px solid rgba(var(--accent), 0.25)",
                    color: "rgb(var(--accent-3))",
                    cursor: "pointer", transition: "all 0.2s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--accent), 0.15)"; e.currentTarget.style.borderColor = "rgba(var(--accent), 0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(var(--accent), 0.08)"; e.currentTarget.style.borderColor = "rgba(var(--accent), 0.25)"; }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="chat-fade-d3" style={{ width: "100%", maxWidth: 520 }}>
              <ChatInput value={input} onChange={setInput} onSend={() => send()} />
            </div>
          </div>
        )}

        {/* ── Chat messages ── */}
        {chatStarted && (
          <>
            <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, padding: "20px 24px", overflowY: "auto", position: "relative", zIndex: 1 }}>
              <div className="col gap-4">
                {messages.map(m => (
                  <ChatMessage
                    key={m.id}
                    m={m}
                    editingId={editingId}
                    editingText={editingText}
                    setEditingId={setEditingId}
                    setEditingText={setEditingText}
                    onEditSave={handleEditSave}
                  />
                ))}
                {thinking && (
                  <div className="row gap-3 chat-msg-in" style={{ alignItems: "flex-start" }}>
                    <AriaOrb size={28} active={true} />
                    <div style={{
                      padding: "10px 14px",
                      background: "rgba(var(--accent), 0.06)",
                      border: "1px solid rgba(var(--accent), 0.18)",
                      borderRadius: 12,
                      display: "flex", gap: 5, alignItems: "center",
                    }}>
                      {[0, 1, 2].map(j => (
                        <span key={j} className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(var(--accent-3))", display: "inline-block" }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: "12px 18px 18px", borderTop: "1px solid var(--hairline)", position: "relative", zIndex: 1 }}>
              <ChatInput value={input} onChange={setInput} onSend={() => send()} />
              <div className="row" style={{ marginTop: 8, justifyContent: "space-between", fontSize: 10.5, color: "var(--fg-3)" }}>
                <span>↵ to send · ⇧↵ for new line</span>
                <span>Aria v4.2 · Groq + Cloudflare</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right: quick actions ── */}
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="h3">Quick prompts</h3>
            <IconSparkles size={14} style={{ color: "rgb(var(--accent-3))" }} />
          </div>
          <div className="col" style={{ padding: 6 }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => send(p.label)}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "transparent", border: "none", borderRadius: "var(--r-sm)", color: "var(--fg-2)", fontSize: 12.5, fontFamily: "inherit", textAlign: "left", lineHeight: 1.45, cursor: "pointer", transition: "background 0.15s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--accent), 0.06)"; e.currentTarget.style.color = "var(--fg-1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-2)"; }}
              >
                <p.I size={14} style={{ color: "rgb(var(--accent-3))", marginTop: 2, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="h3">Aria can access</h3></div>
          <div className="col" style={{ padding: 4 }}>
            {[
              { I: IconMail,      label: "Email automation",  note: "Active" },
              { I: IconPhone,     label: "Call automation",   note: "Active" },
              { I: IconUsers,     label: "ATS & Interviews",  note: "Active" },
              { I: IconCalendar,  label: "Leave management",  note: "Active" },
              { I: IconBarChart,  label: "HR Analytics",      note: "Live"   },
              { I: IconBriefcase, label: "Job postings",      note: "Active" },
            ].map((c, i) => (
              <div key={i} className="row gap-3" style={{ padding: "8px 12px", borderTop: i > 0 ? "1px solid var(--hairline)" : "none" }}>
                <c.I size={14} style={{ color: "rgb(var(--accent-3))", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: "var(--fg-1)" }}>{c.label}</span>
                <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{c.note}</span>
                <span className="dot dot-success" />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "linear-gradient(180deg, rgba(var(--accent), 0.05), rgba(255,255,255,0.01))", border: "1px solid rgba(var(--accent), 0.2)" }}>
          <div className="card-body" style={{ padding: 16 }}>
            <div className="label-accent" style={{ marginBottom: 8 }}>Aria's notes</div>
            <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.55 }}>
              All 9 AI co-worker features are active. Use the sidebar to navigate between Email, Calls, Posts, ATS, Interviews, Attendance, Leave, and Analytics.
            </div>
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => send("What are all the features in this system and how can I use them?")}>
              <IconSparkles size={12} />Show me the features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AriaOrb — CSS accent-colored orb ─────────────────────────────────────────
function AriaOrb({ size, active, pulse }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, rgba(var(--accent-3), 0.95), rgba(var(--accent), 0.75) 50%, rgba(var(--accent-2), 0.35) 80%, transparent)`,
      boxShadow: active
        ? `0 0 ${size * 0.5}px rgba(var(--accent), 0.7), 0 0 ${size}px rgba(var(--accent), 0.35)`
        : pulse
          ? undefined
          : `0 0 ${size * 0.25}px rgba(var(--accent), 0.35)`,
      animation: active ? "chatOrbPulse 1.2s ease-in-out infinite" : pulse ? "chatOrbPulse 2.8s ease-in-out infinite" : "none",
      transition: "box-shadow 0.3s ease",
    }} />
  );
}

// ── ChatInput — spinning border ───────────────────────────────────────────────
function ChatInput({ value, onChange, onSend }) {
  const [listening, setListening] = React.useState(false);
  const voiceRef = React.useRef(null);
  const inputRef = React.useRef(null);

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      try { voiceRef.current?.stop(); } catch {}
      voiceRef.current = null;
      setListening(false);
      return;
    }
    try {
      const rec = new SR();
      voiceRef.current = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      let final = value;
      rec.onresult = (e) => {
        let interim = "", newFinal = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) newFinal += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (newFinal) { final = (final + " " + newFinal).trim(); onChange(final); }
        else onChange((final + " " + interim).trim());
      };
      rec.onerror = () => { setListening(false); voiceRef.current = null; };
      rec.onend = () => { setListening(false); voiceRef.current = null; inputRef.current?.focus(); };
      rec.start();
      setListening(true);
    } catch { setListening(false); }
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Spinning accent border */}
      <div style={{ borderRadius: 14, padding: "1.5px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 0deg, transparent 0deg, rgba(var(--accent),0.85) 40deg, rgba(var(--accent-3),0.9) 80deg, transparent 140deg, transparent 200deg, rgba(var(--accent-2),0.7) 250deg, rgba(var(--accent),0.85) 290deg, transparent 330deg)", animation: "chatSpinBorder 4s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 180deg, transparent 0deg, rgba(var(--accent-2),0.45) 60deg, rgba(var(--accent),0.35) 100deg, transparent 140deg)", animation: "chatSpinBorderRev 6s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none", animation: "chatGlowPulse 3s ease-in-out infinite" }} />

        <div style={{
          display: "flex", gap: 8, background: "var(--bg-elev-1)",
          borderRadius: 13, padding: "4px 4px 4px 14px",
          position: "relative",
        }}>
          <textarea
            ref={inputRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
            }}
            placeholder={listening ? "Listening…" : "Ask Aria anything — emails, posts, candidates, analytics…"}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--fg-1)", fontFamily: "inherit", fontSize: 13.5,
              padding: "10px 0", resize: "none", minHeight: 24, maxHeight: 100, lineHeight: 1.5,
            }}
          />
          <div className="row gap-1" style={{ alignItems: "center", padding: 4 }}>
            <button
              className={`btn btn-icon btn-sm ${listening ? "btn-primary" : "btn-ghost"}`}
              onClick={toggleVoice}
              title={listening ? "Stop" : "Voice input"}
            >
              <IconMic size={14} />
            </button>
            <button
              className="btn btn-icon btn-sm"
              onClick={onSend}
              disabled={!value.trim()}
              style={{
                background: value.trim() ? "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-2)))" : "var(--bg-elev-2)",
                color: value.trim() ? "white" : "var(--fg-3)",
                borderColor: value.trim() ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
                boxShadow: value.trim() ? "0 4px 16px -4px rgba(var(--accent), 0.6)" : "none",
              }}
            >
              <IconSend size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ChatMessage ───────────────────────────────────────────────────────────────
function ChatMessage({ m, editingId, editingText, setEditingId, setEditingText, onEditSave }) {
  if (m.who === "ai") {
    return (
      <div className="row gap-3 chat-msg-in" style={{ alignItems: "flex-start" }}>
        <AriaOrb size={28} active={false} />
        <div style={{ maxWidth: "78%" }}>
          <div style={{
            background: "white",
            border: "1px solid rgba(var(--accent), 0.12)",
            borderRadius: 14, borderTopLeftRadius: 4,
            overflow: "hidden",
            boxShadow: m.error ? "none" : "0 2px 12px rgba(0,0,0,0.15)",
          }}>
            <div style={{ padding: "6px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(var(--accent), 0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: m.error ? "rgb(var(--danger))" : "rgb(var(--accent))" }}>
                ✦ Aria
              </span>
              {!m.error && <InlineCopyBtn text={m.text} />}
            </div>
            <div style={{ padding: "12px 14px", background: "white" }}>
              {m.error
                ? <span style={{ fontSize: 13.5, color: "rgb(252,165,165)", lineHeight: 1.6 }}>{m.text}</span>
                : <ChatMarkdown text={m.text} />
              }
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 4, marginLeft: 4 }}>Aria · just now</div>
        </div>
      </div>
    );
  }

  /* User message */
  return (
    <div className="row gap-3 chat-msg-in chat-user-msg" style={{ alignItems: "flex-start", flexDirection: "row-reverse" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "white", flexShrink: 0, marginTop: 2 }}>ME</div>
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        {editingId === m.id ? (
          <div style={{ width: "100%", minWidth: 220 }}>
            <textarea
              autoFocus
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditSave(m.id); }
                if (e.key === "Escape") { setEditingId(null); setEditingText(""); }
              }}
              rows={Math.min(6, editingText.split("\n").length + 1)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.6, color: "var(--fg-1)", outline: "none", resize: "none", background: "var(--bg-elev-2)", border: "1px solid rgba(var(--accent), 0.4)", fontFamily: "inherit" }}
            />
            <div className="row gap-2" style={{ marginTop: 6, justifyContent: "flex-end" }}>
              <button className="btn btn-sm btn-ghost" onClick={() => { setEditingId(null); setEditingText(""); }}>Cancel</button>
              <button className="btn btn-sm btn-primary" onClick={() => onEditSave(m.id)}><IconSend size={11} /> Send</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "11px 15px", background: "rgba(var(--accent), 0.1)", border: "1px solid rgba(var(--accent), 0.22)", borderRadius: 14, borderTopRightRadius: 4, fontSize: 13.5, lineHeight: 1.6, color: "var(--fg-1)", whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
            <div className="chat-action-btns row gap-1">
              <button
                onClick={() => { setEditingId(m.id); setEditingText(m.text); }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", fontSize: 10, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "none", color: "var(--fg-3)", cursor: "pointer" }}
              >
                <IconZap size={9} /> Edit
              </button>
              <InlineCopyBtn text={m.text} />
            </div>
          </>
        )}
        <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginRight: 4 }}>You · just now</div>
      </div>
    </div>
  );
}

// ── InlineCopyBtn ─────────────────────────────────────────────────────────────
function InlineCopyBtn({ text }) {
  const [copied, setCopied] = React.useState(false);
  function doCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={doCopy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", fontSize: 10, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "none", color: copied ? "rgb(var(--success))" : "var(--fg-3)", cursor: "pointer", transition: "color 0.2s ease" }}>
      {copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── ChatMarkdown ──────────────────────────────────────────────────────────────
function ChatMarkdown({ text }) {
  if (!text) return null;
  const accent = "#7c3aed";   // fallback for white AI bubble (CSS vars don't work on white bg)
  const primary = "#6d28d9";

  function renderInline(raw) {
    const parts = [];
    let rest = raw, k = 0;
    while (rest.length > 0) {
      const bold = rest.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)$/);
      if (bold && bold[1].length < rest.length) {
        if (bold[1]) parts.push(<span key={k++}>{bold[1]}</span>);
        parts.push(<strong key={k++} style={{ color: "#111", fontWeight: 700 }}>{bold[2]}</strong>);
        rest = bold[3]; continue;
      }
      const ic = rest.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)$/);
      if (ic && ic[1].length < rest.length) {
        if (ic[1]) parts.push(<span key={k++}>{ic[1]}</span>);
        parts.push(<code key={k++} style={{ background: "#f3f0ff", border: "1px solid #ddd4fe", borderRadius: 4, padding: "1px 6px", fontFamily: "monospace", fontSize: "0.82em", color: accent }}>{ic[2]}</code>);
        rest = ic[3]; continue;
      }
      parts.push(<span key={k++}>{rest}</span>);
      break;
    }
    return <>{parts}</>;
  }

  const blocks = text.split(/\n{2,}/);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map((block, bi) => {
        const t = block.trim();
        if (!t) return null;
        const cb = t.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (cb) {
          const lang = cb[1], code = cb[2].replace(/\n$/, "");
          return (
            <div key={bi}>
              {lang && <div style={{ background: "#f3f0ff", borderRadius: "8px 8px 0 0", padding: "3px 12px", borderBottom: "1px solid #e9d5ff" }}><span style={{ fontSize: 10, fontWeight: 600, color: primary, textTransform: "uppercase" }}>{lang}</span></div>}
              <pre style={{ background: "#1e1b2e", borderRadius: lang ? "0 0 8px 8px" : 8, padding: "12px 14px", overflowX: "auto", fontFamily: "monospace", fontSize: 12.5, color: "#e2e8f0", lineHeight: 1.65, margin: 0 }}><code>{code}</code></pre>
            </div>
          );
        }
        const h1 = t.match(/^# (.+)/); if (h1) return <h1 key={bi} style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "2px 0 4px" }}>{renderInline(h1[1])}</h1>;
        const h2 = t.match(/^## (.+)/); if (h2) return <h2 key={bi} style={{ fontSize: 15, fontWeight: 700, color: "#222", margin: "2px 0" }}>{renderInline(h2[1])}</h2>;
        const h3 = t.match(/^### (.+)/); if (h3) return <h3 key={bi} style={{ fontSize: 13, fontWeight: 700, color: primary, margin: "2px 0" }}>{renderInline(h3[1])}</h3>;
        const lines = t.split("\n");
        if (lines.length > 1 && lines.every(l => /^[-*•]\s/.test(l.trim()))) return (
          <ul key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>▸</span><span style={{ color: "#1a1a1a", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^[-*•]\s/, ""))}</span></li>)}
          </ul>
        );
        if (lines.length > 1 && lines.every(l => /^\d+\.\s/.test(l.trim()))) return (
          <ol key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><span style={{ color: accent, flexShrink: 0, fontWeight: 700, fontSize: 13, minWidth: 20, marginTop: 1 }}>{li + 1}.</span><span style={{ color: "#1a1a1a", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^\d+\.\s/, ""))}</span></li>)}
          </ol>
        );
        return (
          <p key={bi} style={{ margin: 0, lineHeight: 1.8, color: "#1a1a1a", fontSize: 13.5 }}>
            {lines.map((l, li) => (
              <React.Fragment key={li}>{renderInline(l)}{li < lines.length - 1 && <br />}</React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

Object.assign(window, { ChatPage });
