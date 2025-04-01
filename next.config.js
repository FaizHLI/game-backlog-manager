/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        'placehold.co',
        'images.igdb.com'  // Add IGDB's image domain
      ],
    },
  };
  
  module.exports = nextConfig;