'use client';
import { useState } from 'react';
import { PaymentScheduleItem } from '@tenancy/types';
import { generateSchedule } from '@/lib/paymentPlan';
import SchedulePreview from './SchedulePreview';

export default function PlanBuilder() {
  const [amount, setAmount] = useState(0);
  const [interest, setInterest] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState<PaymentScheduleItem[]>([]);

  function updateSchedule() {
    if (!startDate) return;
    setSchedule(
      generateSchedule(amount, interest, installments, new Date(startDate)),
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 max-w-sm">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          placeholder="Amount"
          className="border p-1"
        />
        <input
          type="number"
          step="0.01"
          value={interest}
          onChange={(e) => setInterest(parseFloat(e.target.value))}
          placeholder="Interest rate"
          className="border p-1"
        />
        <input
          type="number"
          value={installments}
          onChange={(e) => setInstallments(parseInt(e.target.value))}
          placeholder="Installments"
          className="border p-1"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-1"
        />
        <button
          onClick={updateSchedule}
          className="px-2 py-1 bg-blue-600 text-white"
        >
          Preview
        </button>
      </div>
      <SchedulePreview schedule={schedule} />
    </div>
  );
}
