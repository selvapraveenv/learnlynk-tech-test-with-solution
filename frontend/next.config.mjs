/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard/today',
        permanent: true, // or false for temporary
      },
    ];
  },
};

export default nextConfig;
