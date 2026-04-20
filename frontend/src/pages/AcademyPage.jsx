import { useState } from "react";
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  Trophy,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

const MODULES = [
  {
    id: 1,
    title: "The Psychology of Money",
    progress: 100,
    duration: "45m",
    type: "core",
  },
  {
    id: 2,
    title: "Mastering the Snowball Method",
    progress: 45,
    duration: "1h 20m",
    type: "core",
  },
  {
    id: 3,
    title: "Asset Allocation Theory",
    progress: 0,
    duration: "2h",
    type: "advanced",
  },
];

export default function AcademyPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUrl("");
      alert("AI Curriculum Generated! (Simulation)");
    }, 2000);
  };

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
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
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30 font-bold text-sm">
          <Trophy size={16} /> 1,250 XP
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GENERATOR */}
        <div
          className={`${cardClass} lg:col-span-12 bg-gradient-to-br from-blue-900 to-slate-900 text-white border-none relative overflow-hidden`}
        >
          <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
            <Sparkles size={250} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-black mb-2">
              Generate Custom Curriculum
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Drop a YouTube link, PDF URL, or article. J.A.R.V.I.S will
              instantly convert it into a step-by-step interactive financial
              lesson with quizzes.
            </p>

            <form
              onSubmit={handleGenerate}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-white/20 transition-colors">
                <LinkIcon size={18} className="text-blue-300" />
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-transparent border-none text-white placeholder-blue-200/50 outline-none w-full text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-fintech-accent hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Synthesize"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CURRICULUM PATH */}
        <div className={`${cardClass} lg:col-span-12`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <BookOpen size={20} className="text-fintech-primary" /> Active
            Learning Paths
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODULES.map((mod) => (
              <div
                key={mod.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-fintech-primary dark:hover:border-fintech-primary transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      mod.type === "core"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {mod.type}
                  </div>
                  {mod.progress === 100 ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <PlayCircle
                      size={20}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-fintech-primary transition-colors"
                    />
                  )}
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2 leading-tight">
                  {mod.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  <span>{mod.duration}</span>
                  <span>{mod.progress}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mod.progress === 100 ? "bg-green-500" : "bg-fintech-primary"}`}
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
