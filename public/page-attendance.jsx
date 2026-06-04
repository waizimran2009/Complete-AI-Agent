/* ───────────────────────────────────────────
   Attendance & Leave Management
   - Face check-in (webcam-style framing)
   - Geo-attendance map
   - Live presence
   - Leave queue with AI recommendations
   ─────────────────────────────────────────── */

const PRESENCE_NOW = [
  { name: "Waiz Imran",    role: "Admin · HR",       loc: "Office · Karachi",  mode: "office",  since: "09:02", initials: "WI" },
  { name: "Priya Anand",   role: "Backend Eng",      loc: "Remote · Bangalore",mode: "wfh",     since: "09:14", initials: "PA" },
  { name: "Marcus Lee",    role: "Enterprise Sales", loc: "Office · Singapore",mode: "office",  since: "08:51", initials: "ML" },
  { name: "Sarah Chen",    role: "Senior Eng",       loc: "Remote · SF",       mode: "wfh",     since: "21:30¹",initials: "SC" },
  { name: "Diego Alvarez", role: "Eng",              loc: "Remote · BA",       mode: "wfh",     since: "10:22", initials: "DA" },
  { name: "Aisha Patel",   role: "Designer",         loc: "On leave",          mode: "leave",   since: "—",     initials: "AP" },
  { name: "Hassan Reza",   role: "Sales",            loc: "—",                  mode: "absent", since: "Late · 9m", initials: "HR" },
  { name: "Yuki Tanaka",   role: "Eng",              loc: "Office · Tokyo",    mode: "office",  since: "09:00", initials: "YT" },
];

const LEAVE_REQUESTS = [
  { name: "Priya Anand",   type: "Annual",      from: "Jun 10", to: "Jun 14", days: 5,  recommendation: "approve", reason: "Family wedding", risk: "low",  conflict: null },
  { name: "Marcus Lee",    type: "Sick",        from: "Today",  to: "Today",  days: 1,  recommendation: "approve", reason: "Migraine",       risk: "low",  conflict: null },
  { name: "Diego Alvarez", type: "Annual",      from: "Jul 1",  to: "Jul 15", days: 10, recommendation: "review",  reason: "Vacation",       risk: "med",  conflict: "Q3 launch overlaps Jul 8–12" },
  { name: "Sarah Chen",    type: "Personal",    from: "Jun 28", to: "Jun 28", days: 1,  recommendation: "approve", reason: "Personal day",   risk: "low",  conflict: null },
  { name: "Hassan Reza",   type: "Annual",      from: "Jun 5",  to: "Jun 20", days: 15, recommendation: "reject",  reason: "—",              risk: "high", conflict: "3rd request this Q · pattern flagged" },
];

function AttendancePage() {
  const [todayRecords, setTodayRecords] = React.useState(null);
  const [checkingIn, setCheckingIn] = React.useState(false);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [checkInMsg, setCheckInMsg] = React.useState("");
  const [lastId, setLastId] = React.useState(null);

  React.useEffect(() => {
    window.apiFetch('/api/attendance/today')
      .then(r => r.json())
      .then(d => setTodayRecords(d.records || []))
      .catch(() => setTodayRecords([]));
  }, []);

  async function handleCheckIn(method = 'manual', wfh = false) {
    setCheckingIn(true);
    try {
      const res = await window.apiFetch('/api/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify({ employeeName: 'Admin User', method, wfh }),
      });
      const data = await res.json();
      if (data.id) {
        setCheckedIn(true);
        setLastId(data.id);
        setCheckInMsg(data.message || 'Checked in successfully');
        // Refresh
        window.apiFetch('/api/attendance/today').then(r => r.json()).then(d => setTodayRecords(d.records || []));
      }
    } catch(e) {
      setCheckInMsg('Check-in failed: ' + e.message);
    }
    setCheckingIn(false);
  }

  async function handleCheckOut() {
    if (!lastId) return;
    await window.apiFetch('/api/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ employeeId: lastId }),
    });
    setCheckedIn(false);
    setCheckInMsg('Checked out successfully');
    window.apiFetch('/api/attendance/today').then(r => r.json()).then(d => setTodayRecords(d.records || []));
  }

  const { isMobile, isTablet } = useBreakpoint();
  const stackLayout = isMobile || isTablet;

  return (
    <div style={{ padding: stackLayout ? 12 : 24, display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "1.3fr 1fr", gap: stackLayout ? 12 : 16, height: stackLayout ? "auto" : "calc(100vh - 64px)", overflowY: stackLayout ? "auto" : "hidden" }}>
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        <CheckInCard
          checkingIn={checkingIn}
          checkedIn={checkedIn}
          checkInMsg={checkInMsg}
          handleCheckIn={handleCheckIn}
          handleCheckOut={handleCheckOut}
        />
        <PresenceTable todayRecords={todayRecords} />
      </div>

      <div className="col gap-4" style={{ overflowY: "auto" }}>
        <StaffingSummary />
        <LeaveQueue />
      </div>
    </div>
  );
}

// ── Face check-in ────────────────────────────
function CheckInCard({ checkingIn, checkedIn, checkInMsg, handleCheckIn, handleCheckOut }) {
  const [phase, setPhase] = React.useState("idle"); // idle, scanning, success
  const [progress, setProgress] = React.useState(0);
  const { isMobile } = useBreakpoint();
  const camSize = isMobile ? 160 : 220;

  function startCheckIn() {
    setPhase("scanning");
    setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 4;
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setPhase("success");
        handleCheckIn('manual');
        setTimeout(() => { setPhase("idle"); setProgress(0); }, 4000);
      }
    }, 60);
  }

  return (
    <div className="card card-glow" style={{ position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div style={{ padding: isMobile ? 14 : 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 24, position: "relative", zIndex: 1, alignItems: isMobile ? "center" : "flex-start" }}>
        {/* Webcam frame */}
        <div style={{
          width: camSize,
          height: camSize,
          borderRadius: "var(--r-lg)",
          background: "linear-gradient(180deg, #18121a 0%, #0a0a14 100%)",
          border: "1.5px solid",
          borderColor: phase === "success" ? "rgba(var(--success), 0.7)" : "rgba(var(--accent), 0.4)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: phase === "success"
            ? "0 0 24px rgba(var(--success), 0.4)"
            : "0 0 24px rgba(var(--accent), 0.25)",
          transition: "all 0.3s ease",
        }}>
          {/* Pseudo silhouette */}
          <div style={{
            position: "absolute", left: "50%", top: "60%",
            transform: "translate(-50%, -50%)",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "radial-gradient(circle at 40% 40%, #4a3a55, #2a1f30 70%)",
              margin: "0 auto",
              boxShadow: "inset 0 -8px 12px rgba(0,0,0,0.4)",
            }} />
            <div style={{
              width: 140, height: 90, marginTop: -8,
              background: "linear-gradient(180deg, #3a2d44 0%, #1a1424 100%)",
              borderRadius: "60% 60% 0 0 / 50% 50% 0 0",
            }} />
          </div>

          {/* Face bracket */}
          {phase !== "idle" && (
            <div style={{
              position: "absolute", left: "50%", top: "42%",
              transform: "translate(-50%, -50%)",
              width: 110, height: 130,
            }}>
              {["top-left", "top-right", "bottom-left", "bottom-right"].map(corner => {
                const [v, h] = corner.split("-");
                return (
                  <div key={corner} style={{
                    position: "absolute",
                    width: 18, height: 18,
                    [v]: 0, [h]: 0,
                    [`border${v[0].toUpperCase()}${v.slice(1)}`]: `2px solid ${phase === "success" ? "rgb(var(--success))" : "rgb(var(--accent))"}`,
                    [`border${h[0].toUpperCase()}${h.slice(1)}`]: `2px solid ${phase === "success" ? "rgb(var(--success))" : "rgb(var(--accent))"}`,
                    boxShadow: `0 0 8px ${phase === "success" ? "rgba(var(--success), 0.6)" : "rgba(var(--accent), 0.6)"}`,
                  }} />
                );
              })}
            </div>
          )}

          {/* Scan line */}
          {phase === "scanning" && (
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: `${20 + (progress / 100) * 60}%`,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgb(var(--accent)) 30%, rgb(var(--accent)) 70%, transparent)",
              boxShadow: "0 0 16px rgb(var(--accent))",
              opacity: 0.9,
            }} />
          )}

          {/* Status */}
          <div style={{
            position: "absolute", bottom: 12, left: 12, right: 12,
            padding: "6px 10px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: 6,
            fontSize: 10.5,
            fontWeight: 500,
            textAlign: "center",
            color: phase === "success" ? "rgb(var(--success))" : phase === "scanning" ? "rgb(var(--accent-3))" : "var(--fg-3)",
          }}>
            {phase === "idle" && "Look at the camera to check in"}
            {phase === "scanning" && `Scanning face… ${progress}%`}
            {phase === "success" && "✓ Recognized · Admin User"}
          </div>
        </div>

        {/* Info */}
        <div className="col gap-3" style={{ flex: 1, justifyContent: "center" }}>
          <div className="label-accent">Face check-in</div>
          <h2 className="h1" style={{ fontSize: 22 }}>
            {checkedIn ? "Welcome back, Admin" : "Check in to Quantum Forge"}
          </h2>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <span className="pill"><IconClock size={11} />{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="pill">📍 Karachi office · 24.8607° N, 67.0011° E</span>
            <span className="pill pill-success"><IconCheck size={11} />Geo-fence verified</span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--fg-3)", lineHeight: 1.55, maxWidth: 380 }}>
            Face match runs locally on-device — your photo never leaves the browser. Geo-fence checks you're within 200m of an approved office or your registered home address.
          </p>
          {checkInMsg && (
            <div style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: checkInMsg.startsWith('Check-in failed') ? "rgb(var(--danger))" : "rgb(var(--success))",
              padding: "6px 10px",
              background: checkInMsg.startsWith('Check-in failed') ? "rgba(var(--danger), 0.08)" : "rgba(var(--success), 0.08)",
              border: `1px solid ${checkInMsg.startsWith('Check-in failed') ? "rgba(var(--danger), 0.3)" : "rgba(var(--success), 0.3)"}`,
              borderRadius: "var(--r-sm)",
            }}>
              {checkInMsg.startsWith('Check-in failed') ? "✕ " : "✓ "}{checkInMsg}
            </div>
          )}
          <div className="row gap-2">
            <button className="btn btn-primary" onClick={startCheckIn} disabled={phase !== "idle" || checkingIn || checkedIn}>
              {phase === "scanning" || checkingIn ? <>Scanning…</> :
               phase === "success" || checkedIn ? <><IconCheck size={14} />Checked in</> :
               <><IconEye size={14} />Start face scan</>}
            </button>
            <button className="btn" onClick={() => handleCheckIn('manual', true)} disabled={checkingIn || checkedIn}>
              Check in from home (WFH)
            </button>
            {checkedIn && (
              <button className="btn btn-danger" onClick={handleCheckOut}>
                Check out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PresenceTable({ todayRecords }) {
  const { isMobile } = useBreakpoint();
  const activeCount = todayRecords != null
    ? todayRecords.length
    : PRESENCE_NOW.filter(p => p.mode !== "absent" && p.mode !== "leave").length;

  const displayRecords = todayRecords && todayRecords.length > 0 ? todayRecords : PRESENCE_NOW;

  function getMode(record) {
    if (record.mode) return record.mode;
    if (record.is_wfh) return "wfh";
    if (record.status === "absent") return "absent";
    if (record.status === "leave") return "leave";
    return "office";
  }

  function getInitials(record) {
    if (record.initials) return record.initials;
    const name = record.employee_name || "";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  function getName(record) {
    return record.name || record.employee_name || "Unknown";
  }

  function getRole(record) {
    return record.role || record.method || "";
  }

  function getLoc(record) {
    if (record.loc) return record.loc;
    return record.is_wfh ? "Remote" : "Office";
  }

  function getSince(record) {
    if (record.since) return record.since;
    if (record.check_in) {
      try {
        return new Date(record.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      } catch(e) {
        return record.check_in;
      }
    }
    return "—";
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="row gap-3">
          <h3 className="h3">Live presence</h3>
          <span className="pill pill-success"><span className="dot dot-success" />{activeCount} active</span>
        </div>
        <div className="tabs">
          <button className="tab active">All</button>
          <button className="tab">Office</button>
          <button className="tab">WFH</button>
          <button className="tab">Leave</button>
        </div>
      </div>
      <div className="col">
        {displayRecords.map((p, i) => {
          const mode = getMode(p);
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "32px 1fr auto" : "32px 1.3fr 1.1fr 0.8fr 100px",
              gap: isMobile ? 8 : 12,
              alignItems: "center",
              padding: isMobile ? "10px 14px" : "11px 18px",
              borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid",
                borderColor:
                  mode === "office" ? "rgba(var(--success), 0.5)" :
                  mode === "wfh"    ? "rgba(var(--accent), 0.5)" :
                  mode === "leave"  ? "rgba(var(--warning), 0.5)" :
                                       "rgba(var(--danger), 0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
                color: "var(--fg-1)",
              }}>{getInitials(p)}</div>
              <div className="col" style={{ minWidth: 0 }}>
                <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{getName(p)}</span>
                <span className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{isMobile ? getLoc(p) : getRole(p)}</span>
              </div>
              {!isMobile && <span className="truncate" style={{ fontSize: 12, color: "var(--fg-2)" }}>{getLoc(p)}</span>}
              {!isMobile && <span style={{ fontSize: 11.5, color: "var(--fg-3)" }} className="num">
                {mode === "absent" ? <span style={{ color: "rgb(var(--danger))" }}>{getSince(p)}</span> : `Since ${getSince(p)}`}
              </span>}
              <div style={{ textAlign: "right" }}>
                {mode === "office" && <span className="pill pill-success" style={{ height: 22, fontSize: 10 }}>Office</span>}
                {mode === "wfh"    && <span className="pill pill-accent"  style={{ height: 22, fontSize: 10 }}>WFH</span>}
                {mode === "leave"  && <span className="pill pill-warning" style={{ height: 22, fontSize: 10 }}>Leave</span>}
                {mode === "absent" && <span className="pill pill-danger"  style={{ height: 22, fontSize: 10 }}>Absent</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StaffingSummary() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="h3">This week's staffing</h3>
        <span className="label">Jun 16 — 22</span>
      </div>
      <div className="card-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
            const cap = i < 5 ? 70 + Math.random() * 25 : 30 + Math.random() * 20;
            const danger = cap < 60;
            return (
              <div key={d} className="col gap-1" style={{ alignItems: "center" }}>
                <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{d}</div>
                <div style={{
                  width: "100%",
                  height: 48,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                  position: "relative",
                  overflow: "hidden",
                  border: danger ? "1px solid rgba(var(--danger), 0.4)" : "1px solid var(--hairline)",
                }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${cap}%`,
                    background: danger
                      ? "linear-gradient(180deg, rgba(var(--danger), 0.7), rgba(var(--danger), 0.3))"
                      : cap > 80
                        ? "linear-gradient(180deg, rgb(var(--success)), rgba(var(--success), 0.5))"
                        : "linear-gradient(180deg, rgb(var(--accent)), rgba(var(--accent), 0.5))",
                  }} />
                </div>
                <div className="num" style={{ fontSize: 10, color: danger ? "rgb(var(--danger))" : "var(--fg-2)", fontWeight: 500 }}>
                  {Math.round(cap)}%
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: 14,
          padding: 12,
          background: "rgba(var(--warning), 0.08)",
          border: "1px solid rgba(var(--warning), 0.28)",
          borderRadius: "var(--r-md)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}>
          <IconAlertTriangle size={14} style={{ color: "rgb(var(--warning))", marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgb(252, 211, 77)" }}>
              Forecast: Thursday will be understaffed
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 2 }}>
              4 engineers on planned leave. AI recommends approving only 2 of 3 pending requests.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveQueue() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="row gap-3">
          <h3 className="h3">Leave requests</h3>
          <span className="pill pill-accent">{LEAVE_REQUESTS.length}</span>
        </div>
        <button className="btn btn-sm btn-ghost"><IconSparkles size={13} />AI auto-decide</button>
      </div>
      <div className="col">
        {LEAVE_REQUESTS.map((r, i) => (
          <div key={i} style={{
            padding: "14px 18px",
            borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
          }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <div className="col" style={{ gap: 2 }}>
                <div className="row gap-2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                  <span className="pill" style={{ height: 19, fontSize: 10 }}>{r.type}</span>
                  {r.risk === "high" && <span className="pill pill-danger" style={{ height: 19, fontSize: 10 }}>Pattern</span>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>
                  {r.from} → {r.to} · <strong style={{ color: "var(--fg-2)" }}>{r.days} day{r.days > 1 ? "s" : ""}</strong>
                  {r.reason !== "—" && ` · "${r.reason}"`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label" style={{ marginBottom: 2 }}>AI · recommends</div>
                {r.recommendation === "approve" && <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(var(--success))" }}>✓ Approve</span>}
                {r.recommendation === "review"  && <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(var(--warning))" }}>⚠ Review</span>}
                {r.recommendation === "reject"  && <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(var(--danger))" }}>✕ Reject</span>}
              </div>
            </div>
            {r.conflict && (
              <div style={{
                fontSize: 11.5,
                color: "var(--fg-2)",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid var(--hairline)",
                borderLeft: `2.5px solid ${r.recommendation === "reject" ? "rgb(var(--danger))" : "rgb(var(--warning))"}`,
                borderRadius: 4,
                marginBottom: 10,
              }}>
                <IconAlertTriangle size={11} style={{ verticalAlign: -1, marginRight: 6, color: "rgb(var(--warning))" }} />
                {r.conflict}
              </div>
            )}
            <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-sm btn-ghost">Counter-propose</button>
              <button className="btn btn-sm">Reject</button>
              <button className="btn btn-primary btn-sm"><IconCheck size={12} />Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AttendancePage });
