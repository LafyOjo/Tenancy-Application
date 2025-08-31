import { PayoutLedgerEntry } from '@tenancy/types';
import { GenerateLinkForm } from './GenerateLinkForm';
import { TrackReferralForm } from './TrackReferralForm';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getLedger(): Promise<PayoutLedgerEntry[]> {
  const res = await fetch(`${apiUrl}/referrals/ledger`, { cache: 'no-store' });
  return res.json();
}

export default async function ReferralsPage() {
  const ledger = await getLedger();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Referrals</h1>
      <GenerateLinkForm />
      <TrackReferralForm />
      <h2 className="text-lg font-semibold pt-4">Payout Ledger</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Referral</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Paid</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-2 py-1">{entry.referralId}</td>
              <td className="border px-2 py-1">${entry.amount.toFixed(2)}</td>
              <td className="border px-2 py-1">{entry.paid ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
