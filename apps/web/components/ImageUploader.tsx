'use client';
import { useState } from 'react';

interface Props {
  /** API endpoint that returns a signed upload URL. */
  uploadUrlEndpoint: string;
  onUploaded?: (url: string) => void;
}

export function ImageUploader({ uploadUrlEndpoint, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string>();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const res = await fetch(uploadUrlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const { uploadUrl, url: publicUrl } = await res.json();
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    setUrl(publicUrl);
    setUploading(false);
    onUploaded?.(publicUrl);
  }

  return (
    <div>
      <input type="file" onChange={handleChange} />
      {uploading && <p>Uploading...</p>}
      {url && <img src={url} alt="uploaded" className="max-w-xs" />}
    </div>
  );
}

