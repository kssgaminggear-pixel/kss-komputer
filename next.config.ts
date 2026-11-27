import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      // Slug lama tidak sama dengan slug Tokopedia, jadi diarahkan ke pencarian Toko.
      { source: '/komponen', destination: '/toko', permanent: true },
      { source: '/aksesoris', destination: '/toko', permanent: true },
      { source: '/komponen/:slug', destination: '/toko?q=:slug', permanent: true },
      { source: '/produk/:slug', destination: '/toko?q=:slug', permanent: true },
      { source: '/katalog', destination: '/toko', permanent: true },
      { source: '/simulasi', destination: '/paket-rakitan', permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
