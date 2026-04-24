import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Bot,
  ShieldCheck,
  Users,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
  ChevronRight,
  Terminal,
} from "lucide-react";

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ─── AI Terminal Mock ─────────────────────────────────────────────────────────
const userMsg = "Split last night's dinner bill. Total was $124.80 across 4 people.";
const aiResponse = `> Activating Wingman Protocol...

✦ Parsing bill total: $124.80
✦ Participants detected: 4

─────────────────────────────
  Each person owes:  $31.20
─────────────────────────────

Breakdown generated. Ready to send
split requests via link or QR code.`;

function AITerminal() {
  const [phase, setPhase] = useState(0); // 0: idle, 1: user typing, 2: ai typing
  const scrollRef = useRef(null);

  const userTyper = useTypewriter(userMsg, 30, phase === 1 ? 0 : 99999);
  const aiTyper = useTypewriter(aiResponse, 18, phase === 2 ? 0 : 99999);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (userTyper.done && phase === 1) {
      const t = setTimeout(() => setPhase(2), 600);
      return () => clearTimeout(t);
    }
  }, [userTyper.done, phase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [userTyper.displayed, aiTyper.displayed]);

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-cyan-500/10 rounded-3xl blur-2xl pointer-events-none" />
      {/* Window chrome */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-cyan-900/20 overflow-hidden font-mono text-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Terminal size={11} /> syncnol — co-pilot
          </span>
        </div>

        {/* Chat body */}
        <div
          ref={scrollRef}
          className="p-5 space-y-4 h-[340px] overflow-y-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {/* System banner */}
          <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400">
            <Sparkles size={12} />
            <span>J.A.R.V.I.S Co-Pilot online — ready.</span>
          </div>

          {/* User bubble */}
          {phase >= 1 && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-cyan-500 text-white px-4 py-2.5 text-xs leading-relaxed shadow-lg shadow-cyan-500/20">
                {userTyper.displayed}
                {!userTyper.done && (
                  <span className="inline-block w-1.5 h-3.5 bg-white/70 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            </div>
          )}

          {/* AI response */}
          {phase >= 2 && (
            <div className="flex justify-start">
              <div className="max-w-[88%]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <Bot size={11} className="text-white" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">J.A.R.V.I.S</span>
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-700/50">
                  {aiTyper.displayed}
                  {!aiTyper.done && (
                    <span className="inline-block w-1.5 h-3.5 bg-slate-400 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
          <div className="flex-1 h-8 rounded-lg bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/50 flex items-center px-3">
            <span className="text-[11px] text-slate-300 dark:text-slate-600">Ask anything about your money…</span>
          </div>
          <button className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow shadow-cyan-500/30 flex-shrink-0">
            <ArrowRight size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Features Data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: LayoutDashboard,
    name: "Executive Dashboard",
    desc: "See your entire financial life at a glance. Net worth, spending rate, and trends — all in one command center.",
    accent: "from-blue-500 to-indigo-600",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    icon: Bot,
    name: "J.A.R.V.I.S Co-Pilot",
    desc: "Chat with your AI co-pilot in plain English. Ask questions, get insights, and make smarter decisions — instantly.",
    accent: "from-cyan-400 to-blue-500",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: ShieldCheck,
    name: "The Vault",
    desc: "Set spending guardrails for impulse categories. Your wallet's immune system against bad financial days.",
    accent: "from-emerald-400 to-teal-500",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    icon: Users,
    name: "Wingman Protocol",
    desc: "Split any bill in seconds. Dinners, trips, rent — SyncNol calculates, generates links, and tracks who owes what.",
    accent: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-500/20",
  },
  {
    icon: Zap,
    name: "Zero-Friction Logging",
    desc: "Log an expense in under 3 seconds. Type it, say it, snap it — SyncNol parses it and files it automatically.",
    accent: "from-amber-400 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
  },
  {
    icon: BarChart3,
    name: "Smart Analytics",
    desc: "Weekly AI-generated spending reports that actually speak human. Know exactly where every dollar went.",
    accent: "from-pink-500 to-rose-500",
    glow: "group-hover:shadow-pink-500/20",
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ dark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Sync<span className="text-cyan-500">Nol</span>
          </span>
        </a>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="/auth"
            className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Workspace
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Main LandingPage ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-cyan-400/6 dark:bg-cyan-400/4 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500/6 dark:bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/4 dark:bg-violet-500/4 blur-3xl" />
      </div>

      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs font-semibold text-cyan-600 dark:text-cyan-400 tracking-wide uppercase">
              <Sparkles size={11} />
              AI-Powered Finance
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Your smart
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                financial
              </span>
              <br />
              co-pilot.
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
              Track your net worth, log expenses in seconds, split bills effortlessly, and get AI-driven insights — all in one sleek workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <a
                href="/auth"
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
                <ArrowRight size={17} />
              </a>
              <a
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium text-base text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-7 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
              >
                View Dashboard
              </a>
            </div>

            {/* Social proof pill */}
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-600">
              Free to start · No credit card required
            </p>
          </div>

          {/* Right — AI Terminal */}
          <div className="flex-1 w-full lg:max-w-[480px]">
            <AITerminal />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Everything your money needs.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto">
            Six powerful modules. One unified workspace. Zero financial anxiety.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.name}
                className={`group relative rounded-2xl p-6 bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600/60 shadow-sm hover:shadow-xl ${f.glow} dark:shadow-black/20 transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden`}
              >
                {/* Subtle top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={19} className="text-white" strokeWidth={1.8} />
                </div>

                <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">
                  {f.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 p-px shadow-2xl shadow-blue-500/30">
          <div className="rounded-[23px] bg-gradient-to-br from-cyan-500/90 via-blue-600/90 to-violet-600/90 backdrop-blur px-8 py-14 text-center">
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noise%22%2F%3E%3C%2Fsvg%3E')]" />
            <h2 className="relative text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Take control. Finally.
            </h2>
            <p className="relative text-blue-100 mb-8 max-w-md mx-auto text-base">
              Stop guessing where your money went. SyncNol gives you clarity, control, and an AI co-pilot in your corner.
            </p>
            <a
              href="/auth"
              className="relative inline-flex items-center gap-2 font-bold text-blue-700 bg-white hover:bg-blue-50 px-7 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start for Free
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Sync<span className="text-cyan-500">Nol</span>
            </span>
          </a>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} SyncNol. Your money, your co-pilot.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-600">
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}