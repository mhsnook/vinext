import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/config-headers",
        headers: [{ key: "Cache-Control", value: "public, max-age=300" }],
      },
    ];
  },
};

export default nextConfig;
