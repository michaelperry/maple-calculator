'use client';

import { useState, type FormEvent } from 'react';
import { analytics } from '@/lib/analytics';

interface EmailCaptureProps {
  slug: string;
  archetype: string;
  primary: number;
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function EmailCapture({ slug, archetype, primary }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: slug,
          archetype,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus('error');
        setErrorMsg(json?.error === 'invalid_email' ? 'Please enter a valid email.' : 'Something went wrong. Try again?');
        return;
      }
      analytics.emailSubmitted({ slug, archetype, primary });
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Try again?');
    }
  };

  if (status === 'done') {
    return (
      <div className="rounded-2xl bg-maple-soft-green p-6 text-center">
        <p className="font-display text-xl font-semibold text-maple-dark">
          You&rsquo;re in. Check your inbox.
        </p>
        <p className="mt-2 font-body text-sm text-maple-dark/70">
          We&rsquo;ll send a follow-up with what your number means and what to do next.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-maple-dark">
          Get the follow-up.
        </p>
        <p className="font-body text-sm text-maple-dark/60">
          A short email with what your number means and how to redistribute. No spam.
        </p>
      </div>
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border-2 border-maple-dark/10 bg-white px-4 py-3 font-body text-maple-dark placeholder:text-maple-dark/40 transition-colors focus:border-maple-teal focus:outline-none"
      />
      <input
        type="text"
        placeholder="First name (optional)"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full rounded-xl border-2 border-maple-dark/10 bg-white px-4 py-3 font-body text-maple-dark placeholder:text-maple-dark/40 transition-colors focus:border-maple-teal focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'submitting' || !email}
        className="w-full rounded-full bg-maple-teal px-8 py-3 font-body text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Send me the follow-up'}
      </button>
      {errorMsg && <p className="font-body text-sm text-red-600">{errorMsg}</p>}
    </form>
  );
}
