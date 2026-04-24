import type { NextConfig } from 'next';
import { BASE_PATH } from './lib/base-path';

const config: NextConfig = {
  reactStrictMode: true,

  // Serve the app under /mental-load-calculator so the Netlify reverse proxy
  // at www.growmaple.com/mental-load-calculator resolves 1:1 with our routes
  // (including /_next/* assets and /api/*). See lib/base-path.ts for the full
  // rationale and the list of places that need to prefix manually.
  basePath: BASE_PATH,

  async redirects() {
    return [
      // Direct hits to the bare Vercel domain (no basePath) bounce into the
      // basePath so nothing 404s when someone visits the Vercel URL by itself.
      // `basePath: false` opts this rule OUT of the auto-prefix — we need the
      // source to match '/' literally, not '/mental-load-calculator'.
      {
        source: '/',
        destination: BASE_PATH,
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default config;
