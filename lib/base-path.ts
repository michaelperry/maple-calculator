/**
 * Single source of truth for the app's basePath.
 *
 * The app is served at www.growmaple.com/mental-load-calculator via a Netlify
 * reverse proxy. For proxied asset + API paths to resolve 1:1, the Next.js
 * app must also serve itself under the same basePath on Vercel.
 *
 * This constant is imported by:
 *   - next.config.ts               (the canonical declaration)
 *   - client `fetch('/api/...')`   (doesn't auto-prefix, unlike <Link>/<Image>)
 *   - OG image metadata builders   (absolute URLs for external crawlers)
 *   - share-URL absolute builders  (SMS/clipboard — crawlers need basePath)
 *
 * Consumers that DO auto-prefix (leave them alone):
 *   - <Link href="/..."> (next/link)
 *   - <Image src="/..."> (next/image)
 *   - router.push('/...') (next/navigation)
 *
 * To remove the basePath (e.g. cut the proxy), change this to '' in one spot.
 */
export const BASE_PATH = '/mental-load-calculator';

/** Prepend BASE_PATH to an app-absolute path (one that begins with '/'). */
export function withBasePath(path: string): string {
  if (!BASE_PATH) return path;
  if (!path.startsWith('/')) return `${BASE_PATH}/${path}`;
  return `${BASE_PATH}${path}`;
}
