import { CertificateUpload } from './upload';

async function fetchCertificates(propertyId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/certificates/property/${propertyId}`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function PropertyCertificates({ params }: { params: { id: string } }) {
  const certificates = await fetchCertificates(params.id);
  return (
    <div>
      <h1>Certificates</h1>
      <ul>
        {certificates.map((c: any) => {
          const expired = new Date(c.expiryDate) < new Date();
          return (
            <li key={c.id}>
              {c.type} – {new Date(c.expiryDate).toLocaleDateString()} –{' '}
              {expired ? 'Expired' : 'Valid'}
            </li>
          );
        })}
      </ul>
      <CertificateUpload propertyId={params.id} />
    </div>
  );
}
