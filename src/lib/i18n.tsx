'use client';

import React, { createContext, useContext, useState } from 'react';
import { en } from './translations/en';
import { pt } from './translations/pt';
import type { TranslationKeys } from './translations/en';

type Lang = 'en' | 'pt';

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'pt',
  setLang: () => {},
  t: pt,
});

const dictionaries: Record<Lang, TranslationKeys> = { en, pt };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('pt');
  const value: I18nContextValue = {
    lang,
    setLang,
    t: dictionaries[lang],
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Returns the current translation dictionary and language utilities. */
export function useI18n() {
  return useContext(I18nContext);
}
