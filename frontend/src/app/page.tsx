"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Github,
  Linkedin,
  Globe,
  Sparkles,
  Trophy,
  Brain,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import ChatInterface from "@/components/ChatInterface";
import { API_BASE_URL } from "@/lib/api";

interface AnalyticsResponse {
  total_sessions: number;
  total_messages: number;
  total_questions: number;
  topic_distribution: Record<string, number>;
  recent_questions: Array<{
    id: string;
    question: string;
    topic: string;
    visitor_name?: string;
    created_at?: string;
  }>;
}

export default function Home() {
  const [avatarState, setAvatarState] = useState<"idle" | "thinking" | "talking">("idle");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleOpenAnalytics = async () => {
    setShowAdminModal(true);
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/analytics`);
      if (res.ok) {
        const data: AnalyticsResponse = await res.json();
        setAnalyticsData(data);
      }
    } catch (e) {
      console.warn("Analytics fetch error:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shadow-md shadow-cyan-500/20 shrink-0">
            <Image
              src="/avatar.jpg"
              alt="Mohmed Husain"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
              Mohmed Husain Pasheriya
              <span className="hidden sm:inline-block text-[10px] font-mono font-normal text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                Agentic Portfolio
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAnalytics}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Visitor Insights</span>
          </button>

          <a
            href="https://github.com/Mohmed-Husain"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          <a
            href="https://linkedin.com/in/mohmed-husain/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <a
            href="https://mohmed-husain.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>mohmed-husain.in</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Avatar & Bio (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Avatar Component */}
          <div className="w-full flex justify-center py-2">
            <Avatar state={avatarState} onClick={() => setAvatarState("talking")} />
          </div>

          {/* Persona Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Systems & Backend Engineer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Talk to My Digital Twin
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Instead of reading a static resume, chat directly with my AI agent.
              It knows every system I&apos;ve architected, my hackathon wins, research
              in Clinical NLP, and my live GitHub repos.
            </p>
          </div>

          {/* Key Milestones Badges */}
          <div className="w-full space-y-2.5 max-w-md">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 hover:border-amber-500/40 transition-colors">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-100 block">
                  Google Hackathon 2nd Runner-Up
                </span>
                <span className="text-slate-400">
                  CleaniSense presented in New Delhi to 11+ Members of Parliament
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 hover:border-purple-500/40 transition-colors">
              <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-100 block">
                  Clinical NLP Research (IEEE Abstract)
                </span>
                <span className="text-slate-400">
                  PubMedBERT & Federated Learning across 298k MIMIC-IV clinical records
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 hover:border-cyan-500/40 transition-colors">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-100 block">
                  3-Agent LangGraph Architecture
                </span>
                <span className="text-slate-400">
                  LeapSQL-AI Natural Language to SQL with 5-layer security firewall
                </span>
              </div>
            </div>
          </div>

          {/* Education & Current Role footer pill */}
          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              🎓 IIIT Vadodara (2023–2027)
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              💼 AI Backend @ Quba Infotech
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Chat Interface (7 cols) */}
        <div className="lg:col-span-7 w-full">
          <ChatInterface onStateChange={setAvatarState} />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <span>© 2026 Mohmed Husain Pasheriya. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <span>Powered by DeepSeek AI + FastAPI + Next.js</span>
        </span>
      </footer>

      {/* Admin Analytics Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Visitor Conversations & Question Analytics
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {loadingAnalytics ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                Loading visitor logs and question records...
              </p>
            ) : analyticsData ? (
              <div className="space-y-4 text-xs">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Total Visitors</span>
                    <span className="text-xl font-bold text-cyan-400">
                      {analyticsData.total_sessions}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Messages Exchanged</span>
                    <span className="text-xl font-bold text-indigo-400">
                      {analyticsData.total_messages}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Questions Asked</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {analyticsData.total_questions}
                    </span>
                  </div>
                </div>

                {/* Topics breakdown */}
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">
                    Popular Topics Asked by People
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analyticsData.topic_distribution || {}).map(
                      ([topic, count]) => (
                        <span
                          key={topic}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono"
                        >
                          {topic}: <strong className="text-cyan-400">{count}</strong>
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Exact Questions Asked */}
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">
                    Recent Questions Visitors Asked About You
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analyticsData.recent_questions &&
                    analyticsData.recent_questions.length > 0 ? (
                      analyticsData.recent_questions.map((q) => (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-slate-200 block font-medium">
                              &ldquo;{q.question}&rdquo;
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Visitor: {q.visitor_name || "Anonymous"} • Topic:{" "}
                              {q.topic}
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {q.created_at ? new Date(q.created_at).toLocaleTimeString() : ""}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No questions recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">
                Could not load analytics. Make sure the backend server is running.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
