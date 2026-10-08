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
  // En-têtes de sécurité (défense en profondeur).
  async headers() {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https:",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ")
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
};

export default nextConfig;
