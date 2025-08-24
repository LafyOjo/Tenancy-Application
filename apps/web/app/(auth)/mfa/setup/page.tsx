'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function MfaSetupPage() {
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    fetch('/api/auth/mfa/setup', { method: 'POST' })
      .then(res => res.json())
      .then(async data => {
        setSecret(data.secret);
        const img = await QRCode.toDataURL(data.otpauthUrl);
        setQr(img);
      });
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  }

  return (
    <div>
      <h1>MFA Setup</h1>
      {qr && <img src={qr} alt="QR Code" />}
      <p>Secret: {secret}</p>
      <form onSubmit={handleVerify}>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code" />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}
