'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-x-2">
      <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
        EN
      </button>
      <button onClick={() => changeLanguage('es')} disabled={i18n.language === 'es'}>
        ES
      </button>
    </div>
  );
}
