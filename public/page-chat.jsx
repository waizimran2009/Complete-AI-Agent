/* ───────────────────────────────────────────
   QuantuMania Chat — Aria AI co-worker.
   Uses /api/ai/chat (Gemini) for live replies.
   ─────────────────────────────────────────── */

const QUICK_PROMPTS = [
  { I: IconMail,     label: "Draft an email to a customer about our SOC2 cert" },
  { I: IconLinkedIn, label: "Write a LinkedIn post about our Series A" },
  { I: IconBriefcase,label: "Help me reject a candidate politely" },
  { I: IconUsers,    label: "Summarize today's interview scores" },
  { I: IconPhone,    label: "What did Lina from Northwind want?" },
  { I: IconBarChart, label: "How's our hiring funnel performing?" },
];

function ChatPage() {
  const [messages, setMessages] = React.useState([
    { who: "ai", text: "Hi — I'm Aria, your QuantuMania co-worker. I can draft emails, write posts, summarize candidates, and connect to anything in your Company OS. What's on your mind today?" },
  ]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [aiSpeaking, setAiSpeaking] = React.useState(false);
  const [voiceMode, setVoiceMode] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || thinking) return;
    setInput("");

    const newMessages = [...messages, { who: "user", text: userText }];
    setMessages(newMessages);
    setThinking(true);
    setAiSpeaking(true);

    try {
      // Build conversation history for the API
      const history = newMessages.slice(0, -1).map(m => ({
        role: m.who === "user" ? "user" : "model",
        content: m.text,
      }));

      const reply = await window.ariaChat(userText, history);
      setMessages(m => [...m, { who: "ai", text: reply.trim() }]);
    } catch (e) {
      setMessages(m => [...m, { who: "ai", text: "Couldn't reach the neural net just now — try again in a moment.", error: true }]);
    }
    setThinking(false);
    setAiSpeaking(false);
  }

  function clearChat() {
    setMessages([{ who: "ai", text: "Fresh slate. What do you want to work on?" }]);
  }

  return (
    <div style={{
      padding: 24,
      display: "grid",
      gridTemplateColumns: "1.4fr 320px",
      gap: 16,
      height: "calc(100vh - 64px)",
      overflow: "hidden",
    }}>
      {/* Left: chat stage */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />

        {/* Header */}
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <div style={{ position: "relative", width: 36, height: 36 }}>
              <QuantumOrb size={36} mini intensity={aiSpeaking ? 0.9 : 0.25} />
            </div>
            <div className="col" style={{ gap: 0 }}>
              <div className="row gap-2">
                <h3 className="h3" style={{ margin: 0 }}>Aria</h3>
                <span className="pill pill-success" style={{ height: 20 }}>
                  <span className="dot dot-success" style={{ animation: "pulse-soft 1.6s infinite" }} />
                  {aiSpeaking ? "Speaking" : "Online"}
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: "0.06em" }}>
                Quantum core · v4.2 · Gemini 1.5 Flash
              </span>
            </div>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm btn-ghost" onClick={clearChat}><IconPlus size={13} />New chat</button>
            <button
              className={`btn btn-sm ${voiceMode ? "btn-primary" : ""}`}
              onClick={() => setVoiceMode(v => !v)}
            >
              <IconMic size={13} />Voice {voiceMode ? "on" : "off"}
            </button>
          </div>
        </div>

        {/* Voice mode: huge centered orb */}
        {voiceMode ? (
          <div className="col" style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            padding: 40,
          }}>
            <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {aiSpeaking && [0, 1, 2].map(i => (
                <div key={i} style={{
                  position: "absolute", width: 280, height: 280, borderRadius: "50%",
                  border: "1.5px solid rgba(var(--accent), 0.4)",
                  animation: `pulse-ring 2.4s ${i * 0.7}s ease-out infinite`,
                }} />
              ))}
              <QuantumOrb size={220} intensity={aiSpeaking ? 0.9 : 0.25} />
            </div>
            <div className="label-accent" style={{ marginTop: 28 }}>
              {thinking ? "ARIA · THINKING" : aiSpeaking ? "ARIA · SPEAKING" : "TAP TO SPEAK"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--fg-1)", marginTop: 12, textAlign: "center", maxWidth: 480 }}>
              {messages[messages.length - 1]?.text || "Hi, how can I help?"}
            </div>
            <div className="row gap-1" style={{ marginTop: 28, height: 36, alignItems: "center" }}>
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} style={{
                  width: 3,
                  height: `${10 + Math.abs(Math.sin(i * 0.4 + Date.now() * 0.001)) * 22}px`,
                  background: aiSpeaking ? `rgba(var(--accent), ${0.4 + (i % 3) * 0.2})` : "rgba(255,255,255,0.15)",
                  borderRadius: 2,
                  animation: aiSpeaking ? `waveform-bar ${0.5 + (i % 5) * 0.1}s ease-in-out infinite` : "none",
                  animationDelay: `${i * 0.03}s`,
                }} />
              ))}
            </div>
            <button
              onClick={() => send("Tell me what's most important right now")}
              style={{
                marginTop: 32,
                padding: "14px 32px",
                background: "linear-gradient(180deg, rgba(var(--accent), 0.9), rgba(var(--accent-2), 0.9))",
                border: "1px solid rgba(var(--accent), 0.6)",
                borderRadius: 999,
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.22em",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(var(--accent), 0.5)",
              }}
            >
              ASK ARIA
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1,
              padding: "20px 24px",
              overflowY: "auto",
              position: "relative",
              zIndex: 1,
            }}>
              <div className="col gap-4">
                {messages.map((m, i) => (
                  <ChatMessage key={i} m={m} />
                ))}
                {thinking && (
                  <div className="row gap-3 anim-fade-in" style={{ alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, position: "relative", flexShrink: 0 }}>
                      <QuantumOrb size={28} mini intensity={0.7} />
                    </div>
                    <div style={{
                      padding: "10px 14px",
                      background: "rgba(var(--accent), 0.08)",
                      border: "1px solid rgba(var(--accent), 0.18)",
                      borderRadius: 12,
                      display: "flex", gap: 5, alignItems: "center",
                    }}>
                      {[0, 1, 2].map(j => (
                        <span key={j} style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "rgb(var(--accent-3))",
                          animation: `pulse-soft 1s ${j * 0.15}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Composer */}
            <div style={{
              padding: "14px 18px 18px",
              borderTop: "1px solid var(--hairline)",
              position: "relative",
              zIndex: 1,
            }}>
              <div style={{
                display: "flex",
                gap: 10,
                background: "var(--bg-elev-1)",
                border: "1px solid var(--hairline-2)",
                borderRadius: 14,
                padding: 4,
              }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask Aria anything — emails, posts, candidates, schedules…"
                  rows={1}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--fg-1)",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    padding: "10px 12px",
                    resize: "none",
                    minHeight: 24,
                    maxHeight: 100,
                    lineHeight: 1.5,
                  }}
                />
                <div className="row gap-1" style={{ alignItems: "center", padding: 4 }}>
                  <button className="btn btn-icon btn-sm btn-ghost" title="Attach"><IconPaperclip size={14} /></button>
                  <button
                    className="btn btn-icon btn-sm"
                    onClick={() => send()}
                    disabled={!input.trim() || thinking}
                    style={{
                      background: input.trim()
                        ? "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-2)))"
                        : "var(--bg-elev-2)",
                      color: input.trim() ? "white" : "var(--fg-3)",
                      borderColor: input.trim() ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
                      boxShadow: input.trim() ? "0 4px 16px -4px rgba(var(--accent), 0.6)" : "none",
                    }}
                  >
                    <IconSend size={14} />
                  </button>
                </div>
              </div>
              <div className="row" style={{ marginTop: 8, justifyContent: "space-between", fontSize: 10.5, color: "var(--fg-3)" }}>
                <span>↵ to send · ⇧↵ for new line</span>
                <span>Powered by Gemini 1.5 Flash · Aria v4.2</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: quick actions + context */}
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
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  color: "var(--fg-2)",
                  fontSize: 12.5,
                  fontFamily: "inherit",
                  textAlign: "left",
                  lineHeight: 1.45,
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
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
          <div className="card-header">
            <h3 className="h3">Aria can access</h3>
          </div>
          <div className="col" style={{ padding: 4 }}>
            {[
              { I: IconMail,     label: "Email automation", ok: true, note: "Active" },
              { I: IconPhone,    label: "Call automation",  ok: true, note: "Active" },
              { I: IconUsers,    label: "ATS & Interviews", ok: true, note: "Active" },
              { I: IconCalendar, label: "Leave management", ok: true, note: "Active" },
              { I: IconBarChart, label: "HR Analytics",     ok: true, note: "Live" },
              { I: IconBriefcase,label: "Job postings",     ok: true, note: "Active" },
            ].map((c, i) => (
              <div key={i} className="row gap-3" style={{
                padding: "8px 12px",
                borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
              }}>
                <c.I size={14} style={{ color: "rgb(var(--accent-3))", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: "var(--fg-1)" }}>{c.label}</span>
                <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{c.note}</span>
                <span className="dot dot-success" />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{
          background: "linear-gradient(180deg, rgba(var(--accent), 0.05), rgba(255,255,255,0.01))",
          border: "1px solid rgba(var(--accent), 0.2)",
        }}>
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

function ChatMessage({ m }) {
  if (m.who === "ai") {
    return (
      <div className="row gap-3 anim-slide-up" style={{ alignItems: "flex-start" }}>
        <div style={{ width: 28, height: 28, position: "relative", flexShrink: 0, marginTop: 2 }}>
          <QuantumOrb size={28} mini intensity={0.3} />
        </div>
        <div style={{ maxWidth: "78%" }}>
          <div style={{
            padding: "11px 15px",
            background: m.error ? "rgba(var(--danger), 0.08)" : "rgba(var(--accent), 0.06)",
            border: "1px solid",
            borderColor: m.error ? "rgba(var(--danger), 0.25)" : "rgba(var(--accent), 0.18)",
            borderRadius: 14,
            borderTopLeftRadius: 4,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: m.error ? "rgb(252, 165, 165)" : "var(--fg-1)",
            whiteSpace: "pre-wrap",
          }}>
            {m.text}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 4, marginLeft: 4 }}>
            Aria · just now
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="row gap-3 anim-slide-up" style={{ alignItems: "flex-start", flexDirection: "row-reverse" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, color: "white",
        flexShrink: 0, marginTop: 2,
      }}>ME</div>
      <div style={{ maxWidth: "78%" }}>
        <div style={{
          padding: "11px 15px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--hairline-2)",
          borderRadius: 14,
          borderTopRightRadius: 4,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: "var(--fg-1)",
          whiteSpace: "pre-wrap",
        }}>{m.text}</div>
        <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 4, marginRight: 4, textAlign: "right" }}>
          You · just now
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ChatPage });
