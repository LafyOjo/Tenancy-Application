'use client';

import { useState } from 'react';
import { Button } from '@tenancy/ui';

interface Props {
  leaseId: string;
}

export function AutopayToggle({ leaseId }: Props) {
  const [enabled, setEnabled] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const toggle = async () => {
    await fetch(`${apiUrl}/payments/mandate/${leaseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'stripe' }),
    });
    setEnabled(true);
  };
  return (
    <Button onClick={toggle}>{enabled ? 'Autopay enabled' : 'Enable autopay'}</Button>
  );
}
