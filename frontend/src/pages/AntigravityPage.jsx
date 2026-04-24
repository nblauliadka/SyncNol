import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useAppStore from "../store/useAppStore";
import {
  Rocket,
  ShieldAlert,
  Crosshair,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function AntigravityPage() {
  const { dbUserId, transactions } = useAppStore();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({
    nama_kreditur: "",
    jenis_utang: "Pinjol",
    total_utang: "",
  });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDebts = useCallback(async () => {
    if (!dbUserId) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/users/${dbUserId}/debts`,
      );
      if (res.data.status === "success") {
        setDebts(res.data.daftar_utang || []);
      }
    } catch (e) {
      console.error("Failed to fetch debts:", e);
    } finally {
      setLoading(false);
    }
  }, [dbUserId]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!newDebt.nama_kreditur || !newDebt.total_utang) return;
    setActionLoading("add");
    try {
      await axios.post("http://127.0.0.1:8000/api/debts", {
        ...newDebt,
        total_utang: parseFloat(newDebt.total_utang),
        user_id: dbUserId,
      });
      setNewDebt({ nama_kreditur: "", jenis_utang: "Pinjol", total_utang: "" });
      setShowAddDebt(false);
      fetchDebts();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDebt = async (id) => {
    setActionLoading(id);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/debts/${id}`);
      fetchDebts();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Leakage Scanner Logic (Mock detection based on transaction history)
  const leaks = useMemo(() => {
    const expenses = transactions.filter((t) => t.jenis === "Pengeluaran");
    // Simulating finding recurring expenses (Netflix, Spotify, etc) or small frequent ones (Kopi)
    const keywords = [
      "spotify",
      "netflix",
      "youtube",
      "kopi",
      "gofood",
      "grab",
      "shopee",
    ];
    const found = [];

    keywords.forEach((kw) => {
      const matches = expenses.filter(
        (t) => t.keterangan && t.keterangan.toLowerCase().includes(kw),
      );
      if (matches.length >= 1) {
        const total = matches.reduce((sum, t) => sum + t.nominal, 0);
        found.push({
          name: kw.charAt(0).toUpperCase() + kw.slice(1),
          count: matches.length,
          total: total,
          severity: total > 500000 ? "high" : "medium",
        });
      }
    });
    return found.sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalDebt = debts.reduce((sum, d) => sum + d.total_utang, 0);

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Rocket size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Wealth Acceleration
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Antigravity Engine
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DEBT ALGOJO */}
        <div className={`${cardClass} lg:col-span-8 flex flex-col`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-red-500">
            <Crosshair size={120} />
          </div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crosshair size={20} className="text-red-500" /> Debt Algojo
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Target and destroy high-interest liabilities.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Total Liability
              </div>
              <div className="text-2xl font-black text-red-500">
                Rp {(totalDebt / 1e6).toFixed(2)}M
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 relative z-10">
            {loading ? (
              <div className="py-10 text-center text-slate-400 animate-pulse">
                Scanning liabilities...
              </div>
            ) : debts.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <CheckCircle2
                  size={32}
                  className="mx-auto text-green-500 mb-2 opacity-50"
                />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  No active debts detected.
                </p>
                <p className="text-sm text-slate-400">
                  You are completely debt-free.
                </p>
              </div>
            ) : (
              debts.map((d) => (
                <div
                  key={d.id}
                  className="group bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-red-300 dark:hover:border-red-700/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {d.nama_kreditur.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {d.nama_kreditur}
                      </h4>
                      <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit mt-1">
                        {d.jenis_utang}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none border-slate-100 dark:border-slate-700 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                        Remaining Balance
                      </div>
                      <div className="font-bold text-red-500">
                        Rp {d.total_utang.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDebt(d.id)}
                      disabled={actionLoading === d.id}
                      className="bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {actionLoading === d.id ? "..." : "Mark Paid"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
            {showAddDebt ? (
              <form
                onSubmit={handleAddDebt}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col sm:flex-row gap-3"
              >
                <input
                  required
                  placeholder="Creditor (e.g. SPayLater)"
                  value={newDebt.nama_kreditur}
                  onChange={(e) =>
                    setNewDebt((p) => ({ ...p, nama_kreditur: e.target.value }))
                  }
                  className="flex-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fintech-primary outline-none"
                />
                <input
                  required
                  type="number"
                  placeholder="Amount (Rp)"
                  value={newDebt.total_utang}
                  onChange={(e) =>
                    setNewDebt((p) => ({ ...p, total_utang: e.target.value }))
                  }
                  className="w-full sm:w-32 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fintech-primary outline-none"
                />
                <select
                  value={newDebt.jenis_utang}
                  onChange={(e) =>
                    setNewDebt((p) => ({ ...p, jenis_utang: e.target.value }))
                  }
                  className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option>Pinjol</option>
                  <option>Credit Card</option>
                  <option>Personal</option>
                  <option>Bank Loan</option>
                </select>
                <button
                  type="submit"
                  disabled={actionLoading === "add"}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  Target
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDebt(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold py-2 px-3 text-sm"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddDebt(true)}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-fintech-primary dark:hover:border-fintech-primary text-slate-500 hover:text-fintech-primary font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Log New Liability
              </button>
            )}
          </div>
        </div>

        {/* LEAKAGE SCANNER */}
        <div
          className={`${cardClass} lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none`}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert size={20} className="text-amber-400" /> Leakage
              Scanner
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              AI detection of recurring micro-expenses draining your wealth.
            </p>
          </div>

          <div className="flex-1 space-y-3">
            {leaks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-10">
                <ShieldAlert size={32} className="opacity-20 mb-2" />
                <span className="text-sm">
                  Hull integrity stable. No leaks detected.
                </span>
              </div>
            ) : (
              leaks.map((leak, i) => (
                <div
                  key={i}
                  className="bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-slate-700/50"
                >
                  <div>
                    <div className="font-bold">{leak.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {leak.count} detected transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-black ${leak.severity === "high" ? "text-red-400" : "text-amber-400"}`}
                    >
                      -Rp {(leak.total / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {leaks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-1">
                Total Estimated Leakage
              </div>
              <div className="text-xl font-black text-white">
                Rp{" "}
                {leaks
                  .reduce((sum, l) => sum + l.total, 0)
                  .toLocaleString("id-ID")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
