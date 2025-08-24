'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@tenancy/ui';

export default function Page() {
  const { t } = useTranslation();
  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">{t('welcome')}</h1>
      <Button label={t('clickMe')} />
    </main>
  );
}
