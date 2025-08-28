'use client';

import { useState } from 'react';
import { Button } from '@tenancy/ui';

export default function LedgerPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchEntries = async () => {
    const res = await fetch(`${apiUrl}/ledger?start=${start}&end=${end}`);
    const data = await res.json();
    setEntries(data);
  };

  const downloadCsv = async () => {
    const res = await fetch(`${apiUrl}/ledger/export?start=${start}&end=${end}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-x-2">
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <Button onClick={fetchEntries}>Filter</Button>
        <Button onClick={downloadCsv}>Download CSV</Button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>{new Date(entry.date).toLocaleDateString()}</td>
              <td>{entry.description}</td>
              <td>{entry.debitAccount}</td>
              <td>{entry.creditAccount}</td>
              <td>{entry.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
