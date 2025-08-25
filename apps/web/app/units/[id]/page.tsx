import UnitDetailClient from './UnitDetailClient';

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
  return <UnitDetailClient unit={unit} />;
}
