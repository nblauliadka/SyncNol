import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../store/useAppStore";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    id: "name",
    question: "How should J.A.R.V.I.S call you?",
    subtitle: "Confirm or update your agent alias.",
    type: "input",
    placeholder: "Agent Name",
  },
  {
    id: "monthly_income",
    question: "What is your base monthly income?",
    subtitle: "Used to calculate your runway and safe-to-spend limit.",
    type: "number",
    placeholder: "e.g. 5000000",
  },
  {
    id: "goal",
    question: "What's your primary financial goal?",
    subtitle: "The AI will prioritize its recommendations around this target.",
    type: "options",
    options: [
      {
        value: "debt_freedom",
        label: "⚔️ Kill My Debt",
        desc: "Get debt-free as fast as possible",
      },
      {
        value: "emergency_fund",
        label: "🛡️ Build Emergency Fund",
        desc: "3–6 months of safety net",
      },
      {
        value: "invest",
        label: "📈 Start Investing",
        desc: "Grow wealth through stocks or assets",
      },
      {
        value: "big_purchase",
        label: "🏠 Save for Big Purchase",
        desc: "House, car, gadget, travel",
      },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const {
    dbUserId,
    setOnboardingData,
    completeOnboarding,
    setDbUserId,
    setUserName,
    theme,
  } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: "",
    monthly_income: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !answers.name) {
        setAnswers((prev) => ({
          ...prev,
          name: session.user.email.split("@")[0],
        }));
      }
    });
  }, []);

  const currentStep = STEPS[step];
  const currentAnswer = answers[currentStep.id];

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
  };

  const handleNext = async () => {
    if (!currentAnswer && currentStep.type !== "input") return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      try {
        let currentUserId = dbUserId;
        if (!currentUserId) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            const res = await axios.post(
              "http://127.0.0.1:8000/api/sync-user",
              {
                email: session.user.email,
                nama: answers.name || session.user.email.split("@")[0],
              },
            );
            if (res.data.status === "success") {
              currentUserId = res.data.user_id;
              setDbUserId(currentUserId);
            }
          }
        }

        if (currentUserId) {
          await axios.post(
            `http://127.0.0.1:8000/api/users/${currentUserId}/onboarding`,
            {
              nama: answers.name,
              pekerjaan: "Agent",
              tujuan_keuangan: answers.goal,
              pendapatan_bulanan: parseFloat(answers.monthly_income) || 0,
            },
          );
          setUserName(answers.name);
        }
      } catch (err) {
        console.error("Onboarding sync error:", err);
      }
      setOnboardingData(answers);
      completeOnboarding();
      setLoading(false);
      navigate("/app/dashboard", { replace: true });
    }
  };

  const progress = ((step + (currentAnswer ? 1 : 0)) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-fintech-light dark:bg-fintech-dark text-slate-900 dark:text-slate-50 flex items-center justify-center p-6 relative font-sans transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-fintech-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-fintech-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
            {currentStep.question}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {currentStep.subtitle}
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {currentStep.type === "options" ? (
              currentStep.options.map((opt) => {
                const isSelected = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between
                      ${
                        isSelected
                          ? "border-fintech-primary bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                      }
                    `}
                  >
                    <div>
                      <div
                        className={`font-semibold text-base ${isSelected ? "text-fintech-primary dark:text-blue-400" : "text-slate-900 dark:text-slate-200"}`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {opt.desc}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${isSelected ? "border-fintech-primary bg-fintech-primary" : "border-slate-300 dark:border-slate-600"}`}
                    >
                      {isSelected && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <input
                type={currentStep.type}
                value={currentAnswer || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentStep.id]: e.target.value,
                  }))
                }
                placeholder={currentStep.placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-lg font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-fintech-primary focus:ring-4 focus:ring-fintech-primary/20 transition-all"
                autoFocus
              />
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!currentAnswer || loading}
            className="w-full bg-fintech-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Initializing Agent..."
              : step === STEPS.length - 1
                ? "Launch Command Center"
                : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
