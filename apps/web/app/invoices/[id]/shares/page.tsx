import i18n from '@/i18n';
import { formatCurrency } from '@/lib/format';
import { headers } from 'next/headers';

interface Share {
  membershipId: string;
  amount: number;
  currency?: string;
}

export default async function InvoiceSharesPage({ params }: { params: { id: string } }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/invoices/${params.id}/shares`);
  const shares: Share[] = await res.json();

  const locale = headers().get('accept-language')?.split(',')[0] || 'en-US';
  const t = i18n.getFixedT(locale, 'invoices');

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>{t('member')}</th>
            <th>{t('amount')}</th>
          </tr>
        </thead>
        <tbody>
          {shares.map(share => (
            <tr key={share.membershipId}>
              <td>{share.membershipId}</td>
              <td>{formatCurrency(share.amount, share.currency || 'USD', locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
