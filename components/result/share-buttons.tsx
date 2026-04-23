'use client';

import { useState } from 'react';
import { analytics } from '@/lib/analytics';

interface ShareButtonsProps {
  slug: string;
  primary: number;
  archetypeName: string;
  shareUrl: string;
}

/**
 * Share system per strategy brief:
 *   - Group-chat-first (SMS / copy link lead)
 *   - Pre-written copy based on the result
 *   - Native share where available
 *   - No OG-image generation in v1 (deferred)
 *
 * Copy follows the new Copy Package's share-line format.
 */
export function ShareButtons({ slug, primary, archetypeName, shareUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I'm carrying ${primary}% of my family's mental load — and apparently I'm "${archetypeName}." What's your number?`;

  const smsHref = `sms:?&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const track = (platform: string) =>
    analytics.shareClicked({ slug, platform, primary });

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      track('copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail in some browsers/contexts — silent fail is fine.
    }
  };

  const onNativeShare = async () => {
    track('native_share');
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
      } catch {
        // User dismissed, no-op.
      }
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="space-y-3">
      <p className="text-center font-display text-lg font-semibold text-maple-dark">
        Send to a mom friend.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href={smsHref}
          onClick={() => track('sms')}
          className="rounded-full bg-maple-dark px-6 py-3 text-center font-body text-sm font-semibold text-maple-cream transition-opacity hover:opacity-90"
        >
          Text it to someone
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border-2 border-maple-dark/10 bg-white px-6 py-3 font-body text-sm font-semibold text-maple-dark transition-colors hover:border-maple-green/50"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      {canNativeShare && (
        <button
          type="button"
          onClick={onNativeShare}
          className="w-full rounded-full border-2 border-maple-dark/10 bg-white px-6 py-3 font-body text-sm font-semibold text-maple-dark transition-colors hover:border-maple-green/50"
        >
          More sharing options…
        </button>
      )}
    </div>
  );
}
