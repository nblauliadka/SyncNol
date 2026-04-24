import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, Lock, Users, SlidersHorizontal } from "lucide-react";
import { supabase } from "../../supabaseClient";
import useAppStore from "../../store/useAppStore";
import Sidebar from "./Sidebar";
import axios from "axios";

export default function AppShell() {
  const navigate = useNavigate();
  const { setSession, setDbUserId, setUserName, theme, onboardingDone } =
    useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      setSession(session);
      try {
        const namaDariEmail = session.user.email.split("@")[0];
        const res = await axios.post("http://127.0.0.1:8000/api/sync-user", {
          email: session.user.email,
          nama: namaDariEmail,
        });
        if (res.data.status === "success") {
          setDbUserId(res.data.user_id);
          setUserName(namaDariEmail);

          if (res.data.needs_onboarding) {
            navigate("/onboarding", { replace: true });
            return;
          } else if (!useAppStore.getState().onboardingDone) {
            useAppStore.getState().completeOnboarding();
          }
        }
      } catch (err) {
        setUserName(session.user.email.split("@")[0]);
        if (!useAppStore.getState().onboardingDone) {
          navigate("/onboarding", { replace: true });
          return;
        }
      }
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth", { replace: true });
      else setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate, setSession, setDbUserId, setUserName, onboardingDone]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-fintech-primary rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
            ⚡
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Authenticating workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      {/* Desktop Sidebar – hidden on mobile */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 z-50 justify-around items-stretch p-3">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? "text-blue-400" : "text-gray-400"}`
          }
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>

        <NavLink
          to="/app/analytics"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? "text-blue-400" : "text-gray-400"}`
          }
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-semibold">Analytics</span>
        </NavLink>

        <NavLink
          to="/app/planner"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? "text-blue-400" : "text-gray-400"}`
          }
        >
          <SlidersHorizontal size={20} />
          <span className="text-[10px] font-semibold">Goals</span>
        </NavLink>

        <NavLink
          to="/app/vault"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? "text-blue-400" : "text-gray-400"}`
          }
        >
          <Lock size={20} />
          <span className="text-[10px] font-semibold">Vault</span>
        </NavLink>

        <NavLink
          to="/app/wingman"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 ${isActive ? "text-blue-400" : "text-gray-400"}`
          }
        >
          <Users size={20} />
          <span className="text-[10px] font-semibold">Wingman</span>
        </NavLink>
      </nav>
    </div>
  );
}
