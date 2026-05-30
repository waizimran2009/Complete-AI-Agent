/* ───────────────────────────────────────────
   Posts / LinkedIn Automation page
   - AI-generated LinkedIn posts (live Claude)
   - Image placeholder (would be AI-generated)
   - Queue + analytics
   ─────────────────────────────────────────── */

const POST_GOALS = [
  { id: "hiring",    label: "We're hiring",   sub: "Job opening announcement", I: IconBriefcase },
  { id: "launch",    label: "Product launch", sub: "Feature or release",       I: IconZap },
  { id: "thought",   label: "Thought piece",  sub: "Industry POV / insight",   I: IconTrending },
  { id: "milestone", label: "Milestone",      sub: "Funding · award · growth", I: IconStar },
  { id: "case",      label: "Case study",     sub: "Customer story",           I: IconUsers },
];

const POST_QUEUE = [
  { title: "Senior Backend Engineer — Karachi/Remote", status: "scheduled", when: "Tomorrow · 9:00 AM", goal: "hiring",   impressions: null },
  { title: "Quantum Forge raises $14M Series A",       status: "scheduled", when: "Fri · 11:00 AM",     goal: "milestone",impressions: null },
  { title: "Why we're rebuilding our infra on Rust",   status: "draft",     when: "Awaiting review",    goal: "thought",  impressions: null },
];

const POST_LIVE = [
  { title: "We just hit 10,000 customers", when: "2 days ago", goal: "milestone", impressions: 12400, likes: 312, comments: 47 },
  { title: "Introducing Aria — our AI voice agent", when: "5 days ago", goal: "launch", impressions: 28900, likes: 642, comments: 89 },
  { title: "We're hiring: Senior Frontend Engineer", when: "1 week ago", goal: "hiring", impressions: 8400, likes: 178, comments: 22 },
];

function PostsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [goal, setGoal] = React.useState("launch");
  const [prompt, setPrompt] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [imageGenerating, setImageGenerating] = React.useState(false);
  const [imageReady, setImageReady] = React.useState(false);
  const [channels, setChannels] = React.useState({ linkedin: true, twitter: true, fb: false });

  async function generate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setOutput("");
    setImageGenerating(true);
    setImageReady(false);

    // Fake image gen timing
    setTimeout(() => { setImageGenerating(false); setImageReady(true); }, 2400);

    const g = POST_GOALS.find(x => x.id === goal);
    const fullPrompt = `Write a LinkedIn post for Quantum Forge, a software company.\n\nPost type: ${g?.label}.\nThe user's brief: ${prompt}\n\nRules:\n- 5–7 short paragraphs, each 1–2 sentences\n- Hook on line 1\n- Use line breaks generously; LinkedIn rewards scannable posts\n- Light, tasteful emoji where natural (no more than 2-3 total)\n- End with one clear CTA\n- 3–5 relevant hashtags at the bottom\n- No markdown, just text\n- 200 words max`;

    try {
      const text = await window.claude.complete(fullPrompt);
      setOutput(text.trim());
    } catch (e) {
      setOutput("Couldn't reach the model. Try again in a moment.");
    }
    setGenerating(false);
  }

  const stackLayout = isMobile || isTablet;

  return (
    <div style={{ padding: stackLayout ? 12 : 24, display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "1fr 1.1fr", gap: stackLayout ? 12 : 16, height: stackLayout ? "auto" : "calc(100vh - 64px)", overflowY: stackLayout ? "auto" : "hidden" }}>
      {/* Left: compose */}
      <div className="card card-glow" style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div className="grid-bg" />
        <div className="card-header" style={{ position: "relative", zIndex: 1 }}>
          <div className="row gap-3">
            <h3 className="h3">Compose post</h3>
            <span className="pill pill-accent"><IconSparkles size={10} />AI · LinkedIn</span>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm btn-ghost"><IconFileText size={13} />Templates</button>
          </div>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
          {/* Goal */}
          <div className="label" style={{ marginBottom: 8 }}>Post type</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 18 }}>
            {POST_GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: goal === g.id ? "rgba(var(--accent), 0.10)" : "var(--bg-elev-1)",
                  border: "1px solid",
                  borderColor: goal === g.id ? "rgba(var(--accent), 0.5)" : "var(--hairline)",
                  borderRadius: "var(--r-md)",
                  color: "var(--fg-1)",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: goal === g.id ? "rgba(var(--accent), 0.18)" : "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: goal === g.id ? "rgb(var(--accent-3))" : "var(--fg-2)",
                }}><g.I size={14} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{g.label}</div>
                  <div className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{g.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Brief */}
          <div className="label" style={{ marginBottom: 6 }}>Brief / what's the post about?</div>
          <textarea
            className="textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={
              goal === "hiring"    ? "e.g. Senior Backend Engineer role. Karachi or remote. Rust/Go, distributed systems, 4+ yrs. Mention our $14M Series A and remote-friendly culture." :
              goal === "launch"    ? "e.g. Just launched Aria, our AI voice receptionist. Answers calls 24/7, books demos, integrates with Salesforce. Beta is free for 30 days." :
              goal === "thought"   ? "e.g. Why we're rebuilding our infra layer on Rust after 3 years on Node. Performance gains, fewer pages, hiring implications." :
              goal === "milestone" ? "e.g. We just closed our $14M Series A led by Sequoia. Used to scale our voice agent team and open a Lisbon office." :
                                     "e.g. Trellis HQ went from 38m to 11m onboarding time using our SDK. Founder quote, the implementation team, what's next."
            }
            style={{ minHeight: 120, marginBottom: 14 }}
          />

          {/* Image controls */}
          <div className="label" style={{ marginBottom: 6 }}>Visual</div>
          <div className="row gap-3" style={{ marginBottom: 18, alignItems: "stretch" }}>
            <div style={{
              width: 130,
              height: 90,
              borderRadius: "var(--r-md)",
              border: "1px dashed var(--hairline-2)",
              background: imageGenerating
                ? "linear-gradient(135deg, rgba(var(--accent), 0.2), rgba(var(--accent-2), 0.2))"
                : imageReady
                  ? `linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-2)) 60%, #0d1226 100%)`
                  : "var(--bg-elev-1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              {imageGenerating && (
                <div className="col gap-2" style={{ alignItems: "center" }}>
                  <span className="row gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "white",
                        animation: `pulse-soft 1s ${i*0.15}s infinite`,
                      }} />
                    ))}
                  </span>
                  <span style={{ fontSize: 10, color: "white" }}>Imagining…</span>
                </div>
              )}
              {imageReady && !imageGenerating && (
                <>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 40%),
                      radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3), transparent 50%)
                    `,
                  }} />
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 4, padding: "2px 6px",
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
                    color: "white",
                  }}>AI · 1024²</div>
                  <span style={{ fontSize: 11, color: "white", fontWeight: 500, position: "relative", zIndex: 1, textAlign: "center", padding: "0 8px", lineHeight: 1.3 }}>
                    {goal === "hiring" ? "Engineer at terminal" :
                     goal === "launch" ? "Glowing orb · product hero" :
                     goal === "milestone" ? "Confetti · team photo" :
                     goal === "thought" ? "Abstract neural net" : "Customer logo wall"}
                  </span>
                </>
              )}
              {!imageGenerating && !imageReady && (
                <IconImage size={20} style={{ color: "var(--fg-3)" }} />
              )}
            </div>
            <div className="col gap-2" style={{ flex: 1 }}>
              <div className="row gap-2">
                <button className="btn btn-sm">
                  <IconSparkles size={13} />Generate image
                </button>
                <button className="btn btn-sm btn-ghost"><IconImage size={13} />Upload</button>
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.4 }}>
                Image is auto-generated from the brief. Click <strong style={{ color: "var(--fg-2)" }}>Generate</strong> below to start.
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="label" style={{ marginBottom: 6 }}>Publish to</div>
          <div className="row gap-2" style={{ marginBottom: 16 }}>
            {[
              { id: "linkedin", label: "LinkedIn",  I: IconLinkedIn },
              { id: "twitter",  label: "Twitter/X", I: IconShare },
              { id: "fb",       label: "Facebook",  I: IconShare },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setChannels(s => ({ ...s, [c.id]: !s[c.id] }))}
                className="pill"
                style={{
                  cursor: "pointer",
                  height: 30,
                  background: channels[c.id] ? "rgba(var(--accent), 0.12)" : "rgba(255,255,255,0.03)",
                  borderColor: channels[c.id] ? "rgba(var(--accent), 0.4)" : "var(--hairline)",
                  color: channels[c.id] ? "rgb(var(--accent-3))" : "var(--fg-2)",
                }}
              >
                <c.I size={12} />{c.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={generating}
            style={{ width: "100%", height: 42 }}
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
                Writing your post…
              </>
            ) : (
              <><IconSparkles size={14} />Generate post</>
            )}
          </button>
        </div>
      </div>

      {/* Right: preview + queue */}
      <div className="col gap-4" style={{ overflowY: "auto" }}>
        {/* LinkedIn preview */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header" style={{ borderBottomColor: "transparent" }}>
            <h3 className="h3">LinkedIn preview</h3>
            <div className="row gap-2">
              <button className="btn btn-sm btn-ghost"><IconEye size={13} />Preview</button>
            </div>
          </div>
          <LinkedInPreview body={output} generating={generating} imageReady={imageReady} imageGenerating={imageGenerating} goal={goal} />
          {(output && !generating) && (
            <div className="row" style={{ padding: 16, justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--hairline)" }}>
              <button className="btn btn-sm btn-ghost"><IconSparkles size={13} />Regenerate</button>
              <button className="btn btn-sm">Save draft</button>
              <button className="btn btn-sm">Schedule</button>
              <button className="btn btn-primary btn-sm"><IconSend size={13} />Post now</button>
            </div>
          )}
        </div>

        {/* Queue + recent */}
        <div className="card">
          <div className="card-header">
            <div className="row gap-3">
              <h3 className="h3">Queue & published</h3>
              <span className="pill pill-accent">{POST_QUEUE.length + POST_LIVE.length}</span>
            </div>
            <div className="tabs">
              <button className="tab active">All</button>
              <button className="tab">Queue</button>
              <button className="tab">Live</button>
            </div>
          </div>
          <div className="col">
            {[...POST_QUEUE, ...POST_LIVE].map((p, i) => {
              const G = POST_GOALS.find(g => g.id === p.goal);
              return (
                <div key={i} className="row gap-3" style={{
                  padding: "12px 16px",
                  borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(var(--accent), 0.10)",
                    color: "rgb(var(--accent-3))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{G && <G.I size={14} />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                    <div className="truncate" style={{ fontSize: 11, color: "var(--fg-3)" }}>{p.when}</div>
                  </div>
                  {p.status === "scheduled" && <span className="pill pill-accent" style={{ height: 22 }}><IconClock size={11} />Scheduled</span>}
                  {p.status === "draft"     && <span className="pill pill-warning" style={{ height: 22 }}>Needs review</span>}
                  {p.impressions && (
                    <div className="row gap-3" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>
                      <span><IconEye size={11} style={{ verticalAlign: -1 }} /> {(p.impressions/1000).toFixed(1)}k</span>
                      <span style={{ color: "var(--fg-3)" }}>{p.likes} · {p.comments}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ body, generating, imageReady, imageGenerating, goal }) {
  const goalLabels = {
    hiring: "Engineering · Hiring",
    launch: "Product launch",
    thought: "Engineering insight",
    milestone: "Company milestone",
    case: "Customer story",
  };
  return (
    <div style={{ padding: "0 20px 18px" }}>
      <div style={{
        background: "#1d1d2a",
        border: "1px solid var(--hairline-2)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
      }}>
        {/* Author row */}
        <div className="row gap-3" style={{ padding: "14px 16px 8px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-2)) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 14,
            flexShrink: 0,
          }}>QF</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Quantum Forge</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{goalLabels[goal]} · 9,482 followers</div>
            <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>Just now · <span>🌎</span></div>
          </div>
          <button className="btn btn-icon btn-sm btn-ghost"><IconMenu size={14} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 16px 14px" }}>
          {generating && !body && (
            <div className="col gap-2" style={{ padding: "8px 0" }}>
              <div className="skeleton" style={{ height: 12, width: "92%" }} />
              <div className="skeleton" style={{ height: 12, width: "88%" }} />
              <div className="skeleton" style={{ height: 12, width: "70%" }} />
              <div style={{ height: 6 }} />
              <div className="skeleton" style={{ height: 12, width: "95%" }} />
              <div className="skeleton" style={{ height: 12, width: "60%" }} />
            </div>
          )}
          {!generating && !body && (
            <div style={{
              padding: "30px 12px",
              color: "var(--fg-3)",
              fontSize: 13,
              textAlign: "center",
              fontStyle: "italic",
            }}>
              Your AI-generated LinkedIn post will appear here.
            </div>
          )}
          {body && (
            <pre className="anim-fade-in" style={{
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "var(--fg-1)",
              margin: 0,
            }}>{body}</pre>
          )}
        </div>

        {/* Image */}
        <div style={{
          height: 280,
          margin: "0 16px 12px",
          borderRadius: "var(--r-sm)",
          background: imageReady
            ? `radial-gradient(circle at 30% 35%, rgba(var(--accent), 0.65) 0%, transparent 45%), radial-gradient(circle at 75% 70%, rgba(var(--accent-2), 0.55) 0%, transparent 55%), #07071a`
            : "rgba(255,255,255,0.025)",
          border: "1px solid var(--hairline)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {imageGenerating && (
            <div className="col gap-3" style={{ alignItems: "center" }}>
              <div style={{ position: "relative", width: 50, height: 50 }}>
                <QuantumOrb size={50} intensity={0.8} />
              </div>
              <span className="label" style={{ color: "rgb(var(--accent-3))" }}>Imagining…</span>
            </div>
          )}
          {imageReady && !imageGenerating && (
            <>
              {/* Pseudo-image abstract composition */}
              <div style={{
                position: "absolute", left: "20%", top: "30%",
                width: 140, height: 140, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)",
              }} />
              <div style={{
                position: "absolute", right: "15%", bottom: "20%",
                width: 90, height: 90, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(var(--accent-3), 0.6), transparent 70%)",
              }} />
              <div style={{
                position: "absolute", bottom: 12, left: 12,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "white",
              }}>AI-generated · 1024×1024</div>
            </>
          )}
          {!imageReady && !imageGenerating && <IconImage size={28} style={{ color: "var(--fg-3)" }} />}
        </div>

        {/* Actions */}
        <div className="row" style={{ padding: "6px 0", borderTop: "1px solid var(--hairline)", justifyContent: "space-around" }}>
          {["Like", "Comment", "Repost", "Send"].map(a => (
            <button key={a} style={{
              flex: 1,
              padding: "10px",
              background: "transparent",
              border: "none",
              color: "var(--fg-2)",
              fontSize: 12,
              fontWeight: 500,
            }}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PostsPage });
