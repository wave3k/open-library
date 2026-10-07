import type { NextConfig } from "next";

// L'URL du backend Workers+D1 est résolue au RUNTIME (pas au build) :
// - en dev local via .env.local,
// - sur Vercel via la variable d'environnement API_UPSTREAM.
// Le front appelle toujours /api/... en relatif, Next proxifie côté serveur.
const API_UPSTREAM =
  process.env.API_UPSTREAM || "https://open-library-staging.lirostudio.workers.dev";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_UPSTREAM}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
