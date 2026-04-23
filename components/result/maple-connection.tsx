'use client';

import { analytics } from '@/lib/analytics';
import type { Archetype } from '@/lib/calculators/types';

interface MapleConnectionProps {
  slug: string;
  archetype: Archetype;
}

/** Output #3 — one honest sentence + the Maple app pitch. */
export function MapleConnection({ slug, archetype }: MapleConnectionProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-maple-dark to-emerald-900 p-8 text-maple-cream">
      <p className="font-body text-xs font-semibold uppercase tracking-wider text-maple-green/80">
        From Maple
      </p>
      <p className="mt-3 font-display text-xl font-semibold leading-snug md:text-2xl">
        {archetype.mapleConnection}
      </p>
      <ul className="mt-6 space-y-2 font-body text-sm text-maple-cream/85">
        <li className="flex gap-2"><span className="text-maple-green">✓</span> Shared family system, not another app for you alone</li>
        <li className="flex gap-2"><span className="text-maple-green">✓</span> Every task has an owner — including the invisible ones</li>
        <li className="flex gap-2"><span className="text-maple-green">✓</span> Built by parents who&rsquo;ve carried this themselves</li>
      </ul>
      <a
        href="https://growmaple.com"
        target="_blank"
        rel="noreferrer"
        onClick={() =>
          analytics.mapleCtaClicked({ slug, cta_location: 'result_maple_block' })
        }
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-maple-green px-7 py-3 font-body font-semibold text-maple-dark shadow-sm transition-opacity hover:opacity-90"
      >
        Try Maple
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}
