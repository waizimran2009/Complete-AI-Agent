/* ───────────────────────────────────────────
   ATS / CV Filtering page
   Standalone resume pipeline. Filters by JD,
   scores via AI, surfaces the top N.
   ─────────────────────────────────────────── */

const RESUMES = [
  { id: 1, name: "Priya Anand",     yrs: 7, loc: "Bangalore",   fit: 96, status: "shortlist", skills: ["Rust", "Distributed", "PostgreSQL", "K8s"],         salary: "$140k", flag: "Top match" },
  { id: 2, name: "Sarah Chen",      yrs: 6, loc: "Remote · SF", fit: 92, status: "shortlist", skills: ["Go", "Kafka", "PostgreSQL"],                          salary: "$160k", flag: null },
  { id: 3, name: "Diego Alvarez",   yrs: 5, loc: "Buenos Aires",fit: 88, status: "shortlist", skills: ["Rust", "gRPC", "Redis"],                              salary: "$95k",  flag: null },
  { id: 4, name: "Aisha Patel",     yrs: 4, loc: "Karachi",     fit: 84, status: "review",    skills: ["Go", "PostgreSQL", "AWS"],                            salary: "$45k",  flag: "Local · cost-fit" },
  { id: 5, name: "Yuki Tanaka",     yrs: 8, loc: "Tokyo",       fit: 81, status: "review",    skills: ["Rust", "Tokio", "K8s"],                               salary: "$130k", flag: "Lang: JP + EN" },
  { id: 6, name: "Marcus Lee",      yrs: 3, loc: "Singapore",   fit: 76, status: "review",    skills: ["Go", "PostgreSQL"],                                   salary: "$80k",  flag: null },
  { id: 7, name: "Hassan Reza",     yrs: 9, loc: "Lahore",      fit: 71, status: "review",    skills: ["Java", "Spring", "MySQL"],                            salary: "$50k",  flag: "Java, not Rust/Go" },
  { id: 8, name: "Tomás Romero",    yrs: 2, loc: "Madrid",      fit: 52, status: "rejected",  skills: ["Python", "Django"],                                   salary: "$60k",  flag: "Junior · stack mismatch" },
  { id: 9, name: "Linh Nguyen",     yrs: 1, loc: "Hanoi",       fit: 38, status: "rejected",  skills: ["JavaScript", "React"],                                salary: "$30k",  flag: "Frontend candidate" },
  { id:10, name: "James O'Brien",   yrs:12, loc: "Dublin",      fit: 31, status: "rejected",  skills: ["COBOL", "AS/400"],                                    salary: "$110k", flag: "Stack mismatch" },
];

const JD_CRITERIA = [
  { label: "4+ years backend",          weight: 25, matched: 7 },
  { label: "Rust or Go",                weight: 30, matched: 6 },
  { label: "Distributed systems exp.",  weight: 20, matched: 5 },
  { label: "PostgreSQL at scale",       weight: 15, matched: 8 },
  { label: "Salary < $150k",            weight: 10, matched: 6 },
];

function ATSPage() {
  const [tab, setTab] = React.useState("all");
  const [reprocessing, setReprocessing] = React.useState(false);
  const [resumes, setResumes] = React.useState(null); // null = loading
  const [uploading, setUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    window.apiFetch('/api/ats/resumes')
      .then(r => r.json())
      .then(d => setResumes(d.resumes || []))
      .catch(() => setResumes([]));
  }, []);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('jobRole', 'Senior Backend Engineer');
      const token = window.__auth.getToken();
      const res = await fetch('/api/ats/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      setUploadResult(data);
      // Refresh list
      window.apiFetch('/api/ats/resumes').then(r => r.json()).then(d => setResumes(d.resumes || []));
    } catch(err) {
      setUploadResult({ error: err.message });
    }
    setUploading(false);
  }

  function reprocess() {
    setReprocessing(true);
    setTimeout(() => setReprocessing(false), 1800);
  }

  const activeList = resumes && resumes.length > 0 ? resumes : RESUMES;

  // For real resumes, map API fields to display shape; fallback RESUMES already have the right shape.
  function normalizeResume(r) {
    if (r.filename !== undefined) {
      // Real API resume
      return {
        id: r.id,
        name: r.filename,
        fit: r.score || 0,
        status: r.verdict ? (r.score >= 80 ? "shortlist" : r.score >= 60 ? "review" : "rejected") : "review",
        skills: r.skills || [],
        salary: null,
        flag: r.verdict || null,
        yrs: null,
        loc: null,
        _raw: r,
      };
    }
    return r;
  }

  const normalizedList = activeList.map(normalizeResume);
  const shown = normalizedList.filter(r => tab === "all" || r.status === tab);

  const { isMobile, isTablet } = useBreakpoint();
  const stackLayout = isMobile || isTablet;

  return (
    <div style={{ padding: stackLayout ? 12 : 24, display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "320px 1fr", gap: stackLayout ? 10 : 16, height: stackLayout ? "auto" : "calc(100vh - 64px)", overflowY: stackLayout ? "auto" : "hidden" }}>
      {/* Left column: JD + criteria */}
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        <div className="card card-glow" style={{ position: "relative", overflow: "hidden" }}>
          <div className="grid-bg" />
          <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
            <h3 className="h3">Active job</h3>
            <span className="pill pill-success"><span className="dot dot-success" />ATS · Auto-ranking</span>
          </div>
          <div className="card-body" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Senior Backend Engineer</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>Karachi / Remote · Rust or Go · 4+ years</div>
            <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 14 }}>
              <span className="pill"><IconBriefcase size={11} />Engineering</span>
              <span className="pill"><IconClock size={11} />Posted 3d ago</span>
              <span className="pill">412 applicants</span>
            </div>
            <div className="row gap-2">
              <button className="btn btn-sm"><IconFileText size={13} />Edit spec</button>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{display:"none"}} onChange={handleFileUpload} />
              <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "Analyzing…" : <><IconPaperclip size={13} />Upload CV</>}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="h3">AI scoring criteria</h3>
            <button className="btn btn-sm btn-ghost"><IconPlus size={13} /></button>
          </div>
          <div className="card-body col gap-3">
            {JD_CRITERIA.map(c => (
              <div key={c.label}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, color: "var(--fg-1)" }}>{c.label}</span>
                  <span className="row gap-2">
                    <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.matched}/10 match</span>
                    <span className="mono pill" style={{ height: 18, fontSize: 10 }}>{c.weight}%</span>
                  </span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(c.matched / 10) * 100}%`,
                    background: "linear-gradient(90deg, rgb(var(--accent)), rgba(var(--accent-2), 0.6))",
                    borderRadius: 999,
                  }} />
                </div>
              </div>
            ))}
            <div className="divider" />
            <button className="btn btn-primary btn-sm" onClick={reprocess} disabled={reprocessing}>
              {reprocessing ? (
                <><span className="row gap-1">{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "white", animation: `pulse-soft 1s ${i*0.15}s infinite` }} />)}</span>Re-ranking…</>
              ) : (
                <><IconSparkles size={13} />Re-rank all CVs</>
              )}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="h3">Multi-language CVs</h3>
            <span className="pill pill-accent">Auto-translate</span>
          </div>
          <div className="card-body" style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.6 }}>
            Resumes in <strong style={{ color: "var(--fg-1)" }}>Urdu, Arabic, Spanish, Japanese, Mandarin & 7 more</strong> are auto-translated before ranking. Original PDF is kept for reviewers.
            <div className="row gap-1" style={{ marginTop: 10, flexWrap: "wrap" }}>
              {["🇺🇸 12", "🇵🇰 8", "🇮🇳 24", "🇯🇵 4", "🇪🇸 6", "🇸🇦 3"].map(t => (
                <span key={t} className="pill" style={{ height: 22 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right column: ranked list */}
      <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="card-header">
          <div className="row gap-3">
            <h3 className="h3">Ranked candidates</h3>
            <span className="pill pill-accent">{normalizedList.length} of 412 shown</span>
          </div>
          <div className="tabs">
            {[
              ["all", `All (${normalizedList.length})`],
              ["shortlist", `Shortlist (${normalizedList.filter(r => r.status === "shortlist").length})`],
              ["review", `Review (${normalizedList.filter(r => r.status === "review").length})`],
              ["rejected", `Rejected (${normalizedList.filter(r => r.status === "rejected").length})`],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? "active" : ""}`}>{label}</button>
            ))}
          </div>
        </div>

        {uploadResult && !uploadResult.error && (
          <div style={{ margin: "0 16px 12px", padding: 14, background: "rgba(var(--success), 0.08)", border: "1px solid rgba(var(--success), 0.25)", borderRadius: "var(--r-md)" }}>
            <div className="row gap-2">
              <IconCheck size={14} style={{ color: "rgb(var(--success))" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{uploadResult.filename} — {uploadResult.verdict}</span>
              <span className="num" style={{ fontSize: 20, fontWeight: 700, color: "rgb(var(--success))", marginLeft: "auto" }}>{uploadResult.score}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 6 }}>{uploadResult.summary}</div>
          </div>
        )}
        {uploadResult && uploadResult.error && (
          <div style={{ margin: "0 16px 12px", padding: 14, background: "rgba(var(--danger), 0.08)", border: "1px solid rgba(var(--danger), 0.25)", borderRadius: "var(--r-md)", fontSize: 12, color: "rgb(var(--danger))" }}>
            Upload failed: {uploadResult.error}
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 1.6fr 0.7fr 1.2fr 0.8fr 100px",
          padding: "10px 20px",
          fontSize: 10, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--fg-3)",
          borderBottom: "1px solid var(--hairline)",
        }}>
          <span>Rank</span>
          <span>Candidate</span>
          <span>Fit</span>
          <span>Skills</span>
          <span>Salary</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {resumes === null && (
            <div className="col gap-3" style={{ padding: "24px 20px" }}>
              {[0,1,2].map(i => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--r-md)" }} />
              ))}
            </div>
          )}
          {shown.map((r, i) => (
            <div key={r.id} className="anim-slide-up" style={{
              display: "grid",
              gridTemplateColumns: "60px 1.6fr 0.7fr 1.2fr 0.8fr 100px",
              padding: "14px 20px",
              borderBottom: "1px solid var(--hairline)",
              alignItems: "center",
              animationDelay: `${i * 30}ms`,
              transition: "background 0.15s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: i < 3 ? "rgb(var(--accent-3))" : "var(--fg-3)" }}>
                {i < 3 && <span style={{ fontSize: 9, marginRight: 3, verticalAlign: 3 }}>#</span>}
                {i + 1}
              </span>
              <div className="col">
                <div className="row gap-2">
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  {r.flag && <span className="pill" style={{
                    height: 18, fontSize: 9.5,
                    color: r.flag === "Top match" ? "rgb(var(--success))" : "var(--fg-3)",
                    borderColor: r.flag === "Top match" ? "rgba(var(--success), 0.3)" : "var(--hairline)",
                    background: r.flag === "Top match" ? "rgba(var(--success), 0.08)" : "rgba(255,255,255,0.03)",
                  }}>{r.flag}</span>}
                </div>
                {(r.yrs !== null || r.loc) && (
                  <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
                    {r.yrs !== null ? `${r.yrs}y` : ""}{r.yrs !== null && r.loc ? " · " : ""}{r.loc || ""}
                  </span>
                )}
              </div>
              <div className="col gap-1">
                <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 999, overflow: "hidden", width: 80 }}>
                  <div style={{
                    height: "100%",
                    width: `${r.fit}%`,
                    background: r.fit >= 85
                      ? "linear-gradient(90deg, rgb(var(--success)), rgba(var(--success), 0.6))"
                      : r.fit >= 70
                        ? "linear-gradient(90deg, rgb(var(--warning)), rgba(var(--warning), 0.6))"
                        : "linear-gradient(90deg, rgb(var(--danger)), rgba(var(--danger), 0.6))",
                  }} />
                </div>
                <span className="num" style={{ fontSize: 11, fontWeight: 600, color: r.fit >= 85 ? "rgb(var(--success))" : r.fit >= 70 ? "rgb(var(--warning))" : "rgb(var(--danger))" }}>
                  {r.fit}% match
                </span>
              </div>
              <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                {(r.skills || []).slice(0, 3).map(s => (
                  <span key={s} className="pill" style={{ height: 19, fontSize: 10 }}>{s}</span>
                ))}
                {(r.skills || []).length > 3 && <span style={{ fontSize: 10, color: "var(--fg-3)" }}>+{r.skills.length - 3}</span>}
              </div>
              <span className="num" style={{ fontSize: 12.5, color: "var(--fg-1)" }}>{r.salary || "—"}</span>
              <div style={{ textAlign: "right" }}>
                {r.status === "shortlist" && <button className="btn btn-sm btn-primary"><IconVideo size={11} />Interview</button>}
                {r.status === "review"    && <button className="btn btn-sm">Review</button>}
                {r.status === "rejected"  && <button className="btn btn-sm btn-ghost">View CV</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ATSPage });
