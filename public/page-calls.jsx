/* ───────────────────────────────────────────
   Calls page — inbound voice agent
   ─────────────────────────────────────────── */

const CALL_TRANSCRIPT = [
  { who: "ai",      text: "Thanks for calling Quantum Forge. This is Aria, your AI assistant. How can I help you today?", t: "0:00" },
  { who: "caller",  text: "Hi, I'm calling to learn more about your team plan pricing for around 40 engineers.", t: "0:06" },
  { who: "ai",      text: "Great question. Our Team tier starts at $24 per seat per month, and for 40 seats you'd qualify for our Scale plan with custom volume pricing. Would you like me to book a call with our sales team?", t: "0:11" },
  { who: "caller",  text: "Yeah, sometime this week if possible. Thursday afternoon ideally.", t: "0:21" },
  { who: "ai",      text: "Perfect. I have Thursday at 2:30 PM or 4:00 PM Pacific available with Marcus from our Enterprise team. Which works better?", t: "0:25" },
  { who: "caller",  text: "Let's do 2:30.", t: "0:33" },
  { who: "ai",      text: "Booked. You'll get a calendar invite at the email I'm reading on your caller ID — should I send it to lina@northwind.io?", t: "0:35" },
];

function CallsPage() {
  const [isLive, setIsLive] = React.useState(true);
  const [transcriptIdx, setTranscriptIdx] = React.useState(3);
  const [aiSpeaking, setAiSpeaking] = React.useState(false);

  React.useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setTranscriptIdx(i => {
        if (i >= CALL_TRANSCRIPT.length) return i;
        return i + 1;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [isLive]);

  React.useEffect(() => {
    if (transcriptIdx === 0) return;
    const last = CALL_TRANSCRIPT[transcriptIdx - 1];
    setAiSpeaking(last?.who === "ai");
  }, [transcriptIdx]);

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, height: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* Left: live call */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <h3 className="h3">Active call</h3>
            <span className="pill pill-success">
              <span className="dot dot-success" style={{ animation: "pulse-soft 1.4s infinite" }} />
              Live · 0:42
            </span>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm btn-ghost"><IconCopy size={13} />Transcript</button>
            <button className="btn btn-sm btn-danger" onClick={() => setIsLive(false)}>
              <IconPhoneOff size={13} />End call
            </button>
          </div>
        </div>

        {/* Orb + caller info */}
        <div style={{
          padding: "24px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {aiSpeaking && (
              <>
                <div style={{
                  position: "absolute", width: 160, height: 160, borderRadius: "50%",
                  border: "1.5px solid rgba(var(--accent), 0.4)",
                  animation: "pulse-ring 2s ease-out infinite",
                }} />
                <div style={{
                  position: "absolute", width: 160, height: 160, borderRadius: "50%",
                  border: "1.5px solid rgba(var(--accent-2), 0.3)",
                  animation: "pulse-ring 2s ease-out 0.6s infinite",
                }} />
              </>
            )}
            <QuantumOrb size={140} intensity={aiSpeaking ? 0.85 : 0.2} />
          </div>
          <div className="col gap-2" style={{ flex: 1 }}>
            <span className="label-accent">{aiSpeaking ? "Aria speaking" : "Listening"}</span>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Lina Hoffmann</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)" }}>Northwind Trading · CTO</div>
            <div className="row gap-3" style={{ marginTop: 6 }}>
              <span className="pill"><span className="mono">+1 (415) 555-2891</span></span>
              <span className="pill">Returning caller</span>
              <span className="pill">English (US)</span>
            </div>

            {/* Waveform */}
            <div className="row gap-1" style={{ marginTop: 14, height: 28, alignItems: "center" }}>
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} style={{
                  width: 3,
                  height: `${10 + Math.abs(Math.sin(i * 0.6 + transcriptIdx * 0.3)) * 18}px`,
                  background: aiSpeaking ? `rgba(var(--accent), ${0.4 + (i % 3) * 0.2})` : "rgba(255,255,255,0.18)",
                  borderRadius: 2,
                  animation: aiSpeaking ? `waveform-bar ${0.6 + (i % 5) * 0.1}s ease-in-out infinite` : "none",
                  animationDelay: `${i * 0.04}s`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div style={{
          flex: 1,
          padding: "12px 24px 12px",
          overflowY: "auto",
          borderTop: "1px solid var(--hairline)",
          position: "relative",
          zIndex: 1,
        }}>
          <div className="label" style={{ marginBottom: 12, paddingTop: 8 }}>Transcript</div>
          <div className="col gap-3">
            {CALL_TRANSCRIPT.slice(0, transcriptIdx).map((line, i) => (
              <div key={i} className="anim-slide-up" style={{
                display: "flex",
                gap: 10,
                flexDirection: line.who === "ai" ? "row" : "row-reverse",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: line.who === "ai"
                    ? "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))"
                    : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600, color: "white",
                }}>
                  {line.who === "ai" ? <IconSparkles size={10} /> : "LH"}
                </div>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{
                    padding: "9px 13px",
                    background: line.who === "ai"
                      ? "rgba(var(--accent), 0.08)"
                      : "rgba(255,255,255,0.04)",
                    border: "1px solid",
                    borderColor: line.who === "ai" ? "rgba(var(--accent), 0.18)" : "var(--hairline)",
                    borderRadius: 10,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--fg-1)",
                  }}>
                    {line.text}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--fg-4)", marginTop: 4, textAlign: line.who === "ai" ? "left" : "right" }}>
                    {line.who === "ai" ? "Aria" : "Lina"} · {line.t}
                  </div>
                </div>
              </div>
            ))}
            {transcriptIdx < CALL_TRANSCRIPT.length && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600, color: "white",
                }}><IconSparkles size={10} /></div>
                <div style={{
                  padding: "10px 13px",
                  background: "rgba(var(--accent), 0.08)",
                  borderRadius: 10,
                  display: "flex", gap: 4,
                  alignItems: "center",
                }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "rgb(var(--accent-3))",
                      animation: `pulse-soft 1s ${i*0.15}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        {/* Phone number card */}
        <div className="card card-glow">
          <div className="card-header">
            <h3 className="h3">AI phone number</h3>
            <span className="pill pill-success"><span className="dot dot-success" />Active</span>
          </div>
          <div style={{ padding: "16px 18px 18px" }}>
            <div className="mono" style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              background: "linear-gradient(90deg, rgb(var(--accent-3)), rgb(var(--accent)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              +1 (415) 555-QMAI
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 4 }}>
              +1 (415) 555-7624 · Twilio number, US toll-free
            </div>
            <div className="row gap-2" style={{ marginTop: 14 }}>
              <button className="btn btn-sm"><IconCopy size={13} />Copy</button>
              <button className="btn btn-sm"><IconLink size={13} />Forward from another #</button>
              <button className="btn btn-sm btn-ghost">Settings</button>
            </div>
          </div>
        </div>

        {/* Today's stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <StatCard label="Today" value="47 calls" sub="Avg 1m 48s" icon={IconPhone} accent />
          <StatCard label="Booked" value="12" sub="26% conversion" trend="up" icon={IconCalendar} accent />
        </div>

        {/* Recent calls */}
        <div className="card">
          <div className="card-header">
            <h3 className="h3">Recent calls</h3>
            <button className="btn btn-sm btn-ghost">See all</button>
          </div>
          <div className="col" style={{ padding: "4px 0" }}>
            {[
              { name: "Marcus Lee",        org: "Trellis HQ",      time: "12 min ago", dur: "2:14", tag: "Booked demo", color: "success" },
              { name: "Priya Anand",       org: "—",                time: "31 min ago", dur: "0:48", tag: "Pricing Q",   color: "accent" },
              { name: "Anonymous",         org: "Recruiter call",   time: "1h ago",     dur: "0:22", tag: "Routed",     color: "default" },
              { name: "Hassan Reza",       org: "Northstar SaaS",   time: "1h ago",     dur: "3:01", tag: "Support",    color: "warning" },
              { name: "Yuki Tanaka",       org: "Otsuka & Co.",     time: "2h ago",     dur: "1:35", tag: "Booked demo",color: "success" },
            ].map((c, i) => (
              <div key={i} className="row gap-3" style={{
                padding: "10px 18px",
                borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: "var(--fg-2)",
                  flexShrink: 0,
                }}>
                  {c.name.split(" ").map(p => p[0]).slice(0,2).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.org} · {c.time}</div>
                </div>
                <span className={`pill pill-${c.color === "default" ? "" : c.color}`} style={{ height: 20, fontSize: 10 }}>{c.tag}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 36, textAlign: "right" }}>{c.dur}</span>
                <button className="btn btn-icon btn-sm btn-ghost"><IconPlay size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Agent settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="h3">Agent persona</h3>
            <span className="label">Aria · v2.4</span>
          </div>
          <div className="card-body col gap-3">
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <span className="pill pill-accent">Friendly · professional</span>
              <span className="pill">Voice: ARIA-04 (female, neutral)</span>
              <span className="pill">23 languages</span>
            </div>
            <div style={{
              padding: 12,
              background: "var(--bg-elev-1)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--hairline)",
              fontSize: 12,
              color: "var(--fg-2)",
              lineHeight: 1.55,
            }}>
              You are Aria, an inbound AI receptionist for Quantum Forge — a software company.
              Greet callers warmly, qualify their needs, recommend our Team and Scale plans where
              relevant, and book demos in Marcus's calendar (Thursdays preferred). Never invent prices.
            </div>
            <button className="btn btn-sm" style={{ alignSelf: "flex-start" }}>
              <IconFileText size={13} />Edit system prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CallsPage });
