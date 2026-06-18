"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries } from "@/lib/dictionaries";

export type Language = "en" | "ur";
export type FontSize = "small" | "medium" | "large";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang");
    if (savedLang === "ur" || savedLang === "en") {
      setLanguage(savedLang);
    }
    const savedFont = localStorage.getItem("app_font_size") as FontSize;
    if (savedFont === "small" || savedFont === "medium" || savedFont === "large") {
      setFontSize(savedFont);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("app_lang", language);
    }
  }, [language, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("app_font_size", fontSize);
      let scale = "1";
      if (fontSize === "small") scale = "0.9";
      if (fontSize === "large") scale = "1.15";
      document.documentElement.style.setProperty("--font-scale", scale);
    }
  }, [fontSize, isLoaded]);

  const t = (key: string) => {
    const dictionary = dictionaries[language];
    return dictionary[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, fontSize, setFontSize, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
