'use client';

import { useState } from 'react';
import { analytics } from '@/lib/analytics';
import { BASE_PATH } from '@/lib/base-path';

interface ShareButtonsProps {
  slug: string;
  primary: number;
  /** Relative path or absolute URL — we normalize to absolute at click time. */
  shareUrl: string;
}

/**
 * Share system — group-chat first.
 *
 * Fixes two prior bugs:
 *
 *   1. `shareUrl` used to be pasted directly into SMS body as a relative path
 *      (e.g. `/mental-load/result?r=...`). iMessage only auto-links fully-qualified
 *      URLs, so recipients saw plain text. We now resolve against
 *      `window.location.origin` at click time so every shared link is absolute.
 *
 *   2. Share copy was a long self-report ("I'm carrying X%…"). The Copy Package v4
 *      spec is deliberately shorter and lets the OG preview do the work —
 *      "Take this. Don't think about it. Takes 2 minutes. 👇 [link]".
 */
export function ShareButtons({ slug, primary, shareUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const canNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  const body = (absoluteUrl: string) =>
    `Take this. Don't think about it. Takes 2 minutes. 👇 ${absoluteUrl}`;

  const resolveAbsolute = () => {
    if (typeof window === 'undefined') return shareUrl;
    try {
      // If shareUrl is already absolute (http(s)://…), URL() resolves to it and
      // the basePath prefix is ignored. Otherwise it's an app-relative path
      // like /r/abc — we prepend BASE_PATH so the shared link works through
      // the Netlify proxy at www.growmaple.com/mental-load-calculator/…
      const normalized =
        shareUrl.startsWith('http://') || shareUrl.startsWith('https://')
          ? shareUrl
          : shareUrl.startsWith(BASE_PATH)
            ? shareUrl
            : `${BASE_PATH}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
      return new URL(normalized, window.location.origin).toString();
    } catch {
      return shareUrl;
    }
  };

  const track = (platform: string) =>
    analytics.shareClicked({ slug, platform, primary });

  const onSms = () => {
    track('sms');
    const absolute = resolveAbsolute();
    window.location.href = `sms:?&body=${encodeURIComponent(body(absolute))}`;
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(body(resolveAbsolute()));
      setCopied(true);
      track('copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail in some contexts — silent fail is fine.
    }
  };

  const onNativeShare = async () => {
    track('native_share');
    const absolute = resolveAbsolute();
    if (!canNativeShare) return;
    try {
      await navigator.share({ text: body(absolute), url: absolute });
    } catch {
      // User dismissed, no-op.
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-center font-display text-lg font-semibold text-maple-dark">
        Send to a mom friend.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSms}
          className="rounded-full bg-maple-dark px-6 py-3 text-center font-body text-sm font-semibold text-maple-cream transition-opacity hover:opacity-90"
        >
          Text it to someone
        </button>
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
