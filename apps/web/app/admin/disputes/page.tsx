import { Dispute } from '@tenancy/types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getDisputes(): Promise<Dispute[]> {
  const res = await fetch(`${apiUrl}/disputes`, { cache: 'no-store' });
  return res.json();
}

export default async function AdminDisputesPage() {
  const disputes = await getDisputes();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Disputes</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Claimant</th>
            <th className="border px-2 py-1">Respondent</th>
            <th className="border px-2 py-1">Issue</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((d) => (
            <tr key={d.id}>
              <td className="border px-2 py-1">{d.claimant}</td>
              <td className="border px-2 py-1">{d.respondent}</td>
              <td className="border px-2 py-1">{d.issue}</td>
              <td className="border px-2 py-1">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
