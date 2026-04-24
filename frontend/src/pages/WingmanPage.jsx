import { Users, Clock } from "lucide-react";

export default function WingmanPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 font-sans gap-4">
      <div className="w-16 h-16 rounded-2xl bg-fintech-primary/10 flex items-center justify-center text-fintech-primary">
        <Users size={32} />
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        Wingman
      </h1>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Clock size={14} />
        <span>Social Finance features coming soon.</span>
      </div>
    </div>
  );
}
