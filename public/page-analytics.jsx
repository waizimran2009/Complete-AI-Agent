/* ───────────────────────────────────────────
   HR Analytics Dashboard
   ─────────────────────────────────────────── */

function AnalyticsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [stats, setStats] = React.useState(null);
  React.useEffect(() => {
    window.apiFetch('/api/analytics/overview')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  const p = isMobile ? 14 : 24;
  const kpiCols = isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(6, 1fr)";
  const chartCols = (isMobile || isTablet) ? "1fr" : "1.4fr 1fr";
  const lowerCols = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ padding: p, overflowY: "auto", height: "calc(100vh - 64px)" }}>
      {/* Top KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: kpiCols, gap: isMobile ? 8 : 12, marginBottom: 16 }}>
        <StatCard label="Headcount" value={stats?.headcount?.toString() ?? "142"} sub="+6 this quarter" trend="up" icon={IconUsers} accent />
        <StatCard label="Open roles" value="9" sub="3 hot" icon={IconBriefcase} accent />
        <StatCard label="Attendance" value="94%" sub="+1.2 vs last mo" trend="up" icon={IconCheck} accent />
        <StatCard label="Time-to-hire" value="18d" sub="-4d vs last Q" trend="up" icon={IconClock} accent />
        <StatCard label="Offer accept" value="78%" sub="-3% MoM" trend="down" icon={IconStar} accent />
        <StatCard label="Attrition" value="6.2%" sub="Annualized" icon={IconArrowDown} accent />
      </div>

      {/* 2-column charts */}
      <div style={{ display: "grid", gridTemplateColumns: chartCols, gap: 16, marginBottom: 16 }}>
        <PipelineFunnel />
        <FeatureUsageRing />
      </div>

      {/* AI feature performance */}
      <FeaturePerformanceTable />

      {/* Lower row */}
      <div style={{ display: "grid", gridTemplateColumns: lowerCols, gap: 16, marginTop: 16 }}>
        <DepartmentBreakdown />
        <AIDecisionsLog />
      </div>
    </div>
  );
}

function PipelineFunnel() {
  const stages = [
    { label: "Resumes received",        value: 412, ratio: 1.0,    color: 0.95 },
    { label: "AI-ranked (>70% fit)",    value: 142, ratio: 0.345,  color: 0.85 },
    { label: "Shortlisted",             value:  64, ratio: 0.155,  color: 0.75 },
    { label: "AI interview",            value:  32, ratio: 0.078,  color: 0.65 },
    { label: "Passed AI",               value:  18, ratio: 0.044,  color: 0.55 },
    { label: "Offer extended",          value:   9, ratio: 0.022,  color: 0.45 },
    { label: "Hired",                   value:   7, ratio: 0.017,  color: 0.35 },
  ];
  const maxRatio = stages[0].ratio;
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="h3">Hiring pipeline · Q2</h3>
        <span className="label">412 → 7</span>
      </div>
      <div className="card-body col gap-3">
        {stages.map((s, i) => (
          <div key={i} className="row gap-3" style={{ alignItems: "center" }}>
            <div style={{ width: 140, fontSize: 12, color: "var(--fg-2)" }}>{s.label}</div>
            <div style={{
              flex: 1,
              height: 26,
              background: "rgba(255,255,255,0.025)",
              borderRadius: 6,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                width: `${(s.ratio / maxRatio) * 100}%`,
                background: `linear-gradient(90deg, rgba(var(--accent), ${s.color}), rgba(var(--accent-2), ${s.color * 0.7}))`,
                borderRadius: 6,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                fontSize: 11,
                fontWeight: 600,
                color: "white",
              }} className="num">
                {s.value}
              </div>
            </div>
            <div className="num" style={{ width: 50, textAlign: "right", fontSize: 11, color: "var(--fg-3)" }}>
              {(s.ratio * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureUsageRing() {
  const data = [
    { label: "Email",      pct: 38, value: "5,672 ops", color: "rgb(var(--accent))" },
    { label: "Calls",      pct: 22, value: "3,284 ops", color: "rgb(var(--accent-2))" },
    { label: "Posts",      pct: 14, value: "2,089 ops", color: "rgb(var(--accent-3))" },
    { label: "ATS",        pct: 11, value: "1,642 ops", color: "rgb(var(--success))" },
    { label: "Interviews", pct: 9,  value: "1,344 ops", color: "rgb(var(--warning))" },
    { label: "Other",      pct: 6,  value:   "896 ops", color: "rgba(255,255,255,0.3)" },
  ];
  const R = 70;
  const stroke = 18;
  const circ = 2 * Math.PI * R;
  let off = 0;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="h3">AI feature usage</h3>
        <span className="label">Last 30 days</span>
      </div>
      <div className="card-body row gap-4" style={{ alignItems: "center" }}>
        <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
          <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={90} cy={90} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
            {data.map((d, i) => {
              const dash = (d.pct / 100) * circ;
              const seg = (
                <circle
                  key={i}
                  cx={90} cy={90} r={R} fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-off}
                />
              );
              off += dash;
              return seg;
            })}
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <div className="num" style={{ fontSize: 26, fontWeight: 700 }}>14,927</div>
            <div className="label">Total ops</div>
          </div>
        </div>
        <div className="col gap-2" style={{ flex: 1 }}>
          {data.map(d => (
            <div key={d.label} className="row gap-2">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--fg-1)", flex: 1 }}>{d.label}</span>
              <span className="num" style={{ fontSize: 11, color: "var(--fg-3)" }}>{d.value}</span>
              <span className="num" style={{ fontSize: 12, fontWeight: 600, width: 36, textAlign: "right" }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturePerformanceTable() {
  const rows = [
    { feature: "Calls Automation",  health: 98, ops: 3284, success: "94%", saved: "412 hrs", icon: IconPhone,    trend: [3,4,3,5,4,6,5,7,6,8,7,9] },
    { feature: "Email Automation",  health: 95, ops: 5672, success: "97%", saved: "618 hrs", icon: IconMail,     trend: [5,6,5,7,6,8,7,9,8,10,9,11] },
    { feature: "Posts & Socials",   health: 91, ops: 2089, success: "89%", saved: "184 hrs", icon: IconLinkedIn, trend: [2,3,4,3,5,4,5,6,5,7,6,8] },
    { feature: "ATS / Filtering",   health: 96, ops: 1642, success: "92%", saved: "298 hrs", icon: IconFileText, trend: [4,3,5,4,6,5,6,7,6,8,7,9] },
    { feature: "AI Interviews",     health: 88, ops: 1344, success: "86%", saved: "246 hrs", icon: IconVideo,    trend: [1,3,2,4,3,5,4,6,5,7,6,8] },
    { feature: "Attendance",        health: 99, ops:  784, success: "99%", saved: " 92 hrs", icon: IconClock,    trend: [3,4,5,4,5,5,6,6,7,7,8,8] },
    { feature: "Outreach API",      health: 76, ops:  112, success: "78%", saved: " 18 hrs", icon: IconShare,    trend: [4,5,3,4,2,3,5,4,3,2,4,3] },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="h3">AI feature performance</h3>
        <div className="row gap-2">
          <span className="pill pill-success"><IconCheck size={11} />6 healthy</span>
          <span className="pill pill-warning">1 degraded</span>
        </div>
      </div>
      <div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 0.9fr 1.4fr",
          padding: "10px 20px",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
          borderBottom: "1px solid var(--hairline)",
        }}>
          <span>Feature</span>
          <span>Health</span>
          <span>Ops</span>
          <span>Success</span>
          <span>Hours saved</span>
          <span>Trend · 12d</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 0.9fr 1.4fr",
            padding: "12px 20px",
            alignItems: "center",
            borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
          }}>
            <div className="row gap-3">
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: "rgba(var(--accent), 0.10)",
                color: "rgb(var(--accent-3))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><r.icon size={13} /></div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.feature}</span>
            </div>
            <div className="row gap-2">
              <ScoreBar value={r.health / 10} />
              <span className="num" style={{ fontSize: 11, color: r.health > 90 ? "rgb(var(--success))" : r.health > 80 ? "rgb(var(--warning))" : "rgb(var(--danger))" }}>{r.health}</span>
            </div>
            <span className="num" style={{ fontSize: 13 }}>{r.ops.toLocaleString()}</span>
            <span className="num" style={{ fontSize: 13, color: "var(--fg-1)" }}>{r.success}</span>
            <span className="num" style={{ fontSize: 13, color: "rgb(var(--accent-3))" }}>{r.saved}</span>
            <Sparkline data={r.trend} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ data }) {
  const W = 120, H = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`spark-${pts.length}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgb(var(--accent))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="rgb(var(--accent-3))" strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#spark-${pts.length})`} />
    </svg>
  );
}

function DepartmentBreakdown() {
  const depts = [
    { name: "Engineering",  head: 58, growth: 12 },
    { name: "Sales",        head: 24, growth: 4 },
    { name: "Customer Success", head: 18, growth: 6 },
    { name: "Product",      head: 12, growth: 2 },
    { name: "Operations",   head: 10, growth: 1 },
    { name: "Design",       head: 8,  growth: 1 },
    { name: "HR",           head: 6,  growth: 0 },
    { name: "Finance",      head: 6,  growth: 0 },
  ];
  const max = Math.max(...depts.map(d => d.head));
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="h3">Headcount by department</h3>
        <span className="label">142 total</span>
      </div>
      <div className="card-body col gap-3">
        {depts.map(d => (
          <div key={d.name}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-1)" }}>{d.name}</span>
              <div className="row gap-2">
                <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{d.head}</span>
                {d.growth > 0 && <span style={{ fontSize: 10, color: "rgb(var(--success))", fontWeight: 600 }}>+{d.growth}</span>}
              </div>
            </div>
            <div style={{
              height: 5,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 999,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${(d.head / max) * 100}%`,
                background: "linear-gradient(90deg, rgb(var(--accent)), rgba(var(--accent-2), 0.7))",
                borderRadius: 999,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIDecisionsLog() {
  const items = [
    { time: "12:14",  action: "Approved leave request",        who: "Priya Anand · 5d annual", conf: 96, ok: true },
    { time: "11:48",  action: "Disqualified candidate",        who: "Hassan Reza · tab switch", conf: 100, ok: true },
    { time: "11:32",  action: "Routed call to Sales",          who: "+1 415 555-2891",         conf: 89, ok: true },
    { time: "11:11",  action: "Flagged leave pattern",         who: "Hassan Reza · 3rd this Q",conf: 91, ok: true },
    { time: "10:54",  action: "Auto-replied to procurement",   who: "acme.io · SOC2 docs",     conf: 94, ok: true },
    { time: "10:22",  action: "Rejected CV",                   who: "James O'B · stack mismatch", conf: 88, ok: true },
    { time: "09:47",  action: "Sent hiring post to LinkedIn",  who: "Sr Backend role · 142 imp", conf: 92, ok: true },
    { time: "09:14",  action: "Failed to send email",          who: "Outreach API · 500",      conf: 0,  ok: false },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="row gap-3">
          <h3 className="h3">AI decision log</h3>
          <span className="pill pill-accent">Live</span>
        </div>
        <button className="btn btn-sm btn-ghost">Export</button>
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {items.map((it, i) => (
          <div key={i} className="row gap-3" style={{
            padding: "11px 18px",
            borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
          }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 40 }}>{it.time}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: it.ok ? "var(--fg-1)" : "rgb(252, 165, 165)" }}>{it.action}</div>
              <div className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{it.who}</div>
            </div>
            <span className="pill" style={{
              height: 20, fontSize: 10,
              background: !it.ok ? "rgba(var(--danger), 0.12)" : it.conf > 90 ? "rgba(var(--success), 0.12)" : "rgba(var(--warning), 0.12)",
              color: !it.ok ? "rgb(252, 165, 165)" : it.conf > 90 ? "rgb(var(--success))" : "rgb(var(--warning))",
              borderColor: !it.ok ? "rgba(var(--danger), 0.3)" : it.conf > 90 ? "rgba(var(--success), 0.3)" : "rgba(var(--warning), 0.3)",
            }}>{it.ok ? `${it.conf}%` : "fail"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsPage });
