'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

type Filters = {
  startDate: string;
  endDate: string;
  propertyId: string;
  unitId: string;
};

type Metrics = {
  arrears: number;
  dso: number;
  rate: number;
  mttr: number;
  overage: number;
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    propertyId: '',
    unitId: '',
  });
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const query = params.toString();
    async function load() {
      const [a, d, r, m, o] = await Promise.all([
        fetch(`${API_URL}/analytics/arrears?${query}`).then((res) => res.json()),
        fetch(`${API_URL}/analytics/dso?${query}`).then((res) => res.json()),
        fetch(`${API_URL}/analytics/on-time-rate?${query}`).then((res) =>
          res.json(),
        ),
        fetch(`${API_URL}/analytics/mttr?${query}`).then((res) => res.json()),
        fetch(`${API_URL}/analytics/utility-overage?${query}`).then((res) =>
          res.json(),
        ),
      ]);
      setMetrics({
        arrears: a.arrears ?? 0,
        dso: d.dso ?? 0,
        rate: r.rate ?? 0,
        mttr: m.mttr ?? 0,
        overage: o.overage ?? 0,
      });
    }
    load();
  }, [filters]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="border p-1"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className="border p-1"
        />
        <input
          type="text"
          name="propertyId"
          placeholder="Property ID"
          value={filters.propertyId}
          onChange={handleChange}
          className="border p-1"
        />
        <input
          type="text"
          name="unitId"
          placeholder="Unit ID"
          value={filters.unitId}
          onChange={handleChange}
          className="border p-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Arrears</h2>
          <p>{metrics ? metrics.arrears.toFixed(2) : '-'}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">DSO</h2>
          <p>{metrics ? metrics.dso.toFixed(2) : '-'}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">On-time Payment Rate</h2>
          <p>{metrics ? (metrics.rate * 100).toFixed(2) : '-'}%</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">MTTR (hrs)</h2>
          <p>{metrics ? metrics.mttr.toFixed(2) : '-'}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Utility Overage</h2>
          <p>{metrics ? metrics.overage.toFixed(2) : '-'}</p>
        </div>
      </div>
    </div>
  );
}

