import { getRedis } from './upstash';

/**
 * Social-proof counter for the Invisible Load program ("X moms have taken this").
 *
 * Strategy per the brief: the counter is a virality mechanic, not a vanity
 * metric — it signals "you're joining a movement" and lowers the perceived
 * cost of starting the quiz. It updates in near real time as new completions
 * roll in.
 *
 * Redis key: `counter:completions:<slug>` (INCR on every quiz completion)
 *
 * When Redis isn't configured (local dev, pre-Upstash), we return a baseline
 * so the UI never flashes a missing value. The baseline is deliberately
 * rounded — it's a floor, not a lie — and the real number replaces it the
 * moment Upstash is provisioned.
 */

const BASELINE: Record<string, number> = {
  'mental-load': 1200, // floor until Upstash is live
};

function keyFor(slug: string) {
  return `counter:completions:${slug}`;
}

export async function getCount(slug: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return BASELINE[slug] ?? 0;
  try {
    const raw = await redis.get<number | string>(keyFor(slug));
    const n = typeof raw === 'string' ? Number.parseInt(raw, 10) : (raw ?? 0);
    if (!Number.isFinite(n) || n < 0) return BASELINE[slug] ?? 0;
    // Never show a number lower than the baseline — we know X people already
    // took the v3 quiz before this stack existed, and the new Redis counter
    // starts at 0.
    return Math.max(n, BASELINE[slug] ?? 0);
  } catch {
    return BASELINE[slug] ?? 0;
  }
}

export async function incrementCount(slug: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.incr(keyFor(slug));
  } catch {
    // Counter is best-effort — never break the user flow on a Redis blip.
  }
}
