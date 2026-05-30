/* ───────────────────────────────────────────
   Calls page — inbound voice agent + outbound "call me back"
   ─────────────────────────────────────────── */

const CALL_TRANSCRIPT = [
  { who: "ai",     text: "Thanks for calling. This is Aria, your AI assistant. How can I help you today?", t: "0:00" },
  { who: "caller", text: "Hi, I'm calling to learn more about your team plan pricing for around 40 engineers.", t: "0:06" },
  { who: "ai",     text: "Great question. Our Team tier starts at $24 per seat per month, and for 40 seats you'd qualify for our Scale plan with custom volume pricing. Would you like me to book a call with our sales team?", t: "0:11" },
  { who: "caller", text: "Yeah, sometime this week if possible. Thursday afternoon ideally.", t: "0:21" },
  { who: "ai",     text: "Perfect. I have Thursday at 2:30 PM or 4:00 PM available with Marcus from our Enterprise team. Which works better?", t: "0:25" },
  { who: "caller", text: "Let's do 2:30.", t: "0:33" },
  { who: "ai",     text: "Booked! You'll get a calendar invite shortly. Is there anything else I can help you with?", t: "0:35" },
];

// ── "Call me back" outbound section ──────────────────────────────────────────
function OutboundCallCard({ configured, twilioNumber }) {
  const [phone, setPhone] = React.useState("");
  const [calling, setCalling] = React.useState(false);
  const [msg, setMsg] = React.useState(null);

  async function callMe() {
    const val = phone.trim();
    if (!val) return;
    setCalling(true);
    setMsg(null);
    try {
      const res = await window.apiFetch("/api/calls/outbound", {
        method: "POST",
        body: JSON.stringify({ to: val }),
      });
      const data = await res.json();
      if (data.error) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: data.message || "Aria is calling you — answer your phone!" });
        setPhone("");
      }
    } catch {
      setMsg({ type: "error", text: "Could not reach server. Please try again." });
    }
    setCalling(false);
  }

  return (
    <div className="card card-glow" style={{ position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
        <div className="row gap-2">
          <h3 className="h3">Call me back</h3>
          <span className="pill pill-accent"><IconPhone size={11} />Outbound</span>
        </div>
      </div>
      <div style={{ padding: "4px 18px 18px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 12.5, color: "var(--fg-3)", marginBottom: 14, lineHeight: 1.5 }}>
          Enter your number and Aria will call you directly — no hold music, straight to your AI assistant.
        </p>

        {/* Phone input row */}
        <div className="row gap-2" style={{ marginBottom: 10 }}>
          <input
            className="input"
            placeholder="+92 300 1234567  or  +1 555 123 4567"
            value={phone}
            onChange={e => { setPhone(e.target.value); setMsg(null); }}
            onKeyDown={e => e.key === "Enter" && !calling && callMe()}
            style={{ flex: 1, fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={callMe}
            disabled={calling || !phone.trim() || !configured}
            style={{ flexShrink: 0, gap: 6 }}
          >
            {calling ? (
              <>{[0,1,2].map(i => <span key={i} style={{ width:4, height:4, borderRadius:"50%", background:"white", display:"inline-block", animation:`pulse-soft 1s ${i*0.15}s infinite` }} />)}</>
            ) : (
              <><IconPhone size={13} />Call me</>
            )}
          </button>
        </div>

        {/* Status messages */}
        {!configured && (
          <div style={{ fontSize: 11.5, color: "var(--fg-3)", padding: "8px 12px", background: "rgba(255,165,0,0.06)", border: "1px solid rgba(255,165,0,0.2)", borderRadius: 8 }}>
            ⚠ Twilio not configured. Set <span style={{ fontFamily: "monospace" }}>TWILIO_ACCOUNT_SID</span>, <span style={{ fontFamily: "monospace" }}>TWILIO_AUTH_TOKEN</span>, <span style={{ fontFamily: "monospace" }}>TWILIO_PHONE_NUMBER</span>, and <span style={{ fontFamily: "monospace" }}>BASE_URL</span> in your <span style={{ fontFamily: "monospace" }}>.env</span> file.
          </div>
        )}
        {msg && (
          <div style={{
            padding: "9px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 500,
            background: msg.type === "success" ? "rgba(var(--success), 0.08)" : "rgba(var(--danger), 0.08)",
            border: `1px solid ${msg.type === "success" ? "rgba(var(--success), 0.25)" : "rgba(var(--danger), 0.25)"}`,
            color: msg.type === "success" ? "rgb(var(--success))" : "rgb(var(--danger))",
          }}>
            {msg.type === "success" ? "✓ " : "⚠ "}{msg.text}
          </div>
        )}

        {/* Format hint */}
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--fg-4)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>🇵🇰 Pakistan: +92 3xx xxxxxxx</span>
          <span>🇺🇸 US/CA: +1 xxx xxx xxxx</span>
          <span>🌍 Others: +countrycode number</span>
        </div>
      </div>
    </div>
  );
}

function CallsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [isLive, setIsLive] = React.useState(true);
  const [transcriptIdx, setTranscriptIdx] = React.useState(3);
  const [aiSpeaking, setAiSpeaking] = React.useState(false);
  const [phoneData, setPhoneData] = React.useState({ number: null, configured: false });
  const [callLogs, setCallLogs] = React.useState([]);
  const [loadingLogs, setLoadingLogs] = React.useState(true);

  React.useEffect(() => {
    window.apiFetch("/api/calls/number")
      .then(r => r.json())
      .then(d => setPhoneData(d))
      .catch(() => {});

    window.apiFetch("/api/calls/logs")
      .then(r => r.json())
      .then(d => { setCallLogs(d.logs || []); setLoadingLogs(false); })
      .catch(() => setLoadingLogs(false));
  }, []);

  React.useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTranscriptIdx(i => i >= CALL_TRANSCRIPT.length ? i : i + 1), 3200);
    return () => clearInterval(id);
  }, [isLive]);

  React.useEffect(() => {
    if (transcriptIdx === 0) return;
    const last = CALL_TRANSCRIPT[transcriptIdx - 1];
    setAiSpeaking(last?.who === "ai");
  }, [transcriptIdx]);

  const stackLayout = isMobile || isTablet;

  return (
    <div style={{
      padding: stackLayout ? 14 : 24,
      display: "grid",
      gridTemplateColumns: stackLayout ? "1fr" : "1.2fr 1fr",
      gap: stackLayout ? 12 : 16,
      height: stackLayout ? "auto" : "calc(100vh - 64px)",
      overflowY: stackLayout ? "auto" : "hidden",
    }}>

      {/* ── Left / Top: live call demo ── */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", minHeight: stackLayout ? 420 : undefined }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <h3 className="h3">Active call</h3>
            <span className="pill pill-success">
              <span className="dot dot-success" style={{ animation: "pulse-soft 1.4s infinite" }} />
              {isLive ? "Live · 0:42" : "Ended"}
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
        <div style={{ padding: stackLayout ? "16px 16px 12px" : "24px 24px 16px", display: "flex", alignItems: "center", gap: stackLayout ? 16 : 24, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: stackLayout ? 100 : 160, height: stackLayout ? 100 : 160, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {aiSpeaking && (
              <>
                <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "1.5px solid rgba(var(--accent), 0.4)", animation: "pulse-ring 2s ease-out infinite" }} />
                <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "1.5px solid rgba(var(--accent-2), 0.3)", animation: "pulse-ring 2s ease-out 0.6s infinite" }} />
              </>
            )}
            <QuantumOrb size={stackLayout ? 90 : 140} intensity={aiSpeaking ? 0.85 : 0.2} />
          </div>
          <div className="col gap-2" style={{ flex: 1, minWidth: 160 }}>
            <span className="label-accent">{aiSpeaking ? "Aria speaking" : "Listening"}</span>
            <div style={{ fontSize: stackLayout ? 18 : 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Lina Hoffmann</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)" }}>Northwind Trading · CTO</div>
            <div className="row gap-2" style={{ marginTop: 4, flexWrap: "wrap" }}>
              <span className="pill"><span className="mono" style={{ fontSize: 11 }}>+1 (415) 555-2891</span></span>
              <span className="pill">Returning</span>
              <span className="pill">EN</span>
            </div>
            {/* Waveform */}
            <div className="row gap-1" style={{ marginTop: 10, height: 24, alignItems: "center" }}>
              {Array.from({ length: stackLayout ? 22 : 36 }).map((_, i) => (
                <div key={i} style={{
                  width: 3,
                  height: `${10 + Math.abs(Math.sin(i * 0.6 + transcriptIdx * 0.3)) * 14}px`,
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
        <div style={{ flex: 1, padding: stackLayout ? "10px 14px" : "12px 24px", overflowY: "auto", borderTop: "1px solid var(--hairline)", position: "relative", zIndex: 1 }}>
          <div className="label" style={{ marginBottom: 10 }}>Transcript</div>
          <div className="col gap-3">
            {CALL_TRANSCRIPT.slice(0, transcriptIdx).map((line, i) => (
              <div key={i} className="anim-slide-up" style={{ display: "flex", gap: 8, flexDirection: line.who === "ai" ? "row" : "row-reverse" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: line.who === "ai" ? "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, color: "white" }}>
                  {line.who === "ai" ? <IconSparkles size={9} /> : "LH"}
                </div>
                <div style={{ maxWidth: "80%" }}>
                  <div style={{ padding: "8px 12px", background: line.who === "ai" ? "rgba(var(--accent), 0.08)" : "rgba(255,255,255,0.04)", border: "1px solid", borderColor: line.who === "ai" ? "rgba(var(--accent), 0.18)" : "var(--hairline)", borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, color: "var(--fg-1)" }}>
                    {line.text}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--fg-4)", marginTop: 3, textAlign: line.who === "ai" ? "left" : "right" }}>
                    {line.who === "ai" ? "Aria" : "Lina"} · {line.t}
                  </div>
                </div>
              </div>
            ))}
            {transcriptIdx < CALL_TRANSCRIPT.length && (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, rgba(var(--accent), 0.5), rgba(var(--accent-2), 0.5))", display: "flex", alignItems: "center", justifyContent: "center" }}><IconSparkles size={9} /></div>
                <div style={{ padding: "9px 12px", background: "rgba(var(--accent), 0.08)", borderRadius: 10, display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgb(var(--accent-3))", animation: `pulse-soft 1s ${i*0.15}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right / Bottom column ── */}
      <div className="col gap-4" style={{ overflowY: stackLayout ? "visible" : "auto" }}>

        {/* AI phone number display */}
        <div className="card card-glow">
          <div className="card-header">
            <h3 className="h3">AI phone number</h3>
            <span className={`pill ${phoneData.configured ? "pill-success" : "pill-warning"}`}>
              <span className={`dot ${phoneData.configured ? "dot-success" : "dot-warning"}`} />
              {phoneData.configured ? "Active" : "Not configured"}
            </span>
          </div>
          <div style={{ padding: "14px 18px 18px" }}>
            {phoneData.number ? (
              <div className="mono" style={{ fontSize: stackLayout ? 20 : 26, fontWeight: 500, letterSpacing: "-0.01em", background: "linear-gradient(90deg, rgb(var(--accent-3)), rgb(var(--accent)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {phoneData.number}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--fg-3)", padding: "10px 0" }}>
                No Twilio number configured. Set <span style={{ fontFamily: "monospace", color: "var(--fg-2)" }}>TWILIO_PHONE_NUMBER</span> in .env to display your AI line here.
              </div>
            )}
            {phoneData.number && (
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 4 }}>
                Call this number to speak with Aria 24/7 · Powered by Twilio
              </div>
            )}
            <div className="row gap-2" style={{ marginTop: 12, flexWrap: "wrap" }}>
              {phoneData.number && <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(phoneData.number)}><IconCopy size={13} />Copy</button>}
              <button className="btn btn-sm btn-ghost">Settings</button>
            </div>
          </div>
        </div>

        {/* Outbound "call me back" card */}
        <OutboundCallCard configured={phoneData.configured} twilioNumber={phoneData.number} />

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
            {callLogs.length > 0 ? (
              callLogs.slice(0, 10).map((log, i) => (
                <div key={i} className="row gap-3" style={{ padding: "11px 16px", borderTop: i > 0 ? "1px solid var(--hairline)" : "none" }}>
                  <IconPhone size={14} style={{ color: "rgb(var(--accent-3))", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 13 }}>{log.caller_speech || "Inbound call"}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                  <span className="pill pill-success" style={{ height: 22, fontSize: 10 }}>{log.status}</span>
                </div>
              ))
            ) : (
              [
                { name: "Marcus Lee",  org: "Trellis HQ",    time: "12m ago", dur: "2:14", tag: "Booked demo", color: "success" },
                { name: "Priya Anand", org: "—",              time: "31m ago", dur: "0:48", tag: "Pricing Q",   color: "accent" },
                { name: "Anonymous",   org: "Recruiter",      time: "1h ago",  dur: "0:22", tag: "Routed",      color: "default" },
                { name: "Hassan Reza", org: "Northstar SaaS", time: "1h ago",  dur: "3:01", tag: "Support",     color: "warning" },
              ].map((c, i) => (
                <div key={i} className="row gap-3" style={{ padding: "10px 16px", borderTop: i > 0 ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "var(--fg-2)", flexShrink: 0 }}>
                    {c.name.split(" ").map(p => p[0]).slice(0,2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.org} · {c.time}</div>
                  </div>
                  <span className={`pill ${c.color === "default" ? "" : "pill-" + c.color}`} style={{ height: 20, fontSize: 10 }}>{c.tag}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 34, textAlign: "right" }}>{c.dur}</span>
                </div>
              ))
            )}
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
              <span className="pill">Voice: Polly.Joanna</span>
              <span className="pill">23 languages</span>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elev-1)", borderRadius: "var(--r-md)", border: "1px solid var(--hairline)", fontSize: 12, color: "var(--fg-2)", lineHeight: 1.55 }}>
              {process.env?.COMPANY_NAME || "Your company"} · Aria greets callers warmly, qualifies their needs, and can book demos or route to the right team member.
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
