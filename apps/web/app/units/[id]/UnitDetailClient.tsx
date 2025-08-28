'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/ImageUploader';

interface Props {
  unit: any;
}

export default function UnitDetailClient({ unit }: Props) {
  const [tab, setTab] = useState<'details' | 'virtual' | 'events'>('details');
  const [embedUrl, setEmbedUrl] = useState(unit.virtualTourEmbedUrl || '');
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(unit.virtualTourImages || []);
  const [pricing, setPricing] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pricing/suggestions?unitId=${unit.id}`,
    )
      .then((res) => res.json())
      .then((data) => setPricing(data));
  }, [unit.id]);

  useEffect(() => {
    if (tab !== 'events') return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, [tab, unit.id]);

  async function applySuggestion() {
    if (!pricing?.leaseId) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leases/${pricing.leaseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rentAmount: pricing.suggestedRent }),
    });
    setPricing({ ...pricing, currentRent: pricing.suggestedRent });
  }

  async function saveEmbed() {
    setSaving(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ virtualTourEmbedUrl: embedUrl }),
    });
    setSaving(false);
  }

  return (
    <div>
      <h1>{unit.name}</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('details')}>Details</button>
        <button onClick={() => setTab('virtual')}>Virtual Tour</button>
        <button onClick={() => setTab('events')}>IoT Events</button>
      </div>
      {tab === 'details' && (
        <div>
          {unit.imageUrl && (
            <img src={unit.imageUrl} alt={unit.name} className="max-w-sm" />
          )}
          <ImageUploader
            uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/photo`}
          />
          {pricing && (
            <div className="mt-4 space-y-2">
              <div>Current rent: £{pricing.currentRent}</div>
              <div>Suggested rent: £{pricing.suggestedRent}</div>
              <button onClick={applySuggestion} className="border px-2">
                Apply to draft lease
              </button>
            </div>
          )}
        </div>
      )}
      {tab === 'virtual' && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="Embed URL (e.g. Matterport)"
              className="border p-1 flex-1"
            />
            <button onClick={saveEmbed} disabled={saving} className="border px-2">
              Save
            </button>
          </div>
          {embedUrl && (
            <iframe src={embedUrl} className="w-full h-96" />
          )}
          <ImageUploader
            uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/virtual-tour/photo`}
            onUploaded={(url) => setImages([...images, url])}
          />
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <img key={url} src={url} alt="virtual tour" className="h-48" />
            ))}
          </div>
        </div>
      )}
      {tab === 'events' && (
        <div className="mt-4 space-y-2">
          {events.map((e) => (
            <div key={e.id} className="border-b pb-2">
              <div>
                {new Date(e.createdAt).toLocaleString()} - {e.type}
                {e.value !== null && e.value !== undefined && ` (${e.value})`} -
                risk {e.riskScore}
              </div>
              <div className="text-sm text-gray-600">{e.action}</div>
            </div>
          ))}
          {!events.length && <div>No events</div>}
        </div>
      )}
    </div>
  );
}
