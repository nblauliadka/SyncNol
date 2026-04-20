import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      session: null,
      dbUserId: null,
      userName: "Agent",
      setSession: (session) => set({ session }),
      setDbUserId: (id) => set({ dbUserId: id }),
      setUserName: (name) => set({ userName: name }),

      // Onboarding
      onboardingDone: false,
      onboardingData: {
        financialGoal: "",
        role: "",
        referralSource: "",
      },
      setOnboardingData: (data) => set({ onboardingData: data }),
      completeOnboarding: () => set({ onboardingDone: true }),

      // Financial summary
      summary: {
        net_worth: 0,
        pemasukan: 0,
        pengeluaran: 0,
        total_utang: 0,
        nama: "Agent",
      },
      transactions: [],
      setSummary: (summary) => set({ summary }),
      setTransactions: (transactions) => set({ transactions }),

      // Chat
      chatHistory: [],
      addChatMessage: (msg) =>
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),

      // AI Persona
      aiPersona: "roast", // 'zen' | 'roast' | 'ceo'
      setAiPersona: (persona) => set({ aiPersona: persona }),

      // UI Prefs
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      theme: "light", // default to light for FinTech
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      // Currency
      currency: "IDR",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "syncnol-storage",
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        onboardingData: state.onboardingData,
        theme: state.theme,
      }),
    },
  ),
);

export default useAppStore;
