'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ||'http://localhost:8000';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type AuthMode = 'login' | 'signup';
type AuthStatus = 'idle' | 'loading' | 'success_new' | 'success_returning' | 'error';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FEATURES = [
  { icon: '📄', title: 'Resume Analyser', desc: 'Deep semantic parsing against role-specific requirements with precision scoring and ATS compatibility checks.' },
  { icon: '🗺️', title: 'Personalised Roadmap', desc: 'Week-by-week adaptive learning plans calibrated to your current skills, target role, and real-world timelines.' },
  { icon: '🎓', title: 'Course Recommendations', desc: 'Curated content from Coursera, edX, and Udemy — matched precisely to your skill gaps and learning style.' },
  { icon: '🎤', title: 'AI Mock Interviews', desc: 'Conversational interview simulations with real-time STAR-method feedback and confidence scoring.' },
  { icon: '🏅', title: 'Skill Verification Badge', desc: 'Pass AI-assessed evaluations to earn shareable badges that prove competency to recruiters.' },
  { icon: '✨', title: 'Resume Rewriter', desc: 'ATS-optimised, role-tailored resume rewriting that highlights what matters most for your target role.' },
  { icon: '💼', title: 'Job Opportunity Matcher', desc: 'Curated listings matched to your skill profile, location preference, and salary expectations in real time.' },
  { icon: '🎯', title: 'Self-Introduction Coach', desc: 'Craft a compelling "Tell me about yourself" with AI coaching — scripted, practised, and interview-ready.' },
  { icon: '📊', title: 'Skill Gap Analytics', desc: "Visual dashboards showing exactly which skills you're missing, their market value, and time-to-learn estimates." },
];

const STEPS = [
  { num: '01', title: 'Upload Resume & Target Role', desc: 'Paste a job description or choose from our role library. AI instantly maps your profile to employer expectations.' },
  { num: '02', title: 'Receive Your AI Roadmap', desc: 'Get a structured learning plan with prioritised skills, recommended resources, and realistic completion timelines.' },
  { num: '03', title: 'Practice & Get Verified', desc: 'Complete mock interviews, earn skill badges, and let AI rewrite your resume to match your upgraded profile.' },
  { num: '04', title: 'Apply With Confidence', desc: "Browse matched listings with your polished resume, verified skills, and a rehearsed personal pitch. You're ready." },
];

/* ─────────────────────────────────────────────
   STUDENT SVG ILLUSTRATION
───────────────────────────────────────────── */
function StudentIllustration() {
  return (
    <svg viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="300" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f0530" />
          <stop offset="100%" stopColor="#080218" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="80" y1="100" x2="220" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1145" />
          <stop offset="100%" stopColor="#0c0620" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="150" y1="105" x2="150" y2="225" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="matchBar" x1="155" y1="207" x2="190" y2="207" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="300" height="380" rx="24" fill="url(#bgGrad)" />

      <rect x="30" y="260" width="240" height="8" rx="2" fill="#1a1035" stroke="#2d1f5e" strokeWidth="0.5" />
      <rect x="50" y="268" width="6" height="60" rx="1" fill="#150d2e" />
      <rect x="244" y="268" width="6" height="60" rx="1" fill="#150d2e" />
      <rect x="45" y="324" width="16" height="4" rx="1" fill="#150d2e" />
      <rect x="239" y="324" width="16" height="4" rx="1" fill="#150d2e" />

      <rect x="85" y="232" width="130" height="6" rx="2" fill="#1e1540" />
      <rect x="80" y="235" width="140" height="4" rx="1.5" fill="#150d2e" />
      <rect x="88" y="98" width="124" height="136" rx="6" fill="#150d2e" stroke="#2d1f5e" strokeWidth="0.8" />
      <rect x="93" y="103" width="114" height="126" rx="3" fill="url(#screenGrad)" className="student-screen-glow" />
      <rect x="93" y="103" width="114" height="126" rx="3" fill="url(#glowGrad)" />

      <rect x="102" y="114" width="40" height="3" rx="1" fill="#818cf8" opacity="0.6" />
      <rect x="102" y="121" width="65" height="3" rx="1" fill="#6366f1" opacity="0.35" />
      <rect x="110" y="128" width="50" height="3" rx="1" fill="#06b6d4" opacity="0.5" />
      <rect x="110" y="135" width="35" height="3" rx="1" fill="#c084fc" opacity="0.4" />
      <rect x="102" y="142" width="55" height="3" rx="1" fill="#6366f1" opacity="0.3" />
      <rect x="110" y="149" width="45" height="3" rx="1" fill="#22d3ee" opacity="0.45" />
      <rect x="102" y="156" width="30" height="3" rx="1" fill="#818cf8" opacity="0.35" />
      <rect x="110" y="163" width="60" height="3" rx="1" fill="#6366f1" opacity="0.25" />
      <rect x="110" y="170" width="40" height="3" rx="1" fill="#a5b4fc" opacity="0.4" />
      <rect x="102" y="177" width="50" height="3" rx="1" fill="#06b6d4" opacity="0.3" />
      <rect x="110" y="184" width="25" height="3" rx="1" fill="#c084fc" opacity="0.35" />

      <rect x="137" y="184" width="2" height="3" rx="0.5" fill="#818cf8" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0;0.9" dur="1s" repeatCount="indefinite" />
      </rect>

      <rect x="172" y="114" width="30" height="100" rx="2" fill="#0c0620" opacity="0.5" />
      <rect x="176" y="120" width="22" height="2.5" rx="1" fill="#22d3ee" opacity="0.3" />
      <rect x="176" y="127" width="18" height="2.5" rx="1" fill="#818cf8" opacity="0.25" />
      <rect x="176" y="134" width="20" height="2.5" rx="1" fill="#6366f1" opacity="0.2" />
      <circle cx="182" cy="155" r="8" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.3" />
      <path d="M182 149 L182 155 L187 155" stroke="#818cf8" strokeWidth="1" opacity="0.3" strokeLinecap="round" />

      <rect x="100" y="198" width="100" height="24" rx="4" fill="#0c0620" opacity="0.6" />
      <text x="115" y="214" fontFamily="Inter" fontSize="9" fontWeight="600" fill="#22d3ee" opacity="0.7">94% Match</text>
      <rect x="155" y="207" width="35" height="5" rx="2.5" fill="#150d2e" />
      <rect x="155" y="207" width="33" height="5" rx="2.5" fill="url(#matchBar)" />

      <rect x="38" y="210" width="3" height="50" rx="1" fill="#2d1f5e" />
      <ellipse cx="40" cy="208" rx="18" ry="6" fill="#1a1035" />
      <circle cx="40" cy="200" r="25" fill="url(#lampGlow)" />
      <circle cx="40" cy="204" r="4" fill="#fbbf24" opacity="0.25" />

      <path d="M135 195 C135 195 125 230 125 245 L125 258 L175 258 L175 245 C175 230 165 195 165 195" fill="#1e1540" />
      <path d="M145 195 L150 210 L155 195" fill="none" stroke="#2d1f5e" strokeWidth="1" />
      <ellipse cx="150" cy="175" rx="22" ry="26" fill="#2d1f5e" />
      <path d="M128 168 C128 148 140 140 150 140 C160 140 172 148 172 168 C172 162 168 152 150 152 C132 152 128 162 128 168Z" fill="#150d2e" />
      <path d="M128 168 C126 172 127 178 128 180" stroke="#150d2e" strokeWidth="3" strokeLinecap="round" />
      <path d="M172 168 C174 172 173 178 172 180" stroke="#150d2e" strokeWidth="3" strokeLinecap="round" />

      <ellipse cx="142" cy="173" rx="3" ry="2" fill="#0c0620" />
      <ellipse cx="158" cy="173" rx="3" ry="2" fill="#0c0620" />
      <circle cx="143" cy="172.5" r="0.8" fill="#818cf8" opacity="0.5" />
      <circle cx="159" cy="172.5" r="0.8" fill="#818cf8" opacity="0.5" />
      <path d="M137 168 C139 166 145 166 147 167" stroke="#150d2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M153 167 C155 166 161 166 163 168" stroke="#150d2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M150 176 L149 180 L151 180" stroke="#2d1f5e" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M146 185 C148 186 152 186 154 185" stroke="#2d1f5e" strokeWidth="0.8" fill="none" strokeLinecap="round" />

      <rect x="135" y="169" width="14" height="10" rx="5" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.4" />
      <rect x="153" y="169" width="14" height="10" rx="5" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.4" />
      <line x1="149" y1="174" x2="153" y2="174" stroke="#6366f1" strokeWidth="0.6" opacity="0.3" />
      <line x1="138" y1="172" x2="140" y2="170" stroke="#818cf8" strokeWidth="0.5" opacity="0.15" />

      <path d="M130 215 C120 225 110 240 115 252 L125 258" fill="#1e1540" stroke="#2d1f5e" strokeWidth="0.5" />
      <path d="M170 215 C180 225 190 240 185 252 L175 258" fill="#1e1540" stroke="#2d1f5e" strokeWidth="0.5" />
      <ellipse cx="120" cy="255" rx="8" ry="4" fill="#2d1f5e" />
      <ellipse cx="180" cy="255" rx="8" ry="4" fill="#2d1f5e" />

      <rect x="210" y="242" width="16" height="18" rx="3" fill="#1a1035" stroke="#2d1f5e" strokeWidth="0.5" />
      <path d="M226 247 C230 247 232 251 232 255 C232 258 230 260 226 260" fill="none" stroke="#2d1f5e" strokeWidth="0.8" />
      <path d="M216 240 C216 236 218 234 218 230" stroke="#818cf8" strokeWidth="0.6" fill="none" opacity="0.15" strokeLinecap="round">
        <animate attributeName="d" values="M216 240 C216 236 218 234 218 230;M216 240 C214 236 218 232 216 228;M216 240 C216 236 218 234 218 230" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M220 240 C220 237 222 235 222 231" stroke="#818cf8" strokeWidth="0.6" fill="none" opacity="0.1" strokeLinecap="round">
        <animate attributeName="d" values="M220 240 C220 237 222 235 222 231;M220 240 C218 237 222 233 220 229;M220 240 C220 237 222 235 222 231" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.03;0.1" dur="3.5s" repeatCount="indefinite" />
      </path>

      <rect x="55" y="245" width="12" height="15" rx="2" fill="#1a1035" stroke="#2d1f5e" strokeWidth="0.5" />
      <circle cx="61" cy="240" r="8" fill="#0f2a1a" opacity="0.6" />
      <circle cx="57" cy="237" r="5" fill="#0f2a1a" opacity="0.5" />
      <circle cx="65" cy="238" r="6" fill="#0f2a1a" opacity="0.5" />

      <circle cx="70" cy="150" r="1.5" fill="#818cf8" opacity="0.2">
        <animate attributeName="cy" values="150;130;150" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="230" cy="160" r="1" fill="#06b6d4" opacity="0.25">
        <animate attributeName="cy" values="160;140;160" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="250" cy="130" r="1.5" fill="#c084fc" opacity="0.15">
        <animate attributeName="cy" values="130;115;130" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   AURORA CANVAS
───────────────────────────────────────────── */
function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.2, y: 0.15, rx: 0.35, ry: 0.18, color: [99, 102, 241], alpha: 0.12, speed: 0.3, phase: 0 },
      { x: 0.75, y: 0.1, rx: 0.3, ry: 0.15, color: [6, 182, 212], alpha: 0.09, speed: 0.25, phase: 2 },
      { x: 0.5, y: 0.3, rx: 0.4, ry: 0.12, color: [168, 85, 247], alpha: 0.08, speed: 0.35, phase: 4 },
      { x: 0.15, y: 0.5, rx: 0.25, ry: 0.2, color: [236, 72, 153], alpha: 0.06, speed: 0.2, phase: 1 },
      { x: 0.85, y: 0.4, rx: 0.2, ry: 0.15, color: [59, 130, 246], alpha: 0.07, speed: 0.28, phase: 3 },
      { x: 0.4, y: 0.05, rx: 0.5, ry: 0.08, color: [129, 140, 248], alpha: 0.1, speed: 0.15, phase: 5 },
      { x: 0.6, y: 0.6, rx: 0.3, ry: 0.1, color: [34, 211, 238], alpha: 0.05, speed: 0.22, phase: 0.5 },
    ];

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;
      const dt = timestamp - timeRef.current;
      timeRef.current = timestamp;
      const t = timestamp * 0.001;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      for (const blob of blobs) {
        const cx = (blob.x + Math.sin(t * blob.speed + blob.phase) * 0.08) * W;
        const cy = (blob.y + Math.cos(t * blob.speed * 0.7 + blob.phase) * 0.06) * H;
        const rx = blob.rx * W * (0.9 + Math.sin(t * blob.speed * 0.5 + blob.phase * 2) * 0.15);
        const ry = blob.ry * H * (0.9 + Math.cos(t * blob.speed * 0.6 + blob.phase * 1.5) * 0.15);
        const alphaOsc = blob.alpha * (0.7 + Math.sin(t * blob.speed * 0.4 + blob.phase) * 0.3);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * blob.speed * 0.3 + blob.phase) * 0.1);
        ctx.scale(1, ry / Math.max(rx, 1));

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        const [r, g, b] = blob.color;
        grad.addColorStop(0, `rgba(${r},${g},${b},${alphaOsc})`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${alphaOsc * 0.6})`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},${alphaOsc * 0.2})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* Subtle aurora wave bands */
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.globalAlpha = 0.03 + Math.sin(t * 0.2 + i) * 0.015;
        ctx.beginPath();
        const baseY = H * (0.15 + i * 0.12);
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= W; x += 4) {
          const y = baseY + Math.sin(x * 0.003 + t * (0.3 + i * 0.1) + i * 2) * 40
                          + Math.sin(x * 0.007 + t * (0.2 + i * 0.05)) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, baseY + 80);
        ctx.lineTo(0, baseY + 80);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - 40, 0, baseY + 80);
        const colors = [[99, 102, 241], [6, 182, 212], [168, 85, 247]];
        const [cr, cg, cb] = colors[i];
        waveGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        waveGrad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.8)`);
        waveGrad.addColorStop(0.6, `rgba(${cr},${cg},${cb},0.5)`);
        waveGrad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = waveGrad;
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

/* ─────────────────────────────────────────────
   SCORE RING
───────────────────────────────────────────── */
function ScoreRing() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated) {
        setAnimated(true);
        let start: number | null = null;
        const dur = 2200;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          setScore(Math.round((1 - Math.pow(1 - p, 3)) * 87));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [animated]);

  return (
    <div ref={ref} style={{ position: 'relative', width: 120, height: 120 }}>
      <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(129,140,248,0.08)" strokeWidth="6" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad2)" strokeWidth="6" strokeLinecap="round" strokeDasharray="314" strokeDashoffset={animated ? 41 : 314} style={{ transition: 'stroke-dashoffset 2.2s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
        <defs>
          <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(230,235,255,0.95)', textShadow: '0 0 30px rgba(129,140,248,0.2)' }}>
        {score}%
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKILL BARS
───────────────────────────────────────────── */
function SkillBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  const skills = [
    { name: 'Machine Learning', pct: 82, color: '#818cf8' },
    { name: 'Cloud Architecture', pct: 64, color: '#c084fc' },
    { name: 'Data Pipeline', pct: 91, color: '#22d3ee' },
    { name: 'System Design', pct: 47, color: '#a855f7' },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated) setAnimated(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [animated]);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {skills.map(({ name, pct, color }) => (
        <div key={name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(200,210,240,0.55)', fontFamily: "'Inter', sans-serif" }}>{name}</span>
            <span style={{ fontSize: 12, color: `${color}bb`, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(129,140,248,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${color},${color}99)`, width: animated ? `${pct}%` : '0%', transition: 'width 2s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */
function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authError, setAuthError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (saved) router.replace('/');
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLoginOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = loginOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loginOpen]);

  const openLogin = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setAuthStatus('idle');
    setAuthError('');
    setUsername('');
    setPassword('');
    setLoginOpen(true);
  };

  const handleAuth = useCallback(async () => {
    const u = username.trim();
    const p = password.trim();
    setAuthError('');
    if (!u) return setAuthError('Please enter a username.');
    if (u.length < 2) return setAuthError('Username must be at least 2 characters.');
    if (!p) return setAuthError('Please enter a password.');
    if (authMode === 'signup' && p.length < 4) return setAuthError('Password must be at least 4 characters.');

    setAuthStatus('loading');
    try {
      const res = await fetch(`${BASE_URL}/api/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || 'Something went wrong. Please try again.');
        setAuthStatus('error');
        return;
      }
      sessionStorage.setItem('ai_advisor_user', JSON.stringify({ name: data.user.name, id: data.user.id }));
      setAuthStatus(data.is_new ? 'success_new' : 'success_returning');
      setTimeout(() => router.replace('/'), 1500);
    } catch {
      setAuthError('Cannot connect to server. Make sure the backend is running on port 8000.');
      setAuthStatus('error');
    }
  }, [username, password, authMode, router]);

  const isLoading = authStatus === 'loading';
  const isSuccess = authStatus === 'success_new' || authStatus === 'success_returning';

  const renderAuthForm = (autoFocus?: boolean) => {
    if (isSuccess) {
      return (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>{authStatus === 'success_new' ? '✨' : '👋'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'rgba(230,235,255,0.95)', fontFamily: "'Playfair Display', serif" }}>
            {authStatus === 'success_new' ? `Welcome, ${username}!` : `Welcome back, ${username}!`}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(160,170,200,0.5)', fontFamily: "'Inter', sans-serif" }}>
            {authStatus === 'success_new' ? 'Setting up your profile…' : 'Restoring your progress…'}
          </div>
        </div>
      );
    }
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,190,220,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Username</label>
          <input className="auth-input" type="text" placeholder="Enter your username" value={username} onChange={e => { setUsername(e.target.value); setAuthError(''); }} autoComplete="username" autoFocus={autoFocus} />
        </div>
        <div style={{ marginBottom: authMode === 'signup' ? 12 : 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,190,220,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input className="auth-input" type={showPw ? 'text' : 'password'} placeholder={authMode === 'signup' ? 'Create a password (min 4 chars)' : 'Enter your password'} value={password} onChange={e => { setPassword(e.target.value); setAuthError(''); }} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} style={{ paddingRight: 42 }} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(180,190,220,0.35)', cursor: 'pointer', fontSize: 14 }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {authMode === 'signup' && (
          <div style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.08)', borderRadius: 12, padding: '11px 16px', fontSize: 12, color: 'rgba(180,190,220,0.45)', lineHeight: 1.65, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
            ✨ Your roadmap, skill gaps, and certifications will be saved to your account.
          </div>
        )}

        {authError && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '11px 16px', fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>
            {authError}
          </div>
        )}

        <button className="auth-submit" onClick={handleAuth} disabled={isLoading || !username.trim() || !password.trim()}>
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(200,210,240,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinSlow 0.7s linear infinite' }} />
              {authMode === 'login' ? 'Signing in…' : 'Creating account…'}
            </span>
          ) : authMode === 'login' ? 'Sign In to PathAI →' : 'Create My Account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(160,170,200,0.35)', marginTop: 18, fontFamily: "'Inter', sans-serif" }}>
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); setAuthStatus('idle'); }} style={{ background: 'none', border: 'none', color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>
            {authMode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=Inter:wght@200;300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          font-family: 'Inter', sans-serif;
          background: #030014;
          color: rgba(240,240,255,0.92);
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030014; }
        ::-webkit-scrollbar-thumb { background: rgba(129,140,248,0.2); border-radius: 3px; }

        .bg-mesh {
          background:
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(6,182,212,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 50% 80%, rgba(168,85,247,0.07) 0%, transparent 50%),
            linear-gradient(180deg, #030014 0%, #0a0520 30%, #05010f 60%, #030014 100%);
        }
        .bg-mesh-2 {
          background:
            radial-gradient(ellipse 60% 50% at 70% 40%, rgba(6,182,212,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 60%, rgba(168,85,247,0.04) 0%, transparent 50%),
            linear-gradient(180deg, #030014 0%, #08031a 50%, #030014 100%);
        }
        .bg-mesh-cta {
          background:
            radial-gradient(ellipse 80% 70% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 30% 50%, rgba(6,182,212,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 70% 50%, rgba(168,85,247,0.08) 0%, transparent 55%),
            linear-gradient(180deg, #030014 0%, #0c0525 50%, #030014 100%);
        }

        /* ── Animations ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px) scale(0.98); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-24px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.96); filter: blur(5px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(1.5deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(12px) rotate(-1.5deg); }
          75% { transform: translateY(4px) rotate(0.5deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes floatElement {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-18px) translateX(6px) rotate(2.5deg); opacity: 1; }
          50% { transform: translateY(-6px) translateX(-4px) rotate(-1.5deg); opacity: 0.75; }
          75% { transform: translateY(-22px) translateX(10px) rotate(1deg); opacity: 0.9; }
          100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.6; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(129,140,248,0.15), 0 0 60px rgba(6,182,212,0.08), inset 0 0 20px rgba(129,140,248,0.03); }
          50% { box-shadow: 0 0 55px rgba(129,140,248,0.28), 0 0 110px rgba(6,182,212,0.15), inset 0 0 30px rgba(129,140,248,0.06); }
        }
        @keyframes gradShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes screenBreathe { 0%, 100% { opacity: 0.95; transform: scale(1); } 50% { opacity: 1; transform: scale(1.015); } }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.8); opacity: 0; } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(140px) rotate(0deg); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        @keyframes shimmer { 0%, 100% { left: -100%; } 50% { left: 150%; } }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes gentleSway {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
        }

        .float-el { position: absolute; animation: floatElement 6s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .float-el:nth-child(2) { animation-delay: -1.2s; animation-duration: 7s; }
        .float-el:nth-child(3) { animation-delay: -2.8s; animation-duration: 8s; }
        .float-el:nth-child(4) { animation-delay: -4s; animation-duration: 6.5s; }
        .float-el:nth-child(5) { animation-delay: -0.7s; animation-duration: 9s; }
        .float-el:nth-child(6) { animation-delay: -5s; animation-duration: 7.5s; }
        .orbit-dot { animation: orbit 16s linear infinite; }
        .orbit-dot:nth-child(2) { animation-delay: -5.5s; animation-duration: 20s; }
        .orbit-dot:nth-child(3) { animation-delay: -10s; animation-duration: 18s; }

        .text-grad-hero {
          background: linear-gradient(135deg, #818cf8, #06b6d4, #c084fc, #818cf8);
          background-size: 300% 300%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 6s ease-in-out infinite;
        }
        .text-grad-static {
          background: linear-gradient(135deg, #818cf8, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-grad-accent {
          background: linear-gradient(135deg, #a5b4fc, #67e8f9);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass {
          background: rgba(15,10,40,0.5);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(129,140,248,0.08);
        }
        .glass-strong {
          background: rgba(15,10,40,0.75);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(129,140,248,0.1);
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(15,10,40,0.6), rgba(20,15,50,0.4));
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(129,140,248,0.06);
        }

        .nav-glass {
          backdrop-filter: blur(24px) saturate(1.4);
          background: rgba(3,0,20,0.6);
          border-bottom: 1px solid rgba(129,140,248,0.05);
          transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-glass.scrolled {
          background: rgba(3,0,20,0.92);
          border-bottom-color: rgba(129,140,248,0.1);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(129,140,248,0.04);
        }
        .nav-link { position: relative; }
        .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 50%; width: 0; height: 2px;
          background: linear-gradient(90deg, #818cf8, #06b6d4);
          border-radius: 1px; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); transform: translateX(-50%);
        }
        .nav-link:hover::after { width: 100%; }

        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; position: relative; flex-shrink: 0; }
        .pulse-dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid rgba(129,140,248,0.4); animation: pulseDot 2s ease-in-out infinite; }

        .reveal {
          opacity: 0; transform: translateY(44px) scale(0.98); filter: blur(3px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal.visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after { content: ''; position: absolute; top: 0; left: -100%; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(129,140,248,0.04), transparent); animation: shimmer 8s ease-in-out infinite; }

        .glass-panel {
          backdrop-filter: blur(24px) saturate(1.4);
          background: linear-gradient(160deg, rgba(10,16,40,0.6) 0%, rgba(14,20,50,0.4) 100%);
          border: 1px solid rgba(129,140,248,0.08);
          border-radius: 24px; position: relative; overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .glass-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 5%, rgba(129,140,248,0.22) 30%, rgba(192,132,252,0.14) 70%, transparent 95%); }

        .dash-glass {
          background: linear-gradient(145deg, rgba(8,14,36,0.65), rgba(12,18,46,0.45));
          border: 1px solid rgba(129,140,248,0.07);
          border-radius: 18px; position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .dash-glass::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(129,140,248,0.14), transparent); }

        .feature-card {
          background: linear-gradient(160deg, rgba(8,14,36,0.5) 0%, rgba(12,18,46,0.3) 100%);
          border: 1px solid rgba(129,140,248,0.06);
          border-radius: 20px; padding: 32px;
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden; cursor: default;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .feature-card::before { content: ''; position: absolute; inset: 0; border-radius: 20px; background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(129,140,248,0.08) 0%, transparent 60%); opacity: 0; transition: opacity 0.6s; pointer-events: none; }
        .feature-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 5%, rgba(129,140,248,0.2) 30%, rgba(192,132,252,0.12) 70%, transparent 95%); opacity: 0; transition: opacity 0.6s; }
        .feature-card:hover { border-color: rgba(129,140,248,0.18); transform: translateY(-8px) scale(1.01); box-shadow: 0 28px 56px rgba(0,0,0,0.4), 0 0 50px rgba(129,140,248,0.06); }
        .feature-card:hover::before, .feature-card:hover::after { opacity: 1; }
        .feature-card:hover .feat-icon { background: rgba(129,140,248,0.12); box-shadow: 0 0 28px rgba(129,140,248,0.2); border-color: rgba(129,140,248,0.25); transform: scale(1.1) rotate(-4deg); }
        .feat-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(129,140,248,0.06); border: 1px solid rgba(129,140,248,0.08); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 20px; transition: all 0.6s cubic-bezier(0.16,1,0.3,1); }

        .process-circle {
          width: 64px; height: 64px; border-radius: 50%;
          border: 1px solid rgba(129,140,248,0.12);
          background: rgba(15,10,40,0.75);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1); position: relative; z-index: 2;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          font-size: 14px; color: rgba(129,140,248,0.7);
        }
        .process-circle::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; border: 1px solid rgba(129,140,248,0.04); }
        .process-node:hover .process-circle { border-color: rgba(129,140,248,0.4); background: rgba(129,140,248,0.08); box-shadow: 0 0 36px rgba(129,140,248,0.15); color: rgba(129,140,248,1); transform: scale(1.08); }

        .cta-btn-filled {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 40px; border-radius: 60px;
          border: 1px solid rgba(129,140,248,0.3);
          color: rgba(230,235,255,0.95); font-weight: 600; font-size: 15px;
          cursor: pointer; transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
          font-family: 'Space Grotesk', sans-serif;
          position: relative; overflow: hidden;
          text-decoration: none; letter-spacing: 0.01em;
          background: linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(6,182,212,0.15) 100%);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(99,102,241,0.2);
        }
        .cta-btn-filled:hover { transform: translateY(-4px) scale(1.02); border-color: rgba(129,140,248,0.55); box-shadow: 0 16px 48px rgba(99,102,241,0.35), 0 0 70px rgba(6,182,212,0.1); background: linear-gradient(135deg, rgba(99,102,241,0.45) 0%, rgba(6,182,212,0.25) 100%); }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 40px; border-radius: 60px;
          border: 1px solid rgba(129,140,248,0.1);
          color: rgba(165,180,252,0.5); font-weight: 500; font-size: 15px;
          cursor: pointer; transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
          font-family: 'Space Grotesk', sans-serif;
          position: relative; text-decoration: none; letter-spacing: 0.01em;
          background: rgba(255,255,255,0.02);
        }
        .cta-btn:hover { transform: translateY(-4px); border-color: rgba(129,140,248,0.3); color: rgba(200,210,240,0.8); box-shadow: 0 10px 30px rgba(0,0,0,0.25); background: rgba(129,140,248,0.04); }

        .auth-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(3,0,20,0.88);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
        }
        .auth-overlay.open { opacity: 1; pointer-events: all; }
        .auth-panel {
          width: 460px; max-width: 94vw; max-height: 94vh; overflow-y: auto;
          background: linear-gradient(160deg, rgba(8,14,36,0.95) 0%, rgba(12,18,46,0.9) 100%);
          border: 1px solid rgba(129,140,248,0.1);
          border-radius: 28px; padding: 48px 40px;
          position: relative;
          transform: translateY(30px) scale(0.95);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .auth-overlay.open .auth-panel { transform: translateY(0) scale(1); }
        .auth-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 5%, rgba(129,140,248,0.28) 30%, rgba(192,132,252,0.18) 70%, transparent 95%); border-radius: 28px 28px 0 0; }

        .auth-input {
          width: 100%; padding: 14px 18px;
          background: rgba(3,0,20,0.75);
          border: 1px solid rgba(129,140,248,0.1);
          border-radius: 14px;
          color: rgba(230,235,255,0.92);
          font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .auth-input::placeholder { color: 'rgba(165,180,252,0.2)'; }
        .auth-input:focus { border-color: rgba(129,140,248,0.35); box-shadow: 0 0 28px rgba(129,140,248,0.1), inset 0 0 20px rgba(129,140,248,0.03); background: rgba(3,0,20,0.88); transform: scale(1.01); }

        .auth-submit {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(6,182,212,0.2));
          border: 1px solid rgba(129,140,248,0.25);
          border-radius: 14px; color: rgba(230,235,255,0.95);
          font-weight: 600; font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.5s cubic-bezier(0.16,1,0.3,1); letter-spacing: 0.02em;
        }
        .auth-submit:hover:not(:disabled) { border-color: rgba(129,140,248,0.5); box-shadow: 0 10px 36px rgba(129,140,248,0.25); background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(6,182,212,0.3)); transform: translateY(-2px); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-tab {
          flex: 1; padding: 11px; border-radius: 12px; border: none;
          background: transparent; font-family: 'Space Grotesk', sans-serif;
          font-size: 14px; font-weight: 600;
          color: rgba(165,180,252,0.4); cursor: pointer; transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-tab.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(6,182,212,0.25));
          color: rgba(230,235,255,0.95);
          box-shadow: 0 4px 16px rgba(99,102,241,0.15);
        }
        .auth-tab:not(.active):hover { color: rgba(200,210,240,0.7); }

        .section-divider { height: 1px; background: linear-gradient(90deg, transparent 5%, rgba(129,140,248,0.06) 30%, rgba(129,140,248,0.09) 50%, rgba(129,140,248,0.06) 70%, transparent 95%); margin: 0 5%; }

        .heading-glow { text-shadow: 0 0 60px rgba(129,140,248,0.1), 0 0 120px rgba(99,102,241,0.05); }
        .heading-glow-strong { text-shadow: 0 0 40px rgba(129,140,248,0.18), 0 0 80px rgba(129,140,248,0.07), 0 2px 4px rgba(0,0,0,0.5); }

        .student-screen-glow { animation: screenBreathe 4s ease-in-out infinite; }

        .grid-overlay {
          background-image:
            linear-gradient(rgba(129,140,248,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129,140,248,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .dot-pattern {
          background-image: radial-gradient(rgba(129,140,248,0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>

      {/* ── AURORA CANVAS ── */}
      <AuroraCanvas />

      {/* ── NAV ── */}
      <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`} style={{ padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 4px 16px rgba(99,102,241,0.15)' }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'rgba(230,235,255,0.95)', letterSpacing: -0.5, fontFamily: "'Space Grotesk', sans-serif" }}>
              Path<span className="text-grad-static">AI</span>
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {['Features', 'System', 'Process'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link"
                style={{ fontSize: 13, fontWeight: 500, color: 'rgba(165,180,252,0.4)', textDecoration: 'none', transition: 'color .35s', letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(220,225,255,0.9)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(165,180,252,0.4)'; }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => openLogin('login')} style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.12)', cursor: 'pointer', padding: '9px 22px', borderRadius: 50, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: 'rgba(165,180,252,0.45)', transition: 'all .4s cubic-bezier(0.16,1,0.3,1)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)'; e.currentTarget.style.color = 'rgba(220,225,255,0.85)'; e.currentTarget.style.background = 'rgba(129,140,248,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.12)'; e.currentTarget.style.color = 'rgba(165,180,252,0.45)'; e.currentTarget.style.background = 'transparent'; }}>
              Sign In
            </button>
            <button onClick={() => openLogin('signup')} style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.18))', border: '1px solid rgba(129,140,248,0.2)', color: 'rgba(230,235,255,0.9)', padding: '9px 22px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all .4s cubic-bezier(0.16,1,0.3,1)', letterSpacing: '0.01em', boxShadow: '0 4px 16px rgba(99,102,241,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.45),rgba(6,182,212,0.28))'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(129,140,248,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.18))'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="bg-mesh" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 72 }}>
        <div className="grid-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 4, height: 4, background: 'rgba(129,140,248,0.3)', borderRadius: '50%', animation: 'floatA 7s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '60%', left: '80%', width: 6, height: 6, background: 'rgba(6,182,212,0.2)', borderRadius: '50%', animation: 'floatB 9s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', right: '10%', width: 4, height: 4, background: 'rgba(192,132,252,0.25)', borderRadius: '50%', animation: 'floatA 11s ease-in-out infinite', animationDelay: '-3s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '8%', width: 3, height: 3, background: 'rgba(236,72,153,0.2)', borderRadius: '50%', animation: 'floatB 8s ease-in-out infinite', animationDelay: '-5s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', right: '30%', width: 5, height: 5, background: 'rgba(34,211,238,0.15)', borderRadius: '50%', animation: 'floatA 13s ease-in-out infinite', animationDelay: '-7s', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 3, padding: '0 5%', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 20px', borderRadius: 50, background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.08)', marginBottom: 32, animation: 'fadeInDown 1s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
                <div className="pulse-dot" />
                <span style={{ fontSize: 11, color: 'rgba(165,180,252,0.7)', fontWeight: 500, letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Precision Career Intelligence</span>
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 700, lineHeight: 1.07, letterSpacing: -1.5, marginBottom: 28, animation: 'fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
                <span style={{ background: 'linear-gradient(135deg,#d0d8f0 0%,#f0f2ff 40%,#e0e4f8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Land your dream job</span><br />
                <span className="text-grad-hero">faster than ever before</span>
              </h1>

              <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(165,180,252,0.35)', maxWidth: 500, lineHeight: 1.8, fontWeight: 300, animation: 'fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.55s both', letterSpacing: '0.01em' }}>
                Upload your resume. Get an AI-crafted roadmap, close skill gaps, ace mock interviews, and walk into your next role with confidence.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 36, animation: 'fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.7s both' }}>
                <button className="cta-btn-filled" onClick={() => openLogin('signup')}>Analyse My Resume →</button>
                <a href="#system" className="cta-btn">See how it works ↓</a>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInRight 1.1s cubic-bezier(0.16,1,0.3,1) 0.25s both' }}>
              <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(129,140,248,0.04)' }} />
              <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(6,182,212,0.025)' }} />
              <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.02)' }} />
              <div className="orbit-dot" style={{ position: 'absolute', top: '50%', left: '50%', width: 10, height: 10, background: 'rgba(129,140,248,0.3)', borderRadius: '50%', boxShadow: '0 0 12px rgba(129,140,248,0.3)' }} />
              <div className="orbit-dot" style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, background: 'rgba(6,182,212,0.2)', borderRadius: '50%', boxShadow: '0 0 10px rgba(6,182,212,0.2)' }} />
              <div className="orbit-dot" style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, background: 'rgba(192,132,252,0.25)', borderRadius: '50%', boxShadow: '0 0 8px rgba(192,132,252,0.25)' }} />

              <div className="float-el" style={{ top: 8, right: 12 }}>
                <div className="glass-card" style={{ borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22c55e', fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(34,197,94,0.75)' }}>ATS Passed</span>
                </div>
              </div>
              <div className="float-el" style={{ bottom: 60, left: -10 }}>
                <div className="glass-card" style={{ borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>✨</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(6,182,212,0.75)' }}>AI Analyzing</span>
                </div>
              </div>
              <div className="float-el" style={{ top: 80, left: -20 }}>
                <div className="glass-card" style={{ borderRadius: 10, padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }} className="text-grad-static">94%</span>
                  <span style={{ fontSize: 9, color: 'rgba(129,140,248,0.4)', marginLeft: 4 }}>match</span>
                </div>
              </div>
              <div className="float-el" style={{ bottom: 20, right: 20 }}>
                <div className="glass-card" style={{ borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>⚡</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(192,132,252,0.75)' }}>3 Skills Added</span>
                </div>
              </div>
              <div className="float-el" style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}>
                <div className="glass-card" style={{ borderRadius: 8, padding: '6px 10px' }}>
                  <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(129,140,248,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>resume_v3.pdf</span>
                </div>
              </div>
              <div className="float-el" style={{ bottom: 120, right: -10 }}>
                <div className="glass-card" style={{ borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', animation: 'subtlePulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(245,158,11,0.6)' }}>Interview Prep</span>
                </div>
              </div>

              <div style={{ animation: 'floatSlow 8s ease-in-out infinite' }}>
                <div style={{ width: 300, height: 380, borderRadius: 24, overflow: 'hidden', animation: 'pulseGlow 5s ease-in-out infinite', position: 'relative' }} className="glass-strong">
                  <StudentIllustration />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(to top,#030014,transparent)', zIndex: 4 }} />

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 5 }}>
          <span style={{ fontSize: 9, color: 'rgba(129,140,248,0.2)', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 300 }}>Scroll</span>
          <div style={{ width: 20, height: 32, border: '1px solid rgba(129,140,248,0.08)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 6 }}>
            <div style={{ width: 3, height: 6, background: 'rgba(129,140,248,0.35)', borderRadius: 2 }} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════ DASHBOARD PREVIEW ═══════════════ */}
      <section id="system" className="bg-mesh-2" style={{ position: 'relative', zIndex: 1, padding: '110px 5%' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(129,140,248,0.5)', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Intelligent Dashboard</div>
            <h2 className="heading-glow" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>See Your Career Intelligence</h2>
            <p style={{ fontSize: 16, color: 'rgba(165,180,252,0.3)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>Real-time analysis rendered as actionable insights, not raw data.</p>
          </div>

          <div className="glass-panel shimmer reveal" style={{ padding: '30px 36px', transitionDelay: '0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['rgba(129,140,248,0.25)', 'rgba(192,132,252,0.18)', 'rgba(129,140,248,0.1)'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(165,180,252,0.2)', marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>PathAI Analysis Engine v3.2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className="pulse-dot" />
                <span style={{ fontSize: 10, color: 'rgba(34,197,129,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>Live</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
              <div className="dash-glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.8, color: 'rgba(165,180,252,0.25)', marginBottom: 22, fontFamily: "'JetBrains Mono', monospace" }}>Resume Match Score</span>
                <ScoreRing />
                <span style={{ fontSize: 12, color: 'rgba(129,140,248,0.5)', marginTop: 16, fontWeight: 300 }}>Senior Data Scientist</span>
              </div>

              <div className="dash-glass" style={{ padding: 26 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.8, color: 'rgba(165,180,252,0.25)', marginBottom: 22, display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>Skill Gap Analysis</span>
                <SkillBars />
              </div>

              <div className="dash-glass" style={{ padding: 26 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.8, color: 'rgba(165,180,252,0.25)', marginBottom: 22, display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>AI Recommendations</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    { icon: '⚡', text: 'Complete AWS Solutions Architect cert to close cloud gap', priority: 'High', rgb: '129,140,248' },
                    { icon: '🗺️', text: 'Add 2 system design projects to portfolio', priority: 'Medium', rgb: '192,132,252' },
                    { icon: '🎤', text: 'Practice behavioral interviews for L5+ roles', priority: 'High', rgb: '129,140,248' },
                  ].map(({ icon, text, priority, rgb }, i) => (
                    <div key={i} style={{ padding: '11px 14px', borderRadius: 12, background: `rgba(${rgb},0.04)`, border: `1px solid rgba(${rgb},0.07)`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      <div>
                        <p style={{ fontSize: 12, color: 'rgba(200,210,240,0.6)', lineHeight: 1.6, fontWeight: 300 }}>{text}</p>
                        <span style={{ fontSize: 9, color: 'rgba(165,180,252,0.3)', marginTop: 4, display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>Priority: {priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="bg-mesh" style={{ position: 'relative', zIndex: 1, padding: '110px 5%' }}>
        <div className="dot-pattern" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(129,140,248,0.5)', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Capabilities</div>
            <h2 className="heading-glow" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>Your Complete Career Toolkit</h2>
            <p style={{ fontSize: 16, color: 'rgba(165,180,252,0.3)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>Every module precision-engineered to maximise your chances of landing the role you want.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card reveal" style={{ transitionDelay: `${i * 0.06}s` }}
                onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); }}>
                <div className="feat-icon">{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'rgba(230,235,255,0.9)', letterSpacing: '-0.01em', fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(165,180,252,0.3)', lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════ PROCESS ═══════════════ */}
      <section id="process" className="bg-mesh-2" style={{ position: 'relative', zIndex: 1, padding: '110px 5%' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 76 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(129,140,248,0.5)', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>System Pipeline</div>
            <h2 className="heading-glow" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 700, letterSpacing: -1, marginBottom: 16 }}>From Resume to Offer in 4 Steps</h2>
            <p style={{ fontSize: 16, color: 'rgba(165,180,252,0.3)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>A structured intelligence pipeline that transforms your raw profile into a winning career strategy.</p>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 32, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.1),transparent)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, position: 'relative', zIndex: 1 }}>
              {STEPS.map((s, i) => (
                <div key={i} className="reveal process-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, transitionDelay: `${i * 0.12}s` }}>
                  <div className="process-circle">{s.num}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(230,235,255,0.85)', marginBottom: 8, letterSpacing: '-0.01em', fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(165,180,252,0.3)', lineHeight: 1.75, fontWeight: 300 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════ AUTH CTA SECTION ═══════════════ */}
      <section className="bg-mesh-cta" style={{ position: 'relative', zIndex: 1, padding: '110px 5%' }}>
        <div className="grid-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.2 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div className="glass-panel shimmer reveal" style={{ padding: '64px 68px', display: 'flex', gap: 68, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(129,140,248,0.5)', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Get Started Today</div>
              <h2 className="heading-glow" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px,3.5vw,40px)', fontWeight: 700, letterSpacing: -0.5, marginBottom: 18 }}>Your career transformation starts here</h2>
              <p style={{ fontSize: 15, color: 'rgba(165,180,252,0.3)', lineHeight: 1.8, marginBottom: 36, fontWeight: 300 }}>Join 50,000+ students and professionals who used PathAI to land roles they love. No email. No credit card.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Full resume analysis — free forever', 'Personalised roadmap on sign-up', '3 mock interview sessions included', 'No email required — just a username'].map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(165,180,252,0.4)', fontWeight: 300 }}>
                    <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span> {p}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 300, maxWidth: 400, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(129,140,248,0.07)', borderRadius: 22, padding: 34, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.07)', borderRadius: 14, padding: 4, marginBottom: 26 }}>
                {(['login', 'signup'] as AuthMode[]).map(m => (
                  <button key={m} className={`auth-tab ${authMode === m ? 'active' : ''}`} onClick={() => { setAuthMode(m); setAuthError(''); setAuthStatus('idle'); }}>
                    {m === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
              {renderAuthForm(false)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="bg-mesh-2" style={{ position: 'relative', zIndex: 1, padding: '90px 5% 130px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'rgba(99,102,241,0.04)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div className="reveal" style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <h2 className="heading-glow-strong" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px,5vw,58px)', fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, marginBottom: 24 }}>
            Your career deserves{' '}
            <span className="text-grad-hero">precision intelligence</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(165,180,252,0.3)', marginBottom: 42, lineHeight: 1.75, fontWeight: 300 }}>Stop guessing. Start knowing. Let AI map your optimal path forward.</p>
          <button className="cta-btn-filled" onClick={() => openLogin('signup')} style={{ margin: '0 auto', fontSize: 16, padding: '17px 46px' }}>
            Launch PathAI — It&rsquo;s Free →
          </button>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(129,140,248,0.05)', padding: '44px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚡</div>
          <span style={{ fontSize: 12, color: 'rgba(165,180,252,0.2)', fontWeight: 300 }}>© 2025 PathAI · Built for learners and job seekers everywhere</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(165,180,252,0.2)', textDecoration: 'none', transition: 'color .3s', fontWeight: 300 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(200,210,240,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(165,180,252,0.2)'; }}>{l}</a>
          ))}
        </div>
      </footer>

      {/* ═══════════════ AUTH MODAL ═══════════════ */}
      <div className={`auth-overlay ${loginOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setLoginOpen(false); }}>
        <div className="auth-panel">
          <button onClick={() => setLoginOpen(false)} style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(129,140,248,0.07)', color: 'rgba(165,180,252,0.4)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .35s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>✕</button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(129,140,248,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 19, color: 'rgba(230,235,255,0.95)', fontFamily: "'Space Grotesk', sans-serif" }}>Path<span className="text-grad-static">AI</span></span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h3 style={{ fontSize: 23, fontWeight: 700, marginBottom: 8, color: 'rgba(230,235,255,0.95)', fontFamily: "'Playfair Display', serif" }}>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
            <p style={{ fontSize: 14, color: 'rgba(165,180,252,0.35)', fontWeight: 300 }}>{authMode === 'login' ? 'Sign in to your career intelligence dashboard' : 'Start your career transformation today'}</p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.07)', borderRadius: 14, padding: 4, marginBottom: 26 }}>
            {(['login', 'signup'] as AuthMode[]).map(m => (
              <button key={m} className={`auth-tab ${authMode === m ? 'active' : ''}`} onClick={() => { setAuthMode(m); setAuthError(''); setAuthStatus('idle'); }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {renderAuthForm(true)}

          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(165,180,252,0.15)', marginTop: 20, fontWeight: 300 }}>
            Passwords are hashed and stored securely · No email required
          </p>
        </div>
      </div>

      <ScrollReveal />
    </>
  );
}
