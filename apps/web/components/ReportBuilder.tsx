'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

const initialFields = ['Name', 'Email', 'MoveInDate', 'Balance'];
const sampleData = [
  { Name: 'Alice', Email: 'alice@example.com', MoveInDate: '2023-01-01', Balance: 50 },
  { Name: 'Bob', Email: 'bob@example.com', MoveInDate: '2023-02-15', Balance: 0 },
];

export default function ReportBuilder() {
  const [available, setAvailable] = useState(initialFields);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState('');
  const [group, setGroup] = useState('');
  const [chartType, setChartType] = useState('table');

  function onDragStart(e: React.DragEvent<HTMLDivElement>, field: string) {
    e.dataTransfer.setData('text/plain', field);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    if (available.includes(field)) {
      setAvailable(available.filter((f) => f !== field));
      setSelected([...selected, field]);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function saveReport() {
    const report = { selected, filters, group, chartType };
    localStorage.setItem('report-builder', JSON.stringify(report));
  }

  function shareReport() {
    const report = { selected, filters, group, chartType };
    navigator.clipboard.writeText(JSON.stringify(report));
  }

  function exportCSV() {
    const rows = [selected.join(',')];
    sampleData.forEach((item) => {
      rows.push(selected.map((f) => (item as any)[f] ?? '').join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text(selected.join(' | '), 10, 10);
    sampleData.forEach((item, idx) => {
      const row = selected.map((f) => (item as any)[f] ?? '').join(' | ');
      doc.text(row, 10, 20 + idx * 10);
    });
    doc.save('report.pdf');
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="w-1/2 border p-2">
          <h2 className="font-semibold mb-2">Available Fields</h2>
          {available.map((f) => (
            <div
              key={f}
              draggable
              onDragStart={(e) => onDragStart(e, f)}
              className="p-1 border mb-1 cursor-move bg-white"
            >
              {f}
            </div>
          ))}
        </div>
        <div
          className="w-1/2 border p-2 min-h-[150px]"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <h2 className="font-semibold mb-2">Report Fields</h2>
          {selected.map((f) => (
            <div key={f} className="p-1 border mb-1 bg-blue-50">
              {f}
            </div>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={filters}
        onChange={(e) => setFilters(e.target.value)}
        placeholder="Filter (e.g., Balance > 0)"
        className="border p-1 w-full"
      />

      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="border p-1 w-full"
      >
        <option value="">Group by...</option>
        {selected.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={chartType}
        onChange={(e) => setChartType(e.target.value)}
        className="border p-1 w-full"
      >
        <option value="table">Table</option>
        <option value="bar">Bar Chart</option>
        <option value="line">Line Chart</option>
      </select>

      <div className="border p-4">Chart preview: {chartType}</div>

      <div className="flex gap-2">
        <button
          onClick={saveReport}
          className="px-2 py-1 bg-blue-600 text-white"
        >
          Save
        </button>
        <button
          onClick={shareReport}
          className="px-2 py-1 bg-green-600 text-white"
        >
          Share
        </button>
        <button
          onClick={exportCSV}
          className="px-2 py-1 bg-gray-600 text-white"
        >
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-2 py-1 bg-gray-600 text-white"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}

