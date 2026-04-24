import { useState, useMemo } from "react";
import useAppStore from "../store/useAppStore";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  X,
  Trash2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────
const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const TODAY = new Date().toISOString().split("T")[0];

const REMINDER_CATEGORIES = [
  { value: "tagihan", label: "Tagihan Rutin", color: "bg-red-500" },
  { value: "cicilan", label: "Cicilan / Kredit", color: "bg-orange-500" },
  { value: "investasi", label: "Investasi", color: "bg-blue-500" },
  { value: "gaji", label: "Gaji / Pemasukan", color: "bg-green-500" },
  { value: "lainnya", label: "Lainnya", color: "bg-slate-500" },
];

const catColor = (cat) =>
  REMINDER_CATEGORIES.find((c) => c.value === cat)?.color ?? "bg-slate-500";

const SAMPLE_REMINDERS = [
  {
    id: 1,
    dateStr: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-15`,
    title: "Bayar PLN & PDAM",
    amount: 350000,
    category: "tagihan",
    note: "Jangan telat, denda 2%",
  },
  {
    id: 2,
    dateStr: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-25`,
    title: "Cicilan KPR",
    amount: 3200000,
    category: "cicilan",
    note: "",
  },
];

const formatIDR = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num || 0);

// ─── Component ───────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { transactions } = useAppStore();

  // 4.1 – State Management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(TODAY);

  // 4.3 – Reminder state
  const [reminders, setReminders] = useState(SAMPLE_REMINDERS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "tagihan",
    note: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthName = currentDate.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(year, month, d);

      const dayTxs = transactions.filter((t) => {
        if (!t.tanggal) return false;
        return t.tanggal.split("T")[0] === dateStr;
      });

      const income = dayTxs
        .filter((t) => (t.jenis || t.jenis_transaksi) === "Pemasukan")
        .reduce((s, t) => s + t.nominal, 0);
      const expense = dayTxs
        .filter((t) => (t.jenis || t.jenis_transaksi) === "Pengeluaran")
        .reduce((s, t) => s + t.nominal, 0);

      const dayReminders = reminders.filter((r) => r.dateStr === dateStr);

      days.push({ day: d, dateStr, income, expense, net: income - expense, txCount: dayTxs.length, reminders: dayReminders });
    }

    return days;
  }, [currentDate, transactions, reminders]);

  // 4.2 – Click handler
  const handleDayClick = (dayObj) => {
    setSelectedDate(dayObj.dateStr);
  };

  // Selected day data
  const selectedReminders = reminders.filter((r) => r.dateStr === selectedDate);
  const selectedTxs = transactions.filter((t) => {
    if (!t.tanggal) return false;
    return t.tanggal.split("T")[0] === selectedDate;
  });

  // 4.3 – Add reminder
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!form.title) return;
    const newReminder = {
      id: Date.now(),
      dateStr: selectedDate,
      title: form.title,
      amount: Number(form.amount) || 0,
      category: form.category,
      note: form.note,
    };
    setReminders((prev) => [...prev, newReminder]);
    setForm({ title: "", amount: "", category: "tagihan", note: "" });
    setShowModal(false);
    toast.success(`Pengingat ditambahkan: ${newReminder.title}`, { icon: "🔔" });
  };

  const handleDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success("Pengingat dihapus.");
  };

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm";

  const upcomingReminders = reminders
    .filter((r) => r.dateStr >= TODAY)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Chronology
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Kalender Finansial
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Klik tanggal untuk melihat detail atau menambah pengingat tagihan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#111827] p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="font-bold text-sm min-w-[140px] text-center capitalize">{monthName}</div>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CALENDAR GRID */}
        <div className={`${cardClass} p-5 lg:col-span-8`}>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-3">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {calendarDays.map((dayObj, i) => {
              if (!dayObj)
                return (
                  <div key={`e-${i}`} className="aspect-square rounded-xl bg-slate-50/50 dark:bg-slate-800/10 border border-dashed border-slate-100 dark:border-slate-800/50" />
                );

              const isToday = dayObj.dateStr === TODAY;
              const isSelected = dayObj.dateStr === selectedDate;
              const hasReminder = dayObj.reminders.length > 0;

              let bgClass = "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800";
              if (dayObj.net > 0) bgClass = "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30";
              else if (dayObj.net < 0) bgClass = "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30";

              return (
                <div
                  key={dayObj.dateStr}
                  onClick={() => handleDayClick(dayObj)}
                  className={`
                    aspect-square rounded-xl border p-1.5 flex flex-col justify-between
                    transition-all duration-150 cursor-pointer select-none
                    hover:shadow-md hover:scale-[1.04]
                    ${bgClass}
                    ${isSelected ? "ring-2 ring-fintech-primary ring-offset-1 dark:ring-offset-[#0B0F19] scale-[1.04] shadow-md" : ""}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold leading-none ${isToday ? "w-5 h-5 rounded-full bg-fintech-primary text-white flex items-center justify-center text-[10px]" : "text-slate-700 dark:text-slate-300"}`}>
                      {dayObj.day}
                    </span>
                    {hasReminder && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-0.5 mt-1">
                    {dayObj.income > 0 && (
                      <div className="text-[9px] md:text-[10px] font-bold text-green-600 dark:text-green-400 truncate leading-none">
                        +{(dayObj.income / 1000).toFixed(0)}k
                      </div>
                    )}
                    {dayObj.expense > 0 && (
                      <div className="text-[9px] md:text-[10px] font-bold text-red-500 dark:text-red-400 truncate leading-none">
                        -{(dayObj.expense / 1000).toFixed(0)}k
                      </div>
                    )}
                    {dayObj.reminders.length > 0 && (
                      <div className="text-[9px] md:text-[10px] font-bold text-orange-500 truncate leading-none">
                        🔔 {dayObj.reminders.length}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200" /><span className="text-[10px] text-slate-400 font-medium">Net positif</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" /><span className="text-[10px] text-slate-400 font-medium">Net negatif</span></div>
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /><span className="text-[10px] text-slate-400 font-medium">Ada pengingat</span></div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* SELECTED DATE PANEL */}
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tanggal Dipilih</div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-fintech-primary px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Plus size={14} /> Pengingat
              </button>
            </div>

            {/* Reminders for selected day */}
            {selectedReminders.length === 0 && selectedTxs.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <CalendarIcon size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Tidak ada aktivitas di tanggal ini.</p>
              </div>
            )}

            {selectedReminders.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pengingat</div>
                {selectedReminders.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${catColor(r.category)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{r.title}</div>
                      {r.amount > 0 && <div className="text-xs text-red-500 font-bold">{formatIDR(r.amount)}</div>}
                      {r.note && <div className="text-xs text-slate-400 mt-0.5 truncate">{r.note}</div>}
                    </div>
                    <button onClick={() => handleDeleteReminder(r.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedTxs.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Transaksi</div>
                {selectedTxs.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                    <span className="text-slate-600 dark:text-slate-300 truncate">{t.kategori || t.keterangan || "—"}</span>
                    <span className={`font-bold flex-shrink-0 ml-2 ${(t.jenis || t.jenis_transaksi) === "Pemasukan" ? "text-green-600" : "text-red-500"}`}>
                      {(t.jenis || t.jenis_transaksi) === "Pemasukan" ? "+" : "-"}{formatIDR(t.nominal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING REMINDERS */}
          <div className={`${cardClass} p-5`}>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Bell size={16} className="text-orange-500" /> Tagihan Mendatang
            </h3>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                <AlertCircle size={24} className="mx-auto mb-2 opacity-30" />
                Belum ada pengingat terjadwal.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingReminders.map((r) => {
                  const daysAway = Math.round((new Date(r.dateStr) - new Date(TODAY)) / 86400000);
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${catColor(r.category)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{r.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {daysAway === 0 ? "Hari ini" : `${daysAway} hari lagi`} · {new Date(r.dateStr + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      {r.amount > 0 && (
                        <span className="text-xs font-bold text-red-500 flex-shrink-0">{formatIDR(r.amount)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD REMINDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell size={18} className="text-orange-500" /> Tambah Pengingat
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Pengingat</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="mis. Bayar tagihan listrik"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {REMINDER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: cat.value }))}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors flex items-center gap-2 ${form.category === cat.value ? "bg-fintech-primary text-white border-fintech-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nominal (opsional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan (opsional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Denda 2% jika telat..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fintech-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-1"
              >
                <Bell size={16} /> Simpan Pengingat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
