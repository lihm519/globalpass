"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "./translations";

type Language = "en" | "zh-CN" | "zh-TW" | "ja" | "ko" | "es" | "fr" | "de" | "pt" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  // Prevent hydration mismatch by rendering default state on server
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage: () => {}, t: (key) => key }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
