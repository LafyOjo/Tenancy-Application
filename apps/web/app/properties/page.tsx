async function fetchProperties() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/properties`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function PropertiesPage() {
  const properties = await fetchProperties();
  return (
    <div>
      <h1>Properties</h1>
      <div>
        <a href="/properties/import">Import CSV</a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/properties:export`}
          style={{ marginLeft: '1rem' }}
        >
          Export CSV
        </a>
      </div>
      <ul>
        {properties.map((p: any) => (
          <li key={p.id}>
            <a href={`/properties/${p.id}`}>{p.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

