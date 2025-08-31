'use client';

import { useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function TrackReferralForm() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const track = async () => {
    const res = await fetch(`${apiUrl}/referrals/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setResult(data.error ? data.error : 'Tracked');
  };

  return (
    <div className="space-y-2">
      <input
        className="border p-1"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Referral Code"
      />
      <button className="border px-3 py-1" onClick={track}>
        Track Referral
      </button>
      {result && <div className="text-sm">{result}</div>}
    </div>
  );
}
