/**
 * Server-side Mailchimp subscriber.
 *
 * Env-gated: when MAILCHIMP_API_KEY is unset, this is a no-op stub that logs
 * to the server console — useful for local dev and the pre-launch window
 * before Mike's pipeline is live. When env vars land, no code changes.
 */

import crypto from 'node:crypto';

interface SubscribeArgs {
  email: string;
  firstName?: string;
  tags: string[];
}

interface SubscribeResult {
  ok: boolean;
  stubbed?: boolean;
  error?: string;
}

export async function subscribe({
  email,
  firstName,
  tags,
}: SubscribeArgs): Promise<SubscribeResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC ?? 'us2';

  if (!apiKey || !listId) {
    console.log('[mailchimp:stub]', { email, firstName, tags });
    return { ok: true, stubbed: true };
  }

  // Mailchimp uses MD5(lowercased email) as the subscriber hash for upsert.
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`;
  const auth = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: firstName ? { FNAME: firstName } : undefined,
      tags,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: `mailchimp ${res.status}: ${text.slice(0, 200)}` };
  }

  return { ok: true };
}
