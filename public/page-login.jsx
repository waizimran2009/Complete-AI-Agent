/* ─────────────────────────────────────────────────────
   Auth page — Sign In / Sign Up
   ───────────────────────────────────────────────────── */

const AUTH_STYLES = `
  @keyframes authFadeUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes authOrb    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.03)} }
  @keyframes authGrid   { 0%{opacity:0} 100%{opacity:1} }
  @keyframes authGlow   { 0%,100%{opacity:.55} 50%{opacity:.85} }
  @keyframes authDot    { 0%,80%,100%{transform:scale(.6);opacity:.3} 40%{transform:scale(1);opacity:1} }
  @keyframes authSlide  { 0%{opacity:0;transform:translateX(12px)} 100%{opacity:1;transform:translateX(0)} }
  .auth-input {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 12px;
    color: #f3f4f6;
    font-family: inherit; font-size: 13.5px;
    outline: none; box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.25); }
  .auth-input:focus {
    border-color: rgba(139,92,246,0.6);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
  .auth-input.error { border-color: rgba(239,68,68,0.5); }
  .auth-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
`;

// ── Floating orb logo ─────────────────────────────────────────────────────────
function AuthOrb() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = 72; canvas.width = S; canvas.height = S;
    const cx = S/2, cy = S/2, R = S*0.42;
    const rawL = { x:-0.45,y:-0.65,z:0.62 };
    const lLen = Math.hypot(rawL.x,rawL.y,rawL.z);
    const L = { x:rawL.x/lLen, y:rawL.y/lLen, z:rawL.z/lLen };
    const imgData = ctx.createImageData(S,S); const d = imgData.data;
    let t = 0, animId;
    function draw() {
      const beat = 0.15 + Math.sin(t*0.025)*0.08;
      const rotY = t*0.009, rotX = Math.sin(t*0.005)*0.55;
      const cosY=Math.cos(rotY),sinY=Math.sin(rotY),cosX=Math.cos(rotX),sinX=Math.sin(rotX);
      const Rb = R*(1+beat*0.12);
      for (let py=0;py<S;py++) for (let px=0;px<S;px++) {
        const idx=(py*S+px)*4;
        const dx=(px-cx)/Rb, dy=(py-cy)/Rb, d2=dx*dx+dy*dy;
        if(d2>1){d[idx+3]=0;continue;}
        const dz=Math.sqrt(1-d2);
        const wx0=dx, wy0=dy*cosX-dz*sinX, wz0=dy*sinX+dz*cosX;
        const wx=wx0*cosY+wz0*sinY, wy=wy0, wz=-wx0*sinY+wz0*cosY;
        const lon=Math.atan2(wx,wz), lat=Math.asin(Math.max(-1,Math.min(1,wy)));
        const f=t*0.02;
        const plasma=((Math.sin(lon*3.5+f)+Math.sin(lat*4.2-f*.8)+Math.sin((lon+lat)*2.8+f*.6)+Math.sin(Math.sqrt(lon*lon+lat*lat)*6-f*1.2))*0.25+1+beat*0.4)/(2+beat*0.4);
        let br,bg,bb;
        if(plasma<0.35){const f2=plasma/0.35;br=Math.round(12+f2*55);bg=Math.round(8+f2*28);bb=Math.round(60+f2*160);}
        else if(plasma<0.7){const f2=(plasma-0.35)/0.35;br=Math.round(55+f2*84);bg=Math.round(28+f2*46);bb=Math.round(220+f2*26);}
        else{const f2=(plasma-0.7)/0.3;br=Math.min(255,Math.round(139+f2*60));bg=Math.min(255,Math.round(74+f2*40));bb=Math.min(255,Math.round(246+f2*9));}
        const NdotL=Math.max(0,dx*L.x+dy*L.y+dz*L.z);
        const Rz=2*dz*NdotL-L.z;
        const spec=Math.pow(Math.max(0,Rz),28)*0.9;
        const bright=0.13+NdotL*0.78;
        const edge=1-Math.pow(d2,4);
        d[idx]=Math.min(255,br*bright+spec*255);
        d[idx+1]=Math.min(255,bg*bright+spec*220);
        d[idx+2]=Math.min(255,bb*bright+spec*255);
        d[idx+3]=Math.round(edge*255);
      }
      ctx.putImageData(imgData,0,0); t++; animId=requestAnimationFrame(draw);
    }
    draw(); return ()=>cancelAnimationFrame(animId);
  },[]);
  return <canvas ref={canvasRef} style={{ width:72, height:72, filter:"drop-shadow(0 0 20px rgba(139,92,246,0.7)) drop-shadow(0 0 48px rgba(99,102,241,0.4))" }} />;
}

// ── Sign In form ──────────────────────────────────────────────────────────────
function SignInForm({ onLogin }) {
  const [email,    setEmail]    = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error,    setError]    = React.useState("");
  const [loading,  setLoading]  = React.useState(false);
  const [showPw,   setShowPw]   = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); setLoading(false); return; }
      window.__auth.setToken(data.token);
      onLogin();
    } catch { setError("Could not reach server"); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14, animation:"authSlide .35s ease forwards" }}>
      <div>
        <label style={LABEL_STYLE}>Email address</label>
        <input className={`auth-input${error?" error":""}`} type="email" placeholder="you@company.com"
          value={email} onChange={e=>{setEmail(e.target.value);setError("");}} autoFocus />
      </div>
      <div>
        <label style={LABEL_STYLE}>Password</label>
        <div style={{ position:"relative" }}>
          <input className={`auth-input${error?" error":""}`} type={showPw?"text":"password"} placeholder="Enter your password"
            value={password} onChange={e=>{setPassword(e.target.value);setError("");}} style={{ paddingRight:44 }} />
          <button type="button" onClick={()=>setShowPw(v=>!v)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:13, padding:0 }}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>
      {error && <div style={{ fontSize:12, color:"#f87171", display:"flex", alignItems:"center", gap:6, padding:"8px 12px", background:"rgba(239,68,68,0.08)", borderRadius:8, border:"1px solid rgba(239,68,68,0.2)" }}>⚠ {error}</div>}
      <button type="submit" disabled={!email||!password||loading} style={btnStyle(!email||!password||loading)}>
        {loading ? <LoadingDots /> : <><span>→</span> Sign In</>}
      </button>
    </form>
  );
}

// ── Sign Up form ──────────────────────────────────────────────────────────────
function SignUpForm({ onSuccess }) {
  const [name,     setName]     = React.useState("");
  const [email,    setEmail]    = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm,  setConfirm]  = React.useState("");
  const [error,    setError]    = React.useState("");
  const [loading,  setLoading]  = React.useState(false);
  const [showPw,   setShowPw]   = React.useState(false);
  const [done,     setDone]     = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name||!email||!password||!confirm) return;
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      window.__auth.setToken(data.token);
      setDone(true);
      setTimeout(() => onSuccess(), 1200);
    } catch { setError("Could not reach server"); setLoading(false); }
  }

  if (done) return (
    <div style={{ textAlign:"center", padding:"32px 0", animation:"authFadeUp .4s ease" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>✦</div>
      <div style={{ color:"#a78bfa", fontWeight:600, fontSize:15 }}>Account created!</div>
      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:6 }}>Signing you in…</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12, animation:"authSlide .35s ease forwards" }}>
      <div>
        <label style={LABEL_STYLE}>Full name</label>
        <input className="auth-input" type="text" placeholder="Waiz Imran"
          value={name} onChange={e=>{setName(e.target.value);setError("");}} autoFocus />
      </div>
      <div>
        <label style={LABEL_STYLE}>Email address</label>
        <input className={`auth-input${error&&error.includes("email")?" error":""}`} type="email" placeholder="you@company.com"
          value={email} onChange={e=>{setEmail(e.target.value);setError("");}} />
      </div>
      <div>
        <label style={LABEL_STYLE}>Password <span style={{ color:"rgba(255,255,255,0.2)", fontWeight:400 }}>(min 6 chars)</span></label>
        <div style={{ position:"relative" }}>
          <input className={`auth-input${error&&(error.includes("Password")||error.includes("match"))?" error":""}`}
            type={showPw?"text":"password"} placeholder="Create a strong password"
            value={password} onChange={e=>{setPassword(e.target.value);setError("");}} style={{ paddingRight:44 }} />
          <button type="button" onClick={()=>setShowPw(v=>!v)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:13, padding:0 }}>
            {showPw?"🙈":"👁"}
          </button>
        </div>
      </div>
      <div>
        <label style={LABEL_STYLE}>Confirm password</label>
        <input className={`auth-input${error&&error.includes("match")?" error":""}`} type="password" placeholder="Repeat password"
          value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}} />
      </div>
      {error && <div style={{ fontSize:12, color:"#f87171", display:"flex", alignItems:"center", gap:6, padding:"8px 12px", background:"rgba(239,68,68,0.08)", borderRadius:8, border:"1px solid rgba(239,68,68,0.2)" }}>⚠ {error}</div>}
      <button type="submit" disabled={!name||!email||!password||!confirm||loading} style={{ ...btnStyle(!name||!email||!password||!confirm||loading), marginTop:2 }}>
        {loading ? <LoadingDots /> : <><span>✦</span> Create Account</>}
      </button>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const LABEL_STYLE = { display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", color:"rgba(196,181,253,0.7)", textTransform:"uppercase", marginBottom:6 };

function btnStyle(disabled) {
  return {
    height:46, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#7c3aed,#6366f1)",
    border: "1px solid", borderColor: disabled ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.6)",
    borderRadius:12, color: disabled ? "rgba(255,255,255,0.25)" : "white",
    fontFamily:"inherit", fontSize:14, fontWeight:600, letterSpacing:"0.04em",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 8px 24px -8px rgba(139,92,246,0.55)",
    transition:"all .2s ease",
  };
}

function LoadingDots() {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:5 }}>
      {[0,1,2].map(i=><span key={i} style={{ width:5, height:5, borderRadius:"50%", background:"white", display:"inline-block", animation:`authDot 1s ${i*0.15}s infinite` }} />)}
      <span style={{ marginLeft:4, fontSize:13 }}>Please wait…</span>
    </span>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab,   setTab]   = React.useState("signin"); // "signin" | "signup"
  const [phase, setPhase] = React.useState("checking"); // checking | idle

  React.useEffect(() => {
    const token = window.__auth.getToken();
    fetch("/api/auth/check", { headers: token ? { Authorization:`Bearer ${token}` } : {} })
      .then(r=>r.json())
      .then(d=>{ if(d.authenticated){ onLogin(); } else { setPhase("idle"); } })
      .catch(()=>setPhase("idle"));
  }, []);

  if (phase === "checking") {
    return (
      <div style={{ position:"fixed", inset:0, background:"#06060a", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"flex", gap:8 }}>
          {[0,1,2].map(i=><span key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#8b5cf6", animation:`authDot 1s ${i*0.15}s infinite` }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#06060a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-sans,Inter,sans-serif)", overflow:"hidden" }}>
      <style>{AUTH_STYLES}</style>

      {/* Ambient radial glow */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 40%,rgba(139,92,246,0.1) 0%,transparent 65%)", pointerEvents:"none", animation:"authGlow 5s ease-in-out infinite" }} />

      {/* Grid lines */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px)", backgroundSize:"56px 56px", maskImage:"radial-gradient(ellipse at center,black 10%,transparent 70%)", pointerEvents:"none" }} />

      {/* Corner glows */}
      <div style={{ position:"absolute", top:-120, left:-120, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-120, right:-120, width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)", pointerEvents:"none" }} />

      {/* Main card */}
      <div style={{ position:"relative", zIndex:2, width:420, background:"rgba(10,8,18,0.85)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:24, padding:"36px 36px 32px", boxShadow:"0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(139,92,246,0.15)", animation:"authFadeUp .5s ease forwards", backdropFilter:"blur(24px)" }}>

        {/* Top glow inside card */}
        <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }} />

        {/* Logo + branding */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-block", animation:"authOrb 4s ease-in-out infinite" }}>
            <AuthOrb />
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:"#f3f4f6", marginTop:14, letterSpacing:"-0.01em" }}>QuantuMania</div>
          <div style={{ fontSize:10, color:"rgba(167,139,250,0.6)", letterSpacing:"0.25em", textTransform:"uppercase", marginTop:4 }}>Company AI System</div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:12, padding:3, marginBottom:24, gap:2 }}>
          {[
            { id:"signin", label:"Sign In" },
            { id:"signup", label:"Sign Up" },
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s ease",
                background: tab===t.id ? "linear-gradient(135deg,rgba(139,92,246,0.5),rgba(99,102,241,0.4))" : "transparent",
                color: tab===t.id ? "#e2d9ff" : "rgba(255,255,255,0.35)",
                boxShadow: tab===t.id ? "0 2px 12px rgba(139,92,246,0.25)" : "none",
                letterSpacing:"0.04em",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Forms */}
        {tab === "signin" && <SignInForm onLogin={onLogin} />}
        {tab === "signup" && <SignUpForm onSuccess={()=>setTab("signin")} />}

        {/* Footer */}
        <div style={{ marginTop:20, textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.18)", lineHeight:1.6 }}>
          {tab==="signin"
            ? <>No account? <button onClick={()=>setTab("signup")} style={{ background:"none", border:"none", color:"rgba(167,139,250,0.6)", cursor:"pointer", fontSize:11, fontFamily:"inherit", textDecoration:"underline" }}>Create one</button></>
            : <>Already have an account? <button onClick={()=>setTab("signin")} style={{ background:"none", border:"none", color:"rgba(167,139,250,0.6)", cursor:"pointer", fontSize:11, fontFamily:"inherit", textDecoration:"underline" }}>Sign in</button></>
          }
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{ position:"absolute", bottom:24, left:0, right:0, textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.1)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
        Powered by Groq · Cloudflare · Supabase
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
