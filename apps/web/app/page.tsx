'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@tenancy/ui';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Page() {
  const { t } = useTranslation('common');
  return (
    <main className="p-4 space-y-4">
      <LanguageSwitcher />
      <h1 className="text-xl">{t('welcome')}</h1>
      <Button label={t('clickMe')} />
    </main>
  );
}
