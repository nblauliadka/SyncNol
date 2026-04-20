import { useState } from "react";
import { FileText, Download, CheckCircle2, ChevronRight } from "lucide-react";
import useAppStore from "../store/useAppStore";

export default function ReportsPage() {
  const { summary } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [config, setConfig] = useState({
    month: new Date().toISOString().split("T")[0].slice(0, 7),
    includeLedger: true,
    includeCharts: true,
    aiOpinion: true,
  });

  const handleGenerate = () => {
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Simulate download prompt or window print
      // window.print()
    }, 2500);
  };

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Export
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Boardroom Reports
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
        {/* CONFIGURATION */}
        <div className={`${cardClass} lg:col-span-5 flex flex-col gap-6`}>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your formal PDF report parameters.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Report Period
              </label>
              <input
                type="month"
                value={config.month}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, month: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                Include Modules
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={config.includeLedger}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      includeLedger: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-fintech-primary focus:ring-fintech-primary"
                />
                <span className="text-sm font-semibold">
                  Full Transaction Ledger
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      includeCharts: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-fintech-primary focus:ring-fintech-primary"
                />
                <span className="text-sm font-semibold">
                  Visual Analytics & Charts
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={config.aiOpinion}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, aiOpinion: e.target.checked }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-fintech-primary focus:ring-fintech-primary"
                />
                <div>
                  <span className="text-sm font-semibold flex items-center gap-2">
                    J.A.R.V.I.S Opinion Letter{" "}
                    <span className="bg-fintech-primary/10 text-fintech-primary text-[10px] px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                success
                  ? "bg-green-500 text-white"
                  : "bg-fintech-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 size={18} /> Ready for Download
                </>
              ) : (
                <>
                  <Download size={18} /> Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="w-full max-w-md aspect-[1/1.4] bg-white dark:bg-gray-100 rounded border border-slate-200 shadow-2xl overflow-hidden relative group">
            {/* Mock PDF Header */}
            <div className="absolute top-0 w-full h-1/4 bg-slate-900 flex flex-col justify-end p-8 text-white">
              <div className="text-2xl font-serif">SyncNol Financial</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                {config.month} Report
              </div>
            </div>

            {/* Mock Body */}
            <div className="absolute top-1/4 w-full h-3/4 p-8 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="w-1/2 h-20 bg-slate-100 rounded-sm" />
                <div className="w-1/2 h-20 bg-slate-100 rounded-sm" />
              </div>

              {config.includeCharts && (
                <div className="w-full h-32 bg-slate-100 rounded-sm flex items-center justify-center">
                  <div className="text-xs text-slate-300 font-bold uppercase">
                    Chart Data
                  </div>
                </div>
              )}

              {config.includeLedger && (
                <div className="space-y-2">
                  <div className="w-full h-4 bg-slate-100 rounded-sm" />
                  <div className="w-[90%] h-4 bg-slate-100 rounded-sm" />
                  <div className="w-[95%] h-4 bg-slate-100 rounded-sm" />
                  <div className="w-[80%] h-4 bg-slate-100 rounded-sm" />
                </div>
              )}

              {config.aiOpinion && (
                <div className="mt-auto w-full h-24 bg-blue-50 border border-blue-100 rounded-sm p-3">
                  <div className="w-1/3 h-3 bg-blue-200 rounded-sm mb-3" />
                  <div className="w-full h-2 bg-blue-100 rounded-sm mb-1.5" />
                  <div className="w-full h-2 bg-blue-100 rounded-sm mb-1.5" />
                  <div className="w-2/3 h-2 bg-blue-100 rounded-sm" />
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div
              className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center opacity-0 ${success ? "opacity-100" : "group-hover:opacity-100"} transition-opacity`}
            >
              <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                <FileText size={18} /> View PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
