'use client';

import { analytics } from '@/lib/analytics';

interface SendToPartnerProps {
  slug: string;
  primary: number;
  shareUrl: string;
}

/**
 * First-class "send to partner" flow from the strategy brief.
 * Distinct from the general share block — partner sharing has a different
 * emotional context ("let's compare notes") and different default copy.
 *
 * v1 uses the same result URL the partner would hit if they took the quiz.
 * A dedicated comparison page (per brief) is a follow-up; for now, both
 * partners complete independently and the partner-comparison email is what
 * ties it together.
 */
export function SendToPartner({ slug, primary, shareUrl }: SendToPartnerProps) {
  const text =
    "I took the Mental Load Calculator — curious what you'd score. Take it and we'll compare:";

  const resolveAbsolute = () => {
    if (typeof window === 'undefined') return shareUrl;
    try {
      return new URL(shareUrl, window.location.origin).toString();
    } catch {
      return shareUrl;
    }
  };

  const onClick = () => {
    analytics.shareClicked({ slug, platform: 'partner_sms', primary });
    const absolute = resolveAbsolute();
    window.location.href = `sms:?&body=${encodeURIComponent(`${text} ${absolute}`)}`;
  };

  return (
    <div className="rounded-2xl bg-maple-soft-green p-6 text-center">
      <p className="font-display text-lg font-semibold text-maple-dark">
        Send it to your partner.
      </p>
      <p className="mt-1 font-body text-sm text-maple-dark/70">
        See where you&rsquo;re seeing different things — the gap is where the conversation starts.
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-maple-teal px-7 py-3 font-body text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Text it to them
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
