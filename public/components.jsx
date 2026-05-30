/* ───────────────────────────────────────────
   Shared components — QuantumOrb (canvas),
   Sidebar, TopBar, ThemeSwitcher
   ─────────────────────────────────────────── */

// ── Quantum Orb (raymarched plasma sphere) ──
// Lifted from QuantuMania's QuantumOrb3D.tsx with light tweaks.
// Theme-aware via the current accent colors on :root.
function QuantumOrb({ size = 110, intensity = 0.5, mini = false }) {
  const canvasRef = React.useRef(null);
  const beatRef = React.useRef({ intensity });
  React.useEffect(() => { beatRef.current.intensity = intensity; }, [intensity]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const S = mini ? 48 : 110;
    canvas.width = S;
    canvas.height = S;
    const cx = S / 2, cy = S / 2;
    const R = S * 0.42;

    const rawL = { x: -0.45, y: -0.65, z: 0.62 };
    const lLen = Math.hypot(rawL.x, rawL.y, rawL.z);
    const L = { x: rawL.x / lLen, y: rawL.y / lLen, z: rawL.z / lLen };

    const imgData = ctx.createImageData(S, S);
    const d = imgData.data;
    let t = 0;
    let animId;

    // Read accent from CSS vars so orb shifts with theme
    function readAccent() {
      const root = document.documentElement;
      const a = getComputedStyle(root).getPropertyValue("--accent").trim().split(",").map(n => parseInt(n.trim(), 10));
      const a2 = getComputedStyle(root).getPropertyValue("--accent-2").trim().split(",").map(n => parseInt(n.trim(), 10));
      return { a, a2 };
    }
    let palette = readAccent();
    let paletteCheck = 0;

    function draw() {
      paletteCheck++;
      if (paletteCheck > 30) { palette = readAccent(); paletteCheck = 0; }
      const { a, a2 } = palette;

      const beat = beatRef.current.intensity ?? 0;
      if (beat > 0.005) beatRef.current.intensity *= 0.92;
      else beatRef.current.intensity = 0.15 + Math.sin(t * 0.02) * 0.08;

      const rotY = t * 0.007;
      const rotX = Math.sin(t * 0.004) * 0.65;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const beatScale = 1 + beat * 0.18;
      const Rb = R * beatScale;

      for (let py = 0; py < S; py++) {
        for (let px = 0; px < S; px++) {
          const idx = (py * S + px) * 4;
          const dx = (px - cx) / Rb;
          const dy = (py - cy) / Rb;
          const d2 = dx * dx + dy * dy;
          if (d2 > 1) { d[idx + 3] = 0; continue; }

          const dz = Math.sqrt(1 - d2);
          const wx0 = dx;
          const wy0 = dy * cosX - dz * sinX;
          const wz0 = dy * sinX + dz * cosX;
          const wx = wx0 * cosY + wz0 * sinY;
          const wy = wy0;
          const wz = -wx0 * sinY + wz0 * cosY;

          const lon = Math.atan2(wx, wz);
          const lat = Math.asin(Math.max(-1, Math.min(1, wy)));

          const f = t * 0.018;
          const p1 = Math.sin(lon * 3.5 + f);
          const p2 = Math.sin(lat * 4.2 - f * 0.8);
          const p3 = Math.sin((lon + lat) * 2.8 + f * 0.6);
          const p4 = Math.sin(Math.sqrt(lon * lon + lat * lat) * 6 - f * 1.2);
          const plasma = (p1 * 0.3 + p2 * 0.28 + p3 * 0.24 + p4 * 0.18 + 1 + beat * 0.5) / (2 + beat * 0.5);

          let br, bg, bb;
          if (plasma < 0.35) {
            const f2 = plasma / 0.35;
            br = Math.round(12 + f2 * (a2[0] * 0.4));
            bg = Math.round(8 + f2 * (a2[1] * 0.3));
            bb = Math.round(60 + f2 * (a2[2] * 0.7));
          } else if (plasma < 0.7) {
            const f2 = (plasma - 0.35) / 0.35;
            br = Math.round(a2[0] * 0.4 + f2 * (a[0] - a2[0] * 0.4));
            bg = Math.round(a2[1] * 0.3 + f2 * (a[1] - a2[1] * 0.3));
            bb = Math.round(a2[2] * 0.7 + f2 * (a[2] - a2[2] * 0.7));
          } else {
            const f2 = (plasma - 0.7) / 0.3;
            br = Math.min(255, Math.round(a[0] + f2 * 60));
            bg = Math.min(255, Math.round(a[1] + f2 * 80));
            bb = Math.min(255, Math.round(a[2] + f2 * 30));
          }

          const NdotL = Math.max(0, dx * L.x + dy * L.y + dz * L.z);
          const Rz = 2 * dz * NdotL - L.z;
          const spec = Math.pow(Math.max(0, Rz), 28) * (0.9 + beat * 0.6);
          const ambient = 0.13 + beat * 0.15;
          const bright = ambient + NdotL * 0.78;
          const edge = 1 - Math.pow(d2, 4);

          d[idx]     = Math.min(255, br * bright + spec * 255);
          d[idx + 1] = Math.min(255, bg * bright + spec * 220);
          d[idx + 2] = Math.min(255, bb * bright + spec * 255);
          d[idx + 3] = Math.round(edge * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      t++;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [mini]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size, height: size,
        imageRendering: "auto",
        filter: mini
          ? "drop-shadow(0 0 8px rgba(var(--accent), 0.7))"
          : "drop-shadow(0 0 24px rgba(var(--accent), 0.7)) drop-shadow(0 0 56px rgba(var(--accent-2), 0.4))",
      }}
    />
  );
}

// ── Brand mark + word ────────────────────────
function BrandMark({ size = 28 }) {
  return (
    <div className="row gap-3" style={{ alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <QuantumOrb size={size} mini />
      </div>
      <div className="col" style={{ gap: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          color: "var(--fg-1)", lineHeight: 1.1,
        }}>QUANTUMANIA</span>
        <span style={{
          fontSize: 8.5, fontWeight: 500, letterSpacing: "0.32em",
          color: "rgba(var(--accent-3), 0.85)", textTransform: "uppercase", lineHeight: 1.4,
        }}>Company OS</span>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────
const NAV_ITEMS = [
  { id: "chat",       label: "Chat with Aria", Icon: IconSparkles, desc: "Your AI co-worker", badge: "AI" },
  { id: "overview",   label: "Overview",   Icon: IconHome,      desc: "Operations at a glance" },
  { id: "calls",      label: "Calls",      Icon: IconPhone,     desc: "Inbound voice agent", badge: "LIVE" },
  { id: "email",      label: "Email",      Icon: IconMail,      desc: "Inbox & autoresponder", badge: "12" },
  { id: "posts",      label: "Posts",      Icon: IconLinkedIn,  desc: "LinkedIn & socials" },
  { id: "ats",        label: "Resumes",    Icon: IconFileText,  desc: "ATS & CV ranking", badge: "142" },
  { id: "interview",  label: "Interviews", Icon: IconVideo,     desc: "ATS & live screening" },
  { id: "attendance", label: "Attendance", Icon: IconClock,     desc: "Check-in & leave" },
  { id: "analytics",  label: "HR Analytics",Icon: IconBarChart, desc: "Dashboards & reports" },
  { id: "settings",   label: "Settings",   Icon: IconSettings,  desc: "Model & integrations" },
];

function Sidebar({ current, onNavigate, onToggle }) {
  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: "var(--bg-elev-1)",
      borderRight: "1px solid var(--hairline)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 12px 16px",
      position: "relative",
      zIndex: 2,
    }}>
      <div style={{ padding: "0 8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BrandMark size={32} />
        {onToggle && (
          <button
            onClick={onToggle}
            title="Hide sidebar"
            style={{
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--r-sm)",
              color: "var(--fg-3)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--fg-1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-3)"; }}
          >
            <IconClose size={13} />
          </button>
        )}
      </div>

      <div className="label" style={{ padding: "12px 12px 8px" }}>Workspace</div>
      <nav className="col gap-1">
        {NAV_ITEMS.map(item => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: active ? "rgba(var(--accent), 0.10)" : "transparent",
                border: "1px solid",
                borderColor: active ? "rgba(var(--accent), 0.28)" : "transparent",
                borderRadius: "var(--r-md)",
                color: active ? "var(--fg-1)" : "var(--fg-2)",
                fontSize: 13,
                fontWeight: 500,
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={e => {
                if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--fg-1)"; }
              }}
              onMouseLeave={e => {
                if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-2)"; }
              }}
            >
              <item.Icon size={17} stroke={1.7} style={{ color: active ? "rgb(var(--accent))" : "currentColor", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: item.badge === "LIVE" ? "rgba(var(--success), 0.18)" : "rgba(var(--accent), 0.18)",
                  color: item.badge === "LIVE" ? "rgb(var(--success))" : "rgb(var(--accent-3))",
                }}>
                  {item.badge === "LIVE" && <span className="dot dot-success" style={{ marginRight: 4 }} />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status block */}
      <div style={{ marginTop: 24, padding: "0 4px" }}>
        <div className="label" style={{ padding: "8px 8px" }}>System</div>
        <div style={{
          padding: 12,
          background: "rgba(255,255,255,0.015)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-md)",
        }}>
          {[
            { label: "Neural net",   status: "ONLINE",  color: "success" },
            { label: "Voice engine", status: "ACTIVE",  color: "success" },
            { label: "ATS",          status: "READY",   color: "success" },
            { label: "Outreach API", status: "DEGRADED",color: "warning" },
          ].map(s => (
            <div key={s.label} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 2px",
            }}>
              <span style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: "0.02em" }}>{s.label}</span>
              <span className="row gap-2" style={{ gap: 6 }}>
                <span className={`dot dot-${s.color}`} />
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: s.color === "success" ? "rgb(var(--success))" : "rgb(var(--warning))",
                }}>{s.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User chip */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 10,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-md)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(var(--accent), 0.6), rgba(var(--accent-2), 0.6))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600, color: "white",
        }}>WI</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>Waiz Imran</div>
          <div className="truncate" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>Admin · HR</div>
        </div>
        <IconSettings size={15} style={{ color: "var(--fg-3)" }} />
      </div>
    </aside>
  );
}

// ── TopBar ───────────────────────────────────
const THEME_OPTIONS = [
  { id: "default",      label: "Quantum Purple", color: "rgb(139, 92, 246)" },
  { id: "cyber-blue",   label: "Cyber Blue",     color: "rgb(56, 189, 248)" },
  { id: "matrix-green", label: "Matrix Green",   color: "rgb(52, 211, 153)" },
  { id: "solar-orange", label: "Solar Orange",   color: "rgb(251, 146, 60)" },
  { id: "crimson",      label: "Crimson",        color: "rgb(244, 63, 94)" },
];

function TopBar({ title, subtitle, theme, setTheme, rightSlot }) {
  const [themeOpen, setThemeOpen] = React.useState(false);
  return (
    <header style={{
      height: 64,
      flexShrink: 0,
      borderBottom: "1px solid var(--hairline)",
      background: "rgba(12, 12, 20, 0.6)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 18,
      position: "relative",
      zIndex: 2,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-3" style={{ alignItems: "baseline" }}>
          <h1 className="h2" style={{ letterSpacing: "-0.01em" }}>{title}</h1>
          {subtitle && <span style={{ fontSize: 12, color: "var(--fg-3)" }}>· {subtitle}</span>}
        </div>
      </div>

      {rightSlot}

      {/* Theme button */}
      <div style={{ position: "relative" }}>
        <button
          className="btn btn-icon btn-sm"
          onClick={() => setThemeOpen(o => !o)}
          title="Switch theme"
        >
          <IconPalette size={15} />
        </button>
        {themeOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 30 }}
              onClick={() => setThemeOpen(false)}
            />
            <div className="anim-slide-up" style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              width: 200,
              background: "var(--bg-elev-2)",
              border: "1px solid var(--hairline-2)",
              borderRadius: "var(--r-md)",
              boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6)",
              zIndex: 31,
              padding: 6,
            }}>
              <div className="label" style={{ padding: "8px 10px 6px" }}>Theme</div>
              {THEME_OPTIONS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    background: theme === t.id ? "rgba(255,255,255,0.04)" : "transparent",
                    border: "none",
                    borderRadius: "var(--r-sm)",
                    color: "var(--fg-1)",
                    fontSize: 12,
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: t.color,
                    boxShadow: `0 0 12px ${t.color}80`,
                  }} />
                  <span style={{ flex: 1 }}>{t.label}</span>
                  {theme === t.id && <IconCheck size={13} style={{ color: "rgb(var(--accent))" }} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button className="btn btn-icon btn-sm" title="Notifications">
        <IconBell size={15} />
      </button>
    </header>
  );
}

// ── Re-usable "stat card" ───────────────────
function StatCard({ label, value, sub, trend, icon: I, accent }) {
  return (
    <div className="card card-glow" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <span className="label">{label}</span>
        {I && <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: accent ? `rgba(var(--accent), 0.12)` : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent ? "rgb(var(--accent-3))" : "var(--fg-2)",
        }}><I size={14} /></div>}
      </div>
      <div className="num" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--fg-3)" }}>
        {trend === "up"   && <IconArrowUp   size={11} style={{ color: "rgb(var(--success))" }} />}
        {trend === "down" && <IconArrowDown size={11} style={{ color: "rgb(var(--danger))" }} />}
        <span>{sub}</span>
      </div>}
    </div>
  );
}

// ── Shared responsive hook ─────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  React.useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 768, isTablet: w < 1060, w };
}

Object.assign(window, {
  QuantumOrb, BrandMark, Sidebar, TopBar, StatCard, NAV_ITEMS, THEME_OPTIONS, useBreakpoint,
});
