'use client';

import { Button } from '@tenancy/ui';

interface Props {
  invoiceId: string;
}

export function PayNowButton({ invoiceId }: Props) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const pay = async () => {
    const res = await fetch(`${apiUrl}/payments/invoice/${invoiceId}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'stripe' }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
  };
  return <Button onClick={pay}>Pay now</Button>;
}
