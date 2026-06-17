/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the experimental turbo flag entirely
  experimental: {},

  // Force Node.js runtime globally (fixes useSearchParams + prerender errors)
  runtime: "nodejs",

  // Disable static generation globally unless explicitly enabled
  dynamic: "force-dynamic",
};

module.exports = nextConfig;
