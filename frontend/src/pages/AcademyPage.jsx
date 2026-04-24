import { useState, useEffect } from "react";
import {
  GraduationCap,
  PlayCircle,
  Trophy,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  ChevronRight,
  Flame,
  MonitorPlay,
  Lock,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { academyModules } from "../data/academyData";

// ── Static supplementary content ────────────────────────────────────────────
const CATEGORIES = ["Semua", "Dasar", "Investasi", "Utang", "Asuransi", "Lanjutan"];

const ARTICLES = [
  {
    id: 1,
    title: "5 Kebiasaan Keuangan Orang Kaya yang Bisa Anda Tiru Mulai Hari Ini",
    tag: "Mindset",
    readTime: "4 menit",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "Cara Kerja Bunga Majemuk: Mengapa Warren Buffet Menyebutnya Keajaiban Dunia ke-8",
    tag: "Investasi",
    readTime: "6 menit",
    color: "bg-purple-600",
  },
  {
    id: 3,
    title: "Inflasi Tersembunyi: Bagaimana Lifestyle Creep Mencuri Masa Depan Anda",
    tag: "Utang",
    readTime: "3 menit",
    color: "bg-rose-600",
  },
];

// ── XP Level thresholds ──────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
const LEVEL_NAMES = ["Pemula", "Financial Rookie", "Financial Analyst", "Money Expert", "Wealth Builder", "Finance Master"];

function getLevelInfo(xp) {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  const nextLevelXp = LEVEL_THRESHOLDS[level + 1] ?? null;
  return { level: level + 1, name: LEVEL_NAMES[level], nextLevelXp };
}

// ── Level badge color helper ─────────────────────────────────────────────────
function levelColor(level) {
  const map = {
    1: "from-slate-500 to-slate-700",
    2: "from-blue-500 to-blue-700",
    3: "from-purple-500 to-purple-700",
  };
  return map[level] ?? "from-indigo-500 to-indigo-700";
}

// ── Main Component ───────────────────────────────────────────────────────────
const USER_ID = 1; // Hardcoded MVP user

export default function AcademyPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [openModule, setOpenModule] = useState(null);       // module object currently in modal
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState(null);                 // { msg, type }

  // ── Fetch completed module IDs from Supabase on mount ───────────────────
  useEffect(() => {
    async function fetchProgress() {
      setLoadingProgress(true);
      const { data, error } = await supabase
        .from("academy_progress")
        .select("module_id")
        .eq("user_id", USER_ID);

      if (!error && data) {
        setCompletedIds(new Set(data.map((row) => row.module_id)));
      }
      setLoadingProgress(false);
    }
    fetchProgress();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalXP = academyModules
    .filter((m) => completedIds.has(m.id))
    .reduce((acc, m) => acc + m.xpReward, 0);

  const completedCount = completedIds.size;
  const levelInfo = getLevelInfo(totalXP);

  // ── Filtered modules for the grid ───────────────────────────────────────
  const filtered =
    activeCategory === "Semua"
      ? academyModules
      : academyModules.filter((m) => m.category === activeCategory);

  // ── Mark a module as complete via Supabase ───────────────────────────────
  async function handleClaim(module) {
    if (completedIds.has(module.id) || claiming) return;
    setClaiming(true);

    // Check if already in DB to avoid duplicate constraint errors
    const { data: existing } = await supabase
      .from("academy_progress")
      .select("id")
      .eq("user_id", USER_ID)
      .eq("module_id", module.id)
      .maybeSingle();

    if (existing) {
      setCompletedIds((prev) => new Set([...prev, module.id]));
      setClaiming(false);
      return;
    }

    const { error } = await supabase
      .from("academy_progress")
      .insert({ user_id: USER_ID, module_id: module.id });

    if (!error) {
      setCompletedIds((prev) => new Set([...prev, module.id]));
      showToast(`+${module.xpReward} XP diklaim! 🎉`, "success");
    } else {
      showToast("Gagal menyimpan progress. Coba lagi.", "error");
    }
    setClaiming(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm";

  // ── Featured module (first incomplete, or last module) ───────────────────
  const featuredModule =
    academyModules.find((m) => !completedIds.has(m.id)) ??
    academyModules[academyModules.length - 1];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">

      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold transition-all animate-bounce ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <Zap size={16} /> {toast.msg}
        </div>
      )}

      {/* ── VIDEO MODAL ── */}
      {openModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpenModule(null)}
        >
          <div
            className="bg-[#111827] rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="relative aspect-video bg-slate-900">
              <iframe
                src={`https://www.youtube.com/embed/${openModule.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                title={openModule.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r ${levelColor(openModule.level)}`}>
                      Level {openModule.level}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {openModule.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight">{openModule.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{openModule.description}</p>
                </div>
                <button
                  onClick={() => setOpenModule(null)}
                  className="text-slate-500 hover:text-white transition-colors flex-shrink-0 mt-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Claim button */}
              {completedIds.has(openModule.id) ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-green-900/30 border border-green-700/40 text-green-400 font-bold text-sm">
                  <CheckCircle2 size={18} /> Modul Selesai — XP Sudah Diklaim!
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(openModule)}
                  disabled={claiming}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-fintech-primary to-blue-500 text-white font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {claiming ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Trophy size={16} /> Tandai Selesai & Klaim {openModule.xpReward} XP</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Academy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kuasai literasi finansial. Satu modul pada satu waktu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loadingProgress ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Memuat progress...
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30 font-bold text-sm">
                <Trophy size={16} /> {totalXP.toLocaleString("id-ID")} XP
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl border border-green-100 dark:border-green-900/30 font-bold text-sm">
                <CheckCircle2 size={16} /> {completedCount}/{academyModules.length} Selesai
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── XP PROGRESS BAR ── */}
      <div className={`${cardClass} p-5`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Level {levelInfo.level} — {levelInfo.name}
            </span>
            {levelInfo.nextLevelXp ? (
              <p className="text-xs text-slate-400 mt-0.5">
                Butuh {(levelInfo.nextLevelXp - totalXP).toLocaleString("id-ID")} XP lagi untuk level berikutnya
              </p>
            ) : (
              <p className="text-xs text-green-400 mt-0.5">🎉 Level Maksimum Tercapai!</p>
            )}
          </div>
          <span className="text-lg font-black text-fintech-primary">
            {totalXP.toLocaleString("id-ID")} / {(levelInfo.nextLevelXp ?? totalXP).toLocaleString("id-ID")} XP
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fintech-primary to-blue-400 transition-all duration-1000"
            style={{
              width: `${levelInfo.nextLevelXp
                ? Math.min(((totalXP - (LEVEL_THRESHOLDS[levelInfo.level - 1] ?? 0)) / (levelInfo.nextLevelXp - (LEVEL_THRESHOLDS[levelInfo.level - 1] ?? 0))) * 100, 100)
                : 100}%`,
            }}
          />
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div
        className={`${cardClass} bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white border-none relative overflow-hidden`}
      >
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
          <Sparkles size={220} />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">
                {completedIds.has(featuredModule.id) ? "Modul Terakhir Diselesaikan" : "Lanjutkan Belajar"}
              </div>
              <h2 className="text-xl md:text-2xl font-black mb-2 leading-tight">
                {featuredModule.title}
              </h2>
              <p className="text-slate-300 text-sm mb-5 max-w-lg">
                {featuredModule.description}
              </p>
              <button
                onClick={() => setOpenModule(featuredModule)}
                className="flex items-center gap-2 bg-white text-blue-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                <PlayCircle size={18} />
                {completedIds.has(featuredModule.id) ? "Tonton Ulang" : "Mulai Modul"} <ChevronRight size={16} />
              </button>
            </div>
            <div className="hidden md:flex flex-col items-center gap-1 bg-white/10 border border-white/20 rounded-2xl p-4 flex-shrink-0">
              <Flame size={32} className="text-amber-300" />
              <span className="text-2xl font-black">{completedCount}</span>
              <span className="text-xs text-blue-300">Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? "bg-fintech-primary text-white shadow-sm shadow-blue-500/30"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── LEARNING MODULES GRID ── */}
      <div>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
          <MonitorPlay size={18} className="text-fintech-primary" /> Modul Belajar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((module) => {
            const isCompleted = completedIds.has(module.id);
            return (
              <div
                key={module.id}
                onClick={() => setOpenModule(module)}
                className={`${cardClass} p-5 cursor-pointer group hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                  isCompleted ? "opacity-70" : "hover:-translate-y-1"
                }`}
              >
                {/* Completed overlay badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    <CheckCircle2 size={10} /> Selesai
                  </div>
                )}

                {/* Level + Category */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r ${levelColor(
                      module.level
                    )}`}
                  >
                    Level {module.level}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {module.duration}
                  </span>
                </div>

                {/* Title + desc */}
                <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-fintech-primary transition-colors">
                  {module.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {module.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                    <Star size={13} fill="currentColor" /> {module.xpReward} XP
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                      isCompleted
                        ? "text-green-500"
                        : "text-slate-400 group-hover:text-fintech-primary"
                    }`}
                  >
                    {isCompleted ? (
                      <><CheckCircle2 size={14} /> Diklaim</>
                    ) : (
                      <><PlayCircle size={14} /> Tonton <ChevronRight size={12} /></>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ARTICLES ── */}
      <div>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-fintech-primary" /> Artikel Terkurasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARTICLES.map((article) => (
            <div
              key={article.id}
              className={`${cardClass} p-5 cursor-pointer hover:shadow-md transition-all group`}
            >
              <div
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white ${article.color} mb-3`}
              >
                {article.tag}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-fintech-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {article.readTime}
                </span>
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-fintech-primary transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
