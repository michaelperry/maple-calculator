import { customAlphabet } from 'nanoid';
import { getRedis } from './upstash';

/**
 * Short-ID URL store for shared quiz results.
 *
 * Problem being solved: the v1 result URLs encoded answers in a ~300-char
 * base64 query string. That works (fully self-contained, no persistence
 * needed) but is ugly in group-chat previews and breaks some messaging
 * platforms that truncate long URLs.
 *
 * Approach: persist the answer set under a short id in Upstash Redis,
 * return `/r/<id>` as the canonical share URL. Self-contained base64
 * remains a supported fallback so:
 *   a) links already shared in the wild keep working, and
 *   b) the site stays functional when Upstash isn't configured.
 *
 * Key: `r:<slug>:<id>`  Value: JSON-serialized Record<questionId, optionValue>
 *
 * TTL: 1 year. Short enough that unused IDs eventually expire; long enough
 * that any link a mom actually shares will resolve for as long as the
 * recipient is likely to open it.
 */

const ID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'; // no lookalikes (0/O/1/l/I)
const ID_LENGTH = 8; // ~37 bits — plenty for this scale
const TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

const newId = customAlphabet(ID_ALPHABET, ID_LENGTH);

function keyFor(slug: string, id: string) {
  return `r:${slug}:${id}`;
}

/**
 * Store an answer set under a short id.
 * Returns the id, or null if Redis is unavailable / errored.
 * Callers should fall back to `?r=<base64>` URLs on null.
 */
export async function storeAnswers(
  slug: string,
  answers: Record<string, string>,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    // Retry a couple of times on the extremely-unlikely id collision.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const id = newId();
      const key = keyFor(slug, id);
      // SET with NX + EX so we never overwrite an existing id.
      const ok = await redis.set(key, JSON.stringify(answers), {
        nx: true,
        ex: TTL_SECONDS,
      });
      if (ok === 'OK') return id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAnswers(
  slug: string,
  id: string,
): Promise<Record<string, string> | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string | Record<string, string>>(keyFor(slug, id));
    if (!raw) return null;
    // Upstash auto-parses JSON in some cases; handle both shapes.
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') return null;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  } catch {
    return null;
  }
}
