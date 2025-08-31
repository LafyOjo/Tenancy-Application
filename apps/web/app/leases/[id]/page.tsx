'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@tenancy/ui';
import { StatusChip } from '../../../components/StatusChip';
import { AutopayToggle } from '../../../components/AutopayToggle';
import { PayNowButton } from '../../../components/PayNowButton';
import { ProviderBadge } from '../../../components/ProviderBadge';
import Link from 'next/link';
import { DepositInsuranceQuote } from '@tenancy/types';

export default function LeasePage() {
  const params = useParams();
  const id = (params as any).id as string;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signStatus, setSignStatus] = useState<'idle' | 'pending' | 'signed'>('idle');
  const [deposit, setDeposit] = useState<any | null>(null);
  const [insurance, setInsurance] = useState<DepositInsuranceQuote | null>(null);
  const [deduction, setDeduction] = useState(0);
  const [risk, setRisk] = useState<
    | { churnRisk: number; maintenanceForecast: number }
    | null
  >(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetch(`${apiUrl}/leases/${id}/deposit`)
      .then(res => res.json())
      .then(setDeposit);
  }, [apiUrl, id]);

  useEffect(() => {
    fetch(`${apiUrl}/leases/${id}/deposit/insurance`)
      .then(res => res.json())
      .then(setInsurance);
  }, [apiUrl, id]);

  useEffect(() => {
    fetch(`${apiUrl}/analytics/risk/${id}`)
      .then(res => res.json())
      .then(setRisk);
  }, [apiUrl, id]);

  const generatePdf = async () => {
    const res = await fetch(`${apiUrl}/leases/${id}/pdf`);
    const data = await res.json();
    setPdfUrl(data.url);
  };

  const sendForSignature = async () => {
    const res = await fetch(`${apiUrl}/leases/${id}/esign/start`, { method: 'POST' });
    const data = await res.json();
    setSignStatus('pending');
    if (data.url) window.open(data.url, '_blank');
  };

  const recordMoveOut = async () => {
    await fetch(`${apiUrl}/leases/${id}/move-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deductionAmount: deduction }),
    });
    const dep = await fetch(`${apiUrl}/leases/${id}/deposit`).then(res => res.json());
    setDeposit(dep);
  };

  const approveMoveOut = async () => {
    await fetch(`${apiUrl}/leases/${id}/move-out/approve`, { method: 'POST' });
    const dep = await fetch(`${apiUrl}/leases/${id}/deposit`).then(res => res.json());
    setDeposit(dep);
  };

  return (
    <div className="space-y-4">
      <div className="space-x-2">
        <Button onClick={generatePdf}>Generate PDF</Button>
        <Button onClick={sendForSignature}>Send for signature</Button>
        <Link href={`/leases/${id}/amendments`} className="underline">
          View amendments
        </Link>
        <Link href={`/leases/${id}/shares`} className="underline">
          Configure shares
        </Link>
      </div>
      <div className="space-x-2">
        <AutopayToggle leaseId={id} />
        <PayNowButton invoiceId={id} />
      </div>
      <div className="flex space-x-2">
        <ProviderBadge provider="stripe" />
        <ProviderBadge provider="paypal" />
        <ProviderBadge provider="square" />
      </div>
      {risk && (
        <div className="space-y-1">
          <div>Churn Risk: {(risk.churnRisk * 100).toFixed(0)}%</div>
          <div>Maintenance Forecast: ${risk.maintenanceForecast.toFixed(2)}</div>
        </div>
      )}
      {deposit && (
        <div className="space-y-2">
          <div>Deposit Amount: {deposit.amount}</div>
          {deposit.schemeRef && <div>Scheme Ref: {deposit.schemeRef}</div>}
          {deposit.protectedAt && (
            <div>
              Protected: {new Date(deposit.protectedAt).toLocaleDateString()}
            </div>
          )}
          {deposit.returnedAt && (
            <div>
              Returned: {new Date(deposit.returnedAt).toLocaleDateString()}
            </div>
          )}
          {deposit.deductionAmount && (
            <div>Deduction: {deposit.deductionAmount}</div>
          )}
          <div>Status: {deposit.approved ? 'Approved' : 'Pending'}</div>
          {!deposit.returnedAt && (
            <div className="space-x-2">
              <input
                type="number"
                value={deduction}
                onChange={e => setDeduction(parseFloat(e.target.value))}
                className="border p-1"
              />
              <Button onClick={recordMoveOut}>Record Move-out</Button>
            </div>
          )}
          {deposit.returnedAt && !deposit.approved && (
            <Button onClick={approveMoveOut}>Approve Deduction</Button>
          )}
        </div>
      )}
      {insurance && (
        <div className="space-y-2">
          <div>
            Insurance Premium: {insurance.cost} ({insurance.billingFrequency})
          </div>
          <div>Cash Deposit: {insurance.depositAmount}</div>
          <div>
            Upfront Savings: {insurance.depositAmount - insurance.cost}
          </div>
          <Link href={insurance.policyUrl} className="underline">
            View policy
          </Link>
        </div>
      )}
      <div className="flex space-x-2">
        {pdfUrl && <StatusChip text="PDF generated" color="green" />}
        {signStatus === 'pending' && <StatusChip text="Signature pending" color="yellow" />}
        {signStatus === 'signed' && <StatusChip text="Signed" color="green" />}
      </div>
    </div>
  );
}
