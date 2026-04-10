'use client';

import React, { useEffect, useState } from 'react';
import {
  Target, AlertTriangle, BookOpen,
  Database, Layout, Server, Loader2, BrainCircuit,
  CheckCircle2, Mic, TrendingUp, LayoutDashboard,
  FileText, Briefcase, LogOut, Zap, UserCircle,
  GraduationCap, ArrowUpRight, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategory(skill: string) {
  const s = skill.toLowerCase();
  if (s.includes('database') || s.includes('mongo') || s.includes('sql') || s.includes('backend') || s.includes('api') || s.includes('node'))
    return { label: 'Backend', icon: <Database className="w-5 h-5" /> };
  if (s.includes('react') || s.includes('ui') || s.includes('css') || s.includes('html') || s.includes('dom') || s.includes('frontend') || s.includes('front-end'))
    return { label: 'Frontend', icon: <Layout className="w-5 h-5" /> };
  return { label: 'Technical', icon: <Server className="w-5 h-5" /> };
}

function getCriticality(index: number, total: number) {
  if (index === 0)                   return 'High';
  if (index < Math.ceil(total / 2)) return 'Medium';
  return 'Low';
}

const CRITICALITY_STYLE: Record<string, string> = {
  High:   'bg-red-500/15 text-red-400 border-red-500/20',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Low:    'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const CRITICALITY_CARD: Record<string, string> = {
  High:   'border-l-red-500',
  Medium: 'border-l-amber-500',
  Low:    'border-l-slate-400',
};

// ── Sidebar Item ──────────────────────────────────────────────────────────────
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

// ── Stat Mini Card ─────────────────────────────────────────────────────────────
function StatMini({ label, value, color }: { label: string; value: string | number; color: 'red' | 'emerald' | 'indigo' }) {
  const colorMap = {
    red:     'bg-red-500/10 border-red-500/20 text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    indigo:  'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 opacity-70">{label}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SkillGapAnalysis() {
  const router = useRouter();
  const [openGaps,       setOpenGaps]       = useState<any[]>([]);
  const [masteredSkills, setMasteredSkills] = useState<string[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [userId,         setUserId]         = useState<string | null>(null);
  const [candidateName,  setCandidateName]  = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (!saved) { router.replace('/login'); return; }
    try {
      const parsed = JSON.parse(saved);
      setUserId(parsed.id || null);
      setCandidateName(parsed.name || null);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (userId === null) return;

    const fetchData = async () => {
      try {
        const res  = await fetch(`http://localhost:8000/api/hindsight?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        const memories: string[] = data.memories || [];

        const gapEntries      = memories.filter(m => m.includes('Gap Identified:'));
        const masteredEntries = memories.filter(m => m.includes('VERIFIED_MASTERY:'));

        const masteredNames = masteredEntries.map(m =>
          m.replace('VERIFIED_MASTERY:', '').trim().toLowerCase()
        );

        const pending = gapEntries.filter(entry => {
          const skillName = entry.replace('Gap Identified:', '').trim().toLowerCase();
          return !masteredNames.some(mastered => mastered.includes(skillName) || skillName.includes(mastered));
        });

        const formatted = pending.map((entry, i) => {
          const skillName = entry.replace('Gap Identified:', '').trim();
          const cat = getCategory(skillName);
          return {
            id:          i,
            skill:       skillName,
            category:    cat.label,
            icon:        cat.icon,
            criticality: getCriticality(i, pending.length),
          };
        });

        setOpenGaps(formatted);
        setMasteredSkills(masteredNames);
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const totalSkills  = openGaps.length + masteredSkills.length;
  const overallMatch = totalSkills === 0
    ? 0
    : Math.round((masteredSkills.length / totalSkills) * 100);

  const firstOpenGap = openGaps[0]?.skill || '';

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-gray-900 font-sans">

      {/* ═══════ DARK NAVY SIDEBAR ═══════ */}
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
          <SidebarItem href="/"                    icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
          <SidebarItem href="/mock-interview"      icon={<Mic className="w-4 h-4" />}            label="Mock Interview" />
          <SidebarItem href="/resume-evolution"    icon={<FileText className="w-4 h-4" />}       label="Resume Evolution" />
          <SidebarItem href="/skill-gap-analysis"  icon={<Target className="w-4 h-4" />}         label="Skill Gap Analysis" active />
          <SidebarItem href="/job-recommendations" icon={<Briefcase className="w-4 h-4" />}      label="Job Recommendations" />

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3 mt-8">Tools</p>
          <SidebarItem href="/self_intro"          icon={<UserCircle />}      label="Self Introduction"    />
          <SidebarItem href="/higher-studies" icon={<GraduationCap className="w-4 h-4" />} label="Higher Studies" />
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

        {/* ── TOP BAR ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0B1628] tracking-tight">Skill Gap Analysis</h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {loading
                ? 'Loading your profile…'
                : `${openGaps.length} gap${openGaps.length !== 1 ? 's' : ''} remaining · ${masteredSkills.length} verified`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-[12px] font-extrabold">
              <TrendingUp className="w-4 h-4" />
              Profile Match: {overallMatch}%
            </div>
            <div className="w-px h-10 bg-gray-200 mx-1 hidden sm:block" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-extrabold shadow-md shadow-indigo-200">
              {candidateName ? candidateName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        <div className="px-10 py-8 space-y-8">

          {/* ── HERO BANNER ── */}
          <section className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1628] via-[#132042] to-[#1a1060]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 50%)' }} />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v40H0z\'/%3E%3Cpath d=\'M0 0h40v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative z-10 px-10 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase text-indigo-300 mb-5 tracking-wider backdrop-blur-sm border border-white/5">
                  <Zap className="w-3 h-3 text-amber-300" /> AI-Powered · Live Tracking
                </div>
                <h3 className="text-[28px] font-extrabold text-white mb-3 leading-tight tracking-tight">
                  Your Skill Gap<br />Dashboard
                </h3>
                <p className="text-[13px] text-slate-400 max-w-md leading-relaxed font-medium">
                  Every gap was identified from your Resume vs JD analysis. Verify each skill through the mock interview to mark it as mastered.
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 lg:min-w-[300px]">
                <StatMini label="Pending"  value={openGaps.length}       color="red" />
                <StatMini label="Verified" value={masteredSkills.length} color="emerald" />
                <StatMini label="Match %"  value={`${overallMatch}%`}    color="indigo" />
              </div>
            </div>
          </section>

          {/* ── CONTENT GRID ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* LEFT: Open gaps + Verified */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* Pending Gaps */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-[#0B1628]">Pending Skill Gaps</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Complete mock interviews to verify each skill</p>
                  </div>
                </div>

                {loading ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6" />
                    <span className="text-[13px] font-medium">Analysing your profile…</span>
                  </div>
                ) : openGaps.length > 0 ? (
                  <div className="space-y-3">
                    {openGaps.map((gap, i) => (
                      <motion.div
                        key={gap.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${CRITICALITY_CARD[gap.criticality]} overflow-hidden hover:shadow-md transition-all`}
                      >
                        <div className="px-6 py-5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              {gap.icon}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-[#0B1628] text-[14px]">{gap.skill}</h3>
                              <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-[0.15em]">
                                {gap.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${CRITICALITY_STYLE[gap.criticality]}`}>
                              {gap.criticality} Priority
                            </span>
                            <Link
                              href={`/mock-interview?topic=${encodeURIComponent(gap.skill)}`}
                              className="flex items-center gap-1.5 bg-[#0B1628] text-white text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-[#132042] transition-all active:scale-95"
                            >
                              <Mic className="w-3.5 h-3.5" /> Test Now
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                    {totalSkills === 0
                      ? <p className="text-slate-400 text-[13px] font-medium">No gaps found yet. Upload your Resume &amp; JD on the Dashboard first.</p>
                      : <p className="text-emerald-600 font-extrabold text-[15px]">🎉 All identified gaps have been verified! Great work.</p>
                    }
                  </div>
                )}
              </div>

              {/* Verified Skills */}
              {masteredSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-extrabold text-[#0B1628]">Verified Skills</h2>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Passed through mock interview verification</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {masteredSkills.map((skill, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white border border-gray-100 border-l-4 border-l-emerald-500 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-4 hover:shadow-md transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                        </div>
                        <span className="font-extrabold text-[#0B1628] text-[13px] capitalize flex-1">{skill}</span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-[0.15em]">
                          Certified
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Action plan */}
            <div className="w-full lg:w-[340px] space-y-5 shrink-0">

              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <BrainCircuit className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold text-[#0B1628]">Adaptive Action Plan</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your personalised next steps</p>
                </div>
              </div>

              {/* CTA card — dark navy */}
              <div className="bg-[#0B1628] rounded-2xl p-6 text-white shadow-lg border border-white/5">
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase text-indigo-300 mb-4 tracking-wider">
                  <Zap className="w-3 h-3 text-amber-300" /> Onboarding Pathway
                </div>
                <p className="text-[13px] text-slate-400 mb-6 leading-relaxed font-medium">
                  {openGaps.length > 0
                    ? `${openGaps.length} skill gap${openGaps.length !== 1 ? 's' : ''} remaining. Follow the roadmap to close them.`
                    : 'All gaps verified! Your profile is job-ready.'}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/?showRoadmap=true"
                    className="w-full bg-white text-[#0B1628] font-extrabold text-[12px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    <BookOpen className="w-4 h-4" /> View Training Roadmap
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-40 ml-auto" />
                  </Link>

                  {firstOpenGap ? (
                    <Link
                      href={`/mock-interview?topic=${encodeURIComponent(firstOpenGap)}`}
                      className="w-full bg-indigo-600 text-white font-extrabold text-[12px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all border border-indigo-500/50 active:scale-[0.98]"
                    >
                      <Target className="w-4 h-4" />
                      Top Gap: {firstOpenGap.length > 18 ? firstOpenGap.slice(0, 18) + '…' : firstOpenGap}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40 ml-auto" />
                    </Link>
                  ) : (
                    <div className="w-full bg-white/5 text-slate-500 font-extrabold text-[12px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-white/5 cursor-not-allowed">
                      <Target className="w-4 h-4" /> No Pending Gaps
                    </div>
                  )}
                </div>
              </div>

              {/* Progress summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Progress Summary</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] font-bold text-[#0B1628]">
                    <span>Profile Match</span>
                    <span>{overallMatch}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallMatch}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${overallMatch === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-red-600">{openGaps.length}</p>
                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-[0.15em] mt-1">Pending</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-emerald-600">{masteredSkills.length}</p>
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.15em] mt-1">Verified</p>
                  </div>
                </div>

                {openGaps.length > 0 && (
                  <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-gray-100 pt-4">
                    "{openGaps[0].skill} is your highest priority gap. Complete the roadmap module and pass the verification exam to close it."
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}