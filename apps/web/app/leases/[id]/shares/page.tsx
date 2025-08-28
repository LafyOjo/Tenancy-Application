'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@tenancy/ui';

export default function LeaseSharesPage() {
  const params = useParams();
  const id = (params as any).id as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [shares, setShares] = useState<any[]>([]);

  const fetchShares = async () => {
    const res = await fetch(`${apiUrl}/leases/${id}/shares`);
    const data = await res.json();
    setShares(data);
  };

  useEffect(() => {
    fetchShares();
  }, [id]);

  const updateShare = (idx: number, field: string, value: any) => {
    setShares(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const save = async () => {
    await fetch(`${apiUrl}/leases/${id}/shares`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shares),
    });
    fetchShares();
  };

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Member</th>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {shares.map((share, idx) => (
            <tr key={share.membershipId}>
              <td>{share.membershipId}</td>
              <td>
                <select
                  value={share.type}
                  onChange={e => updateShare(idx, 'type', e.target.value)}
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={share.value}
                  onChange={e => updateShare(idx, 'value', parseFloat(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={save}>Save</Button>
    </div>
  );
}
