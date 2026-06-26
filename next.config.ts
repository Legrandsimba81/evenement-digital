import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... vos autres configurations

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // ⬇️ Désactiver les erreurs TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;