import { useState, useMemo, useEffect } from "react";
import useAppStore from "../store/useAppStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { SlidersHorizontal, Target, TrendingUp, Sparkles } from "lucide-react";

export default function PlannerPage() {
  const { summary } = useAppStore();

  // Default values based on real user data or sensible fallbacks
  const baseIncome =
    summary?.monthly_income > 0 ? summary.monthly_income : 10000000;
  const baseExpenses = summary?.pengeluaran > 0 ? summary.pengeluaran : 6000000;
  const currentNetWorth = summary?.net_worth || 0;

  const [income, setIncome] = useState(baseIncome);
  const [expenses, setExpenses] = useState(baseExpenses);
  const [goal, setGoal] = useState(100000000); // 100M target

  useEffect(() => {
    if (summary?.monthly_income > 0) setIncome(summary.monthly_income);
    if (summary?.pengeluaran > 0) setExpenses(summary.pengeluaran);
  }, [summary]);

  const monthlySavings = income - expenses;

  const chartData = useMemo(() => {
    let balance = currentNetWorth;
    const data = [];
    // Project next 12 months
    for (let i = 0; i <= 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      data.push({
        name: d.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        }),
        wealth: balance,
      });
      balance += monthlySavings;
    }
    return data;
  }, [income, expenses, currentNetWorth, monthlySavings]);

  const monthsToGoal =
    monthlySavings > 0
      ? Math.max(0, Math.ceil((goal - currentNetWorth) / monthlySavings))
      : "Infinity";

  const cardClass =
    "bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal size={16} className="text-fintech-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Sandbox
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Interactive Planner
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CONTROLS */}
        <div className={`${cardClass} xl:col-span-4 flex flex-col gap-6`}>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Target size={16} className="text-fintech-primary" /> Strategy
              Variables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Slide to model hypothetical financial trajectories.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Income
                </span>
                <span className="font-bold text-green-500">
                  Rp {(income / 1e6).toFixed(1)}M
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000000"
                step="500000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Expenses
                </span>
                <span className="font-bold text-red-500">
                  Rp {(expenses / 1e6).toFixed(1)}M
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000000"
                step="500000"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Goal
                </span>
                <span className="font-bold text-fintech-primary">
                  Rp {(goal / 1e6).toFixed(1)}M
                </span>
              </div>
              <input
                type="range"
                min="10000000"
                max="1000000000"
                step="10000000"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-fintech-primary"
              />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Savings Rate
                </div>
                <div
                  className={`text-xl font-black ${monthlySavings > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {income > 0 ? Math.round((monthlySavings / income) * 100) : 0}
                  %
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Net
                </div>
                <div
                  className={`text-xl font-black ${monthlySavings > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {monthlySavings > 0 ? "+" : ""}
                  {(monthlySavings / 1e6).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART AND PREDICTION */}
        <div className={`${cardClass} xl:col-span-8 flex flex-col`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-fintech-primary" /> 12-Month
              Projection
            </h3>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-fintech-primary px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <Sparkles size={16} />
              <span className="text-sm font-bold">
                Goal reached in:{" "}
                {monthsToGoal === "Infinity"
                  ? "Never"
                  : `${monthsToGoal} months`}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600 text-[10px]"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600 text-[10px]"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <ReferenceLine
                  y={goal}
                  label={{
                    position: "top",
                    value: "Target Goal",
                    fill: "#3B82F6",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                  stroke="#3B82F6"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="wealth"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#planGrad)"
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: "#3B82F6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
