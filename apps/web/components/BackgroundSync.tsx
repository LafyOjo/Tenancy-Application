'use client';
import { useEffect } from 'react';
import { initEsignQueue } from '../lib/offlineQueue';

export default function BackgroundSync() {
  useEffect(() => {
    initEsignQueue();
  }, []);
  return null;
}
