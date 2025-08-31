'use client';
export default function PaymentsOffline() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Payments Offline</h1>
      <p>Payment features are unavailable while offline. Any actions will be queued and processed once reconnected.</p>
    </div>
  );
}
