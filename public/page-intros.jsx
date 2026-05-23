/* ───────────────────────────────────────────
   Page intro animations — one per feature
   Plays for ~1.2s on every navigation, fades out
   to reveal the actual page. Pure CSS / SVG.
   ─────────────────────────────────────────── */

function PageIntro({ kind, label, sublabel, k }) {
  // `k` is a key forced from the navigation event so the component remounts
  // and replays the animation on each visit.
  const intros = {
    chat:       <IntroChat />,
    overview:   <IntroOverview />,
    calls:      <IntroCalls />,
    email:      <IntroEmail />,
    posts:      <IntroPosts />,
    ats:        <IntroAts />,
    interview:  <IntroInterview />,
    attendance: <IntroAttendance />,
    analytics:  <IntroAnalytics />,
    settings:   <IntroSettings />,
  };
  return (
    <div key={k} className="page-intro-shell">
      <div className="page-intro-stage">
        {intros[kind] || <IntroOverview />}
        <div className="page-intro-text">
          <div className="page-intro-label">{label}</div>
          <div className="page-intro-sub">{sublabel}</div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable shared particles ────────────────
function Ring({ delay = 0, color = "var(--accent)", size = 200 }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      width: size, height: size, marginLeft: -size/2, marginTop: -size/2,
      borderRadius: "50%",
      border: `1.5px solid rgba(${color === "var(--accent)" ? "var(--accent)" : color}, 0.5)`,
      animation: `intro-ring 1.4s ${delay}s ease-out forwards`,
      opacity: 0,
    }} />
  );
}

// ── Chat: orb pulses + greeting bubble ──────
function IntroChat() {
  return (
    <>
      <div className="intro-center">
        {[0,1,2].map(i => (
          <div key={i} className="intro-ring" style={{
            animationDelay: `${0.1 + i * 0.18}s`,
            width: 240 + i * 80,
            height: 240 + i * 80,
          }} />
        ))}
        <div className="intro-orb-wrap">
          <QuantumOrb size={180} intensity={0.95} />
        </div>
        <div className="intro-chat-greeting">
          <span className="dot dot-success" style={{ animation: "pulse-soft 1.4s infinite" }} />
          <span>ARIA · READY</span>
        </div>
      </div>
    </>
  );
}

// ── Overview: orb materializes from grid ────
function IntroOverview() {
  return (
    <>
      <div className="intro-grid-flash" />
      <div className="intro-center">
        <div className="intro-orb-wrap">
          <QuantumOrb size={140} intensity={0.9} />
        </div>
        {[0,1,2,3].map(i => (
          <div key={i} className="intro-ring" style={{
            animationDelay: `${0.1 + i * 0.12}s`,
            width: 180 + i * 60,
            height: 180 + i * 60,
          }} />
        ))}
        {/* Constellation dots */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const r = 180 + (i % 3) * 40;
          return (
            <div key={i} className="intro-dot" style={{
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top: `calc(50% + ${Math.sin(angle) * r}px)`,
              animationDelay: `${0.3 + (i % 6) * 0.06}s`,
            }} />
          );
        })}
      </div>
    </>
  );
}

// ── Calls: sound-wave ripples + phone ────────
function IntroCalls() {
  return (
    <>
      <div className="intro-center">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="intro-sonar" style={{
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
        <div className="intro-phone-burst">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(var(--accent-3))" }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        {/* Voice waveform bars */}
        <div className="intro-waveform">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="intro-wave-bar" style={{
              animationDelay: `${0.3 + i * 0.02}s`,
              height: `${20 + Math.abs(Math.sin(i * 0.4)) * 40}px`,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Email: envelope unfolds + lines stream ───
function IntroEmail() {
  return (
    <>
      <div className="intro-center">
        <svg width="220" height="160" viewBox="0 0 220 160" className="intro-envelope">
          <defs>
            <linearGradient id="env-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%"  stopColor="rgba(var(--accent), 0.4)" />
              <stop offset="100%" stopColor="rgba(var(--accent-2), 0.2)" />
            </linearGradient>
          </defs>
          <rect x="10" y="30" width="200" height="120" rx="6"
            fill="url(#env-grad)"
            stroke="rgba(var(--accent), 0.7)"
            strokeWidth="1.5"
            style={{ animation: "intro-pop 0.6s 0.1s both" }}
          />
          {/* Flap */}
          <path d="M10 36 L110 100 L210 36" fill="none"
            stroke="rgba(var(--accent-3), 0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animation: "intro-dash 0.8s 0.3s both" }}
            strokeDasharray="240" strokeDashoffset="240"
          />
          {/* Lines emerging */}
          {[0,1,2,3].map(i => (
            <line key={i} x1="40" y1={70 + i * 14} x2="180" y2={70 + i * 14}
              stroke="rgba(var(--accent-3), 0.5)" strokeWidth="2" strokeLinecap="round"
              style={{
                animation: `intro-line 0.5s ${0.8 + i * 0.08}s both`,
                transformOrigin: "left center",
              }}
            />
          ))}
        </svg>
        {/* Flying paper planes */}
        {[0,1,2].map(i => (
          <svg key={i} className="intro-plane" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{
            color: "rgb(var(--accent-3))",
            animationDelay: `${0.4 + i * 0.15}s`,
            top: `${30 + i * 12}%`,
          }}>
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        ))}
      </div>
    </>
  );
}

// ── Posts: confetti burst from center ────────
function IntroPosts() {
  const tokens = ["#hiring", "#AI", "🚀", "Series A", "#launch", "10K", "Rust", "🌟", "Engineering", "Karachi"];
  return (
    <>
      <div className="intro-center">
        <div className="intro-burst-core">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(var(--accent))" }}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </div>
        {/* Confetti tokens flying outward */}
        {tokens.map((t, i) => {
          const angle = (i / tokens.length) * Math.PI * 2 + 0.2;
          const r = 220 + (i % 4) * 40;
          return (
            <div key={i} className="intro-confetti" style={{
              animationDelay: `${0.2 + (i % 5) * 0.06}s`,
              "--dx": `${Math.cos(angle) * r}px`,
              "--dy": `${Math.sin(angle) * r}px`,
            }}>{t}</div>
          );
        })}
        {/* Sparkle rays */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360;
          return (
            <div key={i} className="intro-ray" style={{
              transform: `rotate(${angle}deg)`,
              animationDelay: `${0.05 + (i % 4) * 0.04}s`,
            }} />
          );
        })}
      </div>
    </>
  );
}

// ── ATS: documents scan ──────────────────────
function IntroAts() {
  return (
    <>
      <div className="intro-center">
        {[0,1,2].map(i => (
          <div key={i} className="intro-doc" style={{
            transform: `rotate(${(i - 1) * 8}deg) translateX(${(i - 1) * 40}px)`,
            animationDelay: `${0.05 + i * 0.1}s`,
          }}>
            {[0,1,2,3,4,5].map(j => (
              <div key={j} className="intro-doc-line" style={{ width: `${50 + Math.random() * 40}%` }} />
            ))}
          </div>
        ))}
        <div className="intro-scanline" />
        <div className="intro-scan-tag">
          <span className="dot dot-success" />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", color: "rgb(var(--success))" }}>
            ANALYZING · 96% MATCH
          </span>
        </div>
      </div>
    </>
  );
}

// ── Interview: face-detect brackets ──────────
function IntroInterview() {
  return (
    <>
      <div className="intro-center">
        <div className="intro-face-frame">
          {["tl","tr","bl","br"].map(corner => (
            <div key={corner} className={`intro-corner intro-corner-${corner}`} />
          ))}
          {/* Silhouette */}
          <div className="intro-face-silhouette">
            <div className="intro-face-head" />
            <div className="intro-face-body" />
          </div>
          <div className="intro-scanline-vert" />
        </div>
        <div className="intro-face-tag intro-face-tag-1">
          <span className="dot dot-accent" />
          <span>FACE DETECTED</span>
        </div>
        <div className="intro-face-tag intro-face-tag-2">
          <span className="dot dot-success" />
          <span>GAZE · CENTERED</span>
        </div>
        <div className="intro-face-tag intro-face-tag-3">
          <span className="dot dot-success" />
          <span>1 SUBJECT</span>
        </div>
      </div>
    </>
  );
}

// ── Attendance: clock + geo-pin ──────────────
function IntroAttendance() {
  return (
    <>
      <div className="intro-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="intro-clock">
          <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(var(--accent), 0.3)" strokeWidth="1.5" />
          <circle cx="90" cy="90" r="78" fill="none"
            stroke="rgb(var(--accent))" strokeWidth="2"
            strokeDasharray="490"
            strokeDashoffset="490"
            transform="rotate(-90 90 90)"
            style={{ animation: "intro-clock-fill 1.2s 0.1s ease-out forwards" }}
          />
          {/* Ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360;
            return (
              <line key={i}
                x1="90" y1="18"
                x2="90" y2={i % 3 === 0 ? 28 : 24}
                stroke="rgba(var(--accent-3), 0.5)"
                strokeWidth={i % 3 === 0 ? 2 : 1}
                strokeLinecap="round"
                transform={`rotate(${angle} 90 90)`}
                style={{ animation: `intro-tick 0.3s ${0.4 + i * 0.04}s both` }}
              />
            );
          })}
          {/* Hands */}
          <line x1="90" y1="90" x2="90" y2="46" stroke="rgb(var(--accent-3))" strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: "90px 90px", animation: "intro-clockhand-h 1.2s 0.2s ease-out both" }} />
          <line x1="90" y1="90" x2="90" y2="30" stroke="rgb(var(--accent))" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: "90px 90px", animation: "intro-clockhand-m 1.2s 0.2s ease-out both" }} />
          <circle cx="90" cy="90" r="5" fill="rgb(var(--accent))" />
        </svg>
        <div className="intro-geo-pin">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="rgb(var(--accent))" stroke="white" strokeWidth="1">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      </div>
    </>
  );
}

// ── Analytics: bars + chart line ─────────────
function IntroAnalytics() {
  return (
    <>
      <div className="intro-center">
        <div className="intro-bars">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="intro-bar" style={{
              height: `${h * 1.4}px`,
              animationDelay: `${i * 0.06}s`,
            }} />
          ))}
        </div>
        <svg width="320" height="120" viewBox="0 0 320 120" className="intro-chart">
          <defs>
            <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(var(--accent), 0.5)" />
              <stop offset="100%" stopColor="rgba(var(--accent), 0)" />
            </linearGradient>
          </defs>
          <polyline points="0,90 50,70 100,80 150,40 200,50 250,20 320,30"
            fill="none" stroke="rgb(var(--accent-3))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray="500" strokeDashoffset="500"
            style={{ animation: "intro-dash 1.1s 0.4s ease-out forwards" }}
          />
          <polygon points="0,90 50,70 100,80 150,40 200,50 250,20 320,30 320,120 0,120"
            fill="url(#chart-grad)"
            style={{ animation: "intro-fade 0.8s 1s both" }}
          />
        </svg>
      </div>
    </>
  );
}

// ── Settings: orbiting rings ─────────────────
function IntroSettings() {
  return (
    <>
      <div className="intro-center">
        <div className="intro-gear">
          <QuantumOrb size={80} intensity={0.6} mini />
        </div>
        {[0, 1, 2].map(i => {
          const r = 100 + i * 40;
          return (
            <React.Fragment key={i}>
              <div className="intro-orbit" style={{
                width: r * 2, height: r * 2,
                marginLeft: -r, marginTop: -r,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${4 + i * 1.5}s`,
              }}>
                <div className="intro-orbit-dot" style={{
                  background: i === 0 ? "rgb(var(--accent))" : i === 1 ? "rgb(var(--accent-3))" : "rgb(var(--success))",
                }} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, { PageIntro });
