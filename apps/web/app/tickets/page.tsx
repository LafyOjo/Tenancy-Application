import { Ticket, TicketStatus } from 'types';

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/tickets`,
    { cache: 'no-store' },
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

function SlaBadge({ ticket }: { ticket: Ticket }) {
  const slaHours = ticket.category?.slaHours ?? 0;
  if (!slaHours) return null;
  const deadline = new Date(ticket.createdAt);
  deadline.setHours(deadline.getHours() + slaHours);
  const diffMs = deadline.getTime() - Date.now();
  const hoursLeft = Math.ceil(diffMs / 3600000);
  const expired = diffMs < 0;
  const bg = expired ? '#dc2626' : '#16a34a';
  return (
    <span style={{ backgroundColor: bg, color: 'white', padding: '2px 4px', borderRadius: 4 }}>
      {hoursLeft}h
    </span>
  );
}

export default async function TicketsPage() {
  const tickets = await fetchTickets();
  const columns: Record<TicketStatus, Ticket[]> = {
    open: [],
    in_progress: [],
    completed: [],
  };
  tickets.forEach((t) => {
    columns[t.status].push(t);
  });
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {Object.entries(columns).map(([status, items]) => (
        <div key={status} style={{ flex: 1 }}>
          <h2 style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</h2>
          {items.map((t) => (
            <div
              key={t.id}
              style={{
                border: '1px solid #ddd',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                background: 'white',
              }}
            >
              <p>{t.description}</p>
              <SlaBadge ticket={t} />
              <p>Assigned: {t.assignedToId ? t.assignedToId : 'Unassigned'}</p>
              {t.eta && <p>ETA: {new Date(t.eta).toLocaleString()}</p>}
              {(t.partsCost || t.labourCost) && (
                <p>
                  Cost: £{(t.partsCost || 0) + (t.labourCost || 0)} (parts £{t.partsCost || 0}, labour £{t.labourCost || 0})
                </p>
              )}
              {t.status === 'completed' && (
                <p>
                  {t.rating ? `Rating: ${t.rating}/5` : 'Awaiting review'}
                  {t.review && <span> - {t.review}</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
