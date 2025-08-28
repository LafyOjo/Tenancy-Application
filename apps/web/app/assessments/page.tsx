'use client';

import { useState } from 'react';
import {
  assessmentTemplates,
  getTemplate,
  AssessmentTemplate,
} from '../../lib/assessmentTemplates';

type ItemResult = {
  status?: 'pass' | 'fail';
  photo?: string;
};

export default function AssessmentPage() {
  const [templateId, setTemplateId] = useState('minor-damage');
  const template: AssessmentTemplate | undefined = getTemplate(templateId);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [submitted, setSubmitted] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);

  const updateStatus = (itemId: string, status: 'pass' | 'fail') => {
    setResults((prev) => ({ ...prev, [itemId]: { ...prev[itemId], status } }));
  };

  const handlePhoto = (itemId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setResults((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], photo: e.target?.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, items: results }),
    });
    const data = await res.json();
    setNeedsReview(data.needsReview);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4">
        {needsReview ? (
          <p>Assessment submitted. Anomalies detected for manual review.</p>
        ) : (
          <p>Assessment submitted successfully.</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minor Assessment</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Template</label>
        <select
          className="border p-2 w-full"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          {assessmentTemplates.map((t) => (
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
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={submit}
      >
        Submit Assessment
      </button>
    </div>
  );
}
