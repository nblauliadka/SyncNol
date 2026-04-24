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
import toast from "react-hot-toast";
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
  Plus,
  X
} from "lucide-react";

const formatIDR = (num) => new Intl.NumberFormat('id-ID').format(num);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const GREETINGS = [
  "Pagi. Kekayaan stabil, tapi tagihan server besok. Kurangi kopi hari ini.",
  "Agen. Tingkat tabunganmu turun 3% bulan ini. Kita perlu bicara.",
  "Selamat pagi. Ada 2 kebocoran rutin yang belum kuberitahu. Buka Bebas Hutang.",
  "Kembali lagi. Dana daruratmu cukup untuk 12 hari. Targetnya 90. Fokus.",
  "Bangun dan bekerja. Pendapatan pasif: Rp 0. Pendapatan aktif: stagnan. Waktunya perbaiki keduanya.",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
          {label}
        </p>
        <p className="text-fintech-primary font-bold text-sm font-mono">
          {formatIDR(payload[0].value)}
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
  const [messages, setMessages] = useState([]);
  const [persona, setPersona] = useState("Keras");
  const [showPersonas, setShowPersonas] = useState(false);
  const chatEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [netWorth, setNetWorth] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [chartData, setChartData] = useState([]);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualType, setManualType] = useState("Expense");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDesc, setManualDesc] = useState("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Pengenalan suara tidak didukung di browser ini.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchData = useCallback(async () => {
    if (!dbUserId) return;
    try {
      // PHASE 1.3: Centralized Data Fetching Verified
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
  }, [messages]);

  const handleChat = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() && !selectedImage) return;
    const userMsg = { sender: "user", text: chatInput || "Mengirim gambar", image: selectedImage };
    setMessages((p) => [...p, userMsg]);
    setChatInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setChatLoading(true);
    try {
      // PHASE 1.2: J.A.R.V.I.S State Reconciliation
      let apiUrl = "http://127.0.0.1:8000/api/nudge";
      let requestBody = { pesan_user: userMsg.text, user_id: dbUserId };
      
      if (userMsg.image) {
        apiUrl = "http://127.0.0.1:8000/api/chat";
        requestBody = { message: userMsg.text, image: userMsg.image };
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      let aiText = data.ai_roast || data.response || "Tidak ada respons";

      setMessages((p) => [...p, { sender: "ai", text: aiText }]);
      await fetchData();
    } catch {
      setMessages((p) => [
        ...p,
        {
          sender: "ai",
          text: "Agen offline. Backend tidak terjangkau. Periksa server Anda.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const baseNetWorth = summary.net_worth || 0;
    const baseDebt = summary.total_utang || 0;

    setNetWorth(baseNetWorth);
    setTotalDebt(baseDebt);

    // Daily Budget: (Total Cash - Total Debt) / Remaining Days in Month
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - today.getDate() + 1);
    const availableCash = Math.max(0, baseNetWorth - baseDebt);
    setDailyBudget(Math.floor(availableCash / remainingDays));

    // No dummy data — only render chart when real transactions exist
    if (transactions.length > 0) {
      let balance = baseNetWorth;
      const points = [...transactions].reverse().map((t) => {
        const point = {
          name: new Date(t.tanggal || Date.now()).toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
          balance,
        };
        if (t.jenis === "Pemasukan") balance -= t.nominal;
        else balance += t.nominal;
        return point;
      });
      setChartData([{ name: "Mulai", balance }, ...points]);
    } else {
      setChartData([]);
    }
  }, [summary, transactions]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const rawAmount = manualAmount || 0;
    if (rawAmount === 0 || !dbUserId) return;

    try {
      const typeStr = manualType === "Income" ? "Pemasukan" : "Pengeluaran";
      const catStr = manualType === "Debt Payment" ? "Bayar Utang" : (manualDesc || "Manual");
      
      // PHASE 1.1: Dashboard Manual Entry Sync - Async write to DB BEFORE local store update
      const res = await axios.post("http://127.0.0.1:8000/api/transactions", {
        jenis_transaksi: typeStr,
        kategori: catStr,
        nominal: rawAmount,
        keterangan: manualDesc || manualType,
        user_id: dbUserId
      });

      if (res.data.status === "success") {
        toast.success("Data tersinkronisasi ke database.");
        // Fetch the latest state directly from backend to avoid overwriting with stale data
        await fetchData();

        setShowManualModal(false);
        setManualAmount("");
        setManualDesc("");
      } else {
        toast.error("Gagal menyimpan: " + res.data.pesan);
      }
    } catch (error) {
      console.error("Manual entry error:", error);
      toast.error("Gagal sinkronisasi ke database.");
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setManualAmount(parseInt(rawValue, 10));
    } else if (rawValue === "") {
      setManualAmount("");
    }
  };

  const dailyBudgetColor =
    dailyBudget <= 0
      ? "text-red-500"
      : dailyBudget < 50000
        ? "text-amber-500"
        : "text-fintech-primary";

  const netWorthColor =
    netWorth < 0
      ? "text-red-500"
      : "text-slate-900 dark:text-white";

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors";

  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">
      {/* HEADER HERO */}
      <div className="flex items-end justify-between flex-shrink-0 mb-2">
        <div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            Total Kekayaan
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none truncate ${netWorthColor}`}>
              {formatIDR(netWorth)}
            </h1>
            {netWorth < 0 ? (
              <span className="flex items-center gap-1 text-sm md:text-base font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20 px-2.5 py-1 rounded-xl">
                <ArrowDownRight size={16} /> Defisit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm md:text-base font-bold text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/10 px-2.5 py-1 rounded-xl">
                <ArrowUpRight size={16} /> +{formatIDR(2500000)} (5.2%) Hari Ini
              </span>
            )}
          </div>
        </div>
        <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 text-right flex-shrink-0 font-medium hidden sm:block">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6">

        {/* CHART */}
        <div className={`${cardClass} w-full md:col-span-8`}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Activity size={16} className="text-fintech-primary" /> Grafik Kekayaan
            </h3>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-fintech-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
              Langsung
            </span>
          </div>
          <div className="w-full h-[220px]">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <Activity size={32} className="text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">Belum Ada Data</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 max-w-[200px]">
                  Catat transaksi pertamamu untuk melihat grafik kekayaan.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
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
                    domain={['auto', 'auto']}
                    width={85}
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-600 text-[10px]"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => formatIDR(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#0EA5E9"
                    strokeWidth={2.5}
                    fill="url(#wealthGradient)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI CHAT */}
        <div
          className={`${cardClass} w-full md:col-span-4 md:row-span-2 !p-0 flex flex-col min-h-[350px] md:min-h-0`}
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
                  Inti FinTech
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-fintech-primary/10 text-fintech-primary border border-fintech-primary/20 px-3 py-1.5 rounded-md hover:bg-fintech-primary/20 transition-colors"
              >
                <Plus size={14} /> Manual
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowPersonas(!showPersonas)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  {persona} <ChevronDown size={14} />
                </button>
                {showPersonas && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
                    {["Keras", "Tegas", "Ramah"].map((p) => (
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
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-50">
                <Zap size={32} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">
                  "Jarvis, catat gaji 5 juta hari ini"
                  <br /> Coba tanyakan apa saja.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
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
                  {m.image && (
                    <img src={m.image} alt="Upload preview" className="w-32 h-32 object-cover rounded-lg mb-2 border border-slate-200 dark:border-slate-700" />
                  )}
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
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm w-fit text-sm text-slate-500 dark:text-slate-400 italic">
                J.A.R.V.I.S sedang mengetik...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChat(e);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex-shrink-0 mt-auto"
          >
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  &times;
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-[#0B0F19] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-fintech-primary/50 transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-fintech-primary transition-colors flex-shrink-0"
                title="OCR Receipt Drop"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Catat pengeluaran, bagi tagihan..."
                disabled={chatLoading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 transition-colors flex-shrink-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-fintech-primary'}`}
                title="Input Suara"
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                disabled={chatLoading || (!chatInput.trim() && !selectedImage)}
                className="w-8 h-8 bg-fintech-primary hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-fintech-primary flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* DAILY BUDGET CARD */}
        <div
          className={`${cardClass} w-full md:col-span-4 justify-between !p-4`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              <ShieldAlert size={16} /> Batas Jajan Harian
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl lg:text-4xl font-black tracking-tight ${dailyBudgetColor}`}>
                {formatIDR(dailyBudget)}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/hari</span>
            </div>
            {dailyBudget <= 0 ? (
              <div className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                ⚠️ Aset bersih habis atau defisit. Stop pengeluaran!
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                (Total Kas − Utang) ÷ sisa hari bulan ini
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Aman</span>
              <span>Rp {formatIDR(100000)}/hari</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  dailyBudget <= 0 ? "bg-red-500" : dailyBudget < 50000 ? "bg-amber-500" : "bg-fintech-primary"
                }`}
                style={{ width: `${Math.min((dailyBudget / 100000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* PANIC BUTTON + DEBT */}
        <div
          className={`${cardClass} w-full md:col-span-4 justify-between !p-4`}
        >
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Total Utang
            </div>
            <div
              className={`text-2xl lg:text-3xl font-black tracking-tight truncate ${totalDebt > 0 ? "text-red-500" : "text-slate-900 dark:text-white"}`}
            >
              {formatIDR(totalDebt)}
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
            {panicMode ? "PEMBELIAN IMPULSIF TERDETEKSI" : "Panik / Pembelian Impulsif"}
          </button>
        </div>
      </div>

      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="text-fintech-primary" /> Entry Manual
              </h2>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Jenis Transaksi</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Income", "Expense", "Debt Payment"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setManualType(t)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-colors ${manualType === t ? "bg-fintech-primary text-white border-fintech-primary" : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {t === "Income" ? "Pemasukan" : t === "Expense" ? "Pengeluaran" : "Bayar Utang"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Nominal (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input
                    type="text"
                    value={manualAmount ? formatIDR(manualAmount) : ""}
                    onChange={handleAmountChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-fintech-primary/50 outline-none transition-all"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Kategori / Catatan</label>
                <input
                  type="text"
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-fintech-primary/50 outline-none transition-all text-sm"
                  placeholder="Makan siang, Gaji, dll..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

