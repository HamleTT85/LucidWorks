import { useState, useEffect, useCallback } from 'react';
import de from './de.json';
import en from './en.json';

type Language = 'de' | 'en';
type Translations = typeof de;

const translations: Record<Language, Translations> = { de, en };

const STORAGE_KEY = 'lucidworks-lang';

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'de' || stored === 'en') return stored;
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === 'de' ? 'de' : 'en';
}

// Global state so all components share the same language
let globalLang: Language = 'en';
const listeners = new Set<(lang: Language) => void>();

function setGlobalLang(lang: Language) {
  globalLang = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
  listeners.forEach((cb) => cb(lang));
}

// Initialize on first load
if (typeof window !== 'undefined') {
  globalLang = getInitialLang();
  document.documentElement.lang = globalLang;
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>(globalLang);

  useEffect(() => {
    const handler = (newLang: Language) => setLang(newLang);
    listeners.add(handler);
    // Sync in case globalLang changed before mount
    setLang(globalLang);
    return () => { listeners.delete(handler); };
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: unknown = translations[lang];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Fallback: return the key
        }
      }
      if (typeof value !== 'string') return key;
      if (vars) {
        return Object.entries(vars).reduce(
          (str, [varKey, varVal]) => str.replace(`{${varKey}}`, String(varVal)),
          value
        );
      }
      return value;
    },
    [lang]
  );

  const toggleLang = useCallback(() => {
    setGlobalLang(globalLang === 'de' ? 'en' : 'de');
  }, []);

  return { t, lang, toggleLang, setLang: setGlobalLang };
}

export type { Language, Translations };
