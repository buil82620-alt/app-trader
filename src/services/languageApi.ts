export type LanguageCode =
  | 'en'
  | 'ja'
  | 'ko'
  | 'zh-TW'
  | 'th'
  | 'vi'
  | 'fr'
  | 'de'
  | 'ru'
  | 'es';

export interface Language {
  code: LanguageCode;
  label: string;
  flagUrl: string;
}

// Fake API call for now – can be replaced with real backend later
export async function fetchLanguages(): Promise<Language[]> {
  // In a real app, you could do:
  // const res = await fetch('/api/languages');
  // return res.json();

  // Using flagcdn for demo flags
  return [
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/us.svg' },
    { code: 'ja', label: '日本語', flagUrl: 'https://flagcdn.com/jp.svg' },
    { code: 'vi', label: 'Tiếng Việt', flagUrl: 'https://flagcdn.com/vn.svg' },
  ];
}


