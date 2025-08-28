import { CallRoom } from '@/components/CallRoom';

export default function VisitCallPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <CallRoom roomId={params.id} snapshotEndpoint={`/visits/${params.id}/snapshot`} />
    </div>
  );
}

