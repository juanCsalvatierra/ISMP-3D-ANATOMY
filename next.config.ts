import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["8602-2803-1f40-1604-1500-7656-3cff-fea7-56f5.ngrok-free.app"],
  async redirects() {
    return [
      { source: "/skeleton", destination: "/modelos/skeleton", permanent: true },
      { source: "/muscles", destination: "/modelos/muscles", permanent: true },
    ];
  },
};

export default nextConfig;
