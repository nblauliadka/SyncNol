import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
      <div className="min-h-screen flex items-center justify-center bg-fintech-light dark:bg-fintech-dark text-fintech-textLight dark:text-fintech-textDark">
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
    <div className="flex h-screen w-full bg-fintech-light dark:bg-fintech-dark text-fintech-textLight dark:text-fintech-textDark overflow-hidden font-sans transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
