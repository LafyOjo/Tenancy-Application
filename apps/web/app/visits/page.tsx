'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Visit {
  id: string;
  scheduledAt: string;
  type: string;
}

export default function VisitsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    fetch('/api/visits')
      .then((r) => r.json())
      .then(setVisits)
      .catch(() => {});
  }, []);

  const dayVisits = visits.filter(
    (v) => new Date(v.scheduledAt).toDateString() === date.toDateString(),
  );

  return (
    <div className="p-4 space-y-4">
      <Calendar onChange={(d) => setDate(d as Date)} value={date} />
      <div>
        <h2 className="font-bold">
          Visits on {date.toDateString()}
        </h2>
        <ul className="list-disc pl-4">
          {dayVisits.map((v) => (
            <li key={v.id}>
              {v.type} at {new Date(v.scheduledAt).toLocaleTimeString()} -
              <a
                href={`/visits/${v.id}/call`}
                className="text-blue-600 underline ml-1"
              >
                Call
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

