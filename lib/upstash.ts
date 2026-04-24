import { Redis } from '@upstash/redis';

/**
 * Shared Upstash Redis client.
 *
 * Env-gated: when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are
 * unset, every caller sees `null` and is expected to provide a graceful
 * fallback (baseline counter, base64 share URLs, etc.). When the user
 * provisions Upstash Redis from the Vercel Marketplace, these env vars
 * are auto-injected on the next deploy and all Redis-backed features
 * light up with zero code changes.
 */

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
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
