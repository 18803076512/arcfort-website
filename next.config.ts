import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/RFQ",
        destination: "/rfq",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
