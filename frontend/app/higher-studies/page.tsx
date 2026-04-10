'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Mic, FileText, Target, Briefcase,
  GraduationCap, LogOut, UserCircle, Zap, ArrowUpRight,
  CheckCircle, Loader2, Sparkles, TrendingUp, ExternalLink,
  Award, BarChart3, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = 'http://localhost:8000';

// ─── College databases ────────────────────────────────────────────────────────
const GATE_COLLEGES = [
  { name: 'IIT Bombay',      program: 'M.Tech AI/ML',           minScore: 750, fees: '₹2,20,000/yr', placement: '98%', location: 'Mumbai',     category: 'Dream',  applyLink: 'https://www.iitb.ac.in/admissions' },
  { name: 'IIT Delhi',       program: 'M.Tech Data Science',     minScore: 730, fees: '₹2,10,000/yr', placement: '96%', location: 'Delhi',      category: 'Dream',  applyLink: 'https://www.iitd.ac.in/admissions' },
  { name: 'IIT Madras',      program: 'M.Tech CS',               minScore: 720, fees: '₹2,00,000/yr', placement: '95%', location: 'Chennai',    category: 'Dream',  applyLink: 'https://www.iitm.ac.in/admissions' },
  { name: 'IIT Kharagpur',   program: 'M.Tech Software Eng',     minScore: 700, fees: '₹1,95,000/yr', placement: '93%', location: 'Kharagpur', category: 'Dream',  applyLink: 'https://www.iitkgp.ac.in/admissions' },
  { name: 'IIT Kanpur',      program: 'M.Tech CS',               minScore: 690, fees: '₹1,90,000/yr', placement: '93%', location: 'Kanpur',    category: 'Dream',  applyLink: 'https://www.iitk.ac.in/admissions' },
  { name: 'IIT Roorkee',     program: 'M.Tech AI',               minScore: 680, fees: '₹1,85,000/yr', placement: '91%', location: 'Roorkee',   category: 'Dream',  applyLink: 'https://www.iitr.ac.in/admissions' },
  { name: 'IIIT Hyderabad',  program: 'M.Tech AI',               minScore: 650, fees: '₹1,60,000/yr', placement: '92%', location: 'Hyderabad', category: 'Target', applyLink: 'https://www.iiith.ac.in/admissions' },
  { name: 'NIT Trichy',      program: 'M.Tech Computer Science', minScore: 640, fees: '₹1,50,000/yr', placement: '90%', location: 'Trichy',    category: 'Target', applyLink: 'https://www.nitt.edu/admissions' },
  { name: 'NIT Surathkal',   program: 'M.Tech Data Science',     minScore: 620, fees: '₹1,45,000/yr', placement: '88%', location: 'Surathkal', category: 'Target', applyLink: 'https://www.nitk.ac.in/admissions' },
  { name: 'NIT Warangal',    program: 'M.Tech Software',         minScore: 600, fees: '₹1,40,000/yr', placement: '85%', location: 'Warangal',  category: 'Target', applyLink: 'https://www.nitw.ac.in/admissions' },
  { name: 'IIIT Delhi',      program: 'M.Tech Data Science',     minScore: 580, fees: '₹1,55,000/yr', placement: '88%', location: 'Delhi',     category: 'Target', applyLink: 'https://www.iiitd.ac.in/admissions' },
  { name: 'NIT Calicut',     program: 'M.Tech CS',               minScore: 560, fees: '₹1,35,000/yr', placement: '83%', location: 'Calicut',   category: 'Target', applyLink: 'https://www.nitc.ac.in/admissions' },
  { name: 'NIT Rourkela',    program: 'M.Tech CS',               minScore: 530, fees: '₹1,30,000/yr', placement: '81%', location: 'Rourkela',  category: 'Target', applyLink: 'https://www.nitrkl.ac.in/admissions' },
  { name: 'VIT Vellore',     program: 'M.Tech AI',               minScore: 450, fees: '₹3,50,000/yr', placement: '85%', location: 'Vellore',   category: 'Safe',   applyLink: 'https://www.vit.ac.in/admissions' },
  { name: 'RVCE Bangalore',  program: 'M.Tech CS',               minScore: 350, fees: '₹1,70,000/yr', placement: '82%', location: 'Bangalore', category: 'Safe',   applyLink: 'https://www.rvce.edu.in/admissions' },
  { name: 'BMSCE Bangalore', program: 'M.Tech Data Science',     minScore: 320, fees: '₹1,60,000/yr', placement: '80%', location: 'Bangalore', category: 'Safe',   applyLink: 'https://www.bmsce.in/admissions' },
  { name: 'PES University',  program: 'M.Tech CS',               minScore: 300, fees: '₹2,50,000/yr', placement: '78%', location: 'Bangalore', category: 'Safe',   applyLink: 'https://www.pes.edu/admissions' },
  { name: 'SRM University',  program: 'M.Tech AI/ML',            minScore: 250, fees: '₹2,80,000/yr', placement: '76%', location: 'Chennai',   category: 'Safe',   applyLink: 'https://www.srmist.edu.in/admissions' },
];

const GRE_COLLEGES = [
  { name: 'MIT',                    program: 'MS Computer Science', minScore: 330, fees: '$55,000/yr', placement: '99%', location: 'Massachusetts', category: 'Dream',  applyLink: 'https://gradadmissions.mit.edu/' },
  { name: 'Stanford',               program: 'MS CS / AI',          minScore: 325, fees: '$48,000/yr', placement: '98%', location: 'California',    category: 'Dream',  applyLink: 'https://gradadmissions.stanford.edu/' },
  { name: 'Carnegie Mellon',        program: 'MS Machine Learning', minScore: 320, fees: '$45,000/yr', placement: '97%', location: 'Pennsylvania',  category: 'Dream',  applyLink: 'https://cmu.edu/graduate-admissions' },
  { name: 'UC Berkeley',            program: 'MS EECS',             minScore: 318, fees: '$30,000/yr', placement: '96%', location: 'California',    category: 'Dream',  applyLink: 'https://grad.berkeley.edu/' },
  { name: 'University of Washington', program: 'MS CS',             minScore: 310, fees: '$32,000/yr', placement: '94%', location: 'Washington',    category: 'Target', applyLink: 'https://grad.uw.edu/' },
  { name: 'UT Austin',              program: 'MS Computer Science', minScore: 305, fees: '$30,000/yr', placement: '92%', location: 'Texas',         category: 'Target', applyLink: 'https://gradschool.utexas.edu/' },
  { name: 'Georgia Tech',           program: 'MS CS (OMSCS)',       minScore: 300, fees: '$7,000/yr',  placement: '91%', location: 'Georgia',       category: 'Target', applyLink: 'https://grad.gatech.edu/' },
  { name: 'UC San Diego',           program: 'MS Data Science',     minScore: 295, fees: '$32,000/yr', placement: '90%', location: 'California',    category: 'Target', applyLink: 'https://gradadmissions.ucsd.edu/' },
  { name: 'Purdue University',      program: 'MS CS',               minScore: 285, fees: '$28,000/yr', placement: '87%', location: 'Indiana',       category: 'Target', applyLink: 'https://www.purdue.edu/gradschool/' },
  { name: 'University of Illinois', program: 'MS CS (MCS)',         minScore: 280, fees: '$22,000/yr', placement: '88%', location: 'Illinois',      category: 'Target', applyLink: 'https://cs.illinois.edu/academics/graduate' },
  { name: 'Arizona State',          program: 'MS CS',               minScore: 268, fees: '$25,000/yr', placement: '85%', location: 'Arizona',       category: 'Safe',   applyLink: 'https://graduate.asu.edu/' },
  { name: 'Northeastern',           program: 'MS CS',               minScore: 260, fees: '$30,000/yr', placement: '84%', location: 'Massachusetts', category: 'Safe',   applyLink: 'https://www.northeastern.edu/graduate/' },
  { name: 'USC',                    program: 'MS Applied CS',       minScore: 255, fees: '$35,000/yr', placement: '83%', location: 'California',    category: 'Safe',   applyLink: 'https://gradadmissions.usc.edu/' },
  { name: 'Syracuse University',    program: 'MS CS',               minScore: 245, fees: '$26,000/yr', placement: '79%', location: 'New York',      category: 'Safe',   applyLink: 'https://graduate.syr.edu/' },
];

const CAT_COLLEGES = [
  { name: 'IIM Ahmedabad', program: 'MBA',   minScore: 99, fees: '₹23,00,000/yr', placement: '100%', location: 'Ahmedabad', category: 'Dream',  applyLink: 'https://www.iima.ac.in/admissions' },
  { name: 'IIM Bangalore', program: 'MBA',   minScore: 98, fees: '₹22,00,000/yr', placement: '100%', location: 'Bangalore', category: 'Dream',  applyLink: 'https://www.iimb.ac.in/admissions' },
  { name: 'IIM Calcutta',  program: 'MBA',   minScore: 97, fees: '₹21,00,000/yr', placement: '99%',  location: 'Kolkata',   category: 'Dream',  applyLink: 'https://www.iimcal.ac.in/admissions' },
  { name: 'IIM Lucknow',   program: 'MBA',   minScore: 95, fees: '₹15,00,000/yr', placement: '98%',  location: 'Lucknow',   category: 'Dream',  applyLink: 'https://www.iiml.ac.in/admissions' },
  { name: 'IIM Kozhikode', program: 'MBA',   minScore: 93, fees: '₹14,00,000/yr', placement: '96%',  location: 'Kozhikode', category: 'Target', applyLink: 'https://www.iimk.ac.in/admissions' },
  { name: 'IIM Indore',    program: 'MBA',   minScore: 92, fees: '₹14,00,000/yr', placement: '95%',  location: 'Indore',    category: 'Target', applyLink: 'https://www.iimidr.ac.in/admissions' },
  { name: 'MDI Gurgaon',   program: 'PGPM',  minScore: 88, fees: '₹18,00,000/yr', placement: '92%',  location: 'Gurgaon',   category: 'Target', applyLink: 'https://www.mdi.ac.in/admissions' },
  { name: 'IIFT Delhi',    program: 'MBA (IB)', minScore: 85, fees: '₹16,00,000/yr', placement: '90%', location: 'Delhi',  category: 'Target', applyLink: 'https://www.iift.ac.in/admissions' },
  { name: 'SP Jain Mumbai',program: 'PGDM',  minScore: 80, fees: '₹17,00,000/yr', placement: '89%',  location: 'Mumbai',    category: 'Target', applyLink: 'https://www.spjimr.org/admissions' },
  { name: 'NMIMS Mumbai',  program: 'MBA',   minScore: 75, fees: '₹14,00,000/yr', placement: '86%',  location: 'Mumbai',    category: 'Safe',   applyLink: 'https://www.nmims.edu/admissions' },
  { name: 'IMT Ghaziabad', program: 'PGDM',  minScore: 70, fees: '₹12,00,000/yr', placement: '83%',  location: 'Ghaziabad', category: 'Safe',   applyLink: 'https://www.imt.edu/admissions' },
  { name: 'FORE Delhi',    program: 'PGDM',  minScore: 65, fees: '₹11,00,000/yr', placement: '80%',  location: 'Delhi',     category: 'Safe',   applyLink: 'https://www.fsm.ac.in/admissions' },
];

function getRecommendations(exam: 'gate' | 'gre' | 'cat', score: number) {
  const db = exam === 'gate' ? GATE_COLLEGES : exam === 'gre' ? GRE_COLLEGES : CAT_COLLEGES;
  const eligible = db.filter(c => score >= c.minScore);
  const stretch  = db.filter(c => score < c.minScore && score >= c.minScore * 0.90);
  const combined = [...stretch, ...eligible];
  const seen = new Set<string>();
  const unique = combined.filter(c => { if (seen.has(c.name)) return false; seen.add(c.name); return true; });
  const order: Record<string, number> = { Dream: 0, Target: 1, Safe: 2 };
  unique.sort((a, b) => order[a.category] !== order[b.category] ? order[a.category] - order[b.category] : b.minScore - a.minScore);
  return unique.slice(0, 12);
}

const catStyle: Record<string, string> = {
  Dream:  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  Target: 'bg-blue-500/15   text-blue-300   border-blue-500/20',
  Safe:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
};

// ─── Sidebar item (copied exactly from dashboard) ────────────────────────────
function SidebarItem({ icon, label, href = '#', active = false }: any) {
  return (
    <Link href={href}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[12.5px] font-semibold transition-all duration-200
        ${active
          ? 'bg-white/10 text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>
      <span className={`transition-colors ${active ? 'text-indigo-400' : 'text-slate-600'}`}>{icon}</span>
      {label}
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
    </Link>
  );
}

export default function HigherStudiesPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<{ name: string; id: string } | null>(null);

  // Resume analysis state
  const [resumeFile, setResumeFile]     = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [studyRec, setStudyRec]         = useState<any>(null);
  const [resumeError, setResumeError]   = useState('');

  // Exam scores state
  const [examScores, setExamScores]     = useState({ gate: '', gre: '', cat: '' });
  const [isRecommending, setIsRecommending] = useState(false);
  const [colleges, setColleges]         = useState<any[]>([]);

  // Comparison + probability
  const [showComparison, setShowComparison]   = useState(false);
  const [probabilityData, setProbabilityData] = useState<any>(null);

  const candidateName = sessionUser?.name || null;
  const userId        = sessionUser?.id   || null;

  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (!saved) { router.replace('/login'); return; }
    try { setSessionUser(JSON.parse(saved)); }
    catch { router.replace('/login'); }
  }, [router]);

  // ── Resume → /api/upload-resume ──────────────────────────────────────────
  const handleResumeAnalysis = async () => {
    if (!resumeFile) return;
    setIsAnalyzing(true);
    setResumeError('');
    setStudyRec(null);
    try {
      const fd = new FormData();
      fd.append('file', resumeFile);
      fd.append('session_id', 'higher_studies_session');
      const res  = await fetch(`${BASE_URL}/api/upload-resume`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message || 'Upload failed');

      const skills: string[] = data.tags || [];
      const hasAI   = skills.some(s => /ai|ml|machine learning|deep learning|nlp/i.test(s));
      const hasData = skills.some(s => /data|sql|pandas|spark|analytics/i.test(s));

      let recommendedDegree = 'M.Tech / MS in Computer Science';
      let reason = 'Your technical profile is well-suited for a postgraduate CS program.';
      if (hasAI) {
        recommendedDegree = 'M.Tech / MS in Artificial Intelligence or Machine Learning';
        reason = `Strong AI/ML signals detected (${skills.slice(0, 3).join(', ')}). Top AI programs at IITs, IIITs, CMU, and Stanford align perfectly.`;
      } else if (hasData) {
        recommendedDegree = 'M.Tech / MS in Data Science or Analytics';
        reason = `Data skills detected (${skills.slice(0, 3).join(', ')}). Consider IIT Madras, NIT Trichy, or Georgia Tech OMSCS.`;
      }

      setStudyRec({
        candidateName: data.name,
        recommendedDegree,
        reason,
        skills,
        alternatives: [
          'MBA in Technology Management (leadership track)',
          'Online MS programs — Georgia Tech OMSCS, UIUC MCS',
          'Research-focused Ph.D. for academic careers',
        ],
      });
    } catch (err: any) {
      setResumeError(err.message || 'Failed to analyse. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Score → local filtering ───────────────────────────────────────────────
  const handleExamRecommendation = () => {
    setIsRecommending(true);
    setShowComparison(false);
    setProbabilityData(null);
    setTimeout(() => {
      let results: any[] = [];
      if (examScores.gate)     results = getRecommendations('gate', Number(examScores.gate));
      else if (examScores.gre) results = getRecommendations('gre',  Number(examScores.gre));
      else if (examScores.cat) results = getRecommendations('cat',  Number(examScores.cat));
      setColleges(results);
      setIsRecommending(false);
    }, 800);
  };

  // ── Admit probability ─────────────────────────────────────────────────────
  const calculateProbability = async () => {
    const scoreVal = Number(examScores.gate || examScores.gre || examScores.cat || 0);
    const hasScore = scoreVal > 0;
    const hasResume = !!studyRec;
    let verifiedSkills: string[] = [];
    let gaps: string[] = [];

    if (userId) {
      try {
        const res  = await fetch(`${BASE_URL}/api/hindsight?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        const mems: string[] = data.memories || [];
        verifiedSkills = mems.filter(m => m.includes('VERIFIED_MASTERY')).map(m => m.replace('VERIFIED_MASTERY: ', ''));
        gaps           = mems.filter(m => m.includes('Gap Identified')).map(m => m.replace('Gap Identified: ', ''));
      } catch (_) {}
    }

    let p = 0;
    if (hasResume) p += 30;
    if (hasScore)  p += 55;
    if (hasResume && hasScore) p += 10;
    if (verifiedSkills.length > 0) p += Math.min(verifiedSkills.length * 5, 15);
    if (hasScore) {
      const examType = examScores.gate ? 'gate' : examScores.gre ? 'gre' : 'cat';
      const maxScore = examType === 'gate' ? 1000 : examType === 'gre' ? 340 : 100;
      p = Math.round(p * (0.5 + 0.5 * Math.min(scoreVal / maxScore, 1)));
    }
    const clampedP = Math.min(95, Math.max(10, p));

    setProbabilityData({
      probability: `${clampedP}%`,
      level: clampedP >= 70 ? 'High' : clampedP >= 45 ? 'Medium' : 'Low',
      color: clampedP >= 70 ? 'emerald' : clampedP >= 45 ? 'amber' : 'red',
      strengths: [
        hasScore  ? `Score of ${scoreVal} is competitive for your target colleges` : 'Academic profile uploaded',
        hasResume ? `Resume parsed — ${studyRec?.skills?.length || 0} skills identified` : 'Exam score provided',
        colleges.length > 0 ? `${colleges.length} colleges match your profile` : 'Profile evaluated',
        ...(verifiedSkills.length > 0 ? [`AI-verified: ${verifiedSkills.join(', ')}`] : []),
      ],
      weaknesses: [
        ...(gaps.length > 0 ? [`Skill gaps to address: ${gaps.slice(0, 3).join(', ')}`] : ['Research publications strengthen your application']),
        'Add quantified project outcomes to your resume',
        ...(verifiedSkills.length === 0 ? ['Complete skill certification exams to boost profile'] : []),
      ],
    });
  };

  const dreamCount  = colleges.filter(c => c.category === 'Dream').length;
  const targetCount = colleges.filter(c => c.category === 'Target').length;
  const safeCount   = colleges.filter(c => c.category === 'Safe').length;

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-gray-900 font-sans">

      {/* ═══════ DARK NAVY SIDEBAR (exact copy from dashboard) ═══════ */}
      <aside className="w-[280px] bg-[#0B1628] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-7 pt-8 pb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold text-white tracking-tight leading-none">AI Advisor</h1>
              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.2em] mt-0.5">Version 2.4 Live</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3">Main Menu</p>
          <SidebarItem href="/"                    icon={<LayoutDashboard />} label="Dashboard"           />
          <SidebarItem href="/mock-interview"      icon={<Mic />}            label="Mock Interview"      />
          <SidebarItem href="/resume-evolution"    icon={<FileText />}       label="Resume Evolution"    />
          <SidebarItem href="/skill-gap-analysis"  icon={<Target />}         label="Skill Gap Analysis"  />
          <SidebarItem href="/job-recommendations" icon={<Briefcase />}      label="Job Recommendations" />

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3 mt-8">Tools</p>
          <SidebarItem href="/self_intro"          icon={<UserCircle />}     label="Self Introduction"   />
          <SidebarItem href="/higher-studies"      icon={<GraduationCap />}  label="Higher Studies"      active />
        </nav>

        {/* User + Sign Out */}
        <div className="px-4 pb-6 space-y-2">
          {candidateName && (
            <div className="mx-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-extrabold">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">{candidateName}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Career Mode</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => { sessionStorage.removeItem('ai_advisor_user'); router.replace('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 overflow-y-auto">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0B1628] tracking-tight">Higher Studies Advisor</h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Personalised guidance for your postgraduate journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-slate-500">Today</p>
              <p className="text-[13px] font-extrabold text-[#0B1628]">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="w-px h-10 bg-gray-200 mx-1 hidden sm:block" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-extrabold shadow-md shadow-indigo-200">
              {candidateName ? candidateName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        <div className="px-10 py-8 space-y-8">

          {/* ── TOP GRID: Resume Analysis + Exam Scores ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Resume Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#0B1628]">Resume Analysis</h3>
                  <p className="text-[10px] text-slate-400 font-medium">AI-powered degree path recommendation</p>
                </div>
              </div>
              <div className="p-7">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Resume (PDF)</label>
                <input type="file" accept=".pdf"
                  onChange={e => { setResumeFile(e.target.files?.[0] || null); setResumeError(''); }}
                  className="block w-full text-[11px] text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-bold file:text-[11px] file:cursor-pointer file:hover:bg-indigo-100 file:transition-colors cursor-pointer mb-4 border border-gray-200 rounded-xl p-2"
                />

                {resumeError && (
                  <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {resumeError}
                  </div>
                )}

                <button onClick={handleResumeAnalysis} disabled={!resumeFile || isAnalyzing}
                  className="w-full bg-[#0B1628] text-white py-3 px-6 rounded-xl font-extrabold text-[12px] hover:bg-[#132042] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                  {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {isAnalyzing ? 'Analysing with AI...' : 'Analyse for Higher Studies'}
                </button>

                <AnimatePresence>
                  {studyRec && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-5 p-5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                      {studyRec.candidateName && (
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{studyRec.candidateName}</p>
                      )}
                      <p className="text-[13px] font-extrabold text-[#0B1628] mb-1">{studyRec.recommendedDegree}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">{studyRec.reason}</p>

                      {studyRec.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {studyRec.skills.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-bold uppercase tracking-wide border border-indigo-200">{s}</span>
                          ))}
                        </div>
                      )}

                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alternatives</p>
                      <ul className="space-y-1">
                        {studyRec.alternatives.map((alt: string, i: number) => (
                          <li key={i} className="text-[11px] text-slate-600 font-medium flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-indigo-400 shrink-0" />{alt}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Exam Scores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#0B1628]">Exam Scores</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Enter one score to get college matches</p>
                </div>
              </div>
              <div className="p-7 space-y-4">
                {[
                  { label: 'GATE Score', key: 'gate', placeholder: 'e.g. 650  (0 – 1000)',    hint: 'For IITs & NITs' },
                  { label: 'GRE Score',  key: 'gre',  placeholder: 'e.g. 310  (130 – 340)',   hint: 'For US universities' },
                  { label: 'CAT Percentile', key: 'cat', placeholder: 'e.g. 92  (0 – 100)', hint: 'For IIMs & B-schools' },
                ].map(({ label, key, placeholder, hint }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
                      <span className="text-[9px] text-slate-400 font-medium">{hint}</span>
                    </div>
                    <input type="number" value={(examScores as any)[key]}
                      onChange={e => setExamScores(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[12px] text-[#0B1628] font-semibold focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                ))}

                <button onClick={handleExamRecommendation}
                  disabled={isRecommending || (!examScores.gate && !examScores.gre && !examScores.cat)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-extrabold text-[12px] hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                  {isRecommending ? <Loader2 className="animate-spin w-4 h-4" /> : <Target className="w-4 h-4" />}
                  {isRecommending ? 'Finding Colleges...' : 'Get College Recommendations'}
                </button>
              </div>
            </div>
          </div>

          {/* ── College Recommendations ── */}
          <AnimatePresence>
            {colleges.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-extrabold text-[#0B1628] tracking-tight">{colleges.length} Colleges Match Your Score</h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Sorted by category — Dream, Target, Safe</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {dreamCount  > 0 && <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">{dreamCount} Dream</span>}
                    {targetCount > 0 && <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100   text-blue-700   border border-blue-200">{targetCount} Target</span>}
                    {safeCount   > 0 && <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{safeCount} Safe</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {colleges.map((college, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all flex flex-col gap-2 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-[#0B1628] text-[13px] leading-tight">{college.name}</h4>
                        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black border ${catStyle[college.category]}`}>
                          {college.category}
                        </span>
                      </div>
                      <p className="text-indigo-600 text-[11px] font-bold">{college.program}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium mt-1">
                        <span>📍 {college.location}</span>
                        <span>💰 {college.fees}</span>
                        <span>🎓 {college.placement} placement</span>
                        <span>🏆 Min: {college.minScore}</span>
                      </div>
                      <a href={college.applyLink} target="_blank" rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl py-2 transition-all">
                        Apply Now <ExternalLink className="w-3 h-3" />
                      </a>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button onClick={() => setShowComparison(v => !v)}
                    className="flex items-center gap-2 bg-[#0B1628] text-white py-3 px-8 rounded-xl font-extrabold text-[12px] hover:bg-[#132042] transition-all shadow-md">
                    <BarChart3 className="w-4 h-4" />
                    {showComparison ? 'Hide Comparison Table' : 'Compare These Colleges'}
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Comparison Table ── */}
          <AnimatePresence>
            {showComparison && colleges.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-[#0B1628]">College Comparison</h3>
                </div>
                <div className="overflow-x-auto p-1">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50">
                        {['College', 'Program', 'Category', 'Min Score', 'Fees', 'Placement', 'Location', 'Apply'].map(h => (
                          <th key={h} className="border border-gray-100 px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-[9px] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colleges.map((c, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/40 transition-colors`}>
                          <td className="border border-gray-100 px-4 py-3 font-bold text-[#0B1628] whitespace-nowrap">{c.name}</td>
                          <td className="border border-gray-100 px-4 py-3 text-slate-600">{c.program}</td>
                          <td className="border border-gray-100 px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${catStyle[c.category]}`}>{c.category}</span>
                          </td>
                          <td className="border border-gray-100 px-4 py-3 font-mono text-slate-700">{c.minScore}</td>
                          <td className="border border-gray-100 px-4 py-3 text-slate-600 whitespace-nowrap">{c.fees}</td>
                          <td className="border border-gray-100 px-4 py-3 font-bold text-emerald-600">{c.placement}</td>
                          <td className="border border-gray-100 px-4 py-3 text-slate-600 whitespace-nowrap">{c.location}</td>
                          <td className="border border-gray-100 px-4 py-3">
                            <a href={c.applyLink} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                              Apply <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Admit Probability ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-[#0B1628]">Admit Probability Score</h3>
                <p className="text-[10px] text-slate-400 font-medium">Based on your resume, score, and verified skills</p>
              </div>
            </div>
            <div className="p-7">
              <button onClick={calculateProbability}
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 px-8 py-3 rounded-xl font-extrabold text-[12px] hover:shadow-lg hover:shadow-amber-200 transition-all flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Calculate My Probability
              </button>

              <AnimatePresence>
                {probabilityData && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-6 p-6 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="text-center mb-6">
                      <div className="text-[52px] font-extrabold text-[#0B1628] leading-none mb-1">{probabilityData.probability}</div>
                      <div className="text-[13px] font-bold text-slate-500">{probabilityData.level} Probability of Admission</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                          <CheckCircle className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul className="space-y-2">
                          {probabilityData.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-600 font-medium flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-3">Areas to Improve</p>
                        <ul className="space-y-2">
                          {probabilityData.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-[11px] text-slate-600 font-medium flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}