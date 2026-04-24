import { createContext, useContext, useState } from "react";
import { translations } from "../i18n/translations";

// 5.1 – React Context to manage global language state
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("ID"); // Default: Bahasa Indonesia

  // t(key) – resolves a translation key to a string in the active language
  const t = (key) => {
    const dict = translations[lang];
    return dict?.[key] ?? key; // fallback: return the key itself
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for easy consumption
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
