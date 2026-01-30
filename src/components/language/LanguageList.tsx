import { useEffect, useState } from 'react';
import { useLanguageStore } from '../../stores/languageStore';
import LanguageItem from './LanguageItem';
import { fetchLanguages, type Language } from '../../services/languageApi';

export default function LanguageList() {
  const { current, setLanguage, hydrate } = useLanguageStore();
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    hydrate();
    fetchLanguages()
      .then((data) => setLanguages(data))
      .catch(() => {
        // In case API fails, keep list empty or handle fallback here
      });
  }, [hydrate]);

  return (
    <div className="px-4 pt-5 pb-6 bg-gray-900 min-h-[calc(100vh-56px)]">
      {languages.map((lang) => (
        <LanguageItem
          key={lang.code}
          flagUrl={lang.flagUrl}
          label={lang.label}
          code={lang.code}
          selected={current === lang.code}
          onSelect={() => setLanguage(lang.code as any)}
        />
      ))}
    </div>
  );
}


