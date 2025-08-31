'use client';

import { useState } from 'react';

interface Claim {
  text: string;
  evidence: File | null;
}

interface TimelineEntry {
  timestamp: string;
  text: string;
}

export default function DisputesPage() {
  const [tenant, setTenant] = useState<Claim>({ text: '', evidence: null });
  const [landlord, setLandlord] = useState<Claim>({ text: '', evidence: null });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [mediator, setMediator] = useState<string | null>(null);
  const [decision, setDecision] = useState('');

  const handleEvidence = (
    role: 'tenant' | 'landlord',
    files: FileList | null
  ) => {
    const file = files ? files[0] : null;
    if (role === 'tenant') {
      setTenant({ ...tenant, evidence: file });
    } else {
      setLandlord({ ...landlord, evidence: file });
    }
    addTimeline(`${role} uploaded evidence`);
  };

  const addTimeline = (text: string) => {
    setTimeline((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleString(), text },
    ]);
  };

  const startMediation = () => {
    setMediator('MediationBot');
    addTimeline('Mediation started');
  };

  const recordDecision = () => {
    if (decision) {
      addTimeline('Final decision recorded');
    }
  };

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Dispute Resolution</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Tenant Claim</h2>
          <textarea
            className="w-full border p-2"
            value={tenant.text}
            onChange={(e) => setTenant({ ...tenant, text: e.target.value })}
          />
          <input
            type="file"
            className="mt-2"
            onChange={(e) => handleEvidence('tenant', e.target.files)}
          />
          {tenant.evidence && (
            <p className="text-sm mt-1">Evidence: {tenant.evidence.name}</p>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Landlord Claim</h2>
          <textarea
            className="w-full border p-2"
            value={landlord.text}
            onChange={(e) => setLandlord({ ...landlord, text: e.target.value })}
          />
          <input
            type="file"
            className="mt-2"
            onChange={(e) => handleEvidence('landlord', e.target.files)}
          />
          {landlord.evidence && (
            <p className="text-sm mt-1">Evidence: {landlord.evidence.name}</p>
          )}
        </div>
      </div>
      <div>
        {mediator ? (
          <p className="mb-2">Mediator: {mediator}</p>
        ) : (
          <button className="border px-3 py-1" onClick={startMediation}>
            Start Mediation
          </button>
        )}
      </div>
      <div>
        <h2 className="font-semibold mb-2">Timeline</h2>
        <ul className="list-disc pl-5">
          {timeline.map((entry, idx) => (
            <li key={idx}>
              <span className="font-mono mr-2">{entry.timestamp}</span>
              {entry.text}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Final Decision</h2>
        <textarea
          className="w-full border p-2"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
        />
        <button className="border px-3 py-1 mt-2" onClick={recordDecision}>
          Record Decision
        </button>
        {decision && <p className="mt-2">Decision: {decision}</p>}
      </div>
    </main>
  );
}
