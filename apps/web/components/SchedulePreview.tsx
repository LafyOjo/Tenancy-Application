import { PaymentScheduleItem } from '@tenancy/types';

export default function SchedulePreview({
  schedule,
}: {
  schedule: PaymentScheduleItem[];
}) {
  if (!schedule.length) return null;
  return (
    <table className="mt-4 w-full text-left border">
      <thead>
        <tr>
          <th className="border px-2">Due Date</th>
          <th className="border px-2">Amount</th>
          <th className="border px-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((item, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-2">
              {item.dueDate.toISOString().slice(0, 10)}
            </td>
            <td className="px-2">{item.amount.toFixed(2)}</td>
            <td className="px-2">
              {item.paid ? 'Paid' : item.inDunning ? 'Dunning' : 'Pending'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
