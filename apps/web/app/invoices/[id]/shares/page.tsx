'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvoiceSharesPage() {
  const params = useParams();
  const id = (params as any).id as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    const fetchShares = async () => {
      const res = await fetch(`${apiUrl}/invoices/${id}/shares`);
      const data = await res.json();
      setShares(data);
    };
    fetchShares();
  }, [id]);

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Member</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {shares.map(share => (
            <tr key={share.membershipId}>
              <td>{share.membershipId}</td>
              <td>{share.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
