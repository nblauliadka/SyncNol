import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import useAppStore from "../store/useAppStore";
import {
  Send,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  AlertTriangle,
  Mic,
  Paperclip,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

const GREETINGS = [
  "Morning. Net worth stable, but server bills hit tomorrow. Cut the coffee today.",
  "Agent. Your savings rate dropped 3% this month. We need to talk.",
  "Good morning. You have 2 recurring leaks I haven't told you about yet. Open Antigravity.",
  "Back again. Your emergency fund covers 12 days. The target is 90. Focus.",
  "Rise and grind. Passive income: Rp 0. Active income: stagnant. Time to fix both.",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
          {label}
        </p>
        <p className="text-fintech-primary font-bold text-sm font-mono">
          Rp {payload[0].value?.toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dbUserId, summary, transactions, setSummary, setTransactions } =
    useAppStore();

  const [greeting] = useState(
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
  );
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [localChat, setLocalChat] = useState([]);
  const [persona, setPersona] = useState("Roast");
  const [showPersonas, setShowPersonas] = useState(false);
  const chatEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!dbUserId) return;
    try {
      const [sumRes, trxRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/users/${dbUserId}/summary`),
        axios.get(`http://127.0.0.1:8000/api/users/${dbUserId}/transactions`),
      ]);
      if (sumRes.data.status === "success") setSummary(sumRes.data.data);
      if (trxRes.data.status === "success") setTransactions(trxRes.data.data);
    } catch (e) {
      console.error("Data fetch error:", e);
    }
  }, [dbUserId, setSummary, setTransactions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localChat]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !dbUserId) return;
    const userMsg = { sender: "user", text: chatInput };
    setLocalChat((p) => [...p, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      // Pass persona down to the nudge API (even if backend ignores it for now)
      const res = await axios.post("http://127.0.0.1:8000/api/nudge", {
        user_id: dbUserId,
        pesan_user: userMsg.text,
        persona,
      });
      let aiText = res.data.ai_roast;

      // MOCK ACTIONABLE OUTPUT PARSING
      let action = null;
      if (userMsg.text.toLowerCase().includes("split")) {
        aiText =
          "I've calculated the split. Rp 150,000 per person for 3 people.";
        action = { type: "wingman", label: "Launch Wingman QRIS" };
      } else if (userMsg.text.toLowerCase().includes("lock")) {
        aiText =
          "Locking 500k into The Vault. You will need to solve a math puzzle to release it.";
        action = { type: "vault", label: "View The Vault" };
      }

      setLocalChat((p) => [...p, { sender: "ai", text: aiText, action }]);
      fetchData();
    } catch {
      setLocalChat((p) => [
        ...p,
        {
          sender: "ai",
          text: "Agent offline. Backend unreachable. Check your server.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const monthlyIncome = summary.monthly_income || 0;
  const runwayDays =
    monthlyIncome > 0 && summary.net_worth > 0
      ? Math.floor(summary.net_worth / (monthlyIncome / 30))
      : 0;
  const runwayColor =
    runwayDays < 30
      ? "text-red-500 bg-red-500"
      : runwayDays < 90
        ? "text-amber-500 bg-amber-500"
        : "text-fintech-primary bg-fintech-primary";

  const chartData = (() => {
    if (!transactions.length)
      return [{ name: "Now", balance: summary.net_worth }];
    let balance = summary.net_worth;
    const points = [...transactions].reverse().map((t) => {
      const point = {
        name: new Date(t.tanggal || Date.now()).toLocaleDateString("id-ID", {
          month: "short",
          day: "numeric",
        }),
        balance,
      };
      if (t.jenis === "Pemasukan") balance -= t.nominal;
      else balance += t.nominal;
      return point;
    });
    return [{ name: "Start", balance }, ...points];
  })();

  // Base card class
  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-hidden min-h-0 bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER ROW */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-fintech-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Morning Briefing
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-mono">
            <span className="text-fintech-primary">⚡</span> <em>{greeting}</em>
          </p>
        </div>
        <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-right flex-shrink-0 font-medium">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 grid-rows-none lg:grid-rows-2 gap-4 lg:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* NET WORTH — spans 3 cols, 2 rows */}
        <div
          className={`${cardClass} lg:col-span-3 lg:row-span-2 justify-between bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-900`}
        >
          <div className="absolute -top-10 -right-10 text-9xl opacity-5 pointer-events-none select-none">
            💰
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Total Net Worth
            </div>
            <div className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-2 truncate">
              Rp {summary.net_worth.toLocaleString("id-ID")}
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Assets & Equity
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-3 mt-8">
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <ArrowUpRight size={14} className="text-green-500" /> Income
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                +Rp {(summary.pemasukan / 1e6).toFixed(1)}M
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <ArrowDownRight size={14} className="text-red-500" /> Expense
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                -Rp {(summary.pengeluaran / 1e6).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>

        {/* CHART — spans 6 cols, 1 row */}
        <div className={`${cardClass} lg:col-span-6 lg:row-span-1`}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Activity size={16} className="text-fintech-primary" /> Wealth
              Trajectory
            </h3>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-fintech-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
              Live
            </span>
          </div>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600 text-[10px]"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600 text-[10px]"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#wealthGrad)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#3B82F6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI CHAT — spans 3 cols, 2 rows */}
        <div
          className={`${cardClass} lg:col-span-3 lg:row-span-2 !p-0 flex flex-col`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0 relative">
                <Zap size={16} fill="currentColor" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  J.A.R.V.I.S
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  FinTech Core
                </div>
              </div>
            </div>

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPersonas(!showPersonas)}
                className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                {persona} <ChevronDown size={14} />
              </button>
              {showPersonas && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
                  {["Roast", "Strict", "Friendly"].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPersona(p);
                        setShowPersonas(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {localChat.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-50">
                <Zap size={32} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">
                  "Jarvis, logged my 5M salary today"
                  <br /> Try logging a transaction.
                </p>
              </div>
            )}
            {localChat.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`
                  max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${
                    m.sender === "user"
                      ? "bg-fintech-primary text-white rounded-2xl rounded-tr-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700"
                  }
                `}
                >
                  {m.text}
                  {m.action && (
                    <button
                      onClick={() => navigate(`/app/${m.action.type}`)}
                      className="mt-3 w-full bg-white dark:bg-slate-900 text-fintech-primary border border-slate-200 dark:border-slate-700 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <CheckCircle size={14} /> {m.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm w-fit">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-fintech-primary animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-fintech-primary animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-fintech-primary animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleChat}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-900 flex-shrink-0"
          >
            <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-fintech-primary/50 transition-all">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-fintech-primary transition-colors flex-shrink-0"
                title="OCR Receipt Drop"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Log expense, split bill..."
                disabled={chatLoading}
                className="flex-1 bg-transparent border-none px-1 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-fintech-primary transition-colors flex-shrink-0"
                title="Voice Input"
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="w-10 h-10 bg-fintech-primary hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-fintech-primary flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* RUNWAY METER — spans 3 cols, 1 row */}
        <div
          className={`${cardClass} lg:col-span-3 lg:row-span-1 justify-between`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              <ShieldAlert size={16} /> Survival Runway
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-black tracking-tight ${runwayColor.split(" ")[0]}`}
              >
                {runwayDays}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                days
              </span>
            </div>
            {monthlyIncome === 0 ? (
              <div className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                ⚠️ Update income to calculate runway
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Based on base income (Rp {(monthlyIncome / 1e6).toFixed(1)}M/mo)
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>0</span>
              <span>90d goal</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${runwayColor.split(" ")[1]}`}
                style={{ width: `${Math.min((runwayDays / 90) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* PANIC BUTTON + DEBT — spans 3 cols, 1 row */}
        <div
          className={`${cardClass} lg:col-span-3 lg:row-span-1 justify-between`}
        >
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Total Debt
            </div>
            <div
              className={`text-2xl lg:text-3xl font-black tracking-tight truncate ${summary.total_utang > 0 ? "text-red-500" : "text-slate-900 dark:text-white"}`}
            >
              Rp {summary.total_utang.toLocaleString("id-ID")}
            </div>
          </div>

          <button
            onClick={() => {
              setPanicMode(true);
              setTimeout(() => setPanicMode(false), 3000);
            }}
            className={`
              w-full p-4 rounded-xl font-bold text-sm transition-all duration-200 mt-6 flex items-center justify-center gap-2
              ${
                panicMode
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/40 scale-[0.98]"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40"
              }
            `}
          >
            <AlertTriangle
              size={18}
              className={panicMode ? "animate-bounce" : ""}
            />
            {panicMode ? "IMPULSE BUY DETECTED" : "Panic / Impulse Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}
