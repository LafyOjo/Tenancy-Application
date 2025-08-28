import { CallRoom } from '@/components/CallRoom';

export default function TicketCallPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <CallRoom roomId={params.id} snapshotEndpoint={`/tickets/${params.id}/snapshot`} />
    </div>
  );
}

