/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", // for Google profile photos
      "avatars.githubusercontent.com", // for GitHub profile photos
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
