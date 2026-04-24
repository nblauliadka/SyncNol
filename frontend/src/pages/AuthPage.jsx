import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Zap, ShieldCheck } from "lucide-react";
import useAppStore from "../store/useAppStore";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const [mode, setMode] = useState(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/app/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (mode === "signup" && !agreed) {
      setError("You must agree to the Privacy Policy and Terms of Service.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        navigate("/app/dashboard", { replace: true });
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage(
          "Account created! Check your email to confirm, then sign in.",
        );
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 flex items-center justify-center p-6 relative font-sans transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-8 transition-colors"
        >
          ← Back to home
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-fintech-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <Zap size={28} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sync<span className="text-fintech-primary">Nol</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {isSignup ? "Create your command center" : "Welcome back, Agent"}
            </p>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl mb-8">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === m ? "bg-white dark:bg-gray-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-6">
              ⚠ {error}
            </div>
          )}
          {message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-sm p-3 rounded-xl mb-6">
              ✓ {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@syncnol.io"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fintech-primary/50 focus:border-fintech-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fintech-primary/50 focus:border-fintech-primary transition-all"
              />
            </div>

            {isSignup && (
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-fintech-primary focus:ring-fintech-primary dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-500 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/privacy"
                    className="text-fintech-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/terms"
                    className="text-fintech-primary hover:underline"
                  >
                    Terms of Service
                  </Link>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading
                ? "Processing..."
                : isSignup
                  ? "Create Account"
                  : "Enter Command Center"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> Secured by Supabase
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
