'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Mic, FileText, Target,
  Briefcase,
  CheckCircle2, Loader2,
  Sparkles, BookOpen, Lightbulb,
  Youtube, GraduationCap, Clock, ExternalLink, LogOut,
  UserCircle, ChevronRight, Upload, TrendingUp, Award,
  BarChart3, ArrowUpRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  YouTube:  { color: 'text-red-600',    bg: 'bg-red-50 border-red-100',       icon: <Youtube className="w-3.5 h-3.5" /> },
  Udemy:    { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  Coursera: { color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100',     icon: <GraduationCap className="w-3.5 h-3.5" /> },
  NPTEL:    { color: 'text-green-700',  bg: 'bg-green-50 border-green-100',   icon: <GraduationCap className="w-3.5 h-3.5" /> },
};

export default function CareerCommandCenter() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const roadmapRef   = useRef<HTMLDivElement>(null);

  const [resumeFile, setResumeFile]                   = useState<File | null>(null);
  const [jdFile, setJdFile]                           = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing]                 = useState(false);
  const [analysisResult, setAnalysisResult]           = useState<any>(null);
  const [memories, setMemories]                       = useState<string[]>([]);
  const [roadmap, setRoadmap]                         = useState<any[]>([]);
  const [showRoadmap, setShowRoadmap]                 = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [completedSteps, setCompletedSteps]           = useState<Record<number, boolean>>({});
  const [isReturningUser, setIsReturningUser]         = useState<boolean | null>(null);
  const [sessionUser, setSessionUser]                 = useState<{ name: string; id: string } | null>(null);

  const candidateName = sessionUser?.name || null;
  const userId = sessionUser?.id || null;

  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (!saved) { router.replace('/login'); return; }
    try {
      const parsed = JSON.parse(saved);
      setSessionUser(parsed);
    } catch { router.replace('/login'); }
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8000/api/hindsight?user_id=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => setMemories(data.memories || []))
      .catch(err => console.error("Failed to load memories", err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8000/api/user/${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists && data.user) {
          const user = data.user;
          setIsReturningUser(!user.is_new);
          if (user.roadmap && user.roadmap.length > 0) {
            setRoadmap(user.roadmap);
            setShowRoadmap(true);
          }
          if (user.gaps && user.gaps.length > 0) {
            setAnalysisResult((prev: any) => prev || {
              skills_missing: user.gaps,
              reasoning: "Restored from your previous session.",
            });
          }
        } else {
          setIsReturningUser(false);
        }
      })
      .catch(() => setIsReturningUser(false));
  }, [userId]);

  const handleUpload = async () => {
    if (!resumeFile || !jdFile) return alert("Please upload both Resume and JD");
    if (!userId) return alert("Not logged in");
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jd', jdFile);
    formData.append('user_id', userId);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-gap', { method: 'POST', body: formData });
      const data = await response.json();
      setAnalysisResult(data);
      const memRes  = await fetch(`http://localhost:8000/api/hindsight?user_id=${encodeURIComponent(userId)}`);
      const memData = await memRes.json();
      setMemories(memData.memories || []);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchRoadmap = async () => {
    if (!userId) return;
    setIsGeneratingRoadmap(true);
    try {
      const res  = await fetch(`http://localhost:8000/api/generate-roadmap?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      setRoadmap(data.roadmap || []);
      setShowRoadmap(true);
    } catch (error) {
      console.error("Roadmap generation failed", error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const toggleStep = (index: number) =>
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));

  useEffect(() => {
    if (searchParams.get('showRoadmap') === 'true') {
      fetchRoadmap().then(() => {
        setTimeout(() => {
          roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isResourceObject = (r: any) => typeof r === 'object' && r !== null && 'platform' in r;

  const masteredCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = roadmap.length;

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
          <SidebarItem href="/"                    icon={<LayoutDashboard />} label="Dashboard"            active />
          <SidebarItem href="/mock-interview"      icon={<Mic />}            label="Mock Interview"       />
          <SidebarItem href="/resume-evolution"    icon={<FileText />}       label="Resume Evolution"     />
          <SidebarItem href="/skill-gap-analysis"  icon={<Target />}         label="Skill Gap Analysis"   />
          <SidebarItem href="/job-recommendations" icon={<Briefcase />}      label="Job Recommendations"  />
          
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3 mt-8">Tools</p>
          <SidebarItem href="/self_intro"          icon={<UserCircle />}      label="Self Introduction"    />
          <SidebarItem href="/higher-studies"      icon={<GraduationCap />}  label="Higher Studies"       />
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
            onClick={() => {
              sessionStorage.removeItem('ai_advisor_user');
              router.replace('/login');
            }}
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
            <h2 className="text-[22px] font-extrabold text-[#0B1628] tracking-tight">
              {isReturningUser === null
                ? 'Career Command Center'
                : isReturningUser && candidateName
                  ? `Welcome back, ${candidateName}`
                  : candidateName
                    ? `Welcome, ${candidateName}`
                    : 'Welcome!'}
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {isReturningUser
                ? 'Your previous progress has been restored.'
                : 'Upload your documents to generate a personalised skill roadmap.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-slate-500">Today</p>
              <p className="text-[13px] font-extrabold text-[#0B1628]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="w-px h-10 bg-gray-200 mx-1 hidden sm:block" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-extrabold shadow-md shadow-indigo-200">
              {candidateName ? candidateName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        <div className="px-10 py-8 space-y-8">

          {/* ── STAT CARDS ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={<FileText className="w-5 h-5" />} label="Documents Uploaded" value={resumeFile && jdFile ? '2 / 2' : `${(resumeFile ? 1 : 0) + (jdFile ? 1 : 0)} / 2`} color="indigo" />
            <StatCard icon={<Target className="w-5 h-5" />} label="Skills to Learn" value={analysisResult ? analysisResult.skills_missing?.length || 0 : '—'} color="red" />
            <StatCard icon={<BookOpen className="w-5 h-5" />} label="Roadmap Steps" value={totalSteps || '—'} color="amber" />
            <StatCard icon={<Award className="w-5 h-5" />} label="Completed" value={totalSteps ? `${masteredCount} / ${totalSteps}` : '—'} color="emerald" progress={totalSteps ? (masteredCount / totalSteps) * 100 : 0} />
          </div>

          {/* ── HERO UPLOAD SECTION ── */}
          <section className="relative rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1628] via-[#132042] to-[#1a1060]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.3) 0%, transparent 50%)' }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v40H0z\'/%3E%3Cpath d=\'M0 0h40v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

            <div className="relative z-10 p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* Left: Upload Zone */}
                <div className="lg:col-span-3">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase text-indigo-300 mb-5 tracking-wider backdrop-blur-sm border border-white/5">
                    <Sparkles className="w-3 h-3" /> Powered by Llama 3.3
                  </div>
                  <h3 className="text-[28px] font-extrabold text-white mb-3 leading-tight tracking-tight">
                    Intelligent Skill-Gap<br />Analysis Engine
                  </h3>
                  <p className="text-[13px] text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
                    Don't guess what recruiters want. Our AI parses the Job Description and your Resume to create a verified bridge to your next role.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <UploadCard label="Resume" accept=".pdf" file={resumeFile} onFile={setResumeFile} />
                    <UploadCard label="Job Description" accept=".pdf" file={jdFile} onFile={setJdFile} />
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={isAnalyzing || !resumeFile || !jdFile}
                    className="bg-white text-[#0B1628] px-8 py-3.5 rounded-xl font-extrabold text-[13px] hover:shadow-xl hover:shadow-white/10 transition-all flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Target className="w-5 h-5" />}
                    {isAnalyzing ? "Processing Documents..." : "Identify Technical Gaps"}
                    {!isAnalyzing && <ChevronRight className="w-4 h-4 ml-1 opacity-50" />}
                  </button>
                </div>

                {/* Right: Results Panel */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {analysisResult ? (
                      <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.07] backdrop-blur-xl border border-white/10 p-7 rounded-2xl">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                          <h4 className="font-extrabold text-white text-[15px]">Gap Analysis</h4>
                        </div>
                        <p className="text-[12px] text-slate-400 mb-6 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 font-medium">
                          &ldquo;{analysisResult.reasoning}&rdquo;
                        </p>
                        <div className="flex flex-wrap gap-2 mb-7">
                          {analysisResult.skills_missing?.map((s: string, i: number) => (
                            <span key={i} className="bg-red-500/15 border border-red-500/20 text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-red-300">
                              {s}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={fetchRoadmap}
                          disabled={isGeneratingRoadmap}
                          className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 py-3.5 rounded-xl font-extrabold text-[13px] flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-amber-400/20 transition-all active:scale-[0.98]"
                        >
                          {isGeneratingRoadmap ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                          {isGeneratingRoadmap ? "Calculating Path..." : "Build Personalized Roadmap"}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[280px]">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                          <Upload className="w-7 h-7 text-slate-500" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-400 mb-1">No analysis yet</p>
                        <p className="text-[11px] text-slate-600 font-medium">Upload both documents to see your skill gaps</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* ── ROADMAP ── */}
          <AnimatePresence>
            {showRoadmap && (
              <motion.section ref={roadmapRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-extrabold text-[#0B1628] tracking-tight">AI-Adaptive Learning Path</h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Follow these curated steps to reach job-readiness</p>
                    </div>
                  </div>
                  {totalSteps > 0 && (
                    <div className="hidden md:flex items-center gap-3 bg-white border border-gray-100 px-5 py-3 rounded-xl shadow-sm">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      <span className="text-[12px] font-bold text-slate-600">Progress:</span>
                      <span className="text-[13px] font-extrabold text-[#0B1628]">{masteredCount}/{totalSteps}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden ml-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(masteredCount / totalSteps) * 100}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {roadmap.map((step, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}>

                      <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${completedSteps[i] ? 'border-emerald-200 shadow-sm shadow-emerald-50' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}`}>

                        {/* Step Header */}
                        <div className="px-7 py-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 transition-all duration-500 ${completedSteps[i] ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                              {completedSteps[i] ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.15em] bg-indigo-50 px-2 py-0.5 rounded-md">{step.skill}</span>
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.15em] bg-amber-50 px-2 py-0.5 rounded-md">{step.level}</span>
                              </div>
                              <h4 className="text-[17px] font-extrabold text-[#0B1628] leading-snug">
                                {decodeURIComponent(step.topic.replace(/\+/g, ' '))}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                              <Clock className="w-3.5 h-3.5" /> {step.effort}
                            </div>
                            <label className="flex items-center gap-2.5 cursor-pointer group bg-slate-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 px-4 py-2.5 rounded-xl transition-all">
                              <input type="checkbox" checked={completedSteps[i] || false} onChange={() => toggleStep(i)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                              <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors whitespace-nowrap">Completed</span>
                            </label>
                          </div>
                        </div>

                        {/* Step Body */}
                        <div className="px-7 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Syllabus */}
                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> What you must learn
                            </h5>
                            <ul className="space-y-2.5">
                              {step.syllabus?.map((item: string, idx: number) => (
                                <li key={idx} className="text-[12px] text-slate-600 flex items-start gap-2.5 leading-relaxed font-medium">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources */}
                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                              <Youtube className="w-3.5 h-3.5 text-red-500" /> Study Resources
                            </h5>
                            <div className="flex flex-col gap-2.5">
                              {step.resources?.map((res: any, idx: number) => {
                                if (isResourceObject(res)) {
                                  const cfg = PLATFORM_CONFIG[res.platform] || PLATFORM_CONFIG['Coursera'];
                                  return (
                                    <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer"
                                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-[11px] font-bold shadow-sm hover:shadow-md transition-all group ${cfg.bg}`}>
                                      <span className={`flex items-center gap-1 shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.color} ${cfg.bg}`}>
                                        {cfg.icon} {res.platform}
                                      </span>
                                      <span className="text-gray-700 leading-snug flex-1 line-clamp-1 font-semibold">{res.title}</span>
                                      <ExternalLink className={`w-3 h-3 shrink-0 opacity-30 group-hover:opacity-80 transition-opacity ${cfg.color}`} />
                                    </a>
                                  );
                                }
                                return (
                                  <div key={idx} className="bg-slate-50 border border-gray-100 px-4 py-2.5 rounded-xl text-[11px] font-semibold text-slate-600 flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> {res}
                                  </div>
                                );
                              })}
                            </div>

                            {/* AI Tip */}
                            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100/60 mt-4">
                              <p className="text-[10px] text-indigo-700 font-semibold leading-relaxed">
                                💡 <span className="font-bold uppercase">AI Tip:</span> {step.reasoning}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step Footer */}
                        <AnimatePresence>
                          {completedSteps[i] && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="border-t border-emerald-100 bg-emerald-50/30 px-7 py-4 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Module completed — Ready for verification
                              </span>
                              <Link
                                href={`/mock-interview?topic=${encodeURIComponent(decodeURIComponent(step.topic.replace(/\+/g, ' ')))}&syllabus=${encodeURIComponent((step.syllabus || []).join(','))}`}
                                className="bg-[#0B1628] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] hover:bg-[#132042] transition-all flex items-center gap-2 shadow-md active:scale-95"
                              >
                                <Mic className="w-4 h-4" /> Start Verification Test
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── BOTTOM GRID: Hindsight + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Hindsight Feed */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#0B1628]">Hindsight Feed</h3>
                    <p className="text-[10px] text-slate-400 font-medium">AI insights from your sessions</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">{memories.length} entries</span>
              </div>
              <div className="p-5">
                {memories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                    {memories.map((mem, i) => (
                      <FeedItem key={i} desc={mem}
                        type={mem.toLowerCase().includes('weak') || mem.toLowerCase().includes('improve') || mem.toLowerCase().includes('gap') ? 'gap' : 'growth'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium">No activity logged yet</p>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">Upload documents to begin tracking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-50">
                <h3 className="text-[15px] font-extrabold text-[#0B1628]">Quick Actions</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Jump to any tool</p>
              </div>
              <div className="p-4 space-y-2">
                <QuickAction href="/mock-interview" icon={<Mic className="w-4 h-4" />} label="Mock Interview" desc="Practice with AI interviewer" color="indigo" />
                <QuickAction href="/resume-evolution" icon={<FileText className="w-4 h-4" />} label="Resume Builder" desc="AI-optimized resume" color="emerald" />
                <QuickAction href="/self_intro" icon={<UserCircle className="w-4 h-4" />} label="Self Intro Coach" desc="Craft your elevator pitch" color="amber" />
                <QuickAction href="/higher-studies" icon={<GraduationCap className="w-4 h-4" />} label="Higher Studies" desc="MS/MBA guidance" color="violet" />
                <QuickAction href="/job-recommendations" icon={<Briefcase className="w-4 h-4" />} label="Job Finder" desc="Matched opportunities" color="blue" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

function SidebarItem({ icon, label, href = "#", active = false }: any) {
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

function StatCard({ icon, label, value, color, progress }: any) {
  const colorMap: any = {
    indigo:  { iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', barColor: 'from-indigo-500 to-indigo-400' },
    red:     { iconBg: 'bg-red-50',    iconColor: 'text-red-500',    barColor: 'from-red-500 to-red-400' },
    amber:   { iconBg: 'bg-amber-50',  iconColor: 'text-amber-600',  barColor: 'from-amber-500 to-amber-400' },
    emerald: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', barColor: 'from-emerald-500 to-emerald-400' },
  };
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 ${c.iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[20px] font-extrabold text-[#0B1628] leading-tight mt-0.5">{value}</p>
        {progress !== undefined && progress > 0 && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className={`h-full bg-gradient-to-r ${c.barColor} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function UploadCard({ label, accept, file, onFile }: any) {
  return (
    <div className={`bg-white/[0.07] backdrop-blur-sm border rounded-xl p-4 transition-all ${file ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-white/10 hover:border-white/20'}`}>
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label} (PDF)</label>
      <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] || null)}
        className="block w-full text-[11px] text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:font-bold file:text-[10px] file:cursor-pointer file:hover:bg-white/20 file:transition-colors cursor-pointer" />
      {file && (
        <p className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {file.name}
        </p>
      )}
    </div>
  );
}

function FeedItem({ desc, type }: any) {
  const colors: any = {
    gap:    { dot: 'bg-red-400',    border: 'border-l-red-400' },
    growth: { dot: 'bg-emerald-400', border: 'border-l-emerald-400' },
  };
  const c = colors[type] || colors.growth;
  return (
    <div className={`bg-slate-50/80 border-l-2 ${c.border} border border-gray-100 rounded-lg px-4 py-3 hover:bg-white hover:shadow-sm transition-all`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-2 h-2 rounded-full ${c.dot} mt-1.5 shrink-0`} />
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, desc, color }: any) {
  const colorMap: any = {
    indigo:  'hover:bg-indigo-50 hover:border-indigo-100',
    emerald: 'hover:bg-emerald-50 hover:border-emerald-100',
    amber:   'hover:bg-amber-50 hover:border-amber-100',
    violet:  'hover:bg-violet-50 hover:border-violet-100',
    blue:    'hover:bg-blue-50 hover:border-blue-100',
  };
  const iconColorMap: any = {
    indigo: 'text-indigo-500', emerald: 'text-emerald-500', amber: 'text-amber-500',
    violet: 'text-violet-500', blue: 'text-blue-500',
  };
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-transparent transition-all duration-200 group ${colorMap[color] || colorMap.indigo}`}>
      <div className={`w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-gray-100 group-hover:shadow-sm transition-all ${iconColorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-[#0B1628] group-hover:text-indigo-600 transition-colors leading-none">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-1">{desc}</p>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" />
    </Link>
  );
}