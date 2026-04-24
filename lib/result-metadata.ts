import type { Metadata } from 'next';
import type { QuizResult } from './calculators/types';
import { encodeAnswers } from './calculators/encode';

/**
 * Build the per-result OG/Twitter metadata shared by:
 *   - /mental-load/result?r=<base64>  (legacy, still supported)
 *   - /r/<id>                          (short-ID canonical)
 *
 * Both URLs map to the same underlying answer set, so they can use the same
 * OG image endpoint (`/api/og?r=<base64>`) and the same title/description.
 */
export function buildResultMetadata(
  result: QuizResult,
  answers: Record<string, string>,
): Metadata {
  // /api/og takes base64-encoded answers directly — this keeps the OG endpoint
  // stateless (no Redis dep) and avoids a second Redis lookup per preview.
  const rParam = encodeAnswers(answers);
  const ogUrl = `/api/og?r=${rParam}&slug=${result.slug}`;
  const title = `I carry ${result.primary}% of my family's mental load — Maple`;
  const description = `${result.archetype.name}. Take the 90-second Mental Load Calculator and see your number.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  };
}
