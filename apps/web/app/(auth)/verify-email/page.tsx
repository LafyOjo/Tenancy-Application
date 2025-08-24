'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (token) {
      fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).then(() => setStatus('Email verified')); 
    }
  }, [token]);

  return <p>{status}</p>;
}
