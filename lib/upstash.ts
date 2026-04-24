import { Redis } from '@upstash/redis';

/**
 * Shared Upstash Redis client.
 *
 * Env-gated: when the Upstash/KV env vars are unset, every caller sees `null`
 * and provides a graceful fallback (baseline counter, base64 share URLs).
 *
 * We accept two naming conventions because the Vercel Marketplace integration
 * currently provisions Upstash Redis under the legacy `@vercel/kv`-era names
 * (KV_REST_API_URL / KV_REST_API_TOKEN). Both forms map to the same REST
 * endpoint, so we pick whichever is set.
 */

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}

export function hasRedis(): boolean {
  return getRedis() !== null;
}
