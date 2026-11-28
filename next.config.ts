import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Wajib sejak Next 16; nilai di luar daftar dibulatkan ke yang terdekat.
    qualities: [60, 75, 85],
    localPatterns: [{ pathname: '/images/**', search: '' }],
    // 1 hari, bukan lebih lama: sinkron menimpa foto Toko dengan nama file yang sama.
    minimumCacheTTL: 86400,
  },
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
