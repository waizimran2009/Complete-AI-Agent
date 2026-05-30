/* ─── QuantuMania Premium Chatbot ────────────────────────────────
   Converted from PremiumChatbot.tsx — no TypeScript, no Tailwind.
   Uses window.QuantumOrb3D (exported from launch-screen.jsx)
   Uses window.ariaChat(message, history) → Promise<string>
   ─────────────────────────────────────────────────────────────── */

const THEME = {
  primary:    "#8b5cf6",
  secondary:  "#6366f1",
  accent:     "#06b6d4",
  userBubble: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  aiBorder:   "rgba(99,102,241,0.2)",
  aiText:     "#818cf8",
  bg:         "#050308",
};

const SUGGESTION_PILLS = [
  { Icon: IconSparkles, label: "Any advice for me?" },
  { Icon: IconMail,     label: "Draft a client email" },
  { Icon: IconUsers,    label: "Summarize today's interviews" },
];

const FEMALE_VOICES = [
  "Microsoft Sonia Online (Natural)","Microsoft Libby Online (Natural)",
  "Microsoft Maisie Online (Natural)","Microsoft Ava Online (Natural)",
  "Google UK English Female","Moira","Fiona","Victoria","Karen","Samantha",
];
const MALE_VOICES = [
  "Microsoft Ryan Online (Natural)","Microsoft Davis Online (Natural)",
  "Microsoft Abbi Online (Natural)","Microsoft Alfie Online (Natural)",
  "Google UK English Male","Daniel","Oliver","Thomas","Fred","Alex",
];

function cleanForSpeech(text) {
  text = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, "");
  text = text.replace(/[\u{2300}-\u{27BF}]/gu, "");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*{1,3}([^*\n]*)\*{1,3}/g, "$1");
  text = text.replace(/_{1,2}([^_\n]*)_{1,2}/g, "$1");
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]*`/g, "");
  text = text.replace(/^[-*_]{3,}\s*$/gm, ".");
  text = text.replace(/^\s*[-*+>]\s+/gm, "");
  text = text.replace(/^\s*\d+[.)]\s+/gm, "");
  text = text.replace(/[♂♀✦★☆⚡◆▸▶→←↑↓•·–—|\\/<>[\]{}@#$%^&]/g, " ");
  text = text.replace(/[*#_~]/g, "");
  text = text.replace(/\n{2,}/g, ". ");
  text = text.replace(/\n/g, " ");
  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

const CHAT_STYLES = `
  @keyframes subtleFade   { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes orbFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes orbRing      { 0%{transform:scale(1);opacity:.85} 100%{transform:scale(1.9);opacity:0} }
  @keyframes orbRing2     { 0%{transform:scale(1);opacity:.5}  100%{transform:scale(1.55);opacity:0} }
  @keyframes typingDot    { 0%,80%,100%{transform:scale(.7);opacity:.4} 40%{transform:scale(1);opacity:1} }
  @keyframes voiceRing    { 0%{transform:scale(1);opacity:.7}  100%{transform:scale(2.6);opacity:0} }
  @keyframes voiceRing2   { 0%{transform:scale(1);opacity:.5}  100%{transform:scale(2.2);opacity:0} }
  @keyframes voiceRing3   { 0%{transform:scale(1);opacity:.35} 100%{transform:scale(1.8);opacity:0} }
  @keyframes voiceRing4   { 0%{transform:scale(1);opacity:.25} 100%{transform:scale(1.5);opacity:0} }
  @keyframes orbVoicePulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes waveBar      { 0%,100%{transform:scaleY(.25);opacity:.4} 50%{transform:scaleY(1);opacity:1} }
  @keyframes voiceOverlayIn{ 0%{opacity:0} 100%{opacity:1} }
  @keyframes voiceOrbIn   { 0%{opacity:0;transform:scale(.7)} 100%{opacity:1;transform:scale(1)} }
  @keyframes statusDot    { 0%,80%,100%{opacity:.2;transform:translateY(0)} 40%{opacity:1;transform:translateY(-3px)} }
  @keyframes borderSpin   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes borderSpinRev{ 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
  @keyframes goldPulse    { 0%,100%{box-shadow:0 0 18px rgba(251,191,36,.25),0 0 40px rgba(245,158,11,.1)} 50%{box-shadow:0 0 30px rgba(251,191,36,.5),0 0 70px rgba(245,158,11,.25)} }
  @keyframes shimmer      { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pingDot      { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
  .pc-fade-in    { animation:subtleFade .6s ease forwards; }
  .pc-fade-d1    { animation:subtleFade .6s ease .1s  forwards; opacity:0; }
  .pc-fade-d2    { animation:subtleFade .6s ease .2s  forwards; opacity:0; }
  .pc-fade-d3    { animation:subtleFade .6s ease .35s forwards; opacity:0; }
  .pc-fade-d4    { animation:subtleFade .6s ease .5s  forwards; opacity:0; }
  .pc-msg-in     { animation:subtleFade .35s ease forwards; }
  .pc-typing-dot { animation:typingDot 1.2s infinite; }
  .pc-typing-dot:nth-child(2){ animation-delay:.2s; }
  .pc-typing-dot:nth-child(3){ animation-delay:.4s; }
  .pc-voice-ring-1{ animation:voiceRing  2.4s ease-out infinite; }
  .pc-voice-ring-2{ animation:voiceRing2 2.4s ease-out .5s infinite; }
  .pc-voice-ring-3{ animation:voiceRing3 2.4s ease-out 1s infinite; }
  .pc-voice-ring-4{ animation:voiceRing4 2.4s ease-out 1.5s infinite; }
  .pc-orb-voice  { animation:orbVoicePulse 1.8s ease-in-out infinite; }
  .pc-status-dot { animation:statusDot 1.4s ease-in-out infinite; }
  .pc-status-dot:nth-child(2){ animation-delay:.2s; }
  .pc-status-dot:nth-child(3){ animation-delay:.4s; }
  .pc-ping       { animation:pingDot 1.2s ease-out infinite; }
  .pc-shimmer    {
    background:linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a,#f59e0b,#fbbf24);
    background-size:200% auto; -webkit-background-clip:text;
    -webkit-text-fill-color:transparent; background-clip:text;
    animation:shimmer 2.5s linear infinite;
  }
  .pc-scroll::-webkit-scrollbar{ width:4px; }
  .pc-scroll::-webkit-scrollbar-track{ background:transparent; }
  .pc-scroll::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.1); border-radius:4px; }
  .pc-user-msg .pc-msg-actions{ opacity:0; transition:opacity .15s ease; }
  .pc-user-msg:hover .pc-msg-actions{ opacity:1; }
`;

// ══════════════════════════════════════════════════════════════════════════════
// ChatHistorySidebar
// ══════════════════════════════════════════════════════════════════════════════
function ChatHistorySidebar({ sessions, activeId, onLoad, onNew, onDelete, open, onToggle }) {
  const [hoverId, setHoverId] = React.useState(null);

  function dateLabel(iso) {
    if (!iso) return "";
    const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7)  return "This week";
    if (diff < 30) return "This month";
    return "Older";
  }

  const groups = [];
  let lastLabel = null;
  for (const s of sessions) {
    const lbl = dateLabel(s.updated_at || s.created_at);
    if (lbl !== lastLabel) { groups.push({ label: lbl, items: [] }); lastLabel = lbl; }
    groups[groups.length - 1].items.push(s);
  }

  // ── Collapsed strip ──
  if (!open) {
    return (
      <div style={{ width: 40, flexShrink: 0, background: "rgba(6,4,10,0.97)", borderRight: "1px solid rgba(139,92,246,0.12)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, gap: 12, zIndex: 10 }}>
        <button
          onClick={onToggle}
          title="Open chat history"
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
        >
          ▶
        </button>
        <button
          onClick={onNew}
          title="New chat"
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "rgba(167,139,250,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "#a78bfa"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(167,139,250,0.5)"; }}
        >
          <IconPlus size={14} />
        </button>
      </div>
    );
  }

  // ── Expanded sidebar ──
  return (
    <div style={{ width: 240, flexShrink: 0, background: "linear-gradient(180deg,rgba(10,6,18,0.98) 0%,rgba(6,4,12,0.99) 100%)", borderRight: "1px solid rgba(139,92,246,0.15)", display: "flex", flexDirection: "column", zIndex: 10, position: "relative" }}>

      {/* Purple glow at top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "14px 12px 10px", display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,rgba(139,92,246,0.4),rgba(99,102,241,0.3))", border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSparkles size={11} style={{ color: "#a78bfa" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(196,181,253,0.8)", textTransform: "uppercase" }}>Chat History</span>
        </div>
        <button
          onClick={onToggle}
          title="Collapse"
          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "rgba(167,139,250,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, transition: "all .2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "#a78bfa"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(167,139,250,0.45)"; }}
        >
          ◀
        </button>
      </div>

      {/* New Chat button */}
      <div style={{ padding: "0 10px 10px" }}>
        <button
          onClick={onNew}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.4)", background: "linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08))", color: "#c4b5fd", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", transition: "all .2s ease", boxShadow: "0 0 16px rgba(139,92,246,0.08)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.18))"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08))"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(139,92,246,0.08)"; }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconPlus size={11} />
          </div>
          New Chat
        </button>
      </div>

      {/* Divider */}
      <div style={{ margin: "0 10px 4px", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.25),transparent)" }} />

      {/* Sessions list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 6px 12px" }} className="pc-scroll">
        {sessions.length === 0 && (
          <div style={{ padding: "40px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconSparkles size={18} style={{ color: "rgba(139,92,246,0.4)" }} />
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
              No previous chats.<br />Start a conversation!
            </div>
          </div>
        )}
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ padding: "10px 10px 5px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(139,92,246,0.12)" }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(167,139,250,0.35)", whiteSpace: "nowrap" }}>{g.label}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(139,92,246,0.12)" }} />
            </div>
            {g.items.map(s => {
              const isActive = activeId === s.id;
              const isHov = hoverId === s.id;
              return (
                <div key={s.id} style={{ position: "relative", marginBottom: 2 }}
                  onMouseEnter={() => setHoverId(s.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <button
                    onClick={() => onLoad(s)}
                    style={{ width: "100%", textAlign: "left", padding: "8px 30px 8px 10px", borderRadius: 9, border: `1px solid ${isActive ? "rgba(139,92,246,0.4)" : "transparent"}`, background: isActive ? "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.12))" : isHov ? "rgba(255,255,255,0.04)" : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all .15s ease", boxShadow: isActive ? "0 0 12px rgba(139,92,246,0.15)" : "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      {isActive && <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(180deg,#a78bfa,#6366f1)", flexShrink: 0 }} />}
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: isActive ? 500 : 400, color: isActive ? "#e2d9ff" : isHov ? "#d1d5db" : "#9ca3af" }}>{s.title}</div>
                    </div>
                  </button>
                  {isHov && (
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                      title="Delete"
                      style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "none", background: "rgba(239,68,68,0.12)", color: "rgba(239,68,68,0.65)", cursor: "pointer", transition: "all .15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.28)"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "rgba(239,68,68,0.65)"; }}
                    >
                      <IconClose size={9} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(52,211,153,0.7)", boxShadow: "0 0 6px rgba(52,211,153,0.5)" }} />
        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>SUPABASE SYNC ACTIVE</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ChatPage
// ══════════════════════════════════════════════════════════════════════════════
function ChatPage() {
  const beatRef            = React.useRef({ intensity: 0 });
  const [inputVal,         setInputVal]         = React.useState("");
  const [beatPulse,        setBeatPulse]         = React.useState(0);
  const [messages,         setMessages]          = React.useState([]);
  const [isTyping,         setIsTyping]          = React.useState(false);
  const [chatOpen,         setChatOpen]          = React.useState(false);
  const [voiceOrbOpen,     setVoiceOrbOpen]      = React.useState(false);
  const [wakewordReady,    setWakewordReady]     = React.useState(false);
  // Session state
  const [sessions,         setSessions]          = React.useState([]);
  const [activeSessionId,  setActiveSessionId]   = React.useState(null);
  const [chatHistoryOpen,  setChatHistoryOpen]   = React.useState(true);

  const voiceOrbOpenRef    = React.useRef(false);
  const wakewordRecRef     = React.useRef(null);
  const wakewordPausedRef  = React.useRef(false);
  const bottomRef          = React.useRef(null);

  React.useEffect(() => { voiceOrbOpenRef.current = voiceOrbOpen; }, [voiceOrbOpen]);

  // Load chat sessions on mount
  React.useEffect(() => {
    window.chatSessions?.list().then(s => setSessions(s)).catch(() => {});
  }, []);

  // Wakeword: "Hey Quantum" opens voice orb
  React.useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || voiceOrbOpen) {
      setWakewordReady(false);
      if (wakewordRecRef.current) { try { wakewordRecRef.current.abort(); } catch {} wakewordRecRef.current = null; }
      return;
    }
    let destroyed = false;
    function isWakeword(t) {
      const s = t.toLowerCase().trim();
      return s.includes("hey quantum") || s.includes("ok quantum") || s.includes("hi quantum") || s.includes("quantum");
    }
    function start() {
      if (destroyed) return;
      try {
        const rec = new SR();
        wakewordRecRef.current = rec;
        rec.continuous = false; rec.interimResults = false; rec.lang = "en-US"; rec.maxAlternatives = 5;
        rec.onstart = () => { if (!destroyed) setWakewordReady(true); };
        rec.onresult = (e) => {
          if (destroyed) return;
          for (let i = 0; i < e.results.length; i++)
            for (let j = 0; j < e.results[i].length; j++)
              if (isWakeword(e.results[i][j].transcript)) { setVoiceOrbOpen(true); return; }
        };
        rec.onend = () => { if (!destroyed && !wakewordPausedRef.current) setTimeout(start, 250); };
        rec.onerror = (e) => {
          if (e.error === "not-allowed" || e.error === "service-not-allowed") { destroyed = true; setWakewordReady(false); return; }
          if (!destroyed && !wakewordPausedRef.current) setTimeout(start, 1500);
        };
        rec.start();
      } catch { if (!destroyed) setTimeout(start, 2000); }
    }
    start();
    return () => {
      destroyed = true; setWakewordReady(false);
      if (wakewordRecRef.current) { try { wakewordRecRef.current.abort(); } catch {} wakewordRecRef.current = null; }
    };
  }, [voiceOrbOpen]);

  const stopSpeaking = React.useCallback(() => { window.speechSynthesis?.cancel(); }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function triggerBeat() { beatRef.current.intensity = 1.0; setBeatPulse(p => p + 1); }

  function newChat() {
    setMessages([]);
    setChatOpen(false);
    setActiveSessionId(null);
    setInputVal("");
  }

  async function loadSession(session) {
    const msgs = await window.chatSessions.getMessages(session.id);
    setActiveSessionId(session.id);
    setMessages(msgs.map((m, i) => ({ role: m.role, text: m.content, id: m.id || i })));
    setChatOpen(msgs.length > 0);
    setInputVal("");
  }

  async function deleteSession(id) {
    await window.chatSessions.delete(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) newChat();
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const uid = Date.now();
    const isFirstMsg = messages.length === 0;
    const newMsgs = [...messages, { role: "user", text: trimmed, id: uid }];
    setMessages(newMsgs);
    setChatOpen(true);
    triggerBeat();
    setInputVal("");
    setIsTyping(true);

    // Ensure a session exists
    let sid = activeSessionId;
    if (!sid) {
      const session = await window.chatSessions.create();
      sid = session.id;
      setActiveSessionId(sid);
      setSessions(prev => [session, ...prev]);
    }

    let reply = "";
    try {
      const history = newMsgs.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text,
      }));
      reply = (await window.ariaChat(trimmed, history)).trim();
      setMessages(prev => [...prev, { role: "ai", text: reply, id: uid + 1 }]);
      triggerBeat();
    } catch {
      reply = "Sorry, something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "ai", text: reply, id: uid + 1 }]);
    } finally {
      setIsTyping(false);
    }

    // Persist to Supabase
    const title = isFirstMsg ? trimmed.slice(0, 60) + (trimmed.length > 60 ? "…" : "") : null;
    window.chatSessions.saveMessages(sid, [
      { role: "user", content: trimmed },
      { role: "ai",  content: reply },
    ], title);

    // Update local session list
    setSessions(prev => prev.map(s =>
      s.id === sid
        ? { ...s, updated_at: new Date().toISOString(), ...(isFirstMsg ? { title: title } : {}) }
        : s
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
  }

  const handleSend = () => sendMessage(inputVal);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", width: "100%", color: "white", fontFamily: "var(--font-sans)", overflow: "hidden", background: THEME.bg }}>
      <style>{CHAT_STYLES}</style>

      {/* ── Chat History Sidebar ── */}
      <ChatHistorySidebar
        sessions={sessions}
        activeId={activeSessionId}
        onLoad={loadSession}
        onNew={newChat}
        onDelete={deleteSession}
        open={chatHistoryOpen}
        onToggle={() => setChatHistoryOpen(o => !o)}
      />

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <PremiumCanvas />

        {/* ── Top bar ── */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "flex-start", padding: "16px 20px", zIndex: 20 }}>
          {chatOpen && (
            <button
              onClick={newChat}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              <IconPlus size={12} /> New chat
            </button>
          )}
        </div>

        {/* ── Landing view ── */}
        {!chatOpen && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative" }}>
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-62%)", pointerEvents: "none" }} />

            <OrbWrapper beatPulse={beatPulse} beatRef={beatRef} size={160} floats />

            <div className="pc-fade-d1" style={{ textAlign: "center", marginBottom: 12, marginTop: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: "#d1d5db", marginBottom: 4 }}>Good to See You!</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: "white" }}>
                How Can I <span style={{ fontWeight: 700, fontStyle: "italic" }}>Help</span> You Today?
              </div>
            </div>

            <p className="pc-fade-d2" style={{ fontSize: 13, color: "#6b7280", marginBottom: 48, textAlign: "center" }}>
              I'm available 24/7 for you, ask me anything.
            </p>

            <div className="pc-fade-d3" style={{ width: "100%", maxWidth: 576 }}>
              <InputCard
                inputVal={inputVal}
                setInputVal={setInputVal}
                onSend={handleSend}
                onMic={() => setVoiceOrbOpen(true)}
                onVoiceInputStart={() => { wakewordPausedRef.current = true; if (wakewordRecRef.current) { try { wakewordRecRef.current.abort(); } catch {} } setWakewordReady(false); }}
                onVoiceInputEnd={() => { wakewordPausedRef.current = false; }}
              />
            </div>

            <div className="pc-fade-d4" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 576, marginTop: 16 }}>
              {SUGGESTION_PILLS.map(p => (
                <SuggestionPill key={p.label} Icon={p.Icon} label={p.label} onClick={() => sendMessage(p.label)} />
              ))}
            </div>

            {wakewordReady && (
              <div className="pc-fade-d4" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
                  <span className="pc-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(167,139,250,0.6)" }} />
                  <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />
                </span>
                <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.04em" }}>
                  Say <span style={{ color: "#a78bfa", fontWeight: 500 }}>"Hey Quantum"</span> to open voice
                </span>
              </div>
            )}

            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#374151" }}>
              Unlock new era with QuantuMania.
            </div>
          </div>
        )}

        {/* ── Chat view ── */}
        {chatOpen && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", paddingTop: 64, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 16, paddingBottom: 8, flexShrink: 0 }}>
              <OrbWrapper beatPulse={beatPulse} beatRef={beatRef} size={72} />
            </div>

            <div className="pc-scroll" style={{ flex: 1, overflowY: "auto", padding: chatHistoryOpen ? "16px 24px" : "16px 40px 16px 32px", display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: chatHistoryOpen ? 768 : "none", margin: chatHistoryOpen ? "0 auto" : "0", boxSizing: "border-box" }}>
              {messages.map(msg => (
                <div key={msg.id} className="pc-msg-in" style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                  {msg.role === "ai" && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${THEME.primary}22`, border: `1px solid ${THEME.primary}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <IconSparkles size={14} style={{ color: THEME.primary }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                    {msg.role === "user" ? (
                      <div className="pc-user-msg" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <div style={{ padding: "10px 16px", borderRadius: 16, borderTopRightRadius: 4, fontSize: 13.5, lineHeight: 1.6, background: THEME.userBubble, boxShadow: "0 4px 20px rgba(99,102,241,0.25)", whiteSpace: "pre-wrap" }}>
                          {msg.text}
                        </div>
                        <div className="pc-msg-actions" style={{ display: "flex", gap: 4 }}>
                          <PCCopyButton text={msg.text} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ borderRadius: 16, borderTopLeftRadius: 4, overflow: "hidden", background: "#ffffff", border: `1px solid ${THEME.aiBorder}`, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: `${THEME.primary}18` }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: THEME.primary }}>✦ QuantuMania AI</span>
                          <PCCopyButton text={msg.text} color={THEME.primary} />
                        </div>
                        <div style={{ padding: "14px 16px", background: "#ffffff" }}>
                          <PCMarkdown text={msg.text} accentColor={THEME.primary} primaryColor={THEME.primary} />
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 11, fontWeight: 600, color: "#9ca3af" }}>
                      ME
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="pc-msg-in" style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <IconSparkles size={13} style={{ color: "#818cf8" }} />
                  </div>
                  <div style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px", borderRadius: 16, borderTopLeftRadius: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="pc-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", display: "inline-block" }} />
                    <span className="pc-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", display: "inline-block" }} />
                    <span className="pc-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", display: "inline-block" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ flexShrink: 0, padding: chatHistoryOpen ? "0 24px 24px" : "0 40px 24px 32px", maxWidth: chatHistoryOpen ? 768 : "none", width: "100%", margin: chatHistoryOpen ? "0 auto" : "0", boxSizing: "border-box" }}>
              <InputCard
                inputVal={inputVal}
                setInputVal={setInputVal}
                onSend={handleSend}
                onMic={() => setVoiceOrbOpen(true)}
                onVoiceInputStart={() => { wakewordPausedRef.current = true; if (wakewordRecRef.current) { try { wakewordRecRef.current.abort(); } catch {} } setWakewordReady(false); }}
                onVoiceInputEnd={() => { wakewordPausedRef.current = false; }}
              />
            </div>
          </div>
        )}

        {/* ── Voice Orb Overlay ── */}
        {voiceOrbOpen && (
          <AIVoiceOrbOverlay
            beatRef={beatRef}
            beatPulse={beatPulse}
            onClose={() => { stopSpeaking(); setVoiceOrbOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}

// ── OrbWrapper ────────────────────────────────────────────────────────────────
function OrbWrapper({ beatPulse, beatRef, size, floats }) {
  return (
    <div
      className="pc-fade-in"
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        width: size, height: size,
        animation: floats
          ? "subtleFade .6s ease forwards, orbFloat 3.5s ease-in-out infinite"
          : "subtleFade .6s ease forwards",
      }}
    >
      {beatPulse > 0 && (
        <>
          <div key={`r1-${beatPulse}`} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "2px solid rgba(167,139,250,0.85)", animation: "orbRing .75s cubic-bezier(.2,.6,.4,1) forwards", pointerEvents: "none" }} />
          <div key={`r2-${beatPulse}`} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,0.55)", animation: "orbRing2 .6s cubic-bezier(.2,.6,.4,1) .08s forwards", pointerEvents: "none" }} />
        </>
      )}
      <QuantumOrb3D size={size} beatRef={beatRef} />
    </div>
  );
}

// ── InputCard ─────────────────────────────────────────────────────────────────
function InputCard({ inputVal, setInputVal, onSend, onMic, onVoiceInputStart, onVoiceInputEnd }) {
  const [isVoiceListening, setIsVoiceListening] = React.useState(false);
  const voiceRecRef = React.useRef(null);
  const inputRef = React.useRef(null);

  function toggleVoiceToText() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isVoiceListening) {
      if (voiceRecRef.current) { try { voiceRecRef.current.stop(); } catch {} voiceRecRef.current = null; }
      setIsVoiceListening(false); onVoiceInputEnd?.(); return;
    }
    onVoiceInputStart?.();
    try {
      const rec = new SR(); voiceRecRef.current = rec;
      rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
      let finalText = inputVal;
      rec.onresult = (e) => {
        let interim = "", newFinal = "";
        for (let i = e.resultIndex; i < e.results.length; i++)
          if (e.results[i].isFinal) newFinal += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        if (newFinal) { finalText = (finalText + " " + newFinal).trim(); setInputVal(finalText); }
        else setInputVal((finalText + " " + interim).trim());
      };
      rec.onerror = (e) => { if (e.error === "not-allowed") { setIsVoiceListening(false); voiceRecRef.current = null; onVoiceInputEnd?.(); } };
      rec.onend = () => { setIsVoiceListening(false); voiceRecRef.current = null; onVoiceInputEnd?.(); inputRef.current?.focus(); };
      rec.start(); setIsVoiceListening(true);
    } catch { setIsVoiceListening(false); onVoiceInputEnd?.(); }
  }

  return (
    <div style={{ width: "100%", maxWidth: 576, margin: "0 auto" }}>
      <div style={{ position: "relative", borderRadius: 16, padding: "1.5px" }}>
        {/* Spinning gold border */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 0deg,transparent 0deg,rgba(251,191,36,.9) 40deg,rgba(245,158,11,1) 80deg,rgba(253,230,138,.8) 120deg,transparent 160deg,transparent 200deg,rgba(245,158,11,.7) 240deg,rgba(251,191,36,.9) 280deg,transparent 320deg)", animation: "borderSpin 3.5s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 180deg,transparent 0deg,rgba(168,85,247,.5) 50deg,rgba(251,191,36,.4) 90deg,transparent 130deg)", animation: "borderSpinRev 5.5s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", boxShadow: "0 0 20px 3px rgba(251,191,36,.3),0 0 50px 6px rgba(245,158,11,.15)", animation: "goldPulse 3s ease-in-out infinite" }} />

        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#0a0812" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid rgba(251,191,36,0.08)", background: "#0f0d14", fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#f59e0b", fontSize: 12 }}>♛</span>
              <span style={{ color: "rgba(251,191,36,0.6)" }}>Premium AI · Groq + Cloudflare</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
              <span style={{ color: "rgba(251,191,36,0.5)" }}>Active</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#0f0d14" }}>
            <PCPlusBtn />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onSend(); }}
              placeholder={isVoiceListening ? "Listening…" : "Ask anything…"}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13.5, fontFamily: "inherit" }}
            />
            <button
              onClick={toggleVoiceToText}
              title={isVoiceListening ? "Stop" : "Voice to text"}
              style={{ flexShrink: 0, padding: 6, borderRadius: 8, border: "none", cursor: "pointer", transition: "all .2s ease", background: isVoiceListening ? "rgba(239,68,68,.12)" : "transparent", color: isVoiceListening ? "#ef4444" : "rgba(251,191,36,0.6)", animation: isVoiceListening ? "goldPulse 1s ease-in-out infinite" : "none" }}
            >
              <IconMic size={17} />
            </button>
            <button
              onClick={inputVal.trim() ? onSend : onMic}
              title={inputVal.trim() ? "Send" : "Open voice assistant"}
              style={{ flexShrink: 0, padding: 6, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "#f59e0b", transition: "color .2s ease" }}
            >
              {inputVal.trim() ? <IconSend size={18} /> : <IconSparkles size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PCPlusBtn() {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ flexShrink: 0, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, cursor: "pointer", transition: "all .25s ease", background: hov ? "linear-gradient(135deg,rgba(124,58,237,.4),rgba(59,130,246,.35))" : "rgba(255,255,255,.04)", border: hov ? "1px solid rgba(167,139,250,.8)" : "1px solid rgba(167,139,250,.45)", color: hov ? "#c4b5fd" : "#a78bfa", boxShadow: hov ? "0 0 14px rgba(139,92,246,.7),0 0 30px rgba(59,130,246,.3)" : "0 0 8px rgba(139,92,246,.4)" }}
    >
      <IconPlus size={15} />
    </button>
  );
}

function SuggestionPill({ Icon, label, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 999, background: hov ? "linear-gradient(135deg,#7c3aed,#3b82f6)" : "linear-gradient(135deg,rgba(124,58,237,.55),rgba(59,130,246,.55))", border: hov ? "1px solid rgba(200,180,255,.8)" : "1px solid rgba(167,139,250,.55)", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .25s ease", whiteSpace: "nowrap", boxShadow: hov ? "0 0 18px rgba(139,92,246,.75)" : "0 0 10px rgba(139,92,246,.45)", fontFamily: "inherit" }}
    >
      <Icon size={13} style={{ color: "rgba(255,255,255,0.85)", flexShrink: 0 }} />
      {label}
    </button>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function PCCopyButton({ text, color }) {
  const [copied, setCopied] = React.useState(false);
  function doCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  if (color) {
    return (
      <button onClick={doCopy} style={{ padding: 4, borderRadius: 6, border: "none", cursor: "pointer", background: "transparent", color: copied ? color : "#6b7280", transition: "color .2s ease" }}>
        {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
      </button>
    );
  }
  return (
    <button onClick={doCopy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "none", color: copied ? "#34d399" : "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
      {copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function PCMarkdown({ text, accentColor, primaryColor }) {
  if (!text) return null;
  function renderInline(raw) {
    const parts = []; let rest = raw, k = 0;
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
        parts.push(<code key={k++} style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}44`, borderRadius: 4, padding: "1px 6px", fontFamily: "monospace", fontSize: ".82em", color: accentColor }}>{ic[2]}</code>);
        rest = ic[3]; continue;
      }
      parts.push(<span key={k++}>{rest}</span>); break;
    }
    return <>{parts}</>;
  }
  const blocks = text.split(/\n{2,}/);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map((block, bi) => {
        const t = block.trim(); if (!t) return null;
        if (/^[-*_]{3,}$/.test(t)) return <hr key={bi} style={{ border: "none", borderTop: "1px solid rgba(139,92,246,0.25)", margin: "4px 0" }} />;
        const cb = t.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (cb) {
          const lang = cb[1], code = cb[2].replace(/\n$/, "");
          return (
            <div key={bi}>
              {lang && <div style={{ background: "rgba(139,92,246,0.15)", borderRadius: "8px 8px 0 0", padding: "3px 12px", borderBottom: "1px solid rgba(139,92,246,0.2)" }}><span style={{ fontSize: 10, fontWeight: 600, color: primaryColor, textTransform: "uppercase" }}>{lang}</span></div>}
              <pre style={{ background: "#050508", borderRadius: lang ? "0 0 8px 8px" : 8, padding: "12px 14px", overflowX: "auto", border: "1px solid rgba(139,92,246,0.2)", fontFamily: "monospace", fontSize: 12.5, color: "#e2e8f0", lineHeight: 1.65, margin: 0 }}><code>{code}</code></pre>
            </div>
          );
        }
        const h1 = t.match(/^# (.+)/);   if (h1) return <h1 key={bi} style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "4px 0 6px" }}>{renderInline(h1[1])}</h1>;
        const h2 = t.match(/^## (.+)/);  if (h2) return <h2 key={bi} style={{ fontSize: 16, fontWeight: 700, color: "#222", margin: "2px 0 4px" }}>{renderInline(h2[1])}</h2>;
        const h3 = t.match(/^### (.+)/); if (h3) return <h3 key={bi} style={{ fontSize: 14, fontWeight: 700, color: primaryColor, margin: "2px 0" }}>{renderInline(h3[1])}</h3>;
        const lines = t.split("\n");
        if (lines.length > 0 && lines.every(l => /^[-*•]\s/.test(l.trim()))) return (
          <ul key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}><span style={{ color: primaryColor, flexShrink: 0, marginTop: 1 }}>▸</span><span style={{ color: "#222", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^[-*•]\s/, ""))}</span></li>)}
          </ul>
        );
        if (lines.length > 0 && lines.every(l => /^\d+\.\s/.test(l.trim()))) return (
          <ol key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}><span style={{ color: primaryColor, flexShrink: 0, fontWeight: 700, fontSize: 13, minWidth: 22, marginTop: 1 }}>{li + 1}.</span><span style={{ color: "#222", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^\d+\.\s/, ""))}</span></li>)}
          </ol>
        );
        return (
          <p key={bi} style={{ margin: 0, lineHeight: 1.8, color: "#1a1a1a", fontSize: 13.5 }}>
            {lines.map((l, li) => <React.Fragment key={li}>{renderInline(l)}{li < lines.length - 1 && <br />}</React.Fragment>)}
          </p>
        );
      })}
    </div>
  );
}

// ── PremiumCanvas (purple node network) ───────────────────────────────────────
function PremiumCanvas() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let animId;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const COLORS = [
      { hex: "#8b5cf6", rgb: "139,92,246" }, { hex: "#6366f1", rgb: "99,102,241" },
      { hex: "#a78bfa", rgb: "167,139,250" }, { hex: "#7c3aed", rgb: "124,58,237" },
      { hex: "#c4b5fd", rgb: "196,181,253" }, { hex: "#f59e0b", rgb: "245,158,11" },
    ];
    const nodes = Array.from({ length: 72 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      r: Math.random() * 1.8 + .8, colorIdx: Math.floor(Math.random() * COLORS.length),
      phase: Math.random() * Math.PI * 2, phaseSpeed: .012 + Math.random() * .018,
    }));
    const streaks = []; let streakTimer = 0;
    function spawnStreak() {
      const edge = Math.random(); let x, y, vx, vy;
      if (edge < .5) { x = Math.random() * W; y = 0; vx = (Math.random() - .5) * 3; vy = 1.5 + Math.random() * 2; }
      else { x = 0; y = Math.random() * H; vx = 1.5 + Math.random() * 2; vy = (Math.random() - .5) * 3; }
      streaks.push({ x, y, vx, vy, life: 60 + Math.random() * 60, maxLife: 60 + Math.random() * 60 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H); streakTimer++;
      if (streakTimer > 120 && Math.random() < .015) { spawnStreak(); streakTimer = 0; }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i], alpha = (s.life / s.maxLife) * .7, tl = 60;
        const g = ctx.createLinearGradient(s.x - s.vx * tl, s.y - s.vy * tl, s.x, s.y);
        g.addColorStop(0, "rgba(251,191,36,0)"); g.addColorStop(1, `rgba(251,191,36,${alpha})`);
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * tl, s.y - s.vy * tl); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life--;
        if (s.life <= 0 || s.x > W + 100 || s.y > H + 100) streaks.splice(i, 1);
      }
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.phase += n.phaseSpeed;
        if (n.x < 0) { n.x = 0; n.vx *= -1; } if (n.x > W) { n.x = W; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; } if (n.y > H) { n.y = H; n.vy *= -1; }
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const al = (1 - dist / 160) * .35;
          const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          g.addColorStop(0, `rgba(139,92,246,${al})`); g.addColorStop(1, `rgba(99,102,241,${al * .6})`);
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = g; ctx.lineWidth = .7; ctx.stroke();
        }
      }
      for (const n of nodes) {
        const pulse = Math.sin(n.phase) * .5 + .5, r = n.r + pulse * 2, alpha = .5 + pulse * .5;
        const { hex, rgb } = COLORS[n.colorIdx];
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        glow.addColorStop(0, `rgba(${rgb},${alpha * .45})`); glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.globalAlpha = alpha; ctx.fillStyle = hex; ctx.fill(); ctx.globalAlpha = 1;
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    function onResize() { W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W; canvas.height = H; }
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity: .65 }} />;
}

// ── AI Voice Orb Overlay ──────────────────────────────────────────────────────
function AIVoiceOrbOverlay({ beatRef, beatPulse, onClose }) {
  const WAVE_BARS = 28;
  const [voiceGender,      setVoiceGender]      = React.useState(null);
  const [showSwitcher,     setShowSwitcher]      = React.useState(false);
  const [localStatus,      setLocalStatus]       = React.useState("listening");
  const [userText,         setUserText]          = React.useState("");
  const [aiText,           setAiText]            = React.useState("");
  const isActiveRef = React.useRef(true);

  React.useEffect(() => {
    if (!voiceGender) return;
    isActiveRef.current = true;
    let recognition = null;

    function pickVoice(voices) {
      const preferred = voiceGender === "female" ? FEMALE_VOICES : MALE_VOICES;
      for (const name of preferred) { const v = voices.find(vv => vv.name.includes(name)); if (v) return v; }
      return voices.find(vv => vv.lang.toLowerCase().startsWith("en")) ?? voices[0] ?? null;
    }

    function speakResponse(text) {
      if (!isActiveRef.current) return;
      const cleanText = cleanForSpeech(text);
      setLocalStatus("speaking"); setAiText(text);
      if (!window.speechSynthesis) { setTimeout(listen, 300); return; }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(cleanText);
      const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const picked = pickVoice(voices); if (picked) utt.voice = picked;
        if (voiceGender === "male") { utt.rate = .90; utt.pitch = .85; utt.volume = 1; }
        else { utt.rate = .88; utt.pitch = 1.08; utt.volume = 1; }
        utt.onend = () => { if (isActiveRef.current) setTimeout(listen, 600); };
        utt.onerror = () => { if (isActiveRef.current) setTimeout(listen, 600); };
        window.speechSynthesis.speak(utt);
      };
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) trySpeak();
      else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; trySpeak(); }; }
    }

    async function sendQuery(text) {
      if (!isActiveRef.current) return;
      setLocalStatus("thinking"); setUserText(text); setAiText("");
      try {
        const reply = await window.ariaChat(text, []);
        if (isActiveRef.current) speakResponse(reply.trim());
      } catch {
        if (isActiveRef.current) speakResponse("Sorry, I had a bit of trouble there. Could you try again?");
      }
    }

    function listen() {
      if (!isActiveRef.current) return;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { setLocalStatus("listening"); return; }
      if (recognition) { try { recognition.abort(); } catch {} recognition = null; }
      let transcriptText = ""; setLocalStatus("listening"); setUserText("");
      const rec = new SR(); recognition = rec;
      rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
      rec.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; transcriptText = t; setUserText(t); };
      rec.onend = () => {
        if (!isActiveRef.current) return;
        if (transcriptText.trim()) setTimeout(() => { if (isActiveRef.current) sendQuery(transcriptText); }, 900);
        else setTimeout(listen, 600);
      };
      rec.onerror = (e) => { if (!isActiveRef.current || e.error === "not-allowed") return; setTimeout(() => { if (isActiveRef.current) listen(); }, 800); };
      try { rec.start(); } catch {}
    }

    listen();
    return () => {
      isActiveRef.current = false;
      if (recognition) { try { recognition.abort(); } catch {} }
      window.speechSynthesis?.cancel();
    };
  }, [voiceGender]);

  const waveDelays = Array.from({ length: WAVE_BARS }, (_, i) => {
    const center = (WAVE_BARS - 1) / 2, dist = Math.abs(i - center) / center;
    return .05 + dist * .55;
  });

  const statusConfig = {
    listening: { label: "Listening", ringColor: "rgba(251,191,36,", textColor: "#fbbf24", dotClass: "bg-amber-400", ringDur: "2.4s" },
    thinking:  { label: "Thinking",  ringColor: "rgba(251,146,60,", textColor: "#fb923c", dotClass: "bg-orange-400", ringDur: "3.5s" },
    speaking:  { label: "Speaking",  ringColor: "rgba(234,179,8,",  textColor: "#eab308", dotClass: "bg-yellow-400", ringDur: "1.4s" },
  };
  const sc = statusConfig[localStatus];

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,rgba(10,8,4,.96) 0%,rgba(20,14,4,.95) 50%,rgba(6,6,10,.96) 100%)", backdropFilter: "blur(28px)", animation: "voiceOverlayIn .35s ease forwards" }}>
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 80px rgba(251,191,36,.04),inset 0 1px 0 rgba(251,191,36,.12)", pointerEvents: "none" }} />

      {/* Close */}
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, padding: 8, borderRadius: "50%", border: "1px solid rgba(251,191,36,.2)", background: "rgba(251,191,36,.06)", color: "#d4a520", cursor: "pointer" }}>
        <IconClose size={18} />
      </button>

      {/* Header badge */}
      <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(251,191,36,.25)", background: "rgba(251,191,36,.08)", boxShadow: "0 0 20px rgba(251,191,36,.1)" }}>
          <span style={{ color: "#fbbf24", fontSize: 12 }}>♛</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#fbbf24" }}>QuantuMania Premium Voice</span>
        </div>
      </div>

      {/* Gender picker */}
      {!voiceGender && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "0 24px", animation: "voiceOrbIn .4s cubic-bezier(.22,1,.36,1) forwards" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, color: "#fbbf24", marginBottom: 8 }}>♛</div>
            <p style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Choose a voice</p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>Select the voice you'd like to talk with</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ id: "female", icon: "♀", label: "Female" }, { id: "male", icon: "♂", label: "Male" }].map(v => (
              <button key={v.id} onClick={() => setVoiceGender(v.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 40px", borderRadius: 16, border: "1px solid rgba(251,191,36,.2)", background: "rgba(251,191,36,.06)", boxShadow: "0 0 32px rgba(251,191,36,.06)", cursor: "pointer", transition: "all .2s ease", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,.12)"; e.currentTarget.style.borderColor = "rgba(251,191,36,.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,.06)"; e.currentTarget.style.borderColor = "rgba(251,191,36,.2)"; }}
              >
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(251,191,36,.15)", border: "1px solid rgba(251,191,36,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fbbf24" }}>{v.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", color: "#fbbf24" }}>{v.label}</span>
                <span style={{ fontSize: 9, color: "rgba(245,158,11,0.7)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Premium</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {voiceGender && (
        <>
          {/* Gender badge */}
          <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <button onClick={() => setShowSwitcher(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500, border: "1px solid rgba(251,191,36,.3)", background: "rgba(251,191,36,.1)", color: "#fbbf24", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 14 }}>♛</span>
              {voiceGender === "female" ? "♀ Female voice" : "♂ Male voice"}
              <span style={{ opacity: .6 }}>⇅</span>
            </button>
          </div>

          {/* Orb + rings */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", animation: "voiceOrbIn .4s cubic-bezier(.22,1,.36,1) forwards" }}>
            {["pc-voice-ring-1","pc-voice-ring-2","pc-voice-ring-3","pc-voice-ring-4"].map((cls, i) => (
              <div key={i} className={cls} style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: `${i < 2 ? "1.5px" : "1px"} solid ${sc.ringColor}${[".55)",".4)",".3)",".18)"][i]}`, animationDuration: sc.ringDur, pointerEvents: "none" }} />
            ))}
            <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,191,36,.18) 0%,rgba(234,179,8,.08) 50%,transparent 70%)", pointerEvents: "none" }} />
            <div className="pc-orb-voice">
              <OrbWrapper beatPulse={beatPulse} beatRef={beatRef} size={220} floats />
            </div>
          </div>

          {/* Transcript */}
          <div style={{ marginTop: 20, padding: "0 40px", textAlign: "center", maxWidth: 380, minHeight: 44 }}>
            {localStatus === "listening" && userText && <p style={{ fontSize: 13, color: "#d1d5db", fontStyle: "italic", lineHeight: 1.6 }}>"{userText}"</p>}
            {localStatus === "listening" && !userText && <p style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.06em" }}>Say anything to start…</p>}
            {localStatus === "thinking" && userText && <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>"{userText}"</p>}
            {localStatus === "speaking" && aiText && <p style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{aiText}</p>}
          </div>

          {/* Status + waveform */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 300, letterSpacing: "0.15em", color: sc.textColor }}>{sc.label}</span>
              {localStatus !== "thinking" ? (
                <>
                  <span className="pc-status-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: sc.textColor, display: "inline-block" }} />
                  <span className="pc-status-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: sc.textColor, display: "inline-block" }} />
                  <span className="pc-status-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: sc.textColor, display: "inline-block" }} />
                </>
              ) : (
                <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                  {[0, 1, 2].map(i => <span key={i} className="pc-typing-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "#fbbf24", display: "inline-block", animationDelay: `${i * .2}s` }} />)}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
              {waveDelays.map((delay, i) => {
                const lc = `rgba(${i%3===0?"139,92,246":i%3===1?"99,102,241":"6,182,212"},.8)`;
                const tc = `rgba(251,191,36,${.2 + (i / WAVE_BARS) * .35})`;
                const sc2 = `rgba(${i%3===0?"52,211,153":i%3===1?"99,102,241":"139,92,246"},.9)`;
                const barColor = localStatus === "thinking" ? tc : localStatus === "speaking" ? sc2 : lc;
                const dur = localStatus === "speaking" ? .38 + (i % 5) * .07 : .7 + (i % 5) * .12;
                return <div key={i} style={{ width: 3, height: 28, borderRadius: 4, background: barColor, transformOrigin: "bottom", animation: `waveBar ${dur}s ease-in-out ${delay}s infinite`, opacity: localStatus === "thinking" ? .45 : 1 }} />;
              })}
            </div>
          </div>

          {/* Voice switcher + End button */}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {showSwitcher ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 16, border: "1px solid rgba(251,191,36,.2)", background: "rgba(20,14,4,.8)" }}>
                {[{ id: "female", icon: "♀", label: "Female" }, { id: "male", icon: "♂", label: "Male" }].map(v => (
                  <button key={v.id} onClick={() => { setVoiceGender(v.id); setShowSwitcher(false); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .2s ease", background: voiceGender === v.id ? "rgba(251,191,36,.2)" : "transparent", border: voiceGender === v.id ? "1px solid rgba(251,191,36,.5)" : "1px solid transparent", color: voiceGender === v.id ? "#fbbf24" : "#4b5563" }}
                  >
                    <span style={{ fontSize: 20 }}>{v.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{v.label}</span>
                  </button>
                ))}
                <button onClick={() => setShowSwitcher(false)} style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 11 }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowSwitcher(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, fontSize: 11, fontWeight: 500, border: "1px solid rgba(251,191,36,.2)", background: "rgba(251,191,36,.06)", color: "#d97706", cursor: "pointer", fontFamily: "inherit" }}>
                ⇅ Switch voice
              </button>
            )}
            <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 28px", borderRadius: 999, fontSize: 13, fontWeight: 500, border: "1px solid rgba(251,191,36,.25)", background: "rgba(251,191,36,.1)", color: "#d97706", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 20px rgba(251,191,36,.1)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#d97706" }} />
              End voice chat
            </button>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { ChatPage });
