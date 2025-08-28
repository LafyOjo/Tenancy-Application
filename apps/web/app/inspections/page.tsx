'use client';

import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { inspectionTemplates, getTemplate, ChecklistTemplate } from '../../lib/inspectionTemplates';

type ItemResult = {
  status: 'pass' | 'fail';
  photo?: string;
};

export default function InspectionPage() {
  const [templateId, setTemplateId] = useState('fire-safety');
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  const template: ChecklistTemplate | undefined = getTemplate(templateId);

  const updateStatus = (itemId: string, status: 'pass' | 'fail') => {
    setResults((prev) => ({ ...prev, [itemId]: { ...prev[itemId], status } }));
  };

  const handlePhoto = (itemId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setResults((prev) => ({ ...prev, [itemId]: { ...prev[itemId], photo: e.target?.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  const endDraw = () => setDrawing(false);

  const clearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  const generatePdf = () => {
    if (!template) return;
    const doc = new jsPDF();
    doc.text(`Inspection: ${template.name}`, 10, 10);
    let y = 20;
    template.items.forEach((item) => {
      const res = results[item.id];
      doc.text(`${item.description}: ${res?.status ?? 'N/A'}`, 10, y);
      y += 8;
      if (res?.photo) {
        try {
          doc.addImage(res.photo, 'JPEG', 10, y, 50, 40);
          y += 45;
        } catch {
          // ignore image errors
        }
      }
    });
    const signature = canvasRef.current?.toDataURL('image/png');
    if (signature) {
      doc.addImage(signature, 'PNG', 10, y, 50, 20);
    }
    doc.save('inspection.pdf');
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inspection</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Template</label>
        <select
          className="border p-2 w-full"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          {inspectionTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {template?.items.map((item) => (
        <div key={item.id} className="mb-6">
          <p className="font-medium mb-2">{item.description}</p>
          <div className="flex items-center space-x-4 mb-2">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name={`${item.id}-status`}
                value="pass"
                onChange={() => updateStatus(item.id, 'pass')}
              />
              <span>Pass</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name={`${item.id}-status`}
                value="fail"
                onChange={() => updateStatus(item.id, 'fail')}
              />
              <span>Fail</span>
            </label>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhoto(item.id, e.target.files?.[0] ?? null)}
          />
        </div>
      ))}
      <div className="mb-4">
        <p className="font-medium mb-2">Signature</p>
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          className="border w-full mb-2"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        <button className="border px-2 py-1" onClick={clearSignature}>
          Clear
        </button>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={generatePdf}
      >
        Generate PDF
      </button>
    </div>
  );
}
