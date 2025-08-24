import { ImageUploader } from '@/components/ImageUploader';

async function fetchProperty(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
    { cache: 'no-store' },
  );
  return res.json();
}

interface Props {
  params: { id: string };
}

export default async function PropertyDetail({ params }: Props) {
  const property = await fetchProperty(params.id);
  return (
    <div>
      <h1>{property.name}</h1>
      {property.imageUrl && (
        <img src={property.imageUrl} alt={property.name} className="max-w-sm" />
      )}
      <ImageUploader
        uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/properties/${property.id}/photo`}
      />

      <h2>Units</h2>
      <ul>
        {property.units?.map((u: any) => (
          <li key={u.id}>
            <a href={`/units/${u.id}`}>{u.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

