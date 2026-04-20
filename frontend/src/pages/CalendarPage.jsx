import { useState, useMemo } from "react";
import useAppStore from "../store/useAppStore";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CalendarPage() {
  const { transactions } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Add empty slots for days before 1st of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add real days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split("T")[0];

      // Find transactions for this day
      const dayTxs = transactions.filter((t) => {
        if (!t.tanggal) return false;
        return t.tanggal.split("T")[0] === dateStr;
      });

      const income = dayTxs
        .filter((t) => t.jenis === "Pemasukan")
        .reduce((sum, t) => sum + t.nominal, 0);
      const expense = dayTxs
        .filter((t) => t.jenis === "Pengeluaran")
        .reduce((sum, t) => sum + t.nominal, 0);

      days.push({
        day: i,
        dateStr,
        income,
        expense,
        net: income - expense,
        count: dayTxs.length,
      });
    }

    return days;
  }, [currentDate, transactions]);

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
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
            Financial Heatmap
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-sm min-w-[120px] text-center">
            {monthName}
          </div>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {calendarDays.map((dayObj, i) => {
            if (!dayObj)
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[80px] md:min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800"
                />
              );

            // Heatmap styling logic
            let bgClass = "bg-slate-50 dark:bg-slate-800/50";
            let borderClass = "border-slate-100 dark:border-slate-700/50";

            if (dayObj.net > 0) {
              bgClass = "bg-green-50 dark:bg-green-900/10";
              borderClass = "border-green-200 dark:border-green-900/30";
            } else if (dayObj.net < 0) {
              bgClass = "bg-red-50 dark:bg-red-900/10";
              borderClass =
                dayObj.expense > 1000000
                  ? "border-red-400 dark:border-red-700/50"
                  : "border-red-200 dark:border-red-900/30";
            }

            return (
              <div
                key={dayObj.dateStr}
                className={`min-h-[80px] md:min-h-[100px] rounded-xl border p-2 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer ${bgClass} ${borderClass}`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-bold ${new Date().toISOString().split("T")[0] === dayObj.dateStr ? "bg-fintech-primary text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {dayObj.day}
                  </span>
                  {dayObj.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  {dayObj.income > 0 && (
                    <div className="text-[10px] md:text-xs font-bold text-green-600 dark:text-green-400 truncate">
                      +{(dayObj.income / 1000).toFixed(0)}k
                    </div>
                  )}
                  {dayObj.expense > 0 && (
                    <div className="text-[10px] md:text-xs font-bold text-red-500 dark:text-red-400 truncate">
                      -{(dayObj.expense / 1000).toFixed(0)}k
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
