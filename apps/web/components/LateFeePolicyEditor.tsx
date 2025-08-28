'use client';

import { useState } from 'react';
import type { LateFeePolicy } from '@tenancy/types';

export function LateFeePolicyEditor() {
  const [policy, setPolicy] = useState<LateFeePolicy>({
    firstLateFee: 25,
    secondLateFee: 25,
  });
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">First late fee (due +3)</label>
        <input
          type="number"
          value={policy.firstLateFee}
          onChange={(e) =>
            setPolicy({ ...policy, firstLateFee: Number(e.target.value) })
          }
          className="border p-2 rounded w-32"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Second late fee (due +7)</label>
        <input
          type="number"
          value={policy.secondLateFee}
          onChange={(e) =>
            setPolicy({ ...policy, secondLateFee: Number(e.target.value) })
          }
          className="border p-2 rounded w-32"
        />
      </div>
      <div>
        <h2 className="font-medium">Timeline Preview</h2>
        <ul className="list-disc pl-5">
          <li>T-3: Reminder</li>
          <li>Due: Reminder</li>
          <li>
            +3: Reminder &amp; Late Fee $
            {policy.firstLateFee.toFixed(2)}
          </li>
          <li>
            +7: Reminder &amp; Late Fee $
            {policy.secondLateFee.toFixed(2)}
          </li>
        </ul>
      </div>
    </div>
  );
}

