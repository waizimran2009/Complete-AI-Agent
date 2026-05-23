/* ─────────────────────────────────────────────────────
   Login screen — shown when ACCESS_PASSWORD is set.
   Skipped automatically in open/dev mode.
   ───────────────────────────────────────────────────── */

function LoginPage({ onLogin }) {
  const [password, setPassword] = React.useState("");
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState("");
  const [phase,    setPhase]    = React.useState("idle"); // idle | checking | done

  // On mount: check if already authenticated or server is in open mode
  React.useEffect(() => {
    setPhase("checking");
    fetch("/api/auth/check", {
      headers: window.__auth.getToken()
        ? { Authorization: `Bearer ${window.__auth.getToken()}` }
        : {},
    })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setPhase("done");
          onLogin();
        } else {
          setPhase("idle");
        }
      })
      .catch(() => setPhase("idle"));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Wrong password");
        setLoading(false);
        return;
      }
      window.__auth.setToken(data.token);
      onLogin();
    } catch {
      setError("Could not reach server");
      setLoading(false);
    }
  }

  if (phase === "checking") {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#06060a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="row gap-2" style={{ color: "var(--fg-3)" }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "rgb(var(--accent))",
              animation: `pulse-soft 1s ${i*0.15}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background:
        "radial-gradient(ellipse at 50% 40%, rgba(var(--accent), 0.08) 0%, transparent 60%), #06060a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(var(--accent), 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent), 0.06) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: 380,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(var(--accent), 0.25)",
        borderRadius: 20,
        padding: "36px 32px",
        boxShadow: "0 32px 80px -16px rgba(var(--accent), 0.2), 0 0 0 1px rgba(255,255,255,0.04)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-2)) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 12px 32px -8px rgba(var(--accent), 0.5)",
            fontSize: 24, fontWeight: 700, color: "white",
          }}>Q</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-1)", marginBottom: 4 }}>
            QuantuMania
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", letterSpacing: "0.1em" }}>
            COMPANY AI SYSTEM
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 6 }}>
              Access password
            </div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter your access password"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "var(--bg-elev-1)",
                border: `1px solid ${error ? "rgba(var(--danger), 0.5)" : "var(--hairline-2)"}`,
                borderRadius: 10,
                color: "var(--fg-1)",
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
            {error && (
              <div style={{ fontSize: 12, color: "rgb(var(--danger))", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <IconAlertTriangle size={12} /> {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || loading}
            style={{
              height: 44,
              background: password
                ? "linear-gradient(180deg, rgb(var(--accent)), rgb(var(--accent-2)))"
                : "rgba(255,255,255,0.06)",
              border: "1px solid",
              borderColor: password ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
              borderRadius: 10,
              color: password ? "white" : "var(--fg-3)",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: password ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: password ? "0 8px 24px -8px rgba(var(--accent), 0.5)" : "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "white", animation: `pulse-soft 1s ${i*0.15}s infinite` }} />
                ))}
                Signing in…
              </>
            ) : (
              <><IconArrowRight size={14} />Enter QuantuMania</>
            )}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 11, color: "var(--fg-4)", textAlign: "center", lineHeight: 1.6 }}>
          Password is set via <code style={{ color: "var(--fg-3)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4 }}>ACCESS_PASSWORD</code> env variable
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
