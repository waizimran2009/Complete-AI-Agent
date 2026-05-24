/* ───────────────────────────────────────────
   Settings — model picker, languages, Supabase
   ─────────────────────────────────────────── */

const MODELS = [
  { id: "llama-3.1-70b", name: "Llama 3.1 70B Instruct",     vendor: "Meta · self-hosted", ctx: "128K", strengths: ["Best general · open weights", "Strong reasoning", "Multilingual"], cost: "Self-hosted",   recommended: true,  status: "active" },
  { id: "qwen-2.5-72b",  name: "Qwen 2.5 72B Instruct",      vendor: "Alibaba · self-hosted", ctx: "128K", strengths: ["Excellent multilingual", "Strong coding", "Long context"], cost: "Self-hosted",   recommended: false, status: "available" },
  { id: "mistral-l-2",   name: "Mistral Large 2 (123B)",     vendor: "Mistral · self-hosted", ctx: "128K", strengths: ["European data residency", "Function calling"], cost: "Self-hosted",   recommended: false, status: "available" },
  { id: "deepseek-v3",   name: "DeepSeek V3",                vendor: "DeepSeek · API or self-hosted", ctx: "128K", strengths: ["Cheapest at scale", "Strong math/code"], cost: "$0.27/1M tok", recommended: false, status: "available" },
  { id: "llama-3.2-3b",  name: "Llama 3.2 3B (edge)",        vendor: "Meta · on-device", ctx: "128K", strengths: ["Runs on candidate's browser", "For face match / anti-cheat"], cost: "Free",     recommended: false, status: "active" },
  { id: "gemini-current",name: "Gemini Pro (current)",       vendor: "Google · API", ctx: "1M", strengths: ["Currently wired in"], cost: "$2.50/1M tok", recommended: false, status: "active" },
];

const LANGUAGES = [
  { code: "en", name: "English",  flag: "🇺🇸", primary: true,  enabled: true },
  { code: "ur", name: "Urdu",     flag: "🇵🇰", primary: false, enabled: true },
  { code: "ar", name: "Arabic",   flag: "🇸🇦", primary: false, enabled: true },
  { code: "es", name: "Spanish",  flag: "🇪🇸", primary: false, enabled: true },
  { code: "zh", name: "Mandarin", flag: "🇨🇳", primary: false, enabled: true },
  { code: "hi", name: "Hindi",    flag: "🇮🇳", primary: false, enabled: true },
  { code: "fr", name: "French",   flag: "🇫🇷", primary: false, enabled: false },
  { code: "de", name: "German",   flag: "🇩🇪", primary: false, enabled: false },
  { code: "ja", name: "Japanese", flag: "🇯🇵", primary: false, enabled: false },
  { code: "pt", name: "Portuguese",flag: "🇧🇷", primary: false, enabled: false },
  { code: "ru", name: "Russian",  flag: "🇷🇺", primary: false, enabled: false },
  { code: "tr", name: "Turkish",  flag: "🇹🇷", primary: false, enabled: false },
];

function SettingsPage() {
  const [selectedModel, setSelectedModel] = React.useState("llama-3.1-70b");
  const [langs, setLangs] = React.useState(LANGUAGES);
  const [health, setHealth] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => {});
  }, []);

  function toggleLang(code) {
    setLangs(ls => ls.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l));
  }

  return (
    <div style={{ padding: 24, overflowY: "auto", height: "calc(100vh - 64px)" }}>
      {/* Model selection */}
      <div className="card card-glow" style={{ marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div>
            <h3 className="h3">AI model</h3>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 2 }}>
              The model powering every feature in this dashboard. Currently using <strong style={{ color: "var(--fg-2)" }}>Gemini</strong>. We recommend swapping to a self-hostable open-source model.
            </div>
          </div>
        </div>

        <div style={{ padding: 18, position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {MODELS.map(m => {
              const sel = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  style={{
                    padding: 16,
                    background: sel ? "rgba(var(--accent), 0.10)" : "var(--bg-elev-1)",
                    border: "1px solid",
                    borderColor: sel ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
                    borderRadius: "var(--r-md)",
                    textAlign: "left",
                    color: "var(--fg-1)",
                    position: "relative",
                  }}
                >
                  {m.recommended && (
                    <span style={{
                      position: "absolute", top: 12, right: 12,
                      padding: "2px 8px",
                      background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))",
                      borderRadius: 999,
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "white",
                    }}>Recommended</span>
                  )}
                  <div className="row gap-3" style={{ alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: sel ? "rgba(var(--accent), 0.2)" : "rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {m.id === "llama-3.2-3b" ? <IconZap size={16} style={{ color: "rgb(var(--accent-3))" }} /> :
                       m.id === "gemini-current" ? <span style={{ fontSize: 18 }}>✦</span> :
                       <IconSparkles size={16} style={{ color: sel ? "rgb(var(--accent-3))" : "var(--fg-2)" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{m.vendor}</div>
                    </div>
                    {sel && <IconCheck size={16} style={{ color: "rgb(var(--accent))" }} />}
                  </div>
                  <div className="row gap-2" style={{ marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="pill" style={{ height: 18, fontSize: 9.5 }}>{m.ctx} ctx</span>
                    <span className="pill" style={{ height: 18, fontSize: 9.5 }}>{m.cost}</span>
                    {m.status === "active" && <span className="pill pill-success" style={{ height: 18, fontSize: 9.5 }}><span className="dot dot-success" />Active</span>}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55 }}>
                    {m.strengths.map(s => <li key={s}>{s}</li>)}
                  </ul>
                </button>
              );
            })}
          </div>

          <div style={{
            marginTop: 16,
            padding: 14,
            background: "rgba(var(--accent), 0.06)",
            border: "1px solid rgba(var(--accent), 0.22)",
            borderRadius: "var(--r-md)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}>
            <IconSparkles size={16} style={{ color: "rgb(var(--accent-3))", marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--fg-1)" }}>Why we suggest Llama 3.1 70B:</strong> It's open-weight (no API fees), runs on a single A100, beats GPT-4 on many benchmarks, and supports 8 of your 12 target languages out of the box. Host it on Together.ai, Groq, or your own infra — same API shape as Gemini.
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="h3">Languages</h3>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 2 }}>
                Speech, transcription, AI replies, and UI translations
              </div>
            </div>
            <span className="pill pill-accent">{langs.filter(l => l.enabled).length}/{langs.length}</span>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => toggleLang(l.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: l.enabled ? "rgba(var(--accent), 0.08)" : "var(--bg-elev-1)",
                    border: "1px solid",
                    borderColor: l.enabled ? "rgba(var(--accent), 0.3)" : "var(--hairline)",
                    borderRadius: "var(--r-md)",
                    color: "var(--fg-1)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  <div className="col" style={{ flex: 1, minWidth: 0, gap: 0 }}>
                    <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{l.name}</span>
                    {l.primary && <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", color: "rgb(var(--accent-3))" }}>PRIMARY</span>}
                  </div>
                  <div style={{
                    width: 28, height: 16, borderRadius: 999,
                    background: l.enabled ? "rgb(var(--accent))" : "rgba(255,255,255,0.1)",
                    position: "relative",
                    transition: "background 0.15s",
                  }}>
                    <div style={{
                      position: "absolute", top: 2, left: l.enabled ? 14 : 2,
                      width: 12, height: 12, borderRadius: "50%",
                      background: "white",
                      transition: "left 0.15s",
                    }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Supabase */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="h3">Database · Supabase</h3>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 2 }}>
                All data is stored in your Supabase project
              </div>
            </div>
            <span className={`pill ${health?.features?.database ? "pill-success" : "pill-warning"}`}>
              <span className={`dot ${health?.features?.database ? "dot-success" : "dot-warning"}`} />
              {health?.features?.database ? "Connected" : "Not configured"}
            </span>
          </div>
          <div className="card-body col gap-3">
            <div style={{
              padding: 12,
              background: "var(--bg-elev-1)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--r-md)",
            }}>
              <div className="label" style={{ marginBottom: 6 }}>Project URL</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--fg-1)" }}>
                https://quantumforge.supabase.co
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Tables",  value: health?.features?.database ? "8" : "—",  sub: "auth · calls · emails…" },
                { label: "Rows",    value: "184k",sub: "+4.2k this week" },
                { label: "Storage", value: "12.4 GB", sub: "of 100 GB" },
                { label: "Realtime",value: "8 ch",sub: "subscribed" },
              ].map(s => (
                <div key={s.label} style={{
                  padding: 12,
                  background: "var(--bg-elev-1)",
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--r-md)",
                }}>
                  <div className="label">{s.label}</div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="btn btn-sm"><IconLink size={13} />Open in Supabase</button>
              <button className="btn btn-sm btn-ghost"><IconFileText size={13} />Schema</button>
            </div>

            <div style={{
              padding: 10,
              background: "rgba(var(--success), 0.06)",
              border: "1px solid rgba(var(--success), 0.2)",
              borderRadius: "var(--r-sm)",
              fontSize: 11,
              color: "rgb(110, 231, 183)",
              lineHeight: 1.5,
            }}>
              <IconCheck size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
              Row-level security enabled · Daily backups · EU region
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="card">
        <div className="card-header">
          <h3 className="h3">Integrations</h3>
          <button className="btn btn-sm">Browse all (24)</button>
        </div>
        <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { name: "Twilio",     desc: "Phone numbers + voice", connected: health?.features?.calls ?? true,  initial: "T" },
            { name: "SendGrid",   desc: "Outbound email",        connected: health?.features?.email ?? true,  initial: "S" },
            { name: "LinkedIn",   desc: "Posting & DMs",         connected: true,  initial: "in" },
            { name: "Google Cal", desc: "Demo booking",          connected: true,  initial: "G" },
            { name: "Slack",      desc: "Internal alerts",       connected: true,  initial: "#" },
            { name: "Stripe",     desc: "Billing",               connected: true,  initial: "$" },
            { name: "Greenhouse", desc: "ATS sync",              connected: false, initial: "Gh" },
            { name: "Salesforce", desc: "CRM",                   connected: false, initial: "SF" },
          ].map(i => (
            <div key={i.name} style={{
              padding: 12,
              background: "var(--bg-elev-1)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--r-md)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: i.connected ? "rgba(var(--accent), 0.12)" : "rgba(255,255,255,0.04)",
                color: i.connected ? "rgb(var(--accent-3))" : "var(--fg-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{i.initial}</div>
              <div className="col" style={{ flex: 1, minWidth: 0 }}>
                <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{i.name}</span>
                <span className="truncate" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{i.desc}</span>
              </div>
              {i.connected ? (
                <span className="dot dot-success" />
              ) : (
                <button className="btn btn-sm btn-ghost" style={{ padding: "0 8px", height: 22, fontSize: 10 }}>Connect</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
