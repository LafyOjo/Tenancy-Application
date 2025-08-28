'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatusChip } from '../../../../components/StatusChip';

export default function LeaseAmendmentsPage() {
  const params = useParams();
  const leaseId = (params as any).id as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [amendments, setAmendments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${apiUrl}/leases/${leaseId}/amendments`)
      .then((res) => res.json())
      .then(setAmendments)
      .catch(() => setAmendments([]));
  }, [apiUrl, leaseId]);

  return (
    <div className="space-y-4">
      <h1>Amendments</h1>
      <ul className="space-y-2">
        {amendments.map((a) => (
          <li key={a.id} className="flex items-center space-x-2">
            <span>v{a.version}</span>
            <StatusChip text={a.status} color="blue" />
          </li>
        ))}
      </ul>
    </div>
  );
}
