'use client';

import { useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function GenerateLinkForm() {
  const [providerId, setProviderId] = useState('');
  const [link, setLink] = useState<string | null>(null);

  const generate = async () => {
    const res = await fetch(`${apiUrl}/referrals/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId }),
    });
    const data = await res.json();
    setLink(data.url);
  };

  return (
    <div className="space-y-2">
      <input
        className="border p-1"
        value={providerId}
        onChange={(e) => setProviderId(e.target.value)}
        placeholder="Provider ID"
      />
      <button className="border px-3 py-1" onClick={generate}>
        Generate Link
      </button>
      {link && <div className="text-sm break-all">Link: {link}</div>}
    </div>
  );
}
