import '../i18n';
import './globals.css';
import type { ReactNode, CSSProperties } from 'react';

async function getTheme() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!orgId || !api) return {} as any;
  const res = await fetch(`${api}/org/${orgId}/theme`, { cache: 'no-store' });
  if (!res.ok) return {} as any;
  return res.json();
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await getTheme();
  return (
    <html
      lang="en"
      style={{
        '--brand-primary': theme.primaryColor ?? '#0ea5e9',
        '--brand-font': theme.fontFamily ?? 'sans-serif',
      } as CSSProperties}
    >
      <body
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--brand-primary)',
          fontFamily: 'var(--brand-font)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
