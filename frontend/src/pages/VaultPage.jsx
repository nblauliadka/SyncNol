import { useState } from "react";
import { Lock, Unlock, ShieldCheck, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

export default function VaultPage() {
  const [lockedAmount, setLockedAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const handleLock = (e) => {
    e.preventDefault();
    if (!inputAmount) return;
    setLockedAmount((p) => p + Number(inputAmount));
    setInputAmount("");
    toast.success("Funds Secured in the Vault", { icon: "🔒" });
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (captchaAnswer === "144") {
      // 12 * 12
      setLockedAmount(0);
      setUnlocking(false);
      setCaptchaAnswer("");
      toast.success("Vault Unlocked Successfully", { icon: "🔓" });
    } else {
      toast.error("Incorrect. The Vault remains sealed.", { icon: "🚫" });
    }
  };

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Security
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            The Vault
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* VAULT STATUS */}
        <div
          className={`${cardClass} lg:col-span-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]`}
        >
          <div
            className={`absolute inset-0 bg-slate-900 flex items-center justify-center transition-all duration-700 ${lockedAmount > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div
              className="absolute w-64 h-64 border-[20px] border-fintech-primary rounded-full animate-spin"
              style={{ animationDuration: "10s" }}
            />
            <div
              className="absolute w-48 h-48 border-[10px] border-blue-400/30 rounded-full animate-spin"
              style={{ animationDuration: "7s", animationDirection: "reverse" }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <Lock size={64} className="text-white mb-4" />
              <div className="text-sm font-bold text-blue-300 tracking-widest uppercase mb-1">
                Secured Funds
              </div>
              <div className="text-4xl font-black text-white">
                Rp {(lockedAmount / 1e6).toFixed(1)}M
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-700 ${lockedAmount > 0 ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            <Unlock
              size={64}
              className="text-slate-300 dark:text-slate-600 mb-4 mx-auto"
            />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">
              Vault is Empty
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Lock your money away to prevent impulse spending. Once locked, you
              must solve a mental CAPTCHA to release it.
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className={`${cardClass} lg:col-span-6 flex flex-col gap-6`}>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound size={20} className="text-fintech-primary" /> Access
              Terminal
            </h3>
            <p className="text-xs text-slate-500">
              Deposit or attempt withdrawal.
            </p>
          </div>

          {!unlocking ? (
            <form onSubmit={handleLock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Deposit Amount (Rp)
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary"
                />
              </div>
              <button
                type="submit"
                disabled={!inputAmount}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Lock size={18} /> Seal Funds
              </button>

              {lockedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setUnlocking(true)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold py-4 rounded-xl mt-4 transition-colors"
                >
                  Initiate Withdrawal
                </button>
              )}
            </form>
          ) : (
            <form
              onSubmit={handleUnlock}
              className="space-y-4 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30"
            >
              <div className="flex items-start gap-3 text-red-600 dark:text-red-400 mb-4">
                <ShieldAlert size={24} className="flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Mental CAPTCHA Required</h4>
                  <p className="text-xs mt-1">
                    To prove you aren't making an impulsive emotional purchase,
                    solve this equation:
                  </p>
                </div>
              </div>

              <div className="text-center py-4 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/50 mb-4">
                <span className="text-2xl font-black font-mono">
                  12 × 12 = ?
                </span>
              </div>

              <input
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter answer"
                className="w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUnlocking(false);
                    setCaptchaAnswer("");
                  }}
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!captchaAnswer}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Verify & Unlock
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
