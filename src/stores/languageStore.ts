import { create } from 'zustand';

export type LanguageCode =
  | 'en'
  | 'ja'
  | 'vi'

interface LanguageState {
  current: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  hydrated: boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'trader_language';

export const useLanguageStore = create<LanguageState>((set, get) => ({
  current: 'en',
  hydrated: false,
  setLanguage: (code) => {
    set({ current: code });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, code);
    }
  },
  hydrate: () => {
    if (get().hydrated) return;
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved) {
      set({ current: saved, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
}));


