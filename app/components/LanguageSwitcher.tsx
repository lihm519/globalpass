"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { Globe } from "lucide-react";

const languages = [
  { code: "en" as const, name: "English", flag: "🇬🇧" },
  { code: "zh-CN" as const, name: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW" as const, name: "繁體中文", flag: "🇹🇼" },
  { code: "ja" as const, name: "日本語", flag: "🇯🇵" },
  { code: "ko" as const, name: "한국어", flag: "🇰🇷" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
  { code: "fr" as const, name: "Français", flag: "🇫🇷" },
  { code: "de" as const, name: "Deutsch", flag: "🇩🇪" },
  { code: "pt" as const, name: "Português", flag: "🇵🇹" },
  { code: "ru" as const, name: "Русский", flag: "🇷🇺" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 ${
                language === lang.code ? "bg-emerald-500/20 text-emerald-400" : ""
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
