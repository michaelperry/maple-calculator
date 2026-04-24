import { NextResponse } from 'next/server';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { isComplete } from '@/lib/calculators/engine';
import { encodeAnswers } from '@/lib/calculators/encode';
import { storeAnswers } from '@/lib/result-store';
import { incrementCount } from '@/lib/counter';

/**
 * POST /api/r  →  { url }
 *
 * Called by the quiz client the moment it has a complete answer set.
 * Returns the canonical shareable URL:
 *   - `/r/<id>` when Upstash Redis is configured (short-ID persistence)
 *   - `/<slug>/result?r=<base64>` as a graceful fallback otherwise
 *
 * Completion tally is incremented here so the social-proof counter on
 * the landing page reflects real completions (not quiz starts).
 */

const CALCS = { 'mental-load': mentalLoad } as const;
type KnownSlug = keyof typeof CALCS;

function isKnownSlug(slug: string): slug is KnownSlug {
  return Object.prototype.hasOwnProperty.call(CALCS, slug);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const data = body as { slug?: unknown; answers?: unknown };
  const slug = typeof data.slug === 'string' ? data.slug : '';
  if (!isKnownSlug(slug)) {
    return NextResponse.json({ ok: false, error: 'unknown_slug' }, { status: 400 });
  }

  const config = CALCS[slug];

  // Defensive: coerce the incoming answers into a string-keyed/string-valued map.
  const rawAnswers = data.answers;
  if (!rawAnswers || typeof rawAnswers !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_answers' }, { status: 400 });
  }
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawAnswers as Record<string, unknown>)) {
    if (typeof v === 'string') answers[k] = v;
  }
  if (!isComplete(config, answers)) {
    return NextResponse.json({ ok: false, error: 'incomplete_answers' }, { status: 400 });
  }

  // Best-effort completion tally — don't await result, don't block response on failure.
  // (incrementCount already swallows its own errors; we just don't need the value.)
  void incrementCount(slug);

  // Try short-ID store first; fall back to base64 URL.
  const id = await storeAnswers(slug, answers);
  if (id) {
    return NextResponse.json({ ok: true, url: `/r/${id}`, storage: 'redis' });
  }

  const encoded = encodeAnswers(answers);
  return NextResponse.json({
    ok: true,
    url: `/${slug}/result?r=${encoded}`,
    storage: 'base64',
  });
}
