/* ───────────────────────────────────────────
   Overview page — operations at a glance
   ─────────────────────────────────────────── */

function OverviewPage({ navigate }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const ACTIVITY = [
    { time: "just now",    type: "call",      msg: "AI took inbound call from +1 (415) 555-2891 · routed to Sales", icon: IconPhone, color: "success" },
    { time: "2m ago",      type: "email",     msg: "Drafted reply to procurement@acme.io about SOC2 docs", icon: IconMail, color: "accent" },
    { time: "11m ago",     type: "interview", msg: "Sarah Chen scored 8.7/10 — flagged for next round", icon: IconVideo, color: "accent" },
    { time: "23m ago",     type: "post",      msg: "Posted \"We're hiring: Senior Backend Engineer\" to LinkedIn — 142 imp", icon: IconLinkedIn, color: "accent" },
    { time: "41m ago",     type: "interview", msg: "Tab switch detected · Hassan R. auto-disqualified", icon: IconAlertTriangle, color: "danger" },
    { time: "1h ago",      type: "call",      msg: "Demo booking confirmed with Lina at Northwind", icon: IconCalendar, color: "success" },
    { time: "1h ago",      type: "email",     msg: "Cold outreach campaign \"Q3 SaaS leads\" sent · 84 recipients", icon: IconSend, color: "accent" },
    { time: "2h ago",      type: "post",      msg: "Drafted product launch carousel — awaiting approval", icon: IconFileText, color: "warning" },
  ];

  return (
    <div className="col gap-6" style={{ padding: 24 }}>
      {/* Hero */}
      <div className="card card-glow" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div style={{
          position: "absolute", top: -120, right: -120, width: 380, height: 380,
          background: "radial-gradient(circle, rgba(var(--accent), 0.22), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div className="row" style={{ padding: 24, gap: 24, position: "relative", zIndex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <QuantumOrb size={104} intensity={0.4 + Math.sin(tick) * 0.15} />
          </div>
          <div className="col gap-2" style={{ flex: 1 }}>
            <span className="label-accent">Quantum Engine · Online</span>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, maxWidth: 540 }}>
              Good afternoon, Waiz. <span style={{ color: "var(--fg-3)" }}>4 things need your attention today.</span>
            </h2>
            <div className="row gap-3" style={{ marginTop: 6, flexWrap: "wrap" }}>
              <span className="pill pill-success"><span className="dot dot-success" />All systems nominal</span>
              <span className="pill">Llama 3.1 70B · self-hosted</span>
              <span className="pill">12 active workflows</span>
              <span className="pill">14,238 ops today</span>
            </div>
          </div>
          <div className="col gap-2">
            <button className="btn btn-primary" onClick={() => navigate("calls")}>
              <IconSparkles size={14} />Open AI Workspace
            </button>
            <button className="btn btn-sm btn-ghost">
              <IconFileText size={13} />Today's briefing
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Calls handled" value="247" sub="+18% vs last week" trend="up" icon={IconPhone} accent />
        <StatCard label="Emails sent"    value="1,492" sub="+6% vs last week" trend="up" icon={IconMail} accent />
        <StatCard label="Posts live"     value="38" sub="142k impressions" trend="up" icon={IconLinkedIn} accent />
        <StatCard label="Interviews"     value="64" sub="9 disqualified" trend="down" icon={IconVideo} accent />
      </div>

      {/* Two columns: activity + feature shortcuts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Activity */}
        <div className="card">
          <div className="card-header">
            <div className="row gap-3">
              <h3 className="h3">Activity stream</h3>
              <span className="pill pill-accent"><span className="dot dot-accent" style={{ animation: "pulse-soft 1.6s infinite" }} />Live</span>
            </div>
            <div className="tabs">
              <button className="tab active">All</button>
              <button className="tab">Calls</button>
              <button className="tab">Email</button>
              <button className="tab">Posts</button>
              <button className="tab">ATS</button>
            </div>
          </div>
          <div className="col" style={{ padding: "4px 0" }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="row gap-3 anim-slide-up" style={{
                padding: "12px 18px",
                borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
                animationDelay: `${i * 30}ms`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background:
                    a.color === "success" ? "rgba(var(--success), 0.12)" :
                    a.color === "danger"  ? "rgba(var(--danger), 0.12)" :
                    a.color === "warning" ? "rgba(var(--warning), 0.12)" :
                                            "rgba(var(--accent), 0.12)",
                  color:
                    a.color === "success" ? "rgb(var(--success))" :
                    a.color === "danger"  ? "rgb(var(--danger))" :
                    a.color === "warning" ? "rgb(var(--warning))" :
                                            "rgb(var(--accent-3))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <a.icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.45 }}>{a.msg}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{a.time}</div>
                </div>
                <button className="btn btn-sm btn-ghost" style={{ height: 26 }}>
                  <IconArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Feature cards + chart */}
        <div className="col gap-4">
          <div className="card">
            <div className="card-header"><h3 className="h3">Workload this week</h3>
              <span className="label">Mon — Sun</span>
            </div>
            <div className="card-body">
              <MiniBarChart />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="h3">Pinned actions</h3>
              <button className="btn btn-sm btn-ghost"><IconPlus size={13} /></button>
            </div>
            <div className="col" style={{ padding: 4 }}>
              {[
                { label: "Approve 3 LinkedIn drafts", sub: "Q3 hiring campaign", page: "posts", I: IconLinkedIn },
                { label: "Review 12 unread emails", sub: "8 marked high priority", page: "email", I: IconMail },
                { label: "Score 4 pending interviews", sub: "Backend Engineer role", page: "interview", I: IconVideo },
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => navigate(p.page)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    background: "transparent",
                    border: "none",
                    borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
                    color: "var(--fg-1)",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--accent), 0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(var(--accent), 0.12)",
                    color: "rgb(var(--accent-3))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}><p.I size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{p.sub}</div>
                  </div>
                  <IconArrowRight size={13} style={{ color: "var(--fg-3)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline mini chart ────────────────────────
function MiniBarChart() {
  const data = [
    { d: "Mon", calls: 32, emails: 180, posts: 4 },
    { d: "Tue", calls: 41, emails: 220, posts: 6 },
    { d: "Wed", calls: 38, emails: 198, posts: 5 },
    { d: "Thu", calls: 52, emails: 240, posts: 7 },
    { d: "Fri", calls: 44, emails: 215, posts: 8 },
    { d: "Sat", calls: 18, emails: 80,  posts: 5 },
    { d: "Sun", calls: 22, emails: 95,  posts: 3 },
  ];
  const max = 260;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130, paddingBottom: 8 }}>
        {data.map(row => (
          <div key={row.d} className="col gap-1" style={{ flex: 1, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 110 }}>
              <div style={{
                width: 6,
                height: `${(row.calls / max) * 110}px`,
                background: "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-2)))",
                borderRadius: 2,
                boxShadow: "0 0 8px rgba(var(--accent), 0.4)",
              }} />
              <div style={{
                width: 6,
                height: `${(row.emails / max) * 110}px`,
                background: "rgba(var(--accent-3), 0.45)",
                borderRadius: 2,
              }} />
              <div style={{
                width: 6,
                height: `${(row.posts * 8 / max) * 110}px`,
                background: "rgba(255,255,255,0.18)",
                borderRadius: 2,
              }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--fg-3)" }}>{row.d}</span>
          </div>
        ))}
      </div>
      <div className="row gap-4" style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--hairline)" }}>
        <span className="row gap-2" style={{ fontSize: 11, color: "var(--fg-2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgb(var(--accent))" }} />Calls
        </span>
        <span className="row gap-2" style={{ fontSize: 11, color: "var(--fg-2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(var(--accent-3), 0.5)" }} />Emails
        </span>
        <span className="row gap-2" style={{ fontSize: 11, color: "var(--fg-2)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />Posts (×8)
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { OverviewPage });
