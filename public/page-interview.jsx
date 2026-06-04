/* ───────────────────────────────────────────
   AI Interview Assistant
   States:  list  →  setup  →  live  →  terminated / completed
   ─────────────────────────────────────────── */

const CANDIDATES = [
  { id: 1, name: "Sarah Chen",     role: "Senior Backend Engineer",   stage: "Live interview", score: 8.7, status: "active",  initials: "SC", color: "rgb(var(--accent))" },
  { id: 2, name: "Hassan Reza",    role: "Senior Backend Engineer",   stage: "Disqualified",   score: 0,   status: "dq",      initials: "HR", color: "rgb(var(--danger))" },
  { id: 3, name: "Marcus Lee",     role: "Senior Backend Engineer",   stage: "Awaiting AI",    score: null,status: "pending", initials: "ML", color: "rgb(var(--warning))" },
  { id: 4, name: "Priya Anand",    role: "Senior Backend Engineer",   stage: "Passed AI",      score: 9.2, status: "passed",  initials: "PA", color: "rgb(var(--success))" },
  { id: 5, name: "Yuki Tanaka",    role: "Senior Backend Engineer",   stage: "Passed AI",      score: 7.9, status: "passed",  initials: "YT", color: "rgb(var(--success))" },
  { id: 6, name: "Diego Alvarez",  role: "Senior Backend Engineer",   stage: "Resume ranked",  score: 8.4, status: "ranked",  initials: "DA", color: "rgb(var(--accent-3))" },
  { id: 7, name: "Aisha Patel",    role: "Senior Backend Engineer",   stage: "Resume ranked",  score: 7.6, status: "ranked",  initials: "AP", color: "rgb(var(--accent-3))" },
  { id: 8, name: "Tomás Romero",   role: "Senior Backend Engineer",   stage: "Rejected by AI", score: 4.2, status: "rejected",initials: "TR", color: "var(--fg-3)" },
];

const INTERVIEW_QUESTIONS = [
  { num: 1, text: "Tell me about a time you scaled a service from a single machine to a distributed system. What broke first, and how did you fix it?", topic: "Systems design", asked: true,  scored: 8.4 },
  { num: 2, text: "Walk me through how you'd design a rate-limiter for an API serving 100K req/sec with strict fairness across tenants.", topic: "Distributed systems", asked: true,  scored: 9.1 },
  { num: 3, text: "We have a Postgres table with 800M rows and queries are getting slow. Walk me through your investigation.", topic: "Databases", asked: true,  scored: 8.8 },
  { num: 4, text: "Tell me about a conflict you had with another engineer about a technical decision. How did it resolve?", topic: "Behavioral", asked: false, scored: null },
  { num: 5, text: "Live coding: implement a thread-safe LRU cache in your preferred language.", topic: "Coding", asked: false, scored: null },
];

const TRANSCRIPT_LIVE = [
  { who: "ai",        text: "Welcome Sarah. We'll spend about 45 minutes today. I'll cover three areas: systems design, databases, and a behavioral question. Sound good?", t: "0:00" },
  { who: "candidate", text: "Yeah, sounds good. Ready when you are.", t: "0:08" },
  { who: "ai",        text: "Great. First question: Tell me about a time you scaled a service from a single machine to a distributed system. What broke first, and how did you fix it?", t: "0:14" },
  { who: "candidate", text: "Sure — at my last role we had a single-instance webhook processor that started timing out around 200 req/sec. The first thing that broke was actually the connection pool to Postgres, not the worker itself…", t: "0:24" },
];

function InterviewPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const stackLayout = isMobile || isTablet;
  const [view, setView] = React.useState("list"); // list | live | terminated | results
  const [selected, setSelected] = React.useState(CANDIDATES[0]);

  if (view === "live")       return <InterviewLive  candidate={selected} goTerminated={() => setView("terminated")} goResults={() => setView("results")} goBack={() => setView("list")} stackLayout={stackLayout} />;
  if (view === "terminated") return <InterviewTerminated candidate={selected} goBack={() => setView("list")} isMobile={isMobile} />;
  if (view === "results")    return <InterviewResults candidate={selected} goBack={() => setView("list")} stackLayout={stackLayout} />;

  return <InterviewList onStart={(c) => { setSelected(c); setView("live"); }} onTerminated={(c) => { setSelected(c); setView("terminated"); }} onResults={(c) => { setSelected(c); setView("results"); }} stackLayout={stackLayout} isMobile={isMobile} />;
}

// ── List / ATS view ──────────────────────────
function InterviewList({ onStart, onTerminated, onResults, stackLayout, isMobile }) {
  const [tab, setTab] = React.useState("all");

  return (
    <div style={{ padding: isMobile ? 12 : 24, display: "grid", gridTemplateColumns: "1fr", gap: 16, height: isMobile ? "auto" : "calc(100vh - 64px)", overflow: isMobile ? "visible" : "hidden" }}>
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ padding: "16px 20px", position: "relative", zIndex: 1, flexWrap: "wrap", gap: 10 }}>
          <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
            <div className="row gap-3" style={{ flexWrap: "wrap" }}>
              <h3 className="h3">Senior Backend Engineer</h3>
              <span className="pill pill-accent">8 candidates</span>
              {!isMobile && <span className="pill pill-success"><IconCheck size={11} />ATS · Active</span>}
            </div>
            {!isMobile && (
              <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                Karachi or remote · Rust/Go · 4+ years · Posted via the Posts page 3 days ago
              </div>
            )}
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {!isMobile && <button className="btn btn-sm"><IconFileText size={13} />Job spec</button>}
            {!isMobile && <button className="btn btn-sm"><IconPaperclip size={13} />Upload CVs</button>}
            <button className="btn btn-primary btn-sm"><IconPlus size={13} />New interview</button>
          </div>
        </div>

        {/* Filter tabs + stats */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--hairline)", position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div className="tabs" style={{ flexWrap: "wrap" }}>
            {(isMobile ? [["all","All"],["active","Live"],["passed","Passed"],["dq","DQ"]] : [
              ["all", "All"],
              ["ranked", "Resume ranked"],
              ["pending", "Awaiting AI"],
              ["active", "Live now"],
              ["passed", "Passed"],
              ["dq", "Disqualified"],
            ]).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? "active" : ""}`}>{label}</button>
            ))}
          </div>
          {!isMobile && (
            <div className="row gap-4">
              <Stat mini label="Resumes" value="142" />
              <Stat mini label="AI ranked" value="38" />
              <Stat mini label="Interviewed" value="9" />
              <Stat mini label="Passed" value="4" accent="success" />
              <Stat mini label="DQ" value="3" accent="danger" />
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", position: "relative", zIndex: 1 }}>
          {isMobile ? (
            /* Mobile card list */
            <div className="col">
              {CANDIDATES.filter(c => tab === "all" ? true : c.status === tab).map(c => (
                <div key={c.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `1.5px solid ${c.color}`, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{c.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                      {c.score !== null && <span style={{ fontWeight: 600, color: c.score >= 8 ? "rgb(var(--success))" : c.score >= 6 ? "rgb(var(--warning))" : "rgb(var(--danger))" }}>{c.score.toFixed(1)}/10</span>}
                      {c.status === "active"   && <span className="pill pill-accent" style={{ height: 18, fontSize: 9.5 }}><span className="dot dot-accent" style={{ animation: "pulse-soft 1.4s infinite" }} />Live</span>}
                      {c.status === "dq"       && <span className="pill pill-danger" style={{ height: 18, fontSize: 9.5 }}>DQ</span>}
                      {c.status === "pending"  && <span className="pill pill-warning" style={{ height: 18, fontSize: 9.5 }}>Awaiting</span>}
                      {c.status === "passed"   && <span className="pill pill-success" style={{ height: 18, fontSize: 9.5 }}>Passed</span>}
                      {c.status === "ranked"   && <span className="pill" style={{ height: 18, fontSize: 9.5 }}>Ranked</span>}
                    </div>
                  </div>
                  <div>
                    {c.status === "active"   && <button className="btn btn-sm btn-primary" onClick={() => onStart(c)}>Join</button>}
                    {c.status === "dq"       && <button className="btn btn-sm btn-ghost" onClick={() => onTerminated(c)}>View</button>}
                    {c.status === "passed"   && <button className="btn btn-sm" onClick={() => onResults(c)}>Results</button>}
                    {c.status === "pending"  && <button className="btn btn-sm" onClick={() => onStart(c)}>Start</button>}
                    {(c.status === "ranked" || c.status === "rejected") && <button className="btn btn-sm btn-ghost">CV</button>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop table */
            <>
          <div style={{ display: "grid", gridTemplateColumns: "32px 1.4fr 0.9fr 0.7fr 1fr 100px", padding: "10px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "var(--fg-3)", textTransform: "uppercase" }}>
            <span></span>
            <span>Candidate</span>
            <span>Stage</span>
            <span>AI score</span>
            <span>Resume fit</span>
            <span style={{ textAlign: "right" }}>Action</span>
          </div>
          {CANDIDATES.filter(c => tab === "all" ? true : c.status === tab).map(c => (
            <div key={c.id} style={{
              display: "grid",
              gridTemplateColumns: "32px 1.4fr 0.9fr 0.7fr 1fr 100px",
              padding: "12px 20px",
              borderBottom: "1px solid var(--hairline)",
              alignItems: "center",
              transition: "background 0.15s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${c.color}`,
                color: c.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
              }}>{c.initials}</div>
              <div className="col" style={{ minWidth: 0 }}>
                <span className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <span className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.role}</span>
              </div>
              <div>
                {c.status === "active"   && <span className="pill pill-accent"><span className="dot dot-accent" style={{ animation: "pulse-soft 1.4s infinite" }} />Live</span>}
                {c.status === "dq"       && <span className="pill pill-danger"><IconClose size={11} />Disqualified</span>}
                {c.status === "pending"  && <span className="pill pill-warning"><IconClock size={11} />Awaiting</span>}
                {c.status === "passed"   && <span className="pill pill-success"><IconCheck size={11} />Passed AI</span>}
                {c.status === "ranked"   && <span className="pill">Resume ranked</span>}
                {c.status === "rejected" && <span className="pill" style={{ color: "var(--fg-3)" }}>Rejected</span>}
              </div>
              <div className="row gap-2">
                {c.score !== null ? (
                  <>
                    <span className="num" style={{ fontSize: 14, fontWeight: 600, color: c.score >= 8 ? "rgb(var(--success))" : c.score >= 6 ? "rgb(var(--warning))" : "rgb(var(--danger))" }}>
                      {c.score.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--fg-3)" }}>/10</span>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--fg-3)" }}>—</span>
                )}
              </div>
              <ResumeFitBar score={c.score || 6 + Math.random() * 3} />
              <div style={{ textAlign: "right" }}>
                {c.status === "active" && (
                  <button className="btn btn-sm btn-primary" onClick={() => onStart(c)}>Join</button>
                )}
                {c.status === "dq" && (
                  <button className="btn btn-sm btn-ghost" onClick={() => onTerminated(c)}>View</button>
                )}
                {c.status === "passed" && (
                  <button className="btn btn-sm" onClick={() => onResults(c)}>Results</button>
                )}
                {c.status === "pending" && (
                  <button className="btn btn-sm" onClick={() => onStart(c)}>Start</button>
                )}
                {(c.status === "ranked" || c.status === "rejected") && (
                  <button className="btn btn-sm btn-ghost">View CV</button>
                )}
              </div>
            </div>
          ))}
          </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, mini, accent }) {
  return (
    <div className="col" style={{ minWidth: mini ? 60 : 80, alignItems: "flex-start" }}>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", color: "var(--fg-3)", textTransform: "uppercase" }}>{label}</span>
      <span className="num" style={{
        fontSize: mini ? 16 : 20,
        fontWeight: 600,
        color: accent === "success" ? "rgb(var(--success))" : accent === "danger" ? "rgb(var(--danger))" : "var(--fg-1)",
      }}>{value}</span>
    </div>
  );
}

function ResumeFitBar({ score }) {
  const pct = Math.min(100, (score / 10) * 100);
  return (
    <div className="col gap-1" style={{ minWidth: 100 }}>
      <div style={{
        height: 5,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 999,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: score >= 8
            ? "linear-gradient(90deg, rgb(var(--success)), rgba(var(--success), 0.6))"
            : score >= 6
              ? "linear-gradient(90deg, rgb(var(--warning)), rgba(var(--warning), 0.6))"
              : "linear-gradient(90deg, rgb(var(--danger)), rgba(var(--danger), 0.6))",
          borderRadius: 999,
        }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--fg-3)" }}>{Math.round(pct)}% match</span>
    </div>
  );
}

// ── Live interview view ──────────────────────
function InterviewLive({ candidate, goTerminated, goResults, goBack, stackLayout }) {
  const [elapsed, setElapsed] = React.useState(382); // 6m 22s
  const [warning, setWarning] = React.useState(false);
  const [questionIdx, setQuestionIdx] = React.useState(2);
  const [aiQuestions, setAiQuestions] = React.useState(null);

  React.useEffect(() => {
    window.apiFetch('/api/interviews/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ jobRole: candidate.role, numQuestions: 5 }),
    })
      .then(r => r.json())
      .then(d => setAiQuestions(d.questions))
      .catch(() => {}); // fallback to static INTERVIEW_QUESTIONS
  }, [candidate.role]);

  const questions = aiQuestions || INTERVIEW_QUESTIONS;

  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function format(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div style={{ padding: stackLayout ? 12 : 24, display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "1.4fr 1fr", gap: 16, height: "calc(100vh - 64px)", overflow: stackLayout ? "auto" : "hidden", position: "relative" }}>
      {warning && (
        <div className="anim-fade-in" style={{
          position: "absolute", top: 0, left: 24, right: 24,
          margin: "12px 0",
          zIndex: 10,
          padding: "12px 16px",
          background: "rgba(var(--danger), 0.15)",
          border: "1px solid rgba(var(--danger), 0.5)",
          borderRadius: "var(--r-md)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          backdropFilter: "blur(12px)",
        }}>
          <IconAlertTriangle size={18} style={{ color: "rgb(var(--danger))" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgb(252, 165, 165)" }}>
              Anti-cheat triggered — clicking the simulation button will disqualify Sarah.
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>
              This is the actual production behavior: tab switch, copy-paste, second face = instant termination.
            </div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => setWarning(false)}><IconClose size={13} /></button>
        </div>
      )}

      {/* Left: Live stage */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <button className="btn btn-icon btn-sm btn-ghost" onClick={goBack}><IconClose size={14} /></button>
            <h3 className="h3">Live interview</h3>
            <span className="pill pill-accent"><span className="dot dot-accent" style={{ animation: "pulse-soft 1.4s infinite" }} />Recording</span>
            <span className="mono pill">{format(elapsed)} / 45:00</span>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm btn-danger" onClick={() => setWarning(true)}>
              <IconMonitor size={13} />Simulate tab switch
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => {
              window.apiFetch('/api/interviews/session/demo-' + candidate.id + '/disqualify', {
                method: 'PATCH',
                body: JSON.stringify({ reason: 'manual termination' }),
              }).catch(() => {});
              goTerminated();
            }}>
              <IconAlertTriangle size={13} />Terminate
            </button>
            <button className="btn btn-sm" onClick={() => {
              window.apiFetch('/api/interviews/session/demo-' + candidate.id + '/complete', {
                method: 'PATCH',
                body: JSON.stringify({ finalScore: 8.7, summary: 'Interview completed' }),
              }).catch(() => {});
              goResults();
            }}>End normally</button>
          </div>
        </div>

        {/* Video grid */}
        <div style={{
          flex: 1,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}>
          {/* Candidate "webcam" */}
          <div style={{
            background: "#0a0a14",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--hairline-2)",
            position: "relative",
            overflow: "hidden",
            minHeight: 280,
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background:
                "radial-gradient(circle at 50% 35%, rgba(80, 60, 90, 0.6) 0%, transparent 35%)," +
                "radial-gradient(circle at 50% 80%, rgba(40, 35, 60, 0.4) 0%, transparent 50%)," +
                "linear-gradient(180deg, #18121a 0%, #0a0a14 100%)",
            }} />
            {/* Candidate silhouette */}
            <div style={{
              position: "absolute", left: "50%", top: "60%",
              transform: "translate(-50%, -50%)",
              width: 160, height: 200,
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "radial-gradient(circle at 40% 40%, #4a3a55, #2a1f30 70%)",
                margin: "0 auto",
                boxShadow: "inset 0 -8px 12px rgba(0,0,0,0.4)",
              }} />
              <div style={{
                width: 160, height: 120, marginTop: -10,
                background: "linear-gradient(180deg, #3a2d44 0%, #1a1424 100%)",
                borderRadius: "60% 60% 0 0 / 50% 50% 0 0",
                boxShadow: "inset 0 -16px 24px rgba(0,0,0,0.6)",
              }} />
            </div>
            <div style={{
              position: "absolute", top: 10, left: 12,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "rgb(var(--danger))",
                boxShadow: "0 0 6px rgb(var(--danger))",
                animation: "pulse-soft 1.2s infinite",
              }} />
              <span style={{ fontSize: 11, color: "var(--fg-1)", fontWeight: 600 }}>{candidate.name}</span>
              <span className="pill" style={{ height: 18, fontSize: 9.5, background: "rgba(0,0,0,0.4)", border: "none" }}>{format(elapsed)}</span>
            </div>
            <div style={{
              position: "absolute", bottom: 10, left: 12, right: 12,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 10px",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              borderRadius: 8,
              fontSize: 10,
              color: "var(--fg-2)",
            }}>
              <span className="row gap-2"><IconMic size={11} />Audio · clear</span>
              <span className="row gap-2"><IconEye size={11} />Gaze · centered</span>
              <span className="row gap-2"><IconUsers size={11} />1 face</span>
            </div>
          </div>

          {/* AI side */}
          <div style={{
            background: "radial-gradient(circle at 50% 40%, rgba(var(--accent), 0.18) 0%, transparent 60%), #0a0a14",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--hairline-2)",
            position: "relative",
            overflow: "hidden",
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}>
            <QuantumOrb size={120} intensity={0.55} />
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", color: "rgb(var(--accent-3))", textTransform: "uppercase", marginTop: 16 }}>
              Aria · Interviewer
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>Question {questionIdx + 1} of {questions.length} · {questions[questionIdx]?.topic || "Systems design"}</div>

            <div style={{ marginTop: 18, fontSize: 13, color: "var(--fg-1)", textAlign: "center", maxWidth: 320, lineHeight: 1.5 }}>
              "{questions[questionIdx]?.text}"
            </div>

            <div className="row gap-1" style={{ marginTop: 18, height: 22 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{
                  width: 3,
                  height: `${8 + Math.abs(Math.sin(i * 0.5 + elapsed * 0.2)) * 14}px`,
                  background: `rgba(var(--accent), ${0.4 + (i % 3) * 0.2})`,
                  borderRadius: 2,
                  animation: `waveform-bar ${0.6 + (i % 5) * 0.1}s ease-in-out infinite`,
                  animationDelay: `${i * 0.04}s`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Question list */}
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--hairline)", position: "relative", zIndex: 1 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <span className="label">Questions</span>
            <span className="label">{questionIdx + 1} of {questions.length}</span>
          </div>
          <div className="col gap-2">
            {questions.map((q, i) => (
              <div key={q.num} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: i === questionIdx ? "rgba(var(--accent), 0.08)" : "rgba(255,255,255,0.015)",
                border: "1px solid",
                borderColor: i === questionIdx ? "rgba(var(--accent), 0.3)" : "var(--hairline)",
                borderRadius: "var(--r-md)",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: q.asked ? (i === questionIdx ? "rgba(var(--accent), 0.4)" : "rgba(var(--success), 0.18)") : "rgba(255,255,255,0.04)",
                  color: q.asked ? (i === questionIdx ? "white" : "rgb(var(--success))") : "var(--fg-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600,
                }}>
                  {q.asked && i !== questionIdx ? <IconCheck size={11} /> : q.num}
                </span>
                <span className="truncate" style={{ flex: 1, fontSize: 12, color: q.asked ? "var(--fg-1)" : "var(--fg-3)" }}>{q.text}</span>
                <span className="pill" style={{ height: 20, fontSize: 9.5 }}>{q.topic}</span>
                {q.scored !== null && <span className="num" style={{ fontSize: 11, color: "rgb(var(--success))", fontWeight: 600, minWidth: 28, textAlign: "right" }}>{q.scored.toFixed(1)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: scoring panel */}
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="h3">Live scoring</h3>
            <span className="pill pill-accent"><IconSparkles size={10} />Aria · v2.4</span>
          </div>
          <div className="card-body">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              <span className="label">Composite</span>
              <span className="num" style={{ fontSize: 24, fontWeight: 600, color: "rgb(var(--success))" }}>8.7<span style={{ fontSize: 14, color: "var(--fg-3)" }}>/10</span></span>
            </div>
            <ScoreBar value={8.7} />

            <div style={{ marginTop: 20 }}>
              {[
                { label: "Technical depth",       value: 9.1 },
                { label: "Communication",         value: 8.4 },
                { label: "Confidence",            value: 8.8 },
                { label: "Relevance to role",     value: 8.6 },
                { label: "Structured thinking",   value: 8.3 },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{s.label}</span>
                    <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{s.value.toFixed(1)}</span>
                  </div>
                  <ScoreBar value={s.value} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anti-cheat monitor */}
        <div className="card">
          <div className="card-header">
            <h3 className="h3">Integrity monitor</h3>
            <span className="pill pill-success"><IconCheck size={11} />Clean</span>
          </div>
          <div className="card-body col gap-2">
            {[
              { label: "Tab focus",         status: "Held throughout",   ok: true,  icon: IconMonitor },
              { label: "Single face on cam",status: "Verified, 6m 22s",  ok: true,  icon: IconUsers },
              { label: "No copy/paste",     status: "0 events detected", ok: true,  icon: IconCopy },
              { label: "Eye contact",       status: "94% centered",      ok: true,  icon: IconEye },
              { label: "Voice match",       status: "Same speaker",      ok: true,  icon: IconMic },
            ].map(c => (
              <div key={c.label} className="row gap-3" style={{ padding: "6px 0" }}>
                <c.icon size={14} style={{ color: c.ok ? "rgb(var(--success))" : "rgb(var(--danger))" }} />
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--fg-1)" }}>{c.label}</span>
                <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.status}</span>
              </div>
            ))}
            <div style={{
              marginTop: 8,
              padding: 10,
              background: "rgba(var(--warning), 0.08)",
              border: "1px solid rgba(var(--warning), 0.25)",
              borderRadius: "var(--r-sm)",
              fontSize: 11,
              color: "rgb(252, 211, 77)",
              lineHeight: 1.5,
            }}>
              <strong>Anti-cheat rule:</strong> opening another tab, copy-pasting, or a second face on camera will trigger automatic disqualification with a termination screen shown to the candidate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ value }) {
  const pct = (value / 10) * 100;
  return (
    <div style={{
      height: 6,
      background: "rgba(255,255,255,0.05)",
      borderRadius: 999,
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: value >= 8
          ? "linear-gradient(90deg, rgb(var(--success)), rgba(var(--success), 0.6))"
          : value >= 6
            ? "linear-gradient(90deg, rgb(var(--warning)), rgba(var(--warning), 0.6))"
            : "linear-gradient(90deg, rgb(var(--danger)), rgba(var(--danger), 0.6))",
      }} />
    </div>
  );
}

// ── Terminated screen ────────────────────────
function InterviewTerminated({ candidate, goBack }) {
  return (
    <div style={{
      padding: 24,
      height: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      <div className="grid-bg" />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(var(--danger), 0.18) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        width: 560,
        background: "linear-gradient(180deg, rgba(var(--danger), 0.06), rgba(255,255,255,0.01))",
        border: "1px solid rgba(var(--danger), 0.45)",
        borderRadius: "var(--r-xl)",
        padding: 40,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        boxShadow: "0 32px 64px -16px rgba(239, 68, 68, 0.25), 0 0 64px -12px rgba(239, 68, 68, 0.4)",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(var(--danger), 0.12)",
          border: "1.5px solid rgba(var(--danger), 0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: "1px solid rgba(var(--danger), 0.3)",
            animation: "pulse-ring 2s ease-out infinite",
          }} />
          <IconAlertTriangle size={28} style={{ color: "rgb(var(--danger))" }} />
        </div>

        <div className="label" style={{ color: "rgb(252, 165, 165)", letterSpacing: "0.4em", marginBottom: 10 }}>
          Anti-Cheat Triggered
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
          Interview terminated
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-2)", maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.55 }}>
          {candidate.name} switched tabs at <span className="mono" style={{ color: "var(--fg-1)" }}>00:41</span> during a live interview.
          Per policy, the session was immediately ended and the candidate has been marked as <strong style={{ color: "rgb(252, 165, 165)" }}>disqualified</strong>.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
          padding: 16,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-md)",
          textAlign: "left",
        }}>
          {[
            ["Violation",  "Tab switch (chrome://settings)"],
            ["Triggered at","00:41 into Q1"],
            ["Candidate",   candidate.name],
            ["Role",        candidate.role],
            ["Reviewed by", "Aria · auto"],
            ["Appealable",  "Yes — until 7d"],
          ].map(([k, v]) => (
            <div key={k} className="col">
              <span className="label">{k}</span>
              <span style={{ fontSize: 12.5, color: "var(--fg-1)", marginTop: 2 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="row gap-3" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={goBack}>Back to candidates</button>
          <button className="btn">View violation clip</button>
          <button className="btn btn-danger">Notify candidate</button>
        </div>
      </div>
    </div>
  );
}

// ── Results screen ───────────────────────────
function InterviewResults({ candidate, goBack, stackLayout }) {
  return (
    <div style={{ padding: stackLayout ? 14 : 24, height: stackLayout ? "auto" : "calc(100vh - 64px)", overflowY: "auto" }}>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn btn-sm btn-ghost" onClick={goBack}>← Back</button>
      </div>
      <div className="card card-glow" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-4" style={{ marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(var(--accent), 0.12)",
              border: `1.5px solid ${candidate.color}`,
              color: candidate.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 600,
            }}>{candidate.initials}</div>
            <div className="col gap-1" style={{ flex: 1 }}>
              <div className="label-accent">Interview results · {candidate.role}</div>
              <h2 className="h1">{candidate.name}</h2>
              <div className="row gap-3" style={{ fontSize: 12, color: "var(--fg-3)" }}>
                <span>Today · 47m 18s</span>
                <span>·</span>
                <span>5/5 questions</span>
                <span>·</span>
                <span>Aria v2.4</span>
              </div>
            </div>
            <div className="col" style={{ alignItems: "flex-end" }}>
              <div className="label" style={{ marginBottom: 4 }}>Final score</div>
              <div className="num" style={{ fontSize: 44, fontWeight: 700, color: "rgb(var(--success))", lineHeight: 1 }}>
                {candidate.score}<span style={{ fontSize: 16, color: "var(--fg-3)" }}>/10</span>
              </div>
              <span className="pill pill-success" style={{ marginTop: 8 }}><IconCheck size={12} />Recommended · top 8%</span>
            </div>
          </div>

          <div className="divider" />

          <h3 className="h3" style={{ marginBottom: 14, marginTop: 4 }}>Summary</h3>
          <p style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.65, marginBottom: 22, maxWidth: 760 }}>
            Sarah demonstrated strong systems thinking, particularly on the distributed rate-limiter question
            (9.1/10). Her Postgres investigation methodology was textbook — she correctly hypothesized
            partition skew before suggesting indexing. Communication was clear, with appropriate hedging on
            unknowns. <strong style={{ color: "var(--fg-1)" }}>Recommend advancing to final round with the engineering manager.</strong>
          </p>

          <div style={{ display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 22 }}>
            <div>
              <h3 className="h3" style={{ marginBottom: 10 }}>Strengths</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--fg-2)", lineHeight: 1.7 }}>
                <li>Articulated trade-offs between sliding-window and token-bucket rate-limiting</li>
                <li>Walked through query-plan analysis without prompting</li>
                <li>Acknowledged limits of her experience with Rust (refreshing honesty)</li>
              </ul>
            </div>
            <div>
              <h3 className="h3" style={{ marginBottom: 10 }}>Areas to probe</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--fg-2)", lineHeight: 1.7 }}>
                <li>Limited exposure to Kubernetes operators — relevant for our infra team</li>
                <li>Hasn't led an on-call rotation; may want to discuss expectations</li>
                <li>Open question: long-term interest in IC vs. management track</li>
              </ul>
            </div>
          </div>

          <div className="row gap-3">
            <button className="btn btn-primary"><IconCheck size={14} />Advance to next round</button>
            <button className="btn">Request follow-up</button>
            <button className="btn btn-ghost">Save & decide later</button>
            <button className="btn btn-danger" style={{ marginLeft: "auto" }}>Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InterviewPage, ScoreBar });
