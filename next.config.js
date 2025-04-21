/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        'placehold.co',
        'images.igdb.com' 
      ],
    },
  };
  
  module.exports = nextConfig;