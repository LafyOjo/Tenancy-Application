import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/api\/tickets/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'tickets-cache',
        backgroundSync: {
          name: 'tickets-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    {
      urlPattern: /\/api\/payments/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'payments-cache',
        backgroundSync: {
          name: 'payments-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    {
      urlPattern: /\/api\/leases/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'leases-cache',
        backgroundSync: {
          name: 'leases-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    {
      urlPattern: /\/api\/esign/,
      handler: 'NetworkOnly',
      method: 'POST',
      options: {
        backgroundSync: {
          name: 'esign-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline.html',
  },
})(nextConfig);
