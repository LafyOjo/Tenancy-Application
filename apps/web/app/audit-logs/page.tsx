import React from 'react';

type AuditLog = {
  id: string;
  actorId?: string;
  action: string;
  target?: string;
  createdAt: string;
};

async function fetchLogs(
  searchParams: Record<string, string | undefined>
): Promise<AuditLog[]> {
  const query = new URLSearchParams(searchParams as Record<string, string>);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/audit-logs?${query.toString()}`,
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const logs = await fetchLogs(searchParams);
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Audit Logs</h1>
      <form className="mb-4">
        <input
          className="border p-1 mr-2"
          type="text"
          name="actorId"
          placeholder="Actor ID"
          defaultValue={searchParams.actorId}
        />
        <input
          className="border p-1 mr-2"
          type="text"
          name="action"
          placeholder="Action"
          defaultValue={searchParams.action}
        />
        <button className="border px-2" type="submit">
          Filter
        </button>
      </form>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border p-1">Time</th>
            <th className="border p-1">Actor</th>
            <th className="border p-1">Action</th>
            <th className="border p-1">Target</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="border p-1">
                {new Date(l.createdAt).toLocaleString()}
              </td>
              <td className="border p-1">{l.actorId || '-'}</td>
              <td className="border p-1">{l.action}</td>
              <td className="border p-1">{l.target || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
