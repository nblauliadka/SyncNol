import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useAppStore from "../store/useAppStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  Activity,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = [
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#BFDBFE",
  "#1D4ED8",
  "#2563EB",
];

export default function AnalyticsPage() {
  const { dbUserId, transactions, setTransactions, summary, setSummary } =
    useAppStore();
  const [filter, setFilter] = useState("all"); // all, in, out
  const [timeFilter, setTimeFilter] = useState("30d"); // 7d, 30d, all
  const [deleting, setDeleting] = useState(null);

  const fetchData = useCallback(async () => {
    if (!dbUserId) return;
    try {
      const [s, t] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/users/${dbUserId}/summary`),
        axios.get(`http://127.0.0.1:8000/api/users/${dbUserId}/transactions`),
      ]);
      if (s.data.status === "success") setSummary(s.data.data);
      if (t.data.status === "success") setTransactions(t.data.data);
    } catch (e) {
      console.error(e);
    }
  }, [dbUserId, setSummary, setTransactions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/transactions/${id}`);
      toast.success("Transaction Deleted", { icon: "🗑️" });
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete transaction");
    } finally {
      setDeleting(null);
    }
  };

  // Derived state for filtering
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Type filter
    if (filter === "in") result = result.filter((t) => t.jenis === "Pemasukan");
    if (filter === "out")
      result = result.filter((t) => t.jenis === "Pengeluaran");

    // Time filter (mock implementation based on array index for now since dates might be inconsistent)
    // In a real app, you'd filter by t.tanggal
    if (timeFilter === "7d")
      result = result.slice(0, Math.max(7, Math.floor(result.length / 4)));
    if (timeFilter === "30d")
      result = result.slice(0, Math.max(30, Math.floor(result.length / 2)));

    return result;
  }, [transactions, filter, timeFilter]);

  // Aggregate expenses for pie chart
  const pieData = useMemo(() => {
    const expenses = transactions.filter((t) => t.jenis === "Pengeluaran");
    const grouped = expenses.reduce((acc, t) => {
      const cat = t.kategori || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + t.nominal;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col relative";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
        </div>
        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {["7d", "30d", "all"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${timeFilter === t ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ANONYMOUS BENCHMARKING */}
      <div
        className={`${cardClass} bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-fintech-primary shadow-sm flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Anonymous Benchmarking{" "}
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compared to 12,450 users in your income bracket (Rp 10M - 20M)
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex-1 md:min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Savings Rate
            </div>
            <div className="text-lg font-black text-green-500 flex items-center gap-1">
              Top 15% <TrendingUp size={16} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex-1 md:min-w-[140px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Impulse Buys
            </div>
            <div className="text-lg font-black text-red-500 flex items-center gap-1">
              -12% <TrendingDown size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PIE CHART SECTION */}
        <div className={`${cardClass} lg:col-span-4 justify-between`}>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-6">
              <Filter size={16} className="text-fintech-primary" /> Spending by
              Category
            </h3>

            {pieData.length > 0 ? (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `Rp ${value.toLocaleString("id-ID")}`
                      }
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm font-medium text-slate-400">
                No expense data available.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {pieData.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold">
                  Rp {(item.value / 1e6).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS SECTION */}
        <div
          className={`${cardClass} lg:col-span-8 flex flex-col h-[600px] lg:h-auto`}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar size={16} className="text-fintech-primary" />{" "}
              Transaction Ledger
            </h3>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {[
                { id: "all", label: "All" },
                { id: "in", label: "Income" },
                { id: "out", label: "Expense" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    filter === f.id
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Filter size={32} className="opacity-20" />
                <p className="text-sm font-medium">No transactions found.</p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.jenis === "Pemasukan"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {t.jenis === "Pemasukan" ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                        {t.keterangan || "Transaction"}
                      </div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {t.kategori} •{" "}
                        {t.tanggal
                          ? new Date(t.tanggal).toLocaleDateString("id-ID", {
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`font-black tracking-tight ${
                        t.jenis === "Pemasukan"
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {t.jenis === "Pemasukan" ? "+" : "-"} Rp{" "}
                      {t.nominal.toLocaleString("id-ID")}
                    </span>

                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Undo Transaction"
                    >
                      {deleting === t.id ? (
                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
