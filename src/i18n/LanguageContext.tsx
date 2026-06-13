import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from './translations';
import { geoService } from '@/api/services/geoService';
import { translationService, TranslationMap } from '@/api/services/translationService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
  /** Backend geo's suggested language if it differs from current and user hasn't dismissed. */
  geoSuggestion: Language | null;
  /** Switch to the geo-suggested language and remember the choice. */
  acceptSuggestion: () => void;
  /** Keep current language; remember dismissal so banner doesn't reappear. */
  dismissSuggestion: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'magadh_explora_language';
const SUGGESTION_DISMISSED_KEY = 'magadh_explora_lang_suggest_dismissed';

const SUPPORTED: Language[] = ['en', 'hi', 'zh', 'ja', 'th', 'si', 'vi', 'dz'];

function isSupported(code: string | undefined | null): code is Language {
  return !!code && (SUPPORTED as string[]).includes(code);
}

/** Deep-merge a flat dotted-key override map into a nested defaults object. */
function applyOverrides<T extends object>(defaults: T, overrides: TranslationMap): T {
  if (!overrides || Object.keys(overrides).length === 0) return defaults;
  // Structuredclone-safe deep copy of the defaults so we don't mutate the source object
  const merged: any = JSON.parse(JSON.stringify(defaults));
  for (const [path, value] of Object.entries(overrides)) {
    if (!path || value == null) continue;
    const parts = path.split('.');
    let cursor = merged;
    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i];
      if (typeof cursor[segment] !== 'object' || cursor[segment] === null) {
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return merged as T;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [overrides, setOverrides] = useState<TranslationMap>({});
  const [geoSuggestion, setGeoSuggestion] = useState<Language | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Boot: pick initial language from localStorage → browser; then ask backend geo for a suggestion.
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      const browser = navigator.language.split('-')[0];

      let initial: Language = 'en';
      if (isSupported(saved)) initial = saved;
      else if (isSupported(browser)) initial = browser;

      if (!cancelled) setLanguageState(initial);

      // Backend geo — never block UI on this.
      try {
        const geo = await geoService.lookup();
        if (cancelled) return;
        if (
          isSupported(geo.suggestedLang) &&
          geo.suggestedLang !== initial &&
          localStorage.getItem(SUGGESTION_DISMISSED_KEY) !== geo.suggestedLang
        ) {
          setGeoSuggestion(geo.suggestedLang);
        }
        // If user never picked a language and browser didn't match, silently adopt geo's choice.
        if (!saved && !isSupported(browser) && isSupported(geo.suggestedLang)) {
          setLanguageState(geo.suggestedLang);
        }
      } catch {
        /* ignore — geo is best-effort */
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    };

    boot();
    return () => { cancelled = true; };
  }, []);

  // Whenever language changes, pull translation overrides from backend.
  useEffect(() => {
    let cancelled = false;
    translationService.public(language)
        .then((map) => { if (!cancelled) setOverrides(map ?? {}); })
        .catch(() => { if (!cancelled) setOverrides({}); });
    return () => { cancelled = true; };
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    if (geoSuggestion === lang) setGeoSuggestion(null);
  }, [geoSuggestion]);

  const acceptSuggestion = useCallback(() => {
    if (geoSuggestion) {
      setLanguage(geoSuggestion);
      setGeoSuggestion(null);
    }
  }, [geoSuggestion, setLanguage]);

  const dismissSuggestion = useCallback(() => {
    if (geoSuggestion) {
      localStorage.setItem(SUGGESTION_DISMISSED_KEY, geoSuggestion);
    }
    setGeoSuggestion(null);
  }, [geoSuggestion]);

  const t = useMemo(
      () => applyOverrides(translations[language], overrides),
      [language, overrides],
  ) as TranslationKey;

  if (!isInitialized) return null;

  return (
    <LanguageContext.Provider
        value={{ language, setLanguage, t, geoSuggestion, acceptSuggestion, dismissSuggestion }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
