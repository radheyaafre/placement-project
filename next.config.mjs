const CANONICAL_HOST = "www.samyaklabsai.com";
const LEGACY_HOSTS = ["placement-project-ebon.vercel.app"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [
        {
          type: "host",
          value: host
        }
      ],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
      basePath: false
    }));
  }
};

export default nextConfig;
