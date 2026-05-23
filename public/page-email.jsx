/* ───────────────────────────────────────────
   Email Automation page
   - Inbox of AI-drafted replies awaiting review
   - Compose with live Claude generation
   ─────────────────────────────────────────── */

const INBOX_THREADS = [
  { id: 1, from: "procurement@acme.io",   name: "Acme Procurement",  subj: "SOC2 documentation request",         time: "2m",   priority: "high", status: "drafted",  preview: "Following up on our security review — could you share..." },
  { id: 2, from: "lina@northwind.io",     name: "Lina Hoffmann",     subj: "Re: Thursday 2:30 — confirming",     time: "14m",  priority: "med",  status: "drafted",  preview: "Confirming our Thursday call. I'll send the Zoom link..." },
  { id: 3, from: "sales@stripe.com",      name: "Stripe Sales",      subj: "Your invoice for May is ready",      time: "1h",   priority: "low",  status: "auto-replied", preview: "Thanks for being a Stripe customer..." },
  { id: 4, from: "careers@google.com",    name: "Google Recruiting", subj: "Senior PM role — interested?",       time: "1h",   priority: "low",  status: "ignored",  preview: "Hi, I came across your profile..." },
  { id: 5, from: "marcus@trellishq.com",  name: "Marcus Lee",        subj: "Following up on our demo",           time: "3h",   priority: "high", status: "drafted",  preview: "Loved the product demo. Two questions before we sign..." },
  { id: 6, from: "alerts@uptimerobot.com",name: "UptimeRobot",       subj: "[Resolved] api.quantumforge.io",     time: "5h",   priority: "low",  status: "filed",    preview: "Your monitor is back up after 2m 14s downtime" },
];

const EMAIL_TEMPLATES = [
  { id: "cold",      label: "Cold outreach",       desc: "First-touch sales email"  },
  { id: "followup",  label: "Demo follow-up",      desc: "After a sales call"        },
  { id: "support",   label: "Support reply",       desc: "Troubleshooting tone"      },
  { id: "rejection", label: "Polite rejection",    desc: "Decline gracefully"        },
  { id: "outreach",  label: "Hiring outreach",     desc: "Recruit a candidate"       },
];

function EmailPage() {
  const [selected, setSelected] = React.useState(INBOX_THREADS[0]);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [tab, setTab] = React.useState("inbox"); // inbox | compose

  return (
    <div style={{
      padding: 24,
      display: "grid",
      gridTemplateColumns: composeOpen ? "1fr" : "320px 1fr",
      gap: 16,
      height: "calc(100vh - 64px)",
      overflow: "hidden",
    }}>
      {!composeOpen && (
        <InboxList
          threads={INBOX_THREADS}
          selectedId={selected?.id}
          onSelect={setSelected}
          onCompose={() => setComposeOpen(true)}
        />
      )}
      {composeOpen ? (
        <ComposeView onClose={() => setComposeOpen(false)} />
      ) : (
        <ThreadDetail thread={selected} onCompose={() => setComposeOpen(true)} />
      )}
    </div>
  );
}

function InboxList({ threads, selectedId, onSelect, onCompose }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="card-header" style={{ padding: "12px 14px" }}>
        <h3 className="h3">Inbox</h3>
        <button className="btn btn-primary btn-sm" onClick={onCompose}>
          <IconSparkles size={13} />Compose
        </button>
      </div>
      <div style={{ padding: "10px 14px 0" }}>
        <div className="tabs" style={{ width: "100%" }}>
          <button className="tab active" style={{ flex: 1 }}>All</button>
          <button className="tab" style={{ flex: 1 }}>AI drafted <span style={{ marginLeft: 4, color: "rgb(var(--accent-3))" }}>·12</span></button>
          <button className="tab" style={{ flex: 1 }}>Sent</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", marginTop: 6 }}>
        {threads.map(t => {
          const active = t.id === selectedId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                background: active ? "rgba(var(--accent), 0.08)" : "transparent",
                borderLeft: "3px solid",
                borderLeftColor: active ? "rgb(var(--accent))" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--hairline)",
                color: "var(--fg-1)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <div className="row gap-2" style={{ minWidth: 0, flex: 1 }}>
                  {t.priority === "high" && <span className="dot dot-danger" style={{ flexShrink: 0 }} />}
                  {t.priority === "med"  && <span className="dot dot-warning" style={{ flexShrink: 0 }} />}
                  {t.priority === "low"  && <span className="dot" style={{ background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />}
                  <span className="truncate" style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--fg-3)", flexShrink: 0 }}>{t.time}</span>
              </div>
              <div className="truncate" style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{t.subj}</div>
              <div className="truncate" style={{ fontSize: 11.5, color: "var(--fg-3)", marginBottom: 6 }}>{t.preview}</div>
              {t.status === "drafted" && (
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(var(--accent), 0.14)",
                  color: "rgb(var(--accent-3))",
                  textTransform: "uppercase",
                }}>
                  <IconSparkles size={9} style={{ marginRight: 4, verticalAlign: -1 }} />
                  AI drafted
                </span>
              )}
              {t.status === "auto-replied" && (
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", padding: "2px 6px", borderRadius: 4, background: "rgba(var(--success), 0.12)", color: "rgb(var(--success))", textTransform: "uppercase" }}>
                  Auto-replied
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const AI_DRAFTS = {
  1: {
    subject: "Re: SOC2 documentation request",
    body: `Hi Acme Procurement team,\n\nThanks for following up on our security review. Attached you'll find:\n\n• Our latest SOC 2 Type II report (Apr 2026, audited by Prescient Assurance)\n• Pen test summary from Cure53\n• Subprocessor list and DPA\n\nWe also maintain a live trust portal at trust.quantumforge.io with continuous control monitoring — happy to grant your team access.\n\nHappy to jump on a call if it would speed things along. Otherwise, let me know what else you need.\n\nBest,\nWaiz\nQuantum Forge\nsecurity@quantumforge.io`,
    tone: "Professional · concise",
    confidence: 94,
  },
  2: {
    subject: "Re: Thursday 2:30 — confirming",
    body: `Hi Lina,\n\nConfirmed for Thursday at 2:30 PM PT. Marcus from our Enterprise team will be on the call.\n\nZoom link: zoom.us/j/quantumforge-northwind\nA calendar invite is on its way to lina@northwind.io.\n\nIn the meantime, if there's anything specific you'd like Marcus to prep for — pricing scenarios, security review, deployment options — just reply here.\n\nLooking forward to it.\n\nBest,\nWaiz`,
    tone: "Warm · efficient",
    confidence: 97,
  },
  5: {
    subject: "Re: Following up on our demo",
    body: `Hi Marcus,\n\nGlad the demo landed well. Happy to answer your two questions:\n\n1. SSO / SAML — yes, included in the Scale tier (Okta, Azure AD, Google Workspace are all supported). We can have it provisioned within 24 hours of signing.\n\n2. On-prem deployment — also Scale tier. Our deployment team handles the Helm chart, and we have customers running on EKS, GKE, and self-managed Kubernetes.\n\nWant me to send the Scale contract over for review? I can have legal turn it around this afternoon.\n\nBest,\nWaiz`,
    tone: "Direct · sales",
    confidence: 91,
  },
};

function ThreadDetail({ thread, onCompose }) {
  if (!thread) return null;
  const draft = AI_DRAFTS[thread.id];

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="card-header">
        <div>
          <h3 className="h3" style={{ marginBottom: 4 }}>{thread.subj}</h3>
          <div className="row gap-3" style={{ fontSize: 11.5, color: "var(--fg-3)" }}>
            <span>From <strong style={{ color: "var(--fg-2)" }}>{thread.name}</strong> ({thread.from})</span>
            <span>·</span>
            <span>{thread.time} ago</span>
          </div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-sm btn-ghost"><IconStar size={13} /></button>
          <button className="btn btn-sm btn-ghost"><IconCopy size={13} /></button>
          <button className="btn btn-sm">Forward</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        {/* Original */}
        <div style={{
          padding: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-md)",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--fg-2)",
          marginBottom: 18,
        }}>
          {thread.preview}<br /><br />
          {thread.id === 1 && "We've been deeply impressed by Quantum Forge's AI orchestration platform, and we're moving into the final stages of our vendor security review. Could you share your most recent SOC2 Type II report, pen test results, and your subprocessor list? Our infosec team needs them by end of week. Thanks, Acme Procurement"}
          {thread.id === 2 && "Just wanted to confirm we're still on for Thursday at 2:30 PM Pacific. I'll send the Zoom link to my team — anything specific I should prep? Lina"}
          {thread.id === 5 && "Hey Waiz — really enjoyed the demo last week. Two quick questions before we move forward: (1) Does your Scale tier include SSO/SAML out of the box, or is that an add-on? (2) For our compliance reasons we may need to deploy on-prem within 12 months — is that on your roadmap? Looking to wrap this up this week if possible. Marcus"}
        </div>

        {/* AI Draft */}
        {draft && (
          <div className="card-glow" style={{
            padding: 18,
            border: "1px solid rgba(var(--accent), 0.28)",
            borderRadius: "var(--r-lg)",
            background: "linear-gradient(180deg, rgba(var(--accent), 0.06), rgba(var(--accent-2), 0.02))",
          }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div className="row gap-2">
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}><IconSparkles size={12} style={{ color: "white" }} /></div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>AI draft reply</span>
                <span className="pill pill-accent" style={{ fontSize: 10 }}>{draft.tone}</span>
                <span className="pill" style={{ fontSize: 10 }}>{draft.confidence}% confident</span>
              </div>
              <button className="btn btn-sm btn-ghost"><IconSparkles size={13} />Regenerate</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 4 }}>To: {thread.from}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Subject: {draft.subject}</div>
            <textarea className="textarea" defaultValue={draft.body} style={{ minHeight: 240, fontSize: 13, lineHeight: 1.6 }} />
            <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
              <div className="row gap-2">
                <button className="btn btn-sm btn-ghost"><IconPaperclip size={13} /></button>
                <button className="btn btn-sm btn-ghost">Tone: <span style={{ color: "rgb(var(--accent-3))", marginLeft: 4 }}>{draft.tone.split("·")[0].trim()}</span> <IconChevDown size={11} /></button>
              </div>
              <div className="row gap-2">
                <button className="btn btn-sm">Save draft</button>
                <button className="btn btn-primary btn-sm"><IconSend size={13} />Send reply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compose view (live Claude generation) ────
function ComposeView({ onClose }) {
  const [recipient, setRecipient] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [template, setTemplate] = React.useState("cold");
  const [tone, setTone] = React.useState("professional");
  const [output, setOutput] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function generate() {
    if (!purpose.trim()) {
      setError("Tell the AI what the email is about.");
      return;
    }
    setError(null);
    setGenerating(true);
    setOutput("");

    const tpl = EMAIL_TEMPLATES.find(t => t.id === template);
    const prompt = `Write a ${tone} business email for Quantum Forge, a software company.\n\nContext: ${tpl?.desc || "Business email"}.\nRecipient: ${recipient || "(unspecified)"}\nGoal / contents the user wants conveyed: ${purpose}\n\nWrite ONLY the email itself, no preamble, no markdown, no "Subject:" line — start with the greeting (e.g. "Hi <name>,"). Keep it under 180 words, scannable, and human. Sign off as "Waiz · Quantum Forge".`;

    try {
      const text = await window.claude.complete(prompt);
      setOutput(text.trim());
    } catch (e) {
      setError("Generation failed. Tap Try again.");
    }
    setGenerating(false);
  }

  return (
    <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div className="grid-bg" />
      <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
        <div className="row gap-3">
          <h3 className="h3">Compose with AI</h3>
          <span className="pill pill-accent"><IconSparkles size={10} />Live · Claude</span>
        </div>
        <button className="btn btn-icon btn-sm btn-ghost" onClick={onClose}><IconClose size={14} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, position: "relative", zIndex: 1 }}>
        {/* Left: controls */}
        <div className="col gap-4">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Recipient</div>
            <input
              className="input"
              placeholder="name@company.com"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Template</div>
            <div className="col gap-1">
              {EMAIL_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: template === t.id ? "rgba(var(--accent), 0.10)" : "var(--bg-elev-1)",
                    border: "1px solid",
                    borderColor: template === t.id ? "rgba(var(--accent), 0.4)" : "var(--hairline)",
                    borderRadius: "var(--r-md)",
                    color: "var(--fg-1)",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{t.desc}</div>
                  </div>
                  {template === t.id && <IconCheck size={14} style={{ color: "rgb(var(--accent))" }} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Tone</div>
            <div className="row gap-1" style={{ flexWrap: "wrap" }}>
              {["professional", "friendly", "direct", "warm", "formal"].map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className="pill"
                  style={{
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: tone === t ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
                    background: tone === t ? "rgba(var(--accent), 0.1)" : "rgba(255,255,255,0.03)",
                    color: tone === t ? "rgb(var(--accent-3))" : "var(--fg-2)",
                    height: 26,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>What's this email about?</div>
            <textarea
              className="textarea"
              placeholder={"e.g. Pitch our developer tools to Acme's CTO; mention SOC2, free pilot for 10 engineers, and ask for a 20-min intro call."}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              style={{ minHeight: 110 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={generating}
            style={{ alignSelf: "stretch", height: 42 }}
          >
            {generating ? (
              <>
                <span className="row gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "white",
                      animation: `pulse-soft 1s ${i*0.15}s infinite`,
                    }} />
                  ))}
                </span>
                Writing…
              </>
            ) : (
              <><IconSparkles size={14} />Generate email</>
            )}
          </button>
          {error && <div style={{ fontSize: 11.5, color: "rgb(var(--danger))" }}>{error}</div>}
        </div>

        {/* Right: output */}
        <div className="col" style={{ minWidth: 0 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <span className="label">Draft preview</span>
            {output && (
              <div className="row gap-2">
                <button className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard.writeText(output)}><IconCopy size={13} />Copy</button>
                <button className="btn btn-sm btn-ghost" onClick={generate}><IconSparkles size={13} />Regenerate</button>
              </div>
            )}
          </div>
          <div style={{
            flex: 1,
            border: "1px solid var(--hairline-2)",
            borderRadius: "var(--r-md)",
            background: "var(--bg-elev-1)",
            padding: 18,
            overflowY: "auto",
            minHeight: 360,
          }}>
            {generating && !output && (
              <div className="col gap-3" style={{ padding: "20px 0" }}>
                <div className="skeleton" style={{ height: 14, width: "30%" }} />
                <div className="skeleton" style={{ height: 14, width: "85%" }} />
                <div className="skeleton" style={{ height: 14, width: "92%" }} />
                <div className="skeleton" style={{ height: 14, width: "60%" }} />
                <div className="skeleton" style={{ height: 14, width: "78%" }} />
                <div className="skeleton" style={{ height: 14, width: "40%" }} />
              </div>
            )}
            {!generating && !output && (
              <div className="col gap-3" style={{
                padding: "60px 20px",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--fg-3)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(var(--accent), 0.08)",
                  border: "1px solid rgba(var(--accent), 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconSparkles size={20} style={{ color: "rgb(var(--accent-3))" }} />
                </div>
                <div style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 500 }}>Draft preview will appear here</div>
                <div style={{ fontSize: 12, maxWidth: 280, lineHeight: 1.5 }}>
                  Pick a template, describe what you want to say, and tap <strong style={{ color: "var(--fg-2)" }}>Generate</strong>.
                </div>
              </div>
            )}
            {output && (
              <pre className="anim-fade-in" style={{
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "var(--fg-1)",
                margin: 0,
              }}>{output}</pre>
            )}
          </div>
          {output && (
            <div className="row gap-2" style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn">Save as draft</button>
              <button className="btn">Schedule</button>
              <button className="btn btn-primary"><IconSend size={13} />Send now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EmailPage });
