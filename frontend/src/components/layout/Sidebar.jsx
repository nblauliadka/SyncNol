import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAppStore from "../../store/useAppStore";
import { supabase } from "../../supabaseClient";
import { useLanguage } from "../../context/LanguageContext";
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Rocket,
  SlidersHorizontal,
  Calendar,
  FileText,
  GraduationCap,
  Lock,
  Users,
  Settings,
  Shield,
} from "lucide-react";

// Nav items now use translation keys instead of hardcoded labels
const NAV = [
  { path: "/app/dashboard", icon: LayoutDashboard, key: "nav_dashboard" },
  { path: "/app/analytics", icon: BarChart3, key: "nav_analytics" },
  { path: "/app/antigravity", icon: Rocket, key: "nav_debt" },
  { path: "/app/planner", icon: SlidersHorizontal, key: "nav_planner" },
  { path: "/app/calendar", icon: Calendar, key: "nav_calendar" },
  { path: "/app/reports", icon: FileText, key: "nav_reports" },
  { path: "/app/academy", icon: GraduationCap, key: "nav_academy" },
  { path: "/app/vault", icon: Lock, key: "nav_vault" },
  { path: "/app/wingman", icon: Users, key: "nav_wingman" },
  { path: "/app/admin-portal", icon: Shield, key: "nav_admin" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { userName, sidebarCollapsed, toggleSidebar, theme, toggleTheme } =
    useAppStore();
  // 5.4 – Use global translation function
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Clear persisted Zustand store to prevent stale session data
    localStorage.removeItem("syncnol-storage");
    // Reset critical store state
    useAppStore.setState({
      session: null,
      dbUserId: null,
      userName: "Agent",
      transactions: [],
      summary: { net_worth: 0, pemasukan: 0, pengeluaran: 0, total_utang: 0, nama: "Agent" },
    });
    navigate("/auth", { replace: true });
  };

  const collapsed = !isMobile && sidebarCollapsed;
  const isAdmin = false; // Mock condition to hide Admin Portal

  const filteredNav = NAV.filter((item) => {
    if (item.key === "nav_admin") return isAdmin;
    return true;
  });

  return (
    <div
      className={`hidden md:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* Logo Area */}
      <div
        className={`flex items-center p-4 border-b border-slate-200 dark:border-slate-800 min-h-[72px] ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Sync<span className="text-fintech-primary">Nol</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {filteredNav.map(({ path, icon: Icon, key }) => {
          const label = t(key);
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-fintech-primary dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }
                ${collapsed ? "justify-center" : "justify-start"}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className={collapsed ? "" : "flex-shrink-0"} />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer (Theme Toggle & User) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors
            ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-fintech-primary dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
            ${collapsed ? "justify-center" : "justify-start"}
          `}
          title={collapsed ? t("nav_settings") : undefined}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">{t("nav_settings")}</span>}
        </NavLink>

        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${collapsed ? "justify-center" : "justify-start"}`}
          title={collapsed ? t(theme === "dark" ? "theme_light" : "theme_dark") : undefined}
        >
          {theme === "dark" ? (
            <Sun size={20} className="flex-shrink-0" />
          ) : (
            <Moon size={20} className="flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="whitespace-nowrap">
              {t(theme === "dark" ? "theme_light" : "theme_dark")}
            </span>
          )}
        </button>

        <div
          className={`flex items-center gap-3 mt-2 ${collapsed ? "justify-center" : "justify-start"}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex justify-between items-center">
              <div className="truncate font-semibold text-sm">{userName}</div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
