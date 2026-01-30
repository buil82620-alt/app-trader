import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { useLanguageStore } from '../stores/languageStore';

export function useAppTranslation() {
  const { current, hydrate } = useLanguageStore();
  const translation = useTranslation();

  // Đảm bảo state language được hydrate từ localStorage
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Đồng bộ i18next với languageStore
  useEffect(() => {
    i18n.changeLanguage(current);
  }, [current]);

  return translation;
}


