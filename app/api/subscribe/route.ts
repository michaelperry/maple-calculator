import { NextResponse } from 'next/server';
import { subscribe } from '@/lib/mailchimp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const data = body as {
    email?: unknown;
    firstName?: unknown;
    source?: unknown;
    archetype?: unknown;
  };

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const firstName =
    typeof data.firstName === 'string' && data.firstName.trim().length > 0
      ? data.firstName.trim()
      : undefined;
  const source = typeof data.source === 'string' ? data.source : 'unknown';
  const archetype =
    typeof data.archetype === 'string' ? data.archetype : 'unknown';

  const tags = [
    `source:${source}`,
    `archetype:${archetype}`,
    'hub_subscriber:false',
  ];

  const result = await subscribe({ email, firstName, tags });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, stubbed: result.stubbed ?? false });
}
