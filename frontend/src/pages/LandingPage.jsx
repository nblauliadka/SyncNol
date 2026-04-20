import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const TYPING_LINES = [
  {
    user: "gajian masuk 5 juta bulan ini",
    ai: "Noted. Rp 5,000,000 logged as income. Your runway just extended to 47 days. Now stop celebrating and pay that BPJS bill you've been ghosting.",
  },
  {
    user: "beli kopi starbucks 75rb",
    ai: "Rp 75,000 for caffeine? That's 0.3% of your emergency fund. I'm logging it, but at this rate you'll retire at 74. Just saying.",
  },
  {
    user: "gimana kondisi keuangan gue?",
    ai: "Net worth: Rp 2.1M. Debt: Rp 8.5M. Savings rate: 4%. You're not broke — you're pre-broke. Let's fix that before it gets worse.",
  },
  {
    user: "mau nabung buat laptop baru",
    ai: "Set goal: Laptop Rp 12,000,000. At your current savings rate of Rp 200k/month, you'll get there in 5 years. Want me to activate Frugal Mode?",
  },
];

const FEATURES = [
  {
    icon: "🚀",
    title: "Antigravity Engine",
    desc: "Obliterates debt with Snowball & Avalanche strategies. Detects silent subscription leaks automatically.",
  },
  {
    icon: "🛑",
    title: "Impulse Interceptor",
    desc: "Red panic button. Before you buy, the AI roasts your decision and shows the opportunity cost in 30 years.",
  },
  {
    icon: "🗓️",
    title: "Financial Heatmap",
    desc: "Full calendar. Red = bills incoming. Green = payday. Click any date to see your predicted balance.",
  },
  {
    icon: "🧠",
    title: "AI Academy",
    desc: "Drop a YouTube link or PDF. The AI builds you a custom curriculum and quizzes you on it.",
  },
  {
    icon: "📊",
    title: "Boardroom Reports",
    desc: "PDF generator with AI-written Financial Opinion Letters. Present to your parents, or just feel important.",
  },
  {
    icon: "🔒",
    title: "The Vault",
    desc: "Locked savings goal. To withdraw early, you must argue with the AI and pass a Mental CAPTCHA.",
  },
];

function TypewriterText({ text, speed = 22, onDone }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span>{displayed}</span>;
}

function DemoTerminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [phase, setPhase] = useState("user"); // 'user' | 'ai' | 'pause'
  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, phase]);

  const handleUserDone = () => {
    setHistory((h) => [
      ...h,
      { type: "user", text: TYPING_LINES[lineIdx].user },
    ]);
    setTimeout(() => setPhase("ai"), 400);
  };

  const handleAiDone = () => {
    setHistory((h) => [...h, { type: "ai", text: TYPING_LINES[lineIdx].ai }]);
    setTimeout(() => {
      const next = lineIdx + 1;
      if (next < TYPING_LINES.length) {
        setLineIdx(next);
        setPhase("user");
      } else {
        setTimeout(() => {
          setHistory([]);
          setLineIdx(0);
          setPhase("user");
        }, 3000);
      }
    }, 1800);
  };

  return (
    <div
      style={{
        background: "rgba(10,10,10,0.95)",
        border: "1px solid rgba(57,255,20,0.2)",
        borderRadius: 20,
        padding: "0",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.82rem",
        overflow: "hidden",
        boxShadow: "0 0 60px rgba(57,255,20,0.08)",
        width: "100%",
        maxWidth: 640,
      }}
    >
      {/* Terminal bar */}
      <div
        style={{
          background: "#0f0f0f",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ff5f56",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ffbd2e",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#27c93f",
            display: "inline-block",
          }}
        />
        <span style={{ color: "#444", marginLeft: 10, fontSize: "0.75rem" }}>
          syncnol-agent — zsh
        </span>
      </div>

      <div
        style={{
          padding: "20px 20px",
          minHeight: 280,
          maxHeight: 360,
          overflowY: "auto",
        }}
      >
        <div style={{ color: "#39ff14", marginBottom: 16 }}>
          {"> "}
          <span style={{ color: "#a0a0a0" }}>
            SyncNol Agent v2.0 — Roast Mode Active 🔥
          </span>
        </div>

        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {h.type === "user" ? (
              <div style={{ color: "#a0a0a0" }}>
                <span style={{ color: "#39ff14" }}>you@wallet:~$ </span>
                {h.text}
              </div>
            ) : (
              <div
                style={{
                  color: "#f0f0f0",
                  background: "rgba(57,255,20,0.04)",
                  padding: "10px 14px",
                  borderRadius: 10,
                  borderLeft: "2px solid rgba(57,255,20,0.4)",
                  marginTop: 6,
                }}
              >
                <span style={{ color: "#39ff14", marginRight: 8 }}>
                  ⚡ agent:
                </span>
                {h.text}
              </div>
            )}
          </div>
        ))}

        {/* Active line */}
        {phase === "user" && (
          <div style={{ color: "#a0a0a0" }}>
            <span style={{ color: "#39ff14" }}>you@wallet:~$ </span>
            <TypewriterText
              text={TYPING_LINES[lineIdx].user}
              onDone={handleUserDone}
            />
            <span className="animate-blink" style={{ color: "#39ff14" }}>
              ▊
            </span>
          </div>
        )}
        {phase === "ai" && (
          <div
            style={{
              color: "#f0f0f0",
              background: "rgba(57,255,20,0.04)",
              padding: "10px 14px",
              borderRadius: 10,
              borderLeft: "2px solid rgba(57,255,20,0.4)",
              marginTop: 6,
            }}
          >
            <span style={{ color: "#39ff14", marginRight: 8 }}>⚡ agent:</span>
            <TypewriterText
              text={TYPING_LINES[lineIdx].ai}
              speed={14}
              onDone={handleAiDone}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-void)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        className="bg-grid"
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Glow orbs */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "10%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          right: "5%",
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(5,5,5,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(57,255,20,0.4)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>⚡</span>
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "1.15rem",
              letterSpacing: "-0.02em",
            }}
          >
            Sync<span style={{ color: "var(--accent)" }}>Nol</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            to="/auth"
            className="btn btn-ghost"
            style={{ padding: "9px 20px", fontSize: "0.85rem" }}
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="btn btn-primary"
            style={{ padding: "9px 20px", fontSize: "0.85rem" }}
          >
            Deploy Agent →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          className="badge badge-accent animate-fadeInUp"
          style={{ marginBottom: 24 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
              boxShadow: "0 0 6px var(--accent)",
            }}
          />
          AI-Powered • Agentic • Free
        </div>

        <h1
          className="animate-fadeInUp delay-100"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Stop Tracking Your Money.
          <br />
          <span className="gradient-text">Let AI Command It.</span>
        </h1>

        <p
          className="animate-fadeInUp delay-200"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--text-secondary)",
            maxWidth: 580,
            marginBottom: 48,
            lineHeight: 1.7,
          }}
        >
          SyncNol is not a budgeting app. It's an AI financial exoskeleton that
          hunts down your debt, intercepts impulse buys, and builds wealth while
          you sleep.
        </p>

        <div
          className="animate-fadeInUp delay-300"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 80,
          }}
        >
          <Link
            to="/auth?mode=signup"
            className="btn btn-primary"
            style={{ padding: "16px 36px", fontSize: "1rem" }}
          >
            ⚡ Deploy Your Agent
          </Link>
          <a
            href="#demo"
            className="btn btn-ghost"
            style={{ padding: "16px 32px", fontSize: "1rem" }}
          >
            Watch the Demo ↓
          </a>
        </div>

        {/* Floating stat cards */}
        <div
          className="animate-fadeInUp delay-400"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { label: "Avg Debt Paid Off", value: "4.2mo", icon: "🏦" },
            { label: "Leaks Detected", value: "3.1/user", icon: "🔍" },
            { label: "Net Worth Growth", value: "+28%", icon: "📈" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass"
              style={{
                padding: "14px 24px",
                borderRadius: 16,
                textAlign: "center",
                minWidth: 130,
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO TERMINAL */}
      <section
        id="demo"
        style={{
          padding: "80px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="badge badge-accent" style={{ marginBottom: 20 }}>
          Live Demo
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 12,
            letterSpacing: "-0.03em",
          }}
        >
          Get <span className="gradient-text">Roasted</span> by the AI
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 40,
            textAlign: "center",
            maxWidth: 480,
          }}
        >
          This is how SyncNol talks to you. Brutally honest. No sugarcoating.
          Pure financial truth.
        </p>
        <DemoTerminal />
      </section>

      {/* FEATURES */}
      <section
        style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>
            The Arsenal
          </div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Six Weapons. One Goal.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card card-accent animate-fadeInUp"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: 10,
                  color: "var(--accent)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px 120px", textAlign: "center" }}>
        <div
          className="glass"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "60px 40px",
            borderRadius: 28,
            background:
              "linear-gradient(135deg, rgba(57,255,20,0.05) 0%, rgba(15,15,15,0.9) 100%)",
            borderColor: "var(--border-accent)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: 16,
            }}
          >
            Your financial life is
            <br />
            <span className="gradient-text">waiting for orders.</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 36,
              fontSize: "1rem",
            }}
          >
            Join thousands of agents already commanding their wealth.
          </p>
          <Link
            to="/auth?mode=signup"
            className="btn btn-primary"
            style={{ padding: "18px 44px", fontSize: "1.05rem" }}
          >
            ⚡ Deploy Your Agent — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          © 2026 SyncNol. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link
            to="/privacy"
            style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
