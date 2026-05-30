/* ─────────────────────────────────────────────────────
   Auth page — QuantuMania split sign-in / sign-up
   ───────────────────────────────────────────────────── */

const { useState, useEffect, useMemo } = React;

// ─── injected CSS ────────────────────────────────────────────────────────────
const AUTH_STYLES = `
:root {
  --bg:#06060a; --bg-1:#0b0b12; --bg-2:#11111b;
  --panel:rgba(255,255,255,0.025); --panel-2:rgba(255,255,255,0.05);
  --border:rgba(255,255,255,0.07); --border-2:rgba(255,255,255,0.12);
  --text:#f4f4f6; --text-2:#b6b6c5; --text-3:#75758a;
  --primary:#8b5cf6; --primary-2:#6366f1; --accent:#06b6d4;
  --good:#22c55e; --warn:#f59e0b; --bad:#f43f5e;
  --glow:rgba(139,92,246,0.35); --glow-soft:rgba(139,92,246,0.15);
}
.grad-text{background:linear-gradient(120deg,#ddd6fe 0%,#c4b5fd 35%,#67e8f9 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.mono{font-family:'JetBrains Mono',monospace;}
.micro{color:var(--text-3);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
.auth-mesh{position:fixed;inset:-20%;background:radial-gradient(420px 420px at 30% 30%,rgba(139,92,246,.14),transparent 60%),radial-gradient(380px 380px at 70% 60%,rgba(6,182,212,.10),transparent 60%),radial-gradient(360px 360px at 50% 85%,rgba(99,102,241,.12),transparent 60%);filter:blur(20px);z-index:0;pointer-events:none;animation:meshDrift 24s ease-in-out infinite alternate;}
@keyframes meshDrift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(3%,-2%) scale(1.06)}100%{transform:translate(-2%,3%) scale(1.02)}}
.auth-left input{font-family:inherit;color:inherit;width:100%;background:rgba(255,255,255,.028);border:1px solid var(--border);border-radius:11px;padding:13px 14px 13px 42px;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;font-size:14px;}
.auth-left input::placeholder{color:var(--text-3);}
.auth-left input:focus{border-color:var(--primary);background:rgba(139,92,246,.04);box-shadow:0 0 0 3px rgba(139,92,246,.14);}
.auth-left input.err{border-color:var(--bad);box-shadow:0 0 0 3px rgba(244,63,94,.12);}
.field{position:relative;}
.field>.f-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--text-3);display:grid;place-items:center;pointer-events:none;transition:color .18s;}
.field:focus-within>.f-ico{color:var(--primary);}
.field>.f-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);color:var(--text-3);background:transparent;border:0;cursor:pointer;padding:7px;border-radius:8px;display:grid;place-items:center;}
.field>.f-eye:hover{color:var(--text);background:rgba(255,255,255,.05);}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px 16px;border-radius:11px;border:1px solid var(--border-2);background:rgba(255,255,255,.03);color:var(--text);font:600 14px 'Inter',sans-serif;cursor:pointer;transition:all .16s;}
.btn:hover{background:rgba(255,255,255,.07);}
.btn:active{transform:translateY(1px);}
.btn.primary{background:linear-gradient(135deg,var(--primary-2),var(--primary));border:1px solid rgba(255,255,255,.16);color:white;box-shadow:0 10px 30px -10px var(--glow);position:relative;overflow:hidden;}
.btn.primary:hover{filter:brightness(1.08);}
.btn.primary::after{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.28),transparent);transform:skewX(-18deg);}
.btn.primary:hover::after{animation:sheen .9s ease;}
@keyframes sheen{to{left:130%}}
.btn[disabled]{opacity:.65;cursor:progress;}
.link{color:var(--primary);cursor:pointer;font-weight:600;text-decoration:none;transition:color .15s;}
.link:hover{color:#c4b5fd;text-decoration:underline;}
.aspin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:arot .7s linear infinite;display:inline-block;flex-shrink:0;}
@keyframes arot{to{transform:rotate(360deg)}}
@keyframes fieldIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.stagger>*{opacity:0;animation:fieldIn .5s cubic-bezier(.2,.7,.2,1) forwards;}
@keyframes panelFade{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}
.panel-fade{animation:panelFade .45s ease;}
@keyframes shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}
.shake{animation:shake .4s;}
@keyframes orbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes corePulse{0%,100%{transform:scale(1);box-shadow:0 0 60px var(--glow),0 0 130px 14px rgba(139,92,246,.30),inset -12px -14px 34px rgba(0,0,0,.55),inset 12px 12px 30px rgba(255,255,255,.30)}50%{transform:scale(1.045);box-shadow:0 0 80px var(--glow),0 0 170px 22px rgba(139,92,246,.42),inset -12px -14px 34px rgba(0,0,0,.55),inset 12px 12px 30px rgba(255,255,255,.35)}}
@keyframes auroraSpin{to{transform:rotate(360deg)}}
@keyframes nodeBob{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 6px))}}
@keyframes floatUp{from{transform:translateY(0);opacity:0}10%{opacity:.7}90%{opacity:.7}to{transform:translateY(-120px);opacity:0}}
@keyframes wave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@keyframes flow{to{stroke-dashoffset:-28}}
@keyframes twinkle{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes tickIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@keyframes coreSweep{0%,55%{left:-60%}80%,100%{left:130%}}
@keyframes gy1{from{transform:rotateX(74deg) rotateZ(0)}to{transform:rotateX(74deg) rotateZ(360deg)}}
@keyframes gy2{from{transform:rotateY(76deg) rotateZ(0)}to{transform:rotateY(76deg) rotateZ(-360deg)}}
.scene{position:relative;width:min(400px,64vh);height:min(400px,64vh);flex-shrink:0;}
.scene>*{position:absolute;}
.scene>.aurora{inset:0;}
.aurora{width:116%;height:116%;left:-8%;top:-8%;border-radius:50%;background:conic-gradient(from 0deg,rgba(139,92,246,0) 0deg,#8b5cf6 60deg,#06b6d4 140deg,#6366f1 220deg,#ec4899 300deg,rgba(139,92,246,0) 360deg);filter:blur(58px);opacity:.38;animation:auroraSpin 22s linear infinite;}
.aurora.b{width:78%;height:78%;left:11%;top:11%;background:conic-gradient(from 180deg,#06b6d4,#8b5cf6,#06b6d4);filter:blur(40px);opacity:.30;animation:auroraSpin 14s linear infinite reverse;}
.core2{width:132px;height:132px;left:50%;top:50%;margin:-66px 0 0 -66px;border-radius:50%;background:radial-gradient(circle at 34% 27%,#faf5ff 0%,#c4b5fd 22%,#7c3aed 52%,#4c1d95 78%,#2e1065 100%);box-shadow:0 0 60px var(--glow),0 0 130px 14px rgba(139,92,246,.30),inset -12px -14px 34px rgba(0,0,0,.55),inset 12px 12px 30px rgba(255,255,255,.30);animation:corePulse 4.5s ease-in-out infinite;z-index:3;}
.core2::after{content:"";position:absolute;top:15%;left:20%;width:30%;height:22%;border-radius:50%;background:rgba(255,255,255,.7);filter:blur(7px);}
.core-shine{width:132px;height:132px;left:50%;top:50%;margin:-66px 0 0 -66px;border-radius:50%;overflow:hidden;z-index:4;pointer-events:none;}
.core-shine::before{content:"";position:absolute;top:-20%;left:-60%;width:50%;height:140%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);animation:coreSweep 5s ease-in-out infinite;}
.gyro{width:188px;height:188px;left:50%;top:50%;margin:-94px 0 0 -94px;border-radius:50%;transform-style:preserve-3d;z-index:2;}
.gyro i{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(196,181,253,.30);}
.gyro i:nth-child(1){animation:gy1 11s linear infinite;}
.gyro i:nth-child(2){inset:9%;border-color:rgba(103,232,249,.30);animation:gy2 8s linear infinite;}
.onode{position:absolute;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:15px;z-index:5;display:grid;place-items:center;background:linear-gradient(180deg,rgba(20,20,32,.92),rgba(14,14,22,.92));border:1px solid var(--border-2);backdrop-filter:blur(8px);box-shadow:0 12px 36px -14px rgba(0,0,0,.8);animation:nodeBob 5s ease-in-out infinite;}
.onode .dotglow{position:absolute;inset:-1px;border-radius:15px;opacity:0;transition:opacity .5s;}
.onode.hot .dotglow{opacity:1;}
.onode .lbl{position:absolute;top:calc(100% + 7px);left:50%;transform:translateX(-50%);font-size:10.5px;font-weight:600;color:var(--text-2);white-space:nowrap;opacity:0;transition:opacity .4s;}
.onode.hot .lbl{opacity:1;}
.beam{stroke-linecap:round;}
.pt{position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(196,181,253,.6);}
.wbar{width:3px;border-radius:3px;background:var(--primary);transform-origin:center;}
.tick-row{animation:tickIn .5s ease;}
.auth-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);height:100vh;width:100%;}
.auth-left{display:flex;flex-direction:column;justify-content:center;padding:40px clamp(28px,6vw,92px);position:relative;overflow-y:auto;color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
.auth-right{position:relative;overflow:hidden;border-left:1px solid var(--border);background:radial-gradient(600px 600px at 70% 20%,rgba(139,92,246,.12),transparent 60%),linear-gradient(160deg,rgba(255,255,255,.018),rgba(255,255,255,.004));}
@media(max-width:980px){.auth-grid{grid-template-columns:1fr}.auth-right{display:none}.auth-left{padding:32px clamp(20px,7vw,56px)}}
`;

// ─── icon helpers ─────────────────────────────────────────────────────────────
const ico = (path) => (props) => (
  <svg width={props.size||18} height={props.size||18} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={props.sw||1.8} strokeLinecap="round" strokeLinejoin="round"
    style={props.style}>{path}</svg>
);
const I = {
  Mail:     ico(<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>),
  Lock:     ico(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>),
  User:     ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
  Building: ico(<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></>),
  Eye:      ico(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>),
  EyeOff:   ico(<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></>),
  Check:    ico(<polyline points="20 6 9 17 4 12"/>),
  ArrowRight: ico(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>),
  Phone:    ico(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"/>),
  Video:    ico(<><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></>),
  FileText: ico(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>),
  Globe:    ico(<><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>),
  Shield:   ico(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  Cpu:      ico(<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></>),
};

const GoogleG = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-6.9l-6.5 5C9 41.4 15.9 45 24 45z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C42.8 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);
const MsLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 23 23">
    <path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M12 1h10v10H12z"/>
    <path fill="#00a4ef" d="M1 12h10v10H1z"/><path fill="#ffb900" d="M12 12h10v10H12z"/>
  </svg>
);

// ─── OrbMini ──────────────────────────────────────────────────────────────────
function OrbMini({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative', flexShrink: 0,
      background: 'radial-gradient(circle at 30% 28%, #ddd6fe, #6366f1 52%, #312e81 92%)',
      boxShadow: '0 0 22px var(--glow), inset -3px -3px 8px rgba(0,0,0,0.45)',
    }}>
      <div style={{ position:'absolute', inset:'16%', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.25)', transform:'rotateX(70deg)' }} />
      <div style={{ position:'absolute', inset:'16%', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.2)', transform:'rotateY(70deg)' }} />
    </div>
  );
}

// ─── Showcase (right panel) ───────────────────────────────────────────────────
const ORBIT_R = 158;
const NODES = [
  { ico: I.Phone,    label: 'AI Calls',     c: '#a78bfa', ang: -90 },
  { ico: I.Video,    label: 'Interviews',   c: '#22d3ee', ang: -18 },
  { ico: I.Mail,     label: 'Email',        c: '#34d399', ang:  54 },
  { ico: I.FileText, label: 'CV Screening', c: '#fbbf24', ang: 126 },
  { ico: I.Globe,    label: 'Languages',    c: '#f472b6', ang: 198 },
].map(n => {
  const r = (n.ang * Math.PI) / 180;
  return { ...n, x: 220 + ORBIT_R * Math.cos(r), y: 220 + ORBIT_R * Math.sin(r) };
});

function Showcase() {
  const [hot, setHot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHot(h => (h + 1) % NODES.length), 1500);
    return () => clearInterval(t);
  }, []);

  const events = useMemo(() => [
    { ico: I.Phone,    c: '#a78bfa', t: 'Call resolved',    d: 'Acme Corp · 2m 14s · sentiment +0.8' },
    { ico: I.Video,    c: '#22d3ee', t: 'Interview scored', d: 'S. Khan · 87/100 · no flags' },
    { ico: I.FileText, c: '#fbbf24', t: 'CV shortlisted',   d: 'Frontend Eng · 9 of 318' },
    { ico: I.Mail,     c: '#34d399', t: 'Outreach sent',    d: '24 candidates · 6 replied' },
    { ico: I.Globe,    c: '#f472b6', t: 'Translated reply', d: 'Urdu → English · auto' },
    { ico: I.Cpu,      c: '#818cf8', t: 'Model healthy',    d: 'Llama 3.3 70B · 128k ctx' },
  ], []);

  const [feed, setFeed] = useState([0, 1, 2]);
  useEffect(() => {
    let n = 3;
    const t = setInterval(() => { setFeed(prev => [n % events.length, prev[0], prev[1]]); n++; }, 2600);
    return () => clearInterval(t);
  }, [events.length]);

  const particles = useMemo(() => Array.from({ length: 26 }, () => ({
    left: Math.random() * 100, bottom: Math.random() * 100,
    delay: Math.random() * 9, dur: 7 + Math.random() * 7, size: 1.5 + Math.random() * 2.5,
    c: ['rgba(196,181,253,0.7)', 'rgba(103,232,249,0.6)', 'rgba(255,255,255,0.5)'][Math.floor(Math.random() * 3)],
    tw: 2 + Math.random() * 3,
  })), []);

  const orbits = [
    { rx: 158, ry: 158, dur: 16, c: '#c4b5fd' },
    { rx: 120, ry: 158, dur: 12, c: '#67e8f9', rot: 32 },
    { rx: 158, ry: 110, dur: 20, c: '#f0abfc', rot: -28 },
  ];

  return (
    <div className="auth-right">
      {particles.map((p, i) => (
        <span key={i} className="pt" style={{
          left: `${p.left}%`, bottom: `${p.bottom}%`, width: p.size, height: p.size, background: p.c,
          animation: `floatUp ${p.dur}s linear ${p.delay}s infinite, twinkle ${p.tw}s ease-in-out infinite`,
        }} />
      ))}
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, padding:'70px 48px 64px', textAlign:'center' }}>
        <div style={{ marginBottom:4 }}>
          <div className="micro" style={{ color:'var(--primary)', marginBottom:10 }}>QuantuMania Enterprise</div>
          <h2 style={{ fontSize:'clamp(22px,2.3vw,29px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2 }}>
            One AI agent to <span className="grad-text">run your company</span>
          </h2>
          <p style={{ color:'var(--text-2)', fontSize:13.5, marginTop:9, maxWidth:410, marginInline:'auto', lineHeight:1.55 }}>
            Calls, interviews, hiring, email & analytics — autonomous, multilingual, always on.
          </p>
        </div>

        <div className="scene">
          <div className="aurora" />
          <div className="aurora b" />
          <svg viewBox="0 0 440 440" style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
            <defs>
              {NODES.map((n, i) => (
                <linearGradient key={i} id={`beam${i}`} x1="220" y1="220" x2={n.x} y2={n.y} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={n.c} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={n.c} stopOpacity="0.15" />
                </linearGradient>
              ))}
              <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="220" cy="220" r="120" fill="url(#coreHalo)" />
            {orbits.map((o, i) => (
              <ellipse key={i} cx="220" cy="220" rx={o.rx} ry={o.ry}
                transform={o.rot ? `rotate(${o.rot} 220 220)` : undefined}
                fill="none" stroke={o.c} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 6" />
            ))}
            {NODES.map((n, i) => (
              <line key={i} className="beam" x1="220" y1="220" x2={n.x} y2={n.y}
                stroke={`url(#beam${i})`} strokeWidth={hot === i ? 2.6 : 1.4}
                strokeDasharray="3 9" strokeDashoffset="0"
                style={{ animation:`flow ${hot===i?0.5:1.1}s linear infinite`, opacity:hot===i?1:0.55, transition:'stroke-width .4s, opacity .4s' }} />
            ))}
            {orbits.map((o, i) => {
              const path = `M ${220-o.rx},220 a ${o.rx},${o.ry} 0 1,0 ${o.rx*2},0 a ${o.rx},${o.ry} 0 1,0 ${-o.rx*2},0`;
              return (
                <g key={i} transform={o.rot ? `rotate(${o.rot} 220 220)` : undefined}>
                  <circle r={i===0?3.4:2.6} fill={o.c} style={{ filter:`drop-shadow(0 0 6px ${o.c})` }}>
                    <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={path} rotate="auto" />
                  </circle>
                </g>
              );
            })}
          </svg>
          <div className="gyro"><i /><i /></div>
          <div className="core2" />
          <div className="core-shine" />
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', display:'flex', alignItems:'center', gap:2.5, height:34, zIndex:5 }}>
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="wbar" style={{ height:'100%', width:2.5, background:i%2?'#67e8f9':'#e9d5ff', animation:`wave ${0.7+(i%5)*0.12}s ease-in-out ${i*0.05}s infinite` }} />
            ))}
          </div>
          {NODES.map((n, i) => {
            const F = n.ico;
            return (
              <div key={i} className={`onode ${hot===i?'hot':''}`}
                style={{ left:`${(n.x/440)*100}%`, top:`${(n.y/440)*100}%`, color:n.c, animationDelay:`${i*0.4}s` }}>
                <span className="dotglow" style={{ boxShadow:`0 0 22px ${n.c}, inset 0 0 14px ${n.c}55`, border:`1px solid ${n.c}` }} />
                <F size={22} />
                <span className="lbl">{n.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ width:'min(400px,82%)', marginTop:8, display:'flex', flexDirection:'column', gap:7 }}>
          <div className="micro" style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:2 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px #22c55e', animation:'twinkle 1.6s ease-in-out infinite' }} />
            Live activity
          </div>
          {feed.map((idx, row) => {
            const e = events[idx]; const E = e.ico;
            return (
              <div key={`${idx}-${row}`} className="tick-row" style={{
                display:'flex', alignItems:'center', gap:11, textAlign:'left',
                padding:'9px 12px', borderRadius:11,
                background:'linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))',
                border:'1px solid var(--border)', opacity:row===0?1:0.6-row*0.13,
              }}>
                <span style={{ width:29, height:29, borderRadius:9, flexShrink:0, display:'grid', placeItems:'center', background:`${e.c}1f`, color:e.c, border:`1px solid ${e.c}3a` }}><E size={15} /></span>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:600 }}>{e.t}</div>
                  <div style={{ fontSize:10.5, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.d}</div>
                </div>
                {row===0 && <span style={{ fontSize:10, color:'#4ade80', fontWeight:600 }} className="mono">now</span>}
              </div>
            );
          })}
        </div>

        <div style={{ position:'absolute', bottom:30, display:'flex', gap:20, color:'var(--text-3)', fontSize:11, fontWeight:500 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><I.Shield size={13} style={{ color:'var(--good)' }} />SOC 2 · GDPR</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><I.Lock size={13} style={{ color:'var(--primary)' }} />Encrypted</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><I.Cpu size={13} style={{ color:'var(--accent)' }} />Llama 3.3 70B</span>
        </div>
      </div>
    </div>
  );
}

// ─── strength meter ───────────────────────────────────────────────────────────
function strengthOf(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

// ─── small helpers ────────────────────────────────────────────────────────────
function Field({ icon: Ic, eye, ...props }) {
  return (
    <div className="field">
      <span className="f-ico"><Ic size={17} /></span>
      <input {...props} />
      {eye}
    </div>
  );
}
function ErrLine({ msg }) {
  return <div style={{ color:'#fb7185', fontSize:11.5, marginTop:5, fontWeight:500 }}>{msg}</div>;
}
function CheckRow({ checked, onChange, label, err }) {
  return (
    <label style={{ display:'inline-flex', alignItems:'center', gap:9, cursor:'pointer', userSelect:'none' }} onClick={onChange}>
      <span style={{
        width:19, height:19, borderRadius:6, flexShrink:0, display:'grid', placeItems:'center',
        background: checked ? 'linear-gradient(135deg,var(--primary-2),var(--primary))' : 'rgba(255,255,255,0.03)',
        border: checked ? '1px solid transparent' : `1px solid ${err ? 'var(--bad)' : 'var(--border-2)'}`,
        transition:'all .15s', boxShadow: checked ? '0 4px 12px -4px var(--glow)' : 'none',
      }}>
        {checked && <I.Check size={13} style={{ color:'#fff' }} />}
      </span>
      <span style={{ fontSize:13, color:'var(--text-2)' }}>{label}</span>
    </label>
  );
}

// ─── success card ─────────────────────────────────────────────────────────────
function SuccessCard({ mode }) {
  return (
    <div className="auth-left">
      <div className="panel-fade" style={{ width:'100%', maxWidth:380, marginInline:'auto', textAlign:'center' }}>
        <div style={{
          width:78, height:78, borderRadius:'50%', marginInline:'auto', position:'relative',
          background:'radial-gradient(circle at 32% 28%,#ddd6fe,#6366f1 55%,#312e81 95%)',
          boxShadow:'0 0 50px var(--glow)', display:'grid', placeItems:'center',
          animation:'orbPulse 2.2s ease-in-out infinite',
        }}>
          <I.Check size={34} style={{ color:'#fff' }} sw={2.5} />
        </div>
        <h1 style={{ fontSize:25, fontWeight:700, marginTop:26, letterSpacing:'-0.02em' }}>
          {mode==='signup' ? <>Workspace <span className="grad-text">created</span></> : <>You're <span className="grad-text">in</span></>}
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:14, marginTop:10 }}>Booting your command center…</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:22, color:'var(--text-3)', fontSize:13 }}>
          <span className="aspin" style={{ borderTopColor:'var(--primary)' }} /> Redirecting to dashboard
        </div>
      </div>
    </div>
  );
}

// ─── AuthForm ─────────────────────────────────────────────────────────────────
function AuthForm({ onLogin }) {
  const [mode,     setMode]     = useState('signin');
  const [data,     setData]     = useState({ name:'', company:'', email:'', password:'', confirm:'' });
  const [show,     setShow]     = useState(false);
  const [remember, setRemember] = useState(true);
  const [agree,    setAgree]    = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const set = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));
  const st = strengthOf(data.password);
  const stLabel = ['','Weak','Fair','Good','Strong'][st];
  const stColor = ['','#f43f5e','#f59e0b','#67e8f9','#22c55e'][st];

  const switchMode = (m) => { setMode(m); setErrors({}); setDone(false); };

  const validate = () => {
    const e = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailOk) e.email = 'Enter a valid email';
    if (data.password.length < 6) e.password = 'At least 6 characters';
    if (mode === 'signup') {
      if (!data.name.trim()) e.name = 'Required';
      if (!data.company.trim()) e.company = 'Required';
      if (data.confirm !== data.password) e.confirm = "Passwords don't match";
      if (!agree) e.agree = 'Please accept the terms';
    }
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { setShakeKey(k => k + 1); return; }
    setLoading(true);
    try {
      const isUp = mode === 'signup';
      const endpoint = isUp ? '/api/auth/register' : '/api/auth/login';
      const body = isUp
        ? { name: data.name.trim(), company: data.company.trim(), email: data.email.toLowerCase().trim(), password: data.password }
        : { email: data.email.toLowerCase().trim(), password: data.password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors({ _api: json.error || (isUp ? 'Registration failed' : 'Sign in failed') });
        setShakeKey(k => k + 1);
        setLoading(false);
        return;
      }
      window.__auth.setToken(json.token);
      setLoading(false);
      setDone(true);
      setTimeout(() => onLogin(), 1100);
    } catch {
      setErrors({ _api: 'Could not reach server. Please try again.' });
      setShakeKey(k => k + 1);
      setLoading(false);
    }
  };

  const social = async (name) => {
    if (name !== 'google') return;
    setLoading(true);
    setErrors({});
    try {
      const cfgRes = await fetch('/api/auth/config');
      const cfg = await cfgRes.json();
      if (!cfg.googleClientId) {
        setErrors({ _api: 'Google Sign-In is not configured on this server.' });
        setLoading(false);
        return;
      }
      if (!window.google || !window.google.accounts) {
        setErrors({ _api: 'Google script failed to load. Check your connection.' });
        setLoading(false);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: async (response) => {
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            });
            const json = await res.json();
            if (!res.ok) {
              setErrors({ _api: json.error || 'Google sign-in failed' });
              setLoading(false);
              return;
            }
            window.__auth.setToken(json.token);
            setLoading(false);
            setDone(true);
            setTimeout(() => onLogin(), 1000);
          } catch {
            setErrors({ _api: 'Google sign-in failed. Please try again.' });
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    } catch {
      setErrors({ _api: 'Google sign-in unavailable. Please try again.' });
      setLoading(false);
    }
  };

  if (done) return <SuccessCard mode={mode} />;

  const isUp = mode === 'signup';

  return (
    <div className="auth-left">
      <div style={{ width:'100%', maxWidth:410, marginInline:'auto' }}>
        {/* brand */}
        <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:34 }}>
          <OrbMini size={36} />
          <div>
            <div style={{ fontWeight:700, fontSize:17, letterSpacing:'-0.01em' }}>QuantuMania</div>
            <div className="micro" style={{ fontSize:9.5 }}>Enterprise AI</div>
          </div>
        </div>

        {/* mode switch */}
        <div style={{ display:'inline-flex', padding:4, gap:3, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:12, marginBottom:26 }}>
          {[['signin','Sign in'],['signup','Create account']].map(([m, lbl]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              padding:'8px 18px', borderRadius:9, border:0, cursor:'pointer',
              font:'600 13px Inter,sans-serif',
              background: mode===m ? 'linear-gradient(135deg,var(--primary-2),var(--primary))' : 'transparent',
              color: mode===m ? '#fff' : 'var(--text-2)',
              boxShadow: mode===m ? '0 6px 20px -10px var(--glow)' : 'none',
              transition:'all .18s',
            }}>{lbl}</button>
          ))}
        </div>

        {/* heading */}
        <div className="panel-fade" key={mode + '-head'}>
          <h1 style={{ fontSize:27, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.15 }}>
            {isUp ? <>Create your <span className="grad-text">workspace</span></> : <>Welcome <span className="grad-text">back</span></>}
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:14, marginTop:8 }}>
            {isUp ? 'Spin up your AI agent in under a minute.' : 'Sign in to your QuantuMania command center.'}
          </p>
        </div>

        {/* social */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:22 }}>
          <button className="btn" onClick={() => social('google')} disabled={loading}>
            <GoogleG size={18} /> Continue with Google
          </button>
          <button className="btn" disabled style={{ opacity:.4, cursor:'not-allowed' }}>
            <MsLogo size={16} /> Continue with Microsoft
          </button>
        </div>

        {/* divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'var(--text-3)', fontSize:11.5, fontWeight:600 }}>
          <span style={{ flex:1, height:1, background:'var(--border)' }} />
          OR {isUp ? 'SIGN UP' : 'SIGN IN'} WITH EMAIL
          <span style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        {/* API-level error */}
        {errors._api && (
          <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13, fontWeight:500 }}>
            {errors._api}
          </div>
        )}

        {/* form */}
        <form onSubmit={submit} className={shakeKey ? 'shake' : ''} key={mode + '-form-' + shakeKey}>
          <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {isUp && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, animationDelay:'.02s' }}>
                <div>
                  <Field icon={I.User} placeholder="Full name" value={data.name} onChange={set('name')} className={errors.name ? 'err' : ''} />
                  {errors.name && <ErrLine msg={errors.name} />}
                </div>
                <div>
                  <Field icon={I.Building} placeholder="Company" value={data.company} onChange={set('company')} className={errors.company ? 'err' : ''} />
                  {errors.company && <ErrLine msg={errors.company} />}
                </div>
              </div>
            )}
            <div style={{ animationDelay:'.06s' }}>
              <Field icon={I.Mail} type="email" placeholder="Work email" value={data.email} onChange={set('email')} className={errors.email ? 'err' : ''} autoComplete="email" />
              {errors.email && <ErrLine msg={errors.email} />}
            </div>
            <div style={{ animationDelay:'.1s' }}>
              <Field icon={I.Lock} type={show ? 'text' : 'password'} placeholder="Password" value={data.password} onChange={set('password')}
                className={errors.password ? 'err' : ''} autoComplete={isUp ? 'new-password' : 'current-password'}
                eye={<button type="button" className="f-eye" onClick={() => setShow(s => !s)} tabIndex={-1}>{show ? <I.EyeOff size={17} /> : <I.Eye size={17} />}</button>} />
              {errors.password && <ErrLine msg={errors.password} />}
              {isUp && data.password && (
                <div style={{ marginTop:9 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {[1,2,3,4].map(i => (
                      <span key={i} style={{ flex:1, height:4, borderRadius:3, background:i<=st?stColor:'rgba(255,255,255,0.08)', transition:'background .25s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:stColor, marginTop:5, fontWeight:600 }}>{stLabel} password</div>
                </div>
              )}
            </div>
            {isUp && (
              <div style={{ animationDelay:'.14s' }}>
                <Field icon={I.Lock} type={show ? 'text' : 'password'} placeholder="Confirm password" value={data.confirm} onChange={set('confirm')} className={errors.confirm ? 'err' : ''} />
                {errors.confirm && <ErrLine msg={errors.confirm} />}
              </div>
            )}

            <div style={{ animationDelay:'.16s', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginTop:2 }}>
              {!isUp ? (
                <>
                  <CheckRow checked={remember} onChange={() => setRemember(r => !r)} label="Remember me" />
                  <a className="link" style={{ fontSize:13 }} onClick={e => e.preventDefault()} href="#">Forgot password?</a>
                </>
              ) : (
                <div>
                  <CheckRow checked={agree} onChange={() => setAgree(a => !a)} err={!!errors.agree}
                    label={<span style={{ fontSize:12.5, color:'var(--text-2)' }}>I agree to the <a className="link" href="#" onClick={e => e.preventDefault()}>Terms</a> & <a className="link" href="#" onClick={e => e.preventDefault()}>Privacy Policy</a></span>} />
                  {errors.agree && <ErrLine msg={errors.agree} />}
                </div>
              )}
            </div>

            <button type="submit" className="btn primary" disabled={loading} style={{ animationDelay:'.2s', marginTop:6 }}>
              {loading ? <span className="aspin" /> : <>{isUp ? 'Create account' : 'Sign in'} <I.ArrowRight size={17} /></>}
            </button>
          </div>
        </form>

        <p style={{ textAlign:'center', color:'var(--text-2)', fontSize:13.5, marginTop:22 }}>
          {isUp ? 'Already have an account? ' : "Don't have an account? "}
          <a className="link" href="#" onClick={e => { e.preventDefault(); switchMode(isUp ? 'signin' : 'signup'); }}>
            {isUp ? 'Sign in' : 'Create one'}
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [phase, setPhase] = useState('checking');

  useEffect(() => {
    const token = window.__auth ? window.__auth.getToken() : null;
    fetch('/api/auth/check', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => { if (d.authenticated) { onLogin(); } else { setPhase('idle'); } })
      .catch(() => setPhase('idle'));
  }, []);

  if (phase === 'checking') {
    return (
      <div style={{ position:'fixed', inset:0, background:'#06060a', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid rgba(139,92,246,0.25)', borderTopColor:'#8b5cf6', animation:'arot .7s linear infinite' }} />
        <style>{`@keyframes arot{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#06060a', zIndex:9999 }}>
      <style>{AUTH_STYLES}</style>
      {/* ambient gradient overlay */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(900px 700px at 12% -10%,var(--glow-soft),transparent 60%),radial-gradient(800px 600px at 105% 115%,rgba(6,182,212,0.10),transparent 60%)', pointerEvents:'none', zIndex:0 }} />
      <div className="auth-mesh" />
      <div style={{ position:'relative', zIndex:1, height:'100%' }}>
        <div className="auth-grid">
          <AuthForm onLogin={onLogin} />
          <Showcase />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
