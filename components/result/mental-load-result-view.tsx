import Link from 'next/link';
import type { QuizResult } from '@/lib/calculators/types';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { NumberBlock } from './number-block';
import { ArchetypeBlock } from './archetype-block';
import { MapleConnection } from './maple-connection';
import { EmailCapture } from './email-capture';
import { ShareButtons } from './share-buttons';
import { SendToPartner } from './send-to-partner';
import { Logo } from '@/components/brand/logo';
import { ResultsTracker } from '@/app/mental-load/result/results-tracker';

interface Props {
  result: QuizResult;
  /** Relative path that share-to-partner / share-buttons will resolve to an absolute URL. */
  sharePath: string;
}

/**
 * Shared Mental Load result view, used by both the canonical
 * `/mental-load/result?r=...` page and the short-ID `/r/[id]` page.
 * Section order (per design feedback v4):
 *   Number → Type → Send to Partner → Share → Breakdown → Email → Maple CTA
 */
export function MentalLoadResultView({ result, sharePath }: Props) {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col px-6 pt-20 pb-24 md:pt-24 md:pb-32">
      <Logo />
      <ResultsTracker
        slug={result.slug}
        primary={result.primary}
        archetype={result.archetype.id}
      />

      <div className="space-y-10">
        <NumberBlock number={result.number} />
        <ArchetypeBlock archetype={result.archetype} />

        <SendToPartner
          slug={result.slug}
          primary={result.primary}
          shareUrl={sharePath}
        />

        <ShareButtons
          slug={result.slug}
          primary={result.primary}
          shareUrl={sharePath}
        />

        {result.breakdown && Object.keys(result.breakdown).length > 0 && (
          <CategoryBreakdown breakdown={result.breakdown} />
        )}

        <EmailCapture
          slug={result.slug}
          archetype={result.archetype.id}
          primary={result.primary}
        />

        <MapleConnection slug={result.slug} archetype={result.archetype} />

        <div className="pt-4 text-center">
          <Link
            href={`/${mentalLoad.slug}`}
            className="font-body text-sm text-maple-dark/60 underline-offset-2 hover:underline"
          >
            Retake the quiz
          </Link>
        </div>
      </div>
    </main>
  );
}

function CategoryBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="mb-4 font-body text-xs font-semibold uppercase tracking-wider text-maple-dark/60">
        Where your load lives
      </p>
      <ul className="space-y-3">
        {entries.map(([category, pct]) => (
          <li key={category}>
            <div className="mb-1 flex items-baseline justify-between gap-4">
              <span className="font-body text-sm text-maple-dark">{category}</span>
              <span className="font-display text-sm font-semibold text-maple-dark">
                {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-maple-dark/10">
              <div
                className="h-full rounded-full bg-maple-green transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
