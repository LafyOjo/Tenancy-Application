'use client';

import { useState } from 'react';

export default function PreferenceForm() {
  const [event, setEvent] = useState('general');
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    whatsapp: false,
    push: true,
    frequency: 'instant',
    quietStart: '',
    quietEnd: '',
  });

  const submit = async () => {
    await fetch(`/api/notifications/preferences/me/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-2"
    >
      <div>
        <label className="mr-2">Event</label>
        <input
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="border p-1"
        />
      </div>
      <div className="flex gap-2">
        <label>
          <input
            type="checkbox"
            checked={prefs.email}
            onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
          />
          Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.sms}
            onChange={(e) => setPrefs({ ...prefs, sms: e.target.checked })}
          />
          SMS
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.whatsapp}
            onChange={(e) => setPrefs({ ...prefs, whatsapp: e.target.checked })}
          />
          WhatsApp
        </label>
        <label>
          <input
            type="checkbox"
            checked={prefs.push}
            onChange={(e) => setPrefs({ ...prefs, push: e.target.checked })}
          />
          Push
        </label>
      </div>
      <div>
        <label className="mr-2">Frequency</label>
        <select
          value={prefs.frequency}
          onChange={(e) => setPrefs({ ...prefs, frequency: e.target.value })}
          className="border p-1"
        >
          <option value="instant">Instant</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input
          type="time"
          value={prefs.quietStart}
          onChange={(e) => setPrefs({ ...prefs, quietStart: e.target.value })}
          className="border p-1"
        />
        <input
          type="time"
          value={prefs.quietEnd}
          onChange={(e) => setPrefs({ ...prefs, quietEnd: e.target.value })}
          className="border p-1"
        />
      </div>
      <button type="submit" className="px-2 py-1 bg-blue-500 text-white">
        Save
      </button>
    </form>
  );
}
