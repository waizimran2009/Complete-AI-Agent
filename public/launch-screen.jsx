/* ───────────────────────────────────────────
   Launch Screen — boot sequence that plays once
   when the dashboard first opens.

   Recreates the QuantuMania IntroScreen vibe:
   centered orb, system check log, status pills,
   "ENTER QUANTUMANIA" activation.
   ─────────────────────────────────────────── */

function LaunchScreen({ onEnter }) {
  const [phase, setPhase] = React.useState("boot"); // boot → ready → exiting
  const [bootLines, setBootLines] = React.useState([]);
  const [progress, setProgress] = React.useState(0);

  const BOOT_SEQUENCE = [
    { t: 60,   text: "Initializing quantum core…" },
    { t: 180,  text: "Loading neural mesh · 3.7B params" },
    { t: 320,  text: "Establishing secure link · TLS 1.3" },
    { t: 460,  text: "Mounting Supabase realtime channels" },
    { t: 580,  text: "Voice engine · ARIA-04 online" },
    { t: 700,  text: "ATS pipeline · ready" },
    { t: 820,  text: "23 languages indexed" },
    { t: 940,  text: "All systems nominal" },
  ];

  React.useEffect(() => {
    const timers = [];
    BOOT_SEQUENCE.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setBootLines(lines => [...lines, step.text]);
        setProgress(((i + 1) / BOOT_SEQUENCE.length) * 100);
      }, step.t));
    });
    timers.push(setTimeout(() => setPhase("ready"), 1050));
    return () => timers.forEach(clearTimeout);
  }, []);

  function enter() {
    setPhase("exiting");
    setTimeout(onEnter, 800);
  }

  return (
    <div className={`launch-shell launch-${phase}`}>
      {/* Background grid */}
      <div className="launch-grid" />
      <div className="launch-vignette" />

      {/* Orbital rings */}
      {[0, 1, 2].map(i => (
        <div key={i} className="launch-orbit" style={{
          width: 320 + i * 140,
          height: 320 + i * 140,
          animationDelay: `${i * 0.15}s`,
          animationDuration: `${20 + i * 12}s`,
        }} />
      ))}

      {/* Top bar */}
      <div className="launch-topbar">
        <div className="launch-brand">
          <span className="launch-brand-name">QUANTUMANIA</span>
          <span className="launch-brand-sub">v 4.2 · Company OS</span>
        </div>
        <div className="launch-status-row">
          <span className="launch-status">
            <span className="dot dot-success" />
            <span>ONLINE</span>
          </span>
          <span className="launch-status">
            <span className="dot dot-accent" />
            <span>NEURAL · LOADED</span>
          </span>
          <span className="launch-status">
            <span className="dot dot-success" />
            <span>SECURE</span>
          </span>
        </div>
      </div>

      {/* Center stage */}
      <div className="launch-center">
        <div className="launch-orb-frame">
          <QuantumOrb size={220} intensity={phase === "ready" ? 0.6 : 0.3} />
          {/* Halo rings */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="launch-halo" style={{
              width: 240 + i * 50,
              height: 240 + i * 50,
              animationDelay: `${i * 0.8}s`,
            }} />
          ))}
        </div>

        <div className="launch-title-row">
          <div className="launch-divider-line" />
          <div className="launch-label">QUANTUM INTELLIGENCE NETWORK</div>
          <div className="launch-divider-line" />
        </div>

        <h1 className="launch-headline">
          {phase === "ready" ? "WELCOME, COMMANDER" : "BOOTING SYSTEMS"}
        </h1>
        <div className="launch-tagline">
          {phase === "ready"
            ? "Nine AI co-workers standing by"
            : "Initializing nine AI co-workers"}
        </div>

        {/* Progress bar */}
        <div className="launch-progress-wrap">
          <div className="launch-progress-track">
            <div className="launch-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="launch-progress-meta">
            <span className="mono">{Math.round(progress)}%</span>
            <span>{phase === "ready" ? "READY" : "LOADING"}</span>
          </div>
        </div>

        {/* Boot log */}
        <div className="launch-boot-log">
          {bootLines.map((l, i) => (
            <div key={i} className="launch-boot-line">
              <span className="launch-boot-bullet">›</span>
              <span>{l}</span>
              <span className="launch-boot-ok">✓</span>
            </div>
          ))}
          {phase === "boot" && bootLines.length < BOOT_SEQUENCE.length && (
            <div className="launch-boot-line launch-boot-line-active">
              <span className="launch-boot-bullet">›</span>
              <span>Working<span className="launch-cursor">_</span></span>
            </div>
          )}
        </div>

        {/* Enter button */}
        {phase === "ready" && (
          <button className="launch-enter-btn" onClick={enter}>
            <span>ENTER QUANTUMANIA</span>
            <span className="launch-enter-arrow">›</span>
          </button>
        )}
      </div>

      {/* Bottom corner status grid */}
      <div className="launch-corner launch-corner-tl">
        <div className="launch-corner-label">SECURE CHANNEL</div>
        <div className="launch-corner-value mono">TLS · 256</div>
      </div>
      <div className="launch-corner launch-corner-tr">
        <div className="launch-corner-label">NODE</div>
        <div className="launch-corner-value mono">QF-KHI-01</div>
      </div>
      <div className="launch-corner launch-corner-bl">
        <div className="launch-corner-label">LATENCY</div>
        <div className="launch-corner-value mono">{`< 12ms`}</div>
      </div>
      <div className="launch-corner launch-corner-br">
        <div className="launch-corner-label">UPTIME</div>
        <div className="launch-corner-value mono">99.98%</div>
      </div>
    </div>
  );
}

Object.assign(window, { LaunchScreen });
