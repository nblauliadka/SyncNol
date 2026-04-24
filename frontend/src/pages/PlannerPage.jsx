import { useState, useEffect } from "react";
import { Target, Calculator, Plus, Trash2, Calendar, PiggyBank, RefreshCw, CheckCircle2, Wallet } from "lucide-react";
import { supabase } from "../supabaseClient";
import useAppStore from "../store/useAppStore";
import toast from "react-hot-toast";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const calculateBreakdown = (amount, targetDateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.max(1, Math.ceil((target - today) / 86400000));
  const daily = amount / diffDays;
  const monthly = daily * 30;
  return { daily, monthly, diffDays };
};

export default function PlannerPage() {
  const { dbUserId } = useAppStore();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [depositModal, setDepositModal] = useState(null); // goal object
  const [depositAmount, setDepositAmount] = useState("");

  // ─── 2A: Fetch goals from Supabase on mount ────────────────────────────────
  useEffect(() => {
    fetchGoals();
  }, [dbUserId]);

  const fetchGoals = async () => {
    if (!dbUserId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", dbUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error("Fetch goals error:", err);
      toast.error("Gagal memuat goals dari database.");
    } finally {
      setLoading(false);
    }
  };

  // ─── 2B: Add goal → Supabase ───────────────────────────────────────────────
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !targetDate || !dbUserId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([{
          user_id: dbUserId,
          name: goalName,
          target_amount: Number(targetAmount),
          target_date: targetDate,
          current_saved: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) => [data, ...prev]);
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
      toast.success(`Goal "${data.name}" berhasil ditambahkan!`, { icon: "🎯" });
    } catch (err) {
      console.error("Add goal error:", err);
      toast.error("Gagal menyimpan goal. Cek koneksi Supabase.");
    } finally {
      setSaving(false);
    }
  };

  // ─── 2C: Delete goal ────────────────────────────────────────────────────────
  const removeGoal = async (id) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal dihapus.");
    } catch (err) {
      toast.error("Gagal menghapus goal.");
    }
  };

  // ─── 2D: Deposit → Supabase ────────────────────────────────────────────────
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositModal || !depositAmount) return;
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newSaved = (depositModal.current_saved || 0) + amount;
    try {
      const { error } = await supabase
        .from("goals")
        .update({ current_saved: newSaved })
        .eq("id", depositModal.id);

      if (error) throw error;
      setGoals((prev) =>
        prev.map((g) => g.id === depositModal.id ? { ...g, current_saved: newSaved } : g)
      );
      toast.success(`+Rp ${formatCurrency(amount)} disimpan ke "${depositModal.name}"`, { icon: "💰" });
      setDepositModal(null);
      setDepositAmount("");
    } catch (err) {
      toast.error("Gagal deposit. Cek koneksi Supabase.");
    }
  };

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Goal Tracker</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Savings Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Goals tersinkronisasi langsung ke Supabase.</p>
        </div>
        <button
          onClick={fetchGoals}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-fintech-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT FORM */}
        <div className={`${cardClass} lg:col-span-4 h-fit flex flex-col gap-6`}>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1">
              <Calculator size={16} className="text-fintech-primary" /> Goal Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Disimpan ke database. Data tidak hilang saat refresh.</p>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nama Goal</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="mis. MacBook Pro, DP Rumah"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Target (Rp)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="25000000"
                min="1"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tanggal Target</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !dbUserId}
              className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={18} />}
              {saving ? "Menyimpan..." : "Tambah Goal"}
            </button>

            {!dbUserId && (
              <p className="text-xs text-center text-red-500 font-medium">Login diperlukan untuk menyimpan goals.</p>
            )}
          </form>
        </div>

        {/* GOAL LIST */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {loading ? (
            <div className={`${cardClass} flex items-center justify-center h-48`}>
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw size={28} className="animate-spin" />
                <span className="text-sm font-medium">Memuat goals dari Supabase...</span>
              </div>
            </div>
          ) : goals.length === 0 ? (
            <div className={`${cardClass} flex flex-col items-center justify-center h-64 text-center border-dashed`}>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <PiggyBank size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Goal</h3>
              <p className="text-sm text-slate-500 max-w-sm">Buat goal pertamamu. Data akan tersimpan permanen di database.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const { daily, monthly, diffDays } = calculateBreakdown(goal.target_amount, goal.target_date);
              const currentSaved = goal.current_saved || 0;
              const progressPercent = Math.min(100, (currentSaved / goal.target_amount) * 100);
              const isComplete = progressPercent >= 100;

              return (
                <div key={goal.id} className={`${cardClass} flex flex-col gap-5 relative overflow-hidden`}>
                  {isComplete && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                      TERCAPAI!
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{goal.name}</h3>
                      <div className="text-sm font-bold text-slate-500">
                        Target: Rp {formatCurrency(goal.target_amount)} · {new Date(goal.target_date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setDepositModal(goal); setDepositAmount(""); }}
                        className="px-3 py-1.5 text-xs font-bold bg-fintech-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Wallet size={13} /> Deposit
                      </button>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target size={13} className="text-fintech-primary" /> Rencana Tabungan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Per Hari</div>
                        <div className="text-base font-black text-fintech-primary">Rp {formatCurrency(daily)}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Per Bulan</div>
                        <div className="text-base font-black text-fintech-primary">Rp {formatCurrency(monthly)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-xs font-bold text-slate-500">
                        Rp {formatCurrency(currentSaved)} / Rp {formatCurrency(goal.target_amount)}{" "}
                        <span className={isComplete ? "text-green-500" : "text-fintech-primary"}>({progressPercent.toFixed(0)}%)</span>
                      </div>
                      <div className="text-xs font-bold text-slate-400">{diffDays} hari tersisa</div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : "bg-fintech-primary"}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet size={18} className="text-fintech-primary" /> Deposit ke "{depositModal.name}"
              </h2>
              <p className="text-xs text-slate-400 mt-1">Tersimpan: Rp {formatCurrency(depositModal.current_saved)}</p>
            </div>
            <form onSubmit={handleDeposit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Jumlah Deposit (Rp)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="500000"
                  min="1"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDepositModal(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-fintech-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
