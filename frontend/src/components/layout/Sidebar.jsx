import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAppStore from "../../store/useAppStore";
import { supabase } from "../../supabaseClient";
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

const NAV = [
  { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/app/antigravity", icon: Rocket, label: "Antigravity" },
  { path: "/app/planner", icon: SlidersHorizontal, label: "Planner" },
  { path: "/app/calendar", icon: Calendar, label: "Calendar" },
  { path: "/app/reports", icon: FileText, label: "Reports" },
  { path: "/app/academy", icon: GraduationCap, label: "Academy" },
  { path: "/app/vault", icon: Lock, label: "The Vault" },
  { path: "/app/wingman", icon: Users, label: "Wingman" },
  { path: "/app/admin-portal", icon: Shield, label: "Admin Portal" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { userName, sidebarCollapsed, toggleSidebar, theme, toggleTheme } =
    useAppStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const collapsed = !isMobile && sidebarCollapsed;

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* Logo Area */}
      <div
        className={`flex items-center p-4 border-b border-slate-200 dark:border-slate-800 min-h-[72px] ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Sync<span className="text-fintech-primary">Nol</span>
            </span>
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => isMobile && setMobileOpen(false)}
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
        ))}
      </nav>

      {/* Footer (Theme Toggle & User) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <NavLink
          to="/app/settings"
          onClick={() => isMobile && setMobileOpen(false)}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors
            ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-fintech-primary dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"}
            ${collapsed ? "justify-center" : "justify-start"}
          `}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Settings</span>}
        </NavLink>

        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${collapsed ? "justify-center" : "justify-start"}`}
          title={collapsed ? "Toggle Theme" : undefined}
        >
          {theme === "dark" ? (
            <Sun size={20} className="flex-shrink-0" />
          ) : (
            <Moon size={20} className="flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="whitespace-nowrap">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
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
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fintech-primary flex items-center justify-center text-white shadow-sm">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Sync<span className="text-fintech-primary">Nol</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-64 z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
}
