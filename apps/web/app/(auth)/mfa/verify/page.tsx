'use client';
import { useState } from 'react';

export default function MfaVerifyPage() {
  const [code, setCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  }

  return (
    <div>
      <h1>MFA Verification</h1>
      <form onSubmit={handleSubmit}>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code" />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}
