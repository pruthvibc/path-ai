'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send, BrainCircuit, Square, Mic, MicOff,
  Video, VideoOff, Trophy, XCircle, Loader2, Play, LogOut,
  LayoutDashboard, FileText, Target, Briefcase, Zap,
  UserCircle, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ||'http://localhost:8000';

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

export default function MockInterviewStudio() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const topicFromUrl = searchParams.get('topic') || 'Software Engineering';
  const syllabusFromUrl = searchParams.get('syllabus')
    ? searchParams.get('syllabus')!.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // ── Core state ────────────────────────────────────────────────────────────
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [messages, setMessages]     = useState<{ role: string; text: string }[]>([]);
  const [qNum, setQNum]             = useState(1);
  const qNumRef                     = useRef(1);
  const [examResult, setExamResult] = useState<{ passed: boolean; text: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionStarted, setSessionStarted]   = useState(false);
  const isCompleteRef = useRef(false);

  // ── Voice state ───────────────────────────────────────────────────────────
  // micOn = user WANTS the mic active (toggle state)
  // isListening = speech recognition is currently running
  // isSpeaking  = TTS is playing
  const [micOn, setMicOn]           = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [ttsReady, setTtsReady]       = useState(false);
  const recognitionRef                = useRef<any>(null);

  // Accumulated transcript from current mic session
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // ── Camera / recording ────────────────────────────────────────────────────
  const [isCameraOn, setIsCameraOn]   = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef         = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [userId,        setUserId]        = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserId(parsed.id || null);
        setCandidateName(parsed.name || null);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  const TOTAL_QUESTIONS = 10;

  // ── Confetti ──────────────────────────────────────────────────────────────
  const triggerConfetti = () => {
    const duration     = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults     = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // ── TTS unlock (needs a user gesture) ────────────────────────────────────
  const unlockTTS = useCallback(() => {
    if (ttsReady) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    setTtsReady(true);
  }, [ttsReady]);

  useEffect(() => {
    document.addEventListener('click', unlockTTS, { once: true });
    return () => document.removeEventListener('click', unlockTTS);
  }, [unlockTTS]);

  // ── Cleanup on exit ───────────────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    try { recognitionRef.current?.abort(); } catch (_) {}
    try { recognitionRef.current?.stop();  } catch (_) {}
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const handleExit = useCallback(() => {
    isCompleteRef.current = true;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopRecognition();
    setMicOn(false);
    try {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    } catch (_) {}
    try {
      (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
    } catch (_) {}
    setTimeout(() => window.history.back(), 150);
  }, [stopRecognition]);

  // ── Submit answer (text or voice) — only triggered by explicit send ───────
  const submitAnswer = useCallback(async (answerText: string) => {
    if (!answerText.trim() || isLoading || isCompleteRef.current) return;

    // Stop mic before sending
    stopRecognition();
    setMicOn(false);
    setVoiceTranscript('');

    const userText = answerText.trim();
    setInput('');
    setIsLoading(true);

    const currentHistory = [...messages, { role: 'user', text: userText }];
    setMessages(currentHistory);

    try {
      const apiHistory = currentHistory.map(m => ({
        role:    m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:      apiHistory,
          topic_context: topicFromUrl,
          syllabus:      syllabusFromUrl,
          user_id:       userId,
        }),
      });

      const data = await response.json();
      if (isCompleteRef.current) return;

      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);

      const nextQ = qNumRef.current + 1;
      qNumRef.current = nextQ;
      setQNum(nextQ);

      if (data.is_complete || nextQ > TOTAL_QUESTIONS) {
        isCompleteRef.current = true;
        const passed = data.passed ?? true;
        setExamResult({ passed, text: data.text });
        speak(data.text, false);
        if (passed) triggerConfetti();
      } else {
        // Speak AI question — mic stays OFF until user manually enables it
        speak(data.text, false);
      }
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, topicFromUrl, syllabusFromUrl, messages, userId, stopRecognition]);

  // ── Speech recognition ────────────────────────────────────────────────────
  // Starts a CONTINUOUS recognition session and accumulates interim text
  // into the input field. Does NOT auto-send. User must click Send.
  const startRecognitionSession = useCallback(() => {
    if (isCompleteRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition not supported. Please use Chrome or Edge.');
      setMicOn(false);
      return;
    }

    // Kill any existing session first
    stopRecognition();

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous     = true;   // keep listening until stopped
    recognition.interimResults = true;   // show live partial results
    recognition.lang           = 'en-IN';
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => {
      setIsListening(true);
      finalText = input; // preserve whatever was already typed
    };

    recognition.onresult = (event: any) => {
      if (isCompleteRef.current) return;

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += (finalText ? ' ' : '') + transcript.trim();
        } else {
          interim = transcript;
        }
      }

      // Update input with committed text + live interim
      const combined = finalText + (interim ? (finalText ? ' ' : '') + interim : '');
      setInput(combined);
      setVoiceTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
        setMicOn(false);
        setIsListening(false);
        return;
      }
      // For network / no-speech errors, restart if mic is still toggled on
      setIsListening(false);
      if (micOn && !isCompleteRef.current && event.error !== 'aborted') {
        setTimeout(() => {
          if (micOn && !isCompleteRef.current) startRecognitionSession();
        }, 500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // If mic toggle is still ON and session ended naturally, restart
      if (micOn && !isCompleteRef.current) {
        setTimeout(() => {
          if (!isCompleteRef.current) startRecognitionSession();
        }, 300);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setMicOn(false);
      setIsListening(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopRecognition, input]);

  // ── React to micOn toggle ─────────────────────────────────────────────────
  useEffect(() => {
    if (micOn && sessionStarted && !examResult && !isSpeaking) {
      startRecognitionSession();
    } else if (!micOn) {
      stopRecognition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn]);

  // Stop mic automatically when AI starts speaking
  useEffect(() => {
    if (isSpeaking && micOn) {
      stopRecognition();
      setIsListening(false);
      // Don't change micOn toggle state — let user decide to re-enable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  // ── Toggle mic button handler ─────────────────────────────────────────────
  const toggleMic = () => {
    if (!sessionStarted || !!examResult) return;
    if (isSpeaking) return; // Can't start mic while AI is speaking
    setMicOn(prev => !prev);
  };

  // ── TTS speak ─────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, _autoListen = false) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.95;
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Never auto-start mic — user controls it manually
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Camera ────────────────────────────────────────────────────────────────
  const toggleCamera = async () => {
    if (isCameraOn) {
      (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      } catch { alert('Please enable camera access in your browser.'); }
    }
  };

  const startRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return alert('Turn on camera first!');
    setIsRecording(true);
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `exam-session-q${qNum}.webm`;
      a.click();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  // ── Start assessment ──────────────────────────────────────────────────────
  const startAssessment = async () => {
    setSessionStarted(true);
    setIsLoading(true);
    qNumRef.current = 1;
    setQNum(1);
    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:      [],
          topic_context: topicFromUrl,
          syllabus:      syllabusFromUrl,
          user_id:       userId,
        }),
      });
      const data = await response.json();
      setMessages([{ role: 'ai', text: data.text }]);
      speak(data.text, false);
    } catch (err) {
      console.error('Intro failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await submitAnswer(input);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const inputDisabled = !sessionStarted || isLoading || !!examResult || isSpeaking;
  const micDisabled   = !sessionStarted || isLoading || !!examResult || isSpeaking;
  const sendDisabled  = !input.trim() || isLoading || isSpeaking || !sessionStarted || !!examResult;

  const displayQ = Math.min(qNum, TOTAL_QUESTIONS);
  const progress  = (displayQ / TOTAL_QUESTIONS) * 100;

  const statusLabel = !sessionStarted ? 'Waiting to start…'
    : isSpeaking                      ? '🔊 Speaking — listen carefully…'
    : isListening                     ? '🎙️ Mic active — speak your answer, then click Send'
    : micOn && !isListening           ? '🎙️ Mic on — starting…'
    : isLoading                       ? 'Thinking…'
    :                                   'Type or enable mic, then click Send.';

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-gray-900 font-sans overflow-hidden">

      {/* ═══════ DARK NAVY SIDEBAR ═══════ */}
      <aside className="w-[280px] bg-[#0B1628] flex flex-col shrink-0">
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

        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3">Main Menu</p>
          <SidebarItem href="/"                    icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
          <SidebarItem href="/mock-interview"      icon={<Mic className="w-4 h-4" />}            label="Mock Interview" active />
          <SidebarItem href="/resume-evolution"    icon={<FileText className="w-4 h-4" />}       label="Resume Evolution" />
          <SidebarItem href="/skill-gap-analysis"  icon={<Target className="w-4 h-4" />}         label="Skill Gap Analysis" />
          <SidebarItem href="/job-recommendations" icon={<Briefcase className="w-4 h-4" />}      label="Job Recommendations" />

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] px-4 mb-3 mt-8">Tools</p>
          <SidebarItem href="/self_intro"          icon={<UserCircle />}      label="Self Introduction"    />
          <SidebarItem href="/higher-studies" icon={<GraduationCap className="w-4 h-4" />} label="Higher Studies" />
        </nav>

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

      {/* ═══════ MAIN STUDIO ═══════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── HEADER ── */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-5">
            <div>
              <h2 className="text-[18px] font-extrabold text-[#0B1628] tracking-tight">Certification Studio</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{topicFromUrl}</p>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                {qNum > TOTAL_QUESTIONS ? 'Evaluating…' : `Question ${displayQ} / ${TOTAL_QUESTIONS}`}
              </span>
              <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button onClick={startRecording}
                className="px-4 py-2 bg-[#0B1628] text-white rounded-xl text-[11px] font-extrabold hover:bg-[#132042] transition-all">
                Record Session
              </button>
            ) : (
              <button onClick={() => { mediaRecorderRef.current?.stop(); setIsRecording(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[11px] font-extrabold animate-pulse flex items-center gap-2">
                <Square size={11} fill="white" /> Stop & Save
              </button>
            )}
            <div className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[9px] font-extrabold border border-red-100 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> LIVE
            </div>
            <button
              onClick={() => sessionStarted && !examResult ? setShowExitConfirm(true) : handleExit()}
              className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-extrabold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2"
            >
              <LogOut size={13} /> Exit
            </button>
          </div>
        </header>

        {/* ── STUDIO BODY ── */}
        <div className="flex-1 flex gap-0 overflow-hidden">

          {/* CENTER: Video + Input */}
          <div className="flex-1 flex flex-col p-6 gap-5 overflow-hidden">

            {/* VIDEO / AI PANEL */}
            <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 min-h-0">

              {/* START OVERLAY */}
              <AnimatePresence>
                {!sessionStarted && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-slate-900/70 backdrop-blur-md flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md"
                    >
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100">
                        <Play className="w-10 h-10 text-indigo-600 ml-1" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#0B1628] mb-3">Ready to Begin?</h2>
                      <p className="text-slate-500 text-[13px] mb-8 leading-relaxed font-medium">
                        This proctored assessment contains <strong>{TOTAL_QUESTIONS}</strong> technical questions on{' '}
                        <span className="font-extrabold text-indigo-600">{topicFromUrl}</span>.
                        Enable your microphone when prompted.
                      </p>
                      <button
                        onClick={startAssessment}
                        className="w-full bg-[#0B1628] text-white py-4 rounded-xl font-extrabold text-[13px] hover:bg-[#132042] transition-all"
                      >
                        Start Technical Assessment
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI AVATAR */}
              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center transition-all duration-500 ${
                    isSpeaking    ? 'bg-indigo-400 animate-pulse scale-110 shadow-2xl shadow-indigo-500/50'
                    : isListening ? 'bg-emerald-500 animate-pulse scale-105 shadow-2xl shadow-emerald-500/50'
                    : isLoading   ? 'bg-indigo-600 animate-pulse'
                    :               'bg-indigo-600 shadow-2xl shadow-indigo-500/30'
                  }`}>
                    <BrainCircuit className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-white font-extrabold text-2xl tracking-tight">AI Technical Examiner</h2>
                  <p className="text-slate-400 text-[13px] mt-2 max-w-xs font-medium">{statusLabel}</p>

                  {sessionStarted && !examResult && (
                    <div className="mt-6 flex items-center gap-2">
                      {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                        <div key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            i < displayQ - 1
                              ? 'bg-indigo-400'
                              : i === displayQ - 1
                              ? 'bg-emerald-400 scale-125 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <video
                ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Camera toggle */}
              <div className="absolute bottom-5 left-5">
                <button onClick={toggleCamera}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  {isCameraOn ? <Video className="text-white w-5 h-5" /> : <VideoOff className="text-red-400 w-5 h-5" />}
                </button>
              </div>

              {/* Speaking / Listening badge */}
              {(isSpeaking || isListening) && (
                <div className={`absolute top-5 right-5 px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 ${
                  isSpeaking ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {isSpeaking ? 'AI Speaking' : 'Mic Active'}
                </div>
              )}
            </div>

            {/* ── INPUT BAR ── */}
            <div className="shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">

                {/* Mic toggle button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={micDisabled}
                  title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
                  className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border-2 shadow-sm
                    ${micDisabled
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                      : micOn
                        ? isListening
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-200 animate-pulse'
                          : 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                    }`}
                >
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Text input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      // If user edits manually while mic is on, keep the text
                    }}
                    disabled={inputDisabled}
                    placeholder={
                      !sessionStarted     ? 'Click Start to begin…'
                      : isSpeaking        ? 'AI is speaking…'
                      : micOn             ? 'Speaking… click Send when done'
                      : examResult        ? 'Assessment complete.'
                      :                     'Type your answer or enable the mic above…'
                    }
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 text-[13px] font-medium shadow-sm focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 focus:outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  {micOn && isListening && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.div key={i}
                          className="w-1 bg-emerald-500 rounded-full"
                          animate={{ height: [6, 18, 6] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sendDisabled}
                  title="Send answer"
                  className="shrink-0 w-14 h-14 bg-[#0B1628] text-white rounded-2xl flex items-center justify-center shadow-md hover:bg-[#132042] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </form>

              {/* Mic hint */}
              {sessionStarted && !examResult && (
                <p className="text-center text-[10px] text-slate-400 font-medium mt-2">
                  {micOn
                    ? isListening
                      ? '🟢 Mic active — speak freely, then click Send to submit your answer'
                      : '⏳ Starting microphone…'
                    : '🎙️ Toggle the mic button to speak, or type directly — click Send to submit'}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Transcript sidebar */}
          <aside className="w-[22rem] bg-white border-l border-gray-100 flex flex-col hidden xl:flex shadow-sm shrink-0">
            <div className="px-6 py-5 border-b border-gray-50 bg-indigo-50/30 flex items-center justify-between shrink-0">
              <h2 className="font-extrabold text-indigo-900 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <BrainCircuit size={15} className="text-indigo-600" /> Exam Transcript
              </h2>
              <div className="text-[9px] bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 font-extrabold text-indigo-600 shadow-sm">
                {qNum > TOTAL_QUESTIONS ? 'EVAL' : `Q ${displayQ} / ${TOTAL_QUESTIONS}`}
              </div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl text-[12px] leading-relaxed transition-all ${
                  msg.role === 'ai'
                    ? 'bg-slate-50 border border-slate-100 text-slate-700'
                    : 'bg-[#0B1628] text-white ml-6 shadow-md'
                }`}>
                  <span className={`text-[9px] font-extrabold uppercase block mb-1.5 tracking-widest ${
                    msg.role === 'ai' ? 'text-indigo-500' : 'text-indigo-300'
                  }`}>
                    {msg.role === 'ai' ? 'AI Examiner' : 'Candidate'}
                  </span>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── EXIT CONFIRM MODAL ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-8 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <LogOut className="w-9 h-9 text-red-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B1628] mb-3">Exit Assessment?</h2>
              <p className="text-slate-500 text-[13px] mb-8 leading-relaxed font-medium">
                Your progress will be lost and the session will end. Are you sure you want to leave?
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={handleExit}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-extrabold text-[12px] hover:bg-red-700 transition-all uppercase tracking-widest">
                  Yes, Exit Now
                </button>
                <button onClick={() => setShowExitConfirm(false)}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-extrabold text-[12px] hover:bg-slate-200 transition-all uppercase tracking-widest">
                  Continue Assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {examResult && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-16 max-w-xl w-full text-center shadow-2xl"
            >
              {examResult.passed ? (
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center mb-8 border border-amber-100">
                    <Trophy className="w-14 h-14 text-amber-500" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-[#0B1628] mb-3 tracking-tight">Skill Certified!</h2>
                  <p className="text-slate-500 mb-6 leading-relaxed font-medium italic text-[13px]">"{examResult.text}"</p>
                  <button onClick={() => window.history.back()}
                    className="w-full bg-[#0B1628] text-white py-4 rounded-xl font-extrabold text-[13px] hover:bg-[#132042] transition-all uppercase tracking-widest">
                    Add Verified Badge to Resume
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mb-8 border border-red-100">
                    <XCircle className="w-14 h-14 text-red-500" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-[#0B1628] mb-3 tracking-tight">Unverified Proficiency</h2>
                  <p className="text-slate-500 mb-6 leading-relaxed font-medium italic text-[13px]">"{examResult.text}"</p>
                  <button onClick={() => window.location.reload()}
                    className="w-full bg-[#0B1628] text-white py-4 rounded-xl font-extrabold text-[13px] hover:bg-[#132042] transition-all uppercase tracking-widest">
                    Review Roadmap & Retry
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}