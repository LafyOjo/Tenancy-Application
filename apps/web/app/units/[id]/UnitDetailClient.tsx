'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';

interface Props {
  unit: any;
}

export default function UnitDetailClient({ unit }: Props) {
  const [tab, setTab] = useState<'details' | 'virtual'>('details');
  const [embedUrl, setEmbedUrl] = useState(unit.virtualTourEmbedUrl || '');
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(unit.virtualTourImages || []);

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
      </div>
      {tab === 'details' && (
        <div>
          {unit.imageUrl && (
            <img src={unit.imageUrl} alt={unit.name} className="max-w-sm" />
          )}
          <ImageUploader
            uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/photo`}
          />
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
    </div>
  );
}
