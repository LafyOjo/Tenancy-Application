import PushSubscriber from './PushSubscriber';
import PreferenceForm from './PreferenceForm';

async function getNotifications() {
  const res = await fetch('http://localhost:3001/notifications/me', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Notifications</h1>
      <PushSubscriber />
      <ul className="list-disc pl-5">
        {notifications.map((n: any) => (
          <li key={n.id}>{n.message}</li>
        ))}
      </ul>
      <PreferenceForm />
    </div>
  );
}
