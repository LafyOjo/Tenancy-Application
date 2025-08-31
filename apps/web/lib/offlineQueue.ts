'use client';

export interface QueueItem {
  id: string;
  payload: any;
  version: number;
}

const STORAGE_KEY = 'esignQueue';

export function enqueueEsign(item: QueueItem) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const queue: QueueItem[] = raw ? JSON.parse(raw) : [];
  queue.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function processEsignQueue() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const queue: QueueItem[] = raw ? JSON.parse(raw) : [];
  const remaining: QueueItem[] = [];
  for (const item of queue) {
    try {
      const res = await fetch('/api/esign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.status === 409) {
        const server = await res.json();
        if (server.version && server.version > item.version) {
          console.warn('Conflict detected for e-sign item', item.id);
          continue; // drop local version and keep server version
        }
        throw new Error('Conflict unresolved');
      }
      if (!res.ok) throw new Error('Network error');
    } catch (e) {
      remaining.push(item);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export function initEsignQueue() {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', processEsignQueue);
  processEsignQueue();
}
