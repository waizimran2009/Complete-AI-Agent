/* ─── Premium Chat — Aria AI co-worker ───────────────────────────
   Gold theme · GoldOrb · particle canvas · markdown renderer
   API: window.ariaChat(message, history) → Promise<string>
   ─────────────────────────────────────────────────────────────── */

const CHAT_CSS = `
  @keyframes chatFade {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatOrbFloat {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-14px); }
    100% { transform: translateY(0px); }
  }
  @keyframes chatOrbRing {
    0%   { transform: scale(1);   opacity: 0.85; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes chatOrbRing2 {
    0%   { transform: scale(1);    opacity: 0.5; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes chatTypingDot {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }
  @keyframes chatGoldPulse {
    0%, 100% { box-shadow: 0 0 18px rgba(251,191,36,0.25), 0 0 40px rgba(245,158,11,0.1); }
    50%       { box-shadow: 0 0 30px rgba(251,191,36,0.5),  0 0 70px rgba(245,158,11,0.25); }
  }
  @keyframes chatBorderSpin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes chatBorderSpinRev {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  @keyframes chatShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .chat-d0 { animation: chatFade 0.6s ease forwards; }
  .chat-d1 { animation: chatFade 0.6s ease 0.1s forwards; opacity: 0; }
  .chat-d2 { animation: chatFade 0.6s ease 0.25s forwards; opacity: 0; }
  .chat-d3 { animation: chatFade 0.6s ease 0.4s forwards; opacity: 0; }
  .chat-msg-in { animation: chatFade 0.35s ease forwards; }
  .chat-dot { animation: chatTypingDot 1.2s infinite; }
  .chat-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-dot:nth-child(3) { animation-delay: 0.4s; }
  .chat-scroll::-webkit-scrollbar { width: 4px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

// ── ChatPage ──────────────────────────────────────────────────────────────────
function ChatPage() {
  const beatRef = React.useRef({ intensity: 0 });
  const [beatPulse, setBeatPulse] = React.useState(0);
  const [inputVal, setInputVal] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [editingText, setEditingText] = React.useState("");
  const [hoveredId, setHoveredId] = React.useState(null);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function triggerBeat() {
    beatRef.current.intensity = 1.0;
    setBeatPulse(p => p + 1);
  }

  async function send(text, priorMessages) {
    const trimmed = (typeof text === "string" ? text : inputVal).trim();
    if (!trimmed || isTyping) return;
    setInputVal("");

    const base = priorMessages !== undefined ? priorMessages : messages;
    const id = Date.now();
    const newMsgs = [...base, { role: "user", text: trimmed, id }];
    setMessages(newMsgs);
    triggerBeat();
    setIsTyping(true);

    try {
      const history = newMsgs.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text,
      }));
      const reply = await window.ariaChat(trimmed, history);
      setMessages(prev => [...prev, { role: "ai", text: reply.trim(), id: id + 1 }]);
      triggerBeat();
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "Couldn't reach the neural net — try again in a moment.", id: id + 1, error: true }]);
    }
    setIsTyping(false);
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

  const chatOpen = messages.length > 0;

  return (
    <div style={{
      position: "relative",
      height: "calc(100vh - 64px)",
      background: "#050308",
      color: "white",
      fontFamily: "var(--font-sans)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <ChatCanvas />
      <style>{CHAT_CSS}</style>

      {/* ── Landing view ── */}
      {!chatOpen && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", position: "relative", zIndex: 10,
        }}>
          <div style={{
            position: "absolute", width: 340, height: 340, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%, -62%)", pointerEvents: "none",
          }} />

          <OrbWrapper beatPulse={beatPulse} beatRef={beatRef} size={160} floats />

          <div className="chat-d1" style={{ textAlign: "center", marginTop: 24, marginBottom: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: "#d1d5db", marginBottom: 4 }}>Good to See You!</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "white" }}>
              How Can I <em style={{ fontStyle: "italic", fontWeight: 700 }}>Help</em> You Today?
            </div>
          </div>

          <div className="chat-d2" style={{ fontSize: 13, color: "#6b7280", marginBottom: 40, textAlign: "center" }}>
            I'm available 24/7 — ask me anything.
          </div>

          <div className="chat-d3" style={{ width: "100%", maxWidth: 576 }}>
            <PremiumInput inputVal={inputVal} setInputVal={setInputVal} onSend={() => send()} />
          </div>

          <div className="chat-d3" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 576, marginTop: 20 }}>
            {["Draft an email to a client", "Summarize today's interviews", "Write a LinkedIn post about us"].map(label => (
              <SuggestionPill key={label} label={label} onClick={() => send(label)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Chat view ── */}
      {chatOpen && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 12, zIndex: 10, overflow: "hidden" }}>
          {/* Orb + New Chat */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 8, flexShrink: 0, position: "relative" }}>
            <OrbWrapper beatPulse={beatPulse} beatRef={beatRef} size={56} />
            <button
              onClick={() => setMessages([])}
              style={{
                position: "absolute", right: 20,
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 999,
                border: "1px solid rgba(251,191,36,0.25)",
                background: "rgba(251,191,36,0.06)",
                color: "#d97706", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              <IconPlus size={12} /> New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{
            flex: 1, overflowY: "auto", padding: "16px 24px",
            display: "flex", flexDirection: "column", gap: 20,
            maxWidth: 768, width: "100%", marginLeft: "auto", marginRight: "auto",
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className="chat-msg-in"
                style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {msg.role === "ai" && (
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <IconSparkles size={14} style={{ color: "#fbbf24" }} />
                  </div>
                )}

                <div style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}>
                  {msg.role === "user" ? (
                    <>
                      {editingId === msg.id ? (
                        <div style={{ minWidth: 220, maxWidth: 340 }}>
                          <textarea
                            autoFocus
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(msg.id); }
                              if (e.key === "Escape") { setEditingId(null); setEditingText(""); }
                            }}
                            rows={Math.min(6, editingText.split("\n").length + 1)}
                            style={{
                              width: "100%", padding: "10px 14px", borderRadius: 14,
                              fontSize: 13, lineHeight: 1.6, color: "white",
                              outline: "none", resize: "none",
                              background: "linear-gradient(135deg,#d97706,#ea580c)",
                              border: "1.5px solid rgba(251,191,36,0.6)",
                              boxShadow: "0 0 16px rgba(251,191,36,0.3)",
                              fontFamily: "inherit",
                            }}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 6, justifyContent: "flex-end" }}>
                            <button onClick={() => { setEditingId(null); setEditingText(""); }} style={{ padding: "4px 12px", fontSize: 11, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleEditSave(msg.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", fontSize: 11, borderRadius: 8, background: "#f59e0b", border: "none", color: "#1a0800", fontWeight: 600, cursor: "pointer" }}>
                              <IconSend size={10} /> Send
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{
                            padding: "10px 14px", borderRadius: 14, borderTopRightRadius: 4,
                            fontSize: 13, lineHeight: 1.6, color: "white",
                            background: "linear-gradient(135deg,#d97706,#ea580c)",
                            boxShadow: "0 2px 16px rgba(251,191,36,0.2)",
                            whiteSpace: "pre-wrap",
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ display: "flex", gap: 4, opacity: hoveredId === msg.id ? 1 : 0, transition: "opacity 0.15s ease" }}>
                            <button
                              onClick={() => { setEditingId(msg.id); setEditingText(msg.text); }}
                              style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "none", color: "#9ca3af", cursor: "pointer" }}
                            >
                              <IconZap size={9} /> Edit
                            </button>
                            <GoldCopyBtn text={msg.text} iconOnly />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{
                      borderRadius: 14, borderTopLeftRadius: 4,
                      overflow: "hidden", background: "white",
                      border: "1px solid rgba(251,191,36,0.15)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.07)",
                        background: "rgba(251,191,36,0.08)",
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706" }}>
                          ✦ QuantuMania AI
                        </span>
                        <GoldCopyBtn text={msg.text} color="#d97706" />
                      </div>
                      <div style={{ padding: "14px 16px", background: "white" }}>
                        <ChatMarkdown text={msg.text} accentColor="#f59e0b" primaryColor="#d97706" />
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2, fontSize: 10, fontWeight: 700, color: "#fcd34d",
                  }}>ME</div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chat-msg-in" style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                }}>
                  <IconSparkles size={13} style={{ color: "#fbbf24" }} />
                </div>
                <div style={{
                  padding: "12px 16px", borderRadius: 14, borderTopLeftRadius: 4,
                  background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ flexShrink: 0, padding: "0 24px 24px", maxWidth: 768, width: "100%", marginLeft: "auto", marginRight: "auto" }}>
            <PremiumInput inputVal={inputVal} setInputVal={setInputVal} onSend={() => send()} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── OrbWrapper ────────────────────────────────────────────────────────────────
function OrbWrapper({ beatPulse, beatRef, size, floats }) {
  return (
    <div
      className="chat-d0"
      style={{
        width: size, height: size, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: floats
          ? "chatFade 0.6s ease forwards, chatOrbFloat 3.5s ease-in-out infinite"
          : "chatFade 0.6s ease forwards",
      }}
    >
      {beatPulse > 0 && (
        <>
          <div key={`r1-${beatPulse}`} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "2px solid rgba(251,191,36,0.85)", animation: "chatOrbRing 0.75s cubic-bezier(0.2,0.6,0.4,1) forwards", pointerEvents: "none" }} />
          <div key={`r2-${beatPulse}`} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1.5px solid rgba(245,158,11,0.55)", animation: "chatOrbRing2 0.6s cubic-bezier(0.2,0.6,0.4,1) 0.08s forwards", pointerEvents: "none" }} />
        </>
      )}
      <GoldOrb size={size} />
    </div>
  );
}

function GoldOrb({ size }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 45%, #92400e 80%, #1c0700)",
      boxShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(245,158,11,0.25), inset 0 0 20px rgba(255,255,255,0.15)",
    }} />
  );
}

// ── PremiumInput ──────────────────────────────────────────────────────────────
function PremiumInput({ inputVal, setInputVal, onSend }) {
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
      let finalText = inputVal;
      rec.onresult = (e) => {
        let interim = "", newFinal = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) newFinal += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (newFinal) { finalText = (finalText + " " + newFinal).trim(); setInputVal(finalText); }
        else setInputVal((finalText + " " + interim).trim());
      };
      rec.onerror = () => { setListening(false); voiceRef.current = null; };
      rec.onend = () => { setListening(false); voiceRef.current = null; inputRef.current?.focus(); };
      rec.start();
      setListening(true);
    } catch { setListening(false); }
  }

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={{ borderRadius: 16, padding: "1.5px", position: "relative" }}>
        {/* Spinning gold border */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.9) 40deg, rgba(245,158,11,1) 80deg, rgba(253,230,138,0.8) 120deg, transparent 160deg, transparent 200deg, rgba(245,158,11,0.7) 240deg, rgba(251,191,36,0.9) 280deg, transparent 320deg)", animation: "chatBorderSpin 3.5s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: "-80%", background: "conic-gradient(from 180deg, transparent 0deg, rgba(168,85,247,0.5) 50deg, rgba(251,191,36,0.4) 90deg, transparent 130deg)", animation: "chatBorderSpinRev 5.5s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", boxShadow: "0 0 20px 3px rgba(251,191,36,0.3), 0 0 50px 6px rgba(245,158,11,0.15)", animation: "chatGoldPulse 3s ease-in-out infinite" }} />

        <div style={{ borderRadius: 14, overflow: "hidden", background: "#0a0812", position: "relative" }}>
          {/* Header strip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid rgba(251,191,36,0.08)", background: "#0f0d14" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#f59e0b" }}>♛</span>
              <span style={{ fontSize: 11, color: "rgba(251,191,36,0.6)" }}>Premium AI · Aria v4.2</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "rgba(251,191,36,0.5)" }}>Active</span>
            </div>
          </div>

          {/* Input row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#0f0d14" }}>
            <GoldPlusBtn />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onSend(); }}
              placeholder={listening ? "Listening…" : "Ask Aria anything about your company…"}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13.5, fontFamily: "inherit" }}
            />
            <button onClick={toggleVoice} title={listening ? "Stop" : "Voice input"} style={{ flexShrink: 0, padding: 6, borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.2s ease", color: listening ? "#ef4444" : "rgba(251,191,36,0.6)", background: listening ? "rgba(239,68,68,0.12)" : "transparent", animation: listening ? "chatGoldPulse 1s ease-in-out infinite" : "none" }}>
              <IconMic size={17} />
            </button>
            <button onClick={onSend} title="Send" style={{ flexShrink: 0, padding: 6, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: inputVal.trim() ? "#f59e0b" : "rgba(255,255,255,0.3)", transition: "color 0.2s ease" }}>
              <IconSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoldPlusBtn() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ flexShrink: 0, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, cursor: "pointer", transition: "all 0.25s ease", background: hovered ? "linear-gradient(135deg,rgba(245,158,11,0.4),rgba(234,88,12,0.35))" : "rgba(255,255,255,0.04)", border: hovered ? "1px solid rgba(251,191,36,0.8)" : "1px solid rgba(251,191,36,0.35)", color: hovered ? "#fbbf24" : "#d97706", boxShadow: hovered ? "0 0 14px rgba(251,191,36,0.6)" : "0 0 8px rgba(251,191,36,0.25)" }}
    >
      <IconPlus size={15} />
    </button>
  );
}

function SuggestionPill({ label, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 999, background: hovered ? "linear-gradient(135deg,#d97706,#ea580c)" : "linear-gradient(135deg,rgba(217,119,6,0.45),rgba(234,88,12,0.45))", border: hovered ? "1px solid rgba(251,191,36,0.8)" : "1px solid rgba(251,191,36,0.4)", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.25s ease", whiteSpace: "nowrap", boxShadow: hovered ? "0 0 18px rgba(251,191,36,0.6)" : "0 0 10px rgba(251,191,36,0.2)" }}
    >
      {label}
    </button>
  );
}

function GoldCopyBtn({ text, color, iconOnly }) {
  const [copied, setCopied] = React.useState(false);
  function doCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  if (iconOnly) {
    return (
      <button onClick={doCopy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "none", color: copied ? "#34d399" : "#9ca3af", cursor: "pointer" }}>
        {copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
        {copied ? "Copied" : "Copy"}
      </button>
    );
  }
  return (
    <button onClick={doCopy} style={{ padding: 4, borderRadius: 6, border: "none", cursor: "pointer", background: "transparent", color: copied ? (color || "#d97706") : "#9ca3af", transition: "color 0.2s ease" }}>
      {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
    </button>
  );
}

// ── ChatMarkdown ──────────────────────────────────────────────────────────────
function ChatMarkdown({ text, accentColor, primaryColor }) {
  if (!text) return null;

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
        parts.push(<code key={k++} style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}44`, borderRadius: 4, padding: "1px 6px", fontFamily: "monospace", fontSize: "0.82em", color: accentColor }}>{ic[2]}</code>);
        rest = ic[3]; continue;
      }
      const em = rest.match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/);
      if (em && em[1].length < rest.length) {
        if (em[1]) parts.push(<span key={k++}>{em[1]}</span>);
        parts.push(<em key={k++} style={{ color: "#444", fontStyle: "italic" }}>{em[2]}</em>);
        rest = em[3]; continue;
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
        if (/^[-*_]{3,}$/.test(t)) return <hr key={bi} style={{ border: "none", borderTop: `1px solid ${primaryColor}33`, margin: "4px 0" }} />;
        const cb = t.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (cb) {
          const lang = cb[1], code = cb[2].replace(/\n$/, "");
          return (
            <div key={bi}>
              {lang && <div style={{ background: `${primaryColor}22`, borderRadius: "8px 8px 0 0", padding: "4px 12px", borderBottom: `1px solid ${primaryColor}33` }}><span style={{ fontSize: 10, fontWeight: 600, color: primaryColor, textTransform: "uppercase" }}>{lang}</span></div>}
              <pre style={{ background: "#050508", borderRadius: lang ? "0 0 8px 8px" : 8, padding: "12px 14px", overflowX: "auto", border: `1px solid ${primaryColor}22`, fontFamily: "monospace", fontSize: 12.5, color: "#e2e8f0", lineHeight: 1.65, margin: 0 }}><code>{code}</code></pre>
            </div>
          );
        }
        const h1 = t.match(/^# (.+)/); if (h1) return <h1 key={bi} style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "4px 0 6px" }}>{renderInline(h1[1])}</h1>;
        const h2 = t.match(/^## (.+)/); if (h2) return <h2 key={bi} style={{ fontSize: 16, fontWeight: 700, color: "#222", margin: "2px 0 4px" }}>{renderInline(h2[1])}</h2>;
        const h3 = t.match(/^### (.+)/); if (h3) return <h3 key={bi} style={{ fontSize: 14, fontWeight: 700, color: primaryColor, margin: "2px 0" }}>{renderInline(h3[1])}</h3>;
        const lines = t.split("\n");
        if (lines.every(l => /^[-*•]\s/.test(l.trim()))) return (
          <ul key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}><span style={{ color: primaryColor, flexShrink: 0, marginTop: 1 }}>▸</span><span style={{ color: "#222", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^[-*•]\s/, ""))}</span></li>)}
          </ul>
        );
        if (lines.every(l => /^\d+\.\s/.test(l.trim()))) return (
          <ol key={bi} style={{ padding: 0, margin: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {lines.map((l, li) => <li key={li} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}><span style={{ color: primaryColor, flexShrink: 0, fontWeight: 700, fontSize: 13, minWidth: 22, marginTop: 1 }}>{li + 1}.</span><span style={{ color: "#222", lineHeight: 1.65 }}>{renderInline(l.trim().replace(/^\d+\.\s/, ""))}</span></li>)}
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

// ── ChatCanvas (particle background) ─────────────────────────────────────────
function ChatCanvas() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const COLORS = [
      { hex: "#f59e0b", rgb: "245,158,11" }, { hex: "#fbbf24", rgb: "251,191,36" },
      { hex: "#d97706", rgb: "217,119,6" }, { hex: "#8b5cf6", rgb: "139,92,246" },
      { hex: "#c4b5fd", rgb: "196,181,253" }, { hex: "#a78bfa", rgb: "167,139,250" },
    ];
    const nodes = Array.from({ length: 72 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8,
      colorIdx: Math.floor(Math.random() * COLORS.length),
      phase: Math.random() * Math.PI * 2, phaseSpeed: 0.012 + Math.random() * 0.018,
    }));
    const streaks = [];
    let streakTimer = 0;
    function spawnStreak() {
      const edge = Math.random();
      let x, y, vx, vy;
      if (edge < 0.5) { x = Math.random() * W; y = 0; vx = (Math.random() - 0.5) * 3; vy = 1.5 + Math.random() * 2; }
      else { x = 0; y = Math.random() * H; vx = 1.5 + Math.random() * 2; vy = (Math.random() - 0.5) * 3; }
      streaks.push({ x, y, vx, vy, life: 60 + Math.random() * 60, maxLife: 60 + Math.random() * 60 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      streakTimer++;
      if (streakTimer > 120 && Math.random() < 0.015) { spawnStreak(); streakTimer = 0; }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i], alpha = (s.life / s.maxLife) * 0.7, tl = 60;
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
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const a = (1 - dist / 160) * 0.3;
            const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            g.addColorStop(0, `rgba(251,191,36,${a})`); g.addColorStop(1, `rgba(245,158,11,${a * 0.6})`);
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = g; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const pulse = Math.sin(n.phase) * 0.5 + 0.5, r = n.r + pulse * 2, alpha = 0.5 + pulse * 0.5;
        const { hex, rgb } = COLORS[n.colorIdx];
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        glow.addColorStop(0, `rgba(${rgb},${alpha * 0.45})`); glow.addColorStop(1, "rgba(0,0,0,0)");
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
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity: 0.65 }} />;
}

Object.assign(window, { ChatPage });
