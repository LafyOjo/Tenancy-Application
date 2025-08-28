'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@tenancy/ui';
import { StatusChip } from '../../../components/StatusChip';
import { AutopayToggle } from '../../../components/AutopayToggle';
import { PayNowButton } from '../../../components/PayNowButton';
import { ProviderBadge } from '../../../components/ProviderBadge';
import Link from 'next/link';

export default function LeasePage() {
  const params = useParams();
  const id = (params as any).id as string;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signStatus, setSignStatus] = useState<'idle' | 'pending' | 'signed'>('idle');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  return (
    <div className="space-y-4">
      <div className="space-x-2">
        <Button onClick={generatePdf}>Generate PDF</Button>
        <Button onClick={sendForSignature}>Send for signature</Button>
        <Link href={`/leases/${id}/amendments`} className="underline">
          View amendments
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
      <div className="flex space-x-2">
        {pdfUrl && <StatusChip text="PDF generated" color="green" />}
        {signStatus === 'pending' && <StatusChip text="Signature pending" color="yellow" />}
        {signStatus === 'signed' && <StatusChip text="Signed" color="green" />}
      </div>
    </div>
  );
}
