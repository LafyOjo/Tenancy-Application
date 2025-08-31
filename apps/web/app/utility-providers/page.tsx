import { UtilityProvider, ReferralCommission } from '@tenancy/types';
import { SwitchProviderButton } from '../../components/SwitchProviderButton';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getProviders(): Promise<UtilityProvider[]> {
  const res = await fetch(`${apiUrl}/utility-providers`, { cache: 'no-store' });
  return res.json();
}

async function getCommissions(): Promise<ReferralCommission[]> {
  const res = await fetch(`${apiUrl}/utility-providers/referrals`, { cache: 'no-store' });
  return res.json();
}

export default async function UtilityProvidersPage() {
  const [providers, commissions] = await Promise.all([
    getProviders(),
    getCommissions(),
  ]);
  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Utility Providers</h1>
      {providers.map((p) => (
        <div key={p.id} className="border p-4 rounded">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <p>Rate: ${p.rate.toFixed(2)} per kWh</p>
          <p>Estimated Savings: ${p.estimatedSavings.toFixed(2)}</p>
          <SwitchProviderButton providerId={p.id} />
        </div>
      ))}
      <div className="pt-4 font-medium">
        Total referral commissions: ${totalCommission.toFixed(2)}
      </div>
    </div>
  );
}
