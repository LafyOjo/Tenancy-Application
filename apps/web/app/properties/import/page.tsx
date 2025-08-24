'use client';
import { useState } from 'react';

export default function ImportPropertiesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);

  const upload = async (f: File) => {
    const form = new FormData();
    form.append('file', f);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties:import`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    setErrors(data.errors || []);
    setPreview(data.preview || []);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      await upload(f);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      await upload(f);
    }
  };

  const commit = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties:import?commit=true`, {
      method: 'POST',
      body: form,
    });
    if (res.ok) {
      setSuccess(true);
      setPreview([]);
      setErrors([]);
    }
  };

  return (
    <div>
      <h1>Import Properties</h1>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
      >
        {file ? file.name : 'Drag & Drop CSV here or click to select'}
        <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} id="fileInput" />
        <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block', marginTop: '10px' }}>
          Browse
        </label>
      </div>
      {errors.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={i}>
                <td>{e.row}</td>
                <td>{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {preview.length > 0 && errors.length === 0 && (
        <div>
          <h2>Preview</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(preview[0]).map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.keys(row).map((h) => (
                    <td key={h}>{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={commit} style={{ marginTop: '1rem' }}>
            Import
          </button>
        </div>
      )}
      {success && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: '#48bb78',
            color: '#fff',
            padding: '10px',
          }}
        >
          Import successful
        </div>
      )}
    </div>
  );
}
