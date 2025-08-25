'use client';
import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';

export function CertificateUpload({ propertyId }: { propertyId: string }) {
  const [type, setType] = useState('gas_safety');
  const [expiryDate, setExpiryDate] = useState('');
  const [fileUrl, setFileUrl] = useState<string>();

  async function handleSubmit() {
    if (!fileUrl || !expiryDate) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId: 'demo',
        propertyId,
        type,
        expiryDate,
        fileUrl,
      }),
    });
    setFileUrl(undefined);
  }

  return (
    <div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="gas_safety">Gas Safety</option>
        <option value="epc">EPC</option>
        <option value="electrical_safety">Electrical Safety</option>
      </select>
      <input
        type="date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />
      <ImageUploader
        uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/certificates/upload-url`}
        onUploaded={(url) => setFileUrl(url)}
      />
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}
