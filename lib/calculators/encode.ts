/**
 * Encode/decode quiz answers as a URL-safe base64 string.
 * Format: { v: 1, a: { [questionId]: optionValue } }
 *
 * Encoding only the answers (not the result) keeps the URL short and lets us
 * re-derive the result if scoring changes. Enables shareable links and
 * partner-comparison flows where each person's URL contains their inputs.
 */

interface EncodedShape {
  v: 1;
  a: Record<string, string>;
}

function toBase64Url(input: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(input, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  if (typeof window === 'undefined') {
    return Buffer.from(padded + pad, 'base64').toString('utf8');
  }
  return decodeURIComponent(escape(atob(padded + pad)));
}

export function encodeAnswers(answers: Record<string, string>): string {
  const payload: EncodedShape = { v: 1, a: answers };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeAnswers(encoded: string): Record<string, string> | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as Partial<EncodedShape>;
    if (parsed?.v !== 1 || !parsed.a || typeof parsed.a !== 'object') return null;
    // Defensively normalize to a plain string-keyed object.
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed.a)) {
      if (typeof v === 'string') out[String(k)] = v;
    }
    return out;
  } catch {
    return null;
  }
}
