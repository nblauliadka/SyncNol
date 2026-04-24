import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Database,
  Server,
  Radio,
  Lock,
  Activity,
  Send,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import useAppStore from "../store/useAppStore";

export default function AdminPortalPage() {
  const { userName } = useAppStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      // For demonstration, we allow 'admin' or just force it for the founder
      if (
        userName &&
        (userName.toLowerCase().includes("admin") ||
          userName.toLowerCase().includes("newwst"))
      ) {
        setIsAdmin(true);
      } else {
        // Toggle to true for demo purposes, normally this would be false
        setIsAdmin(true);
      }
      setChecking(false);
    }, 1000);
  }, [userName]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    toast.success("Broadcast sent to all active sessions");
    setBroadcastMsg("");
  };

  const cardClass =
    "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm";

  if (checking) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <Shield size={48} className="animate-pulse text-fintech-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Verifying Clearance...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#0B0F19]">
        <Lock size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          You do not possess the required clearance level to access the God Mode
          Admin Portal.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2 text-fintech-primary">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              God Mode
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Admin Portal
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-900/30 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
          Live Systems
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* METRICS */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
            <Users size={20} />{" "}
            <span className="text-sm font-bold uppercase tracking-wider">
              Registered Users
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            12,450
          </div>
          <div className="text-xs font-bold text-green-500 mt-2">
            +142 this week
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
            <Activity size={20} />{" "}
            <span className="text-sm font-bold uppercase tracking-wider">
              Global AUM
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            Rp 4.2T
          </div>
          <div className="text-xs font-bold text-green-500 mt-2">
            +Rp 12B today
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
            <Zap size={20} />{" "}
            <span className="text-sm font-bold uppercase tracking-wider">
              API Tokens Used
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            1.2M
          </div>
          <div className="text-xs font-bold text-slate-400 mt-2">
            Reset in 4 days
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className={`${cardClass} bg-slate-900 text-white border-none`}>
          <div className="text-sm font-bold uppercase tracking-wider mb-6 text-slate-400">
            System Health
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Server size={16} className="text-slate-400" /> FastAPI Engine
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />{" "}
                Operational
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Database size={16} className="text-slate-400" /> PostgreSQL
                Node
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />{" "}
                Operational
              </div>
            </div>
          </div>
        </div>

        {/* BROADCAST ENGINE */}
        <div
          className={`${cardClass} md:col-span-2 xl:col-span-4 flex flex-col gap-4 border-l-4 border-l-fintech-primary`}
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio size={20} className="text-fintech-primary" /> Broadcast
            Engine
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Send a global push notification or toast to all connected clients
            instantly.
          </p>

          <form onSubmit={handleBroadcast} className="mt-2 relative">
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="System will undergo maintenance at 02:00 AM UTC..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-fintech-primary resize-none"
            />
            <button
              type="submit"
              disabled={!broadcastMsg.trim()}
              className="absolute bottom-4 right-4 bg-fintech-primary hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
