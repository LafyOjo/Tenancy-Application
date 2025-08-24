import { ImageUploader } from '@/components/ImageUploader';

async function fetchUnit(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${id}`,
    { cache: 'no-store' },
  );
  return res.json();
}

interface Props {
  params: { id: string };
}

export default async function UnitDetail({ params }: Props) {
  const unit = await fetchUnit(params.id);
  return (
    <div>
      <h1>{unit.name}</h1>
      {unit.imageUrl && (
        <img src={unit.imageUrl} alt={unit.name} className="max-w-sm" />
      )}
      <ImageUploader
        uploadUrlEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/photo`}
      />
    </div>
  );
}

