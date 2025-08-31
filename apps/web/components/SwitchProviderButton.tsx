'use client';

import { Button } from '@tenancy/ui';

interface Props {
  providerId: string;
}

export function SwitchProviderButton({ providerId }: Props) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const switchProvider = async () => {
    await fetch(`${apiUrl}/utility-providers/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId }),
    });
    alert('Switched provider');
  };
  return <Button label="Switch" onClick={switchProvider} />;
}
