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
})(nextConfig);
