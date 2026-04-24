import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Globe,
  Zap,
  AlertTriangle,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import useAppStore from "../store/useAppStore";
import { useLanguage } from "../context/LanguageContext";

const SETTINGS_KEY = "syncnol-settings-prefs";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { currency: "IDR", notifications: true, persona: "Roast" };
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs));
  } catch (_) {}
}

export default function SettingsPage() {
  const { setTransactions, setSummary } = useAppStore();
  const { lang, setLang, t } = useLanguage();

  const [currency, setCurrency] = useState(() => loadPrefs().currency);
  const [notifications, setNotifications] = useState(() => loadPrefs().notifications);
  const [persona, setPersona] = useState(() => loadPrefs().persona);
  const [showWipeModal, setShowWipeModal] = useState(false);

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    savePrefs({ currency, notifications, persona });
  }, [currency, notifications, persona]);

  const handleSavePreferences = () => {
    savePrefs({ currency, notifications, persona });
    toast.success("Preferences saved successfully");
  };

  const handleWipeData = () => {
    setTransactions([]);
    setSummary({ net_worth: 0, monthly_income: 0, pengeluaran: 0 });
    toast.error("All transaction data has been permanently wiped", {
      icon: "🔥",
      style: { background: "#ef4444", color: "#fff" },
    });
    setShowWipeModal(false);
  };

  const handleDeleteAccount = () => {
    toast("Account deletion initiated. Contact support.", { icon: "⚠️" });
  };

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              System
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
        </div>
        <button
          onClick={handleSavePreferences}
          className="self-start md:self-auto bg-fintech-primary hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Save Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl">
        {/* GENERAL PREFERENCES */}
        <div className={`${cardClass} lg:col-span-12 flex flex-col gap-6`}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Globe size={20} className="text-fintech-primary" /> General
            Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  toast(`Currency updated to ${e.target.value}`, {
                    icon: "💱",
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
              >
                <option value="IDR">IDR - Indonesian Rupiah</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t("settings_language")}
              </label>
              <div className="flex gap-2">
                {["ID", "EN"].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      toast(`Bahasa diubah ke ${l}`, { icon: "🌍" });
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                      lang === l
                        ? "bg-fintech-primary text-white border-fintech-primary shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-fintech-primary"
                    }`}
                  >
                    {l === "ID" ? "🇮🇩 Indonesia" : "🇺🇸 English"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Bell size={16} /> Notifications
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setNotifications(true);
                    toast.success("Notifications Enabled");
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${notifications ? "bg-fintech-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
                >
                  On
                </button>
                <button
                  onClick={() => {
                    setNotifications(false);
                    toast("Notifications Disabled", { icon: "🔕" });
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!notifications ? "bg-slate-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
                >
                  Off
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* J.A.R.V.I.S PERSONA */}
        <div className={`${cardClass} lg:col-span-12 flex flex-col gap-6`}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Zap size={20} className="text-fintech-primary" /> Agentic Persona
            Global Default
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Roast", "Strict", "Friendly"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPersona(p);
                  toast.success(`J.A.R.V.I.S Persona set to ${p}`);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${persona === p ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50 shadow-sm" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`font-bold ${persona === p ? "text-fintech-primary dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {p} Mode
                  </div>
                  {persona === p && (
                    <div className="w-2 h-2 rounded-full bg-fintech-primary" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {p === "Roast" &&
                    "Brutal, sarcastic financial wake-up calls."}
                  {p === "Strict" && "No-nonsense data and robotic directives."}
                  {p === "Friendly" &&
                    "Empathetic, encouraging financial advice."}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="lg:col-span-12 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 border-b border-red-200 dark:border-red-900/30 pb-4">
            <AlertTriangle size={20} /> Danger Zone
          </h3>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/20">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Wipe Transaction Data
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Permanently deletes all logged transactions and resets your net
                worth.
              </p>
            </div>
            <button
              onClick={() => setShowWipeModal(true)}
              className="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Trash2 size={16} /> Wipe Data
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/20">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Delete Account
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Irreversibly delete your account and all associated Supabase
                data.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <ShieldAlert size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showWipeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action cannot be undone. All your transactions, debts, and
              history will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWipeModal(false)}
                className="flex-1 font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeData}
                className="flex-1 font-bold py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, Wipe It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
