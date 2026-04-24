import type { Metadata } from 'next';
import Link from 'next/link';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { buildResult, isComplete } from '@/lib/calculators/engine';
import { decodeAnswers } from '@/lib/calculators/encode';
import { NumberBlock } from '@/components/result/number-block';
import { ArchetypeBlock } from '@/components/result/archetype-block';
import { MapleConnection } from '@/components/result/maple-connection';
import { EmailCapture } from '@/components/result/email-capture';
import { ShareButtons } from '@/components/result/share-buttons';
import { Logo } from '@/components/brand/logo';
import { ResultsTracker } from './results-tracker';

interface ResultPageProps {
  searchParams: Promise<{ r?: string }>;
}

/**
 * Per-result OG metadata. The `?r=...` answer string is what makes each
 * shared link unique, so each share gets its own preview image with the
 * actual number and archetype baked in.
 *
 * `metadataBase` from app/layout.tsx provides the absolute origin used
 * when resolving the relative `/api/og?r=...` URL — Next.js sets this
 * automatically from VERCEL_URL on Vercel deployments.
 */
export async function generateMetadata({ searchParams }: ResultPageProps): Promise<Metadata> {
  const { r } = await searchParams;
  if (!r) return {};
  const answers = decodeAnswers(r);
  if (!answers || !isComplete(mentalLoad, answers)) return {};

  const result = buildResult(mentalLoad, answers);
  const ogUrl = `/api/og?r=${r}&slug=${mentalLoad.slug}`;
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

export default async function MentalLoadResultPage({ searchParams }: ResultPageProps) {
  const { r } = await searchParams;

  if (!r) return <InvalidResult />;
  const answers = decodeAnswers(r);
  if (!answers || !isComplete(mentalLoad, answers)) return <InvalidResult />;

  const result = buildResult(mentalLoad, answers);

  // Build a canonical share URL using the same encoded answers.
  // For local dev this will be relative; share buttons concat it with the host.
  const sharePath = `/${mentalLoad.slug}/result?r=${r}`;

  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col px-6 pt-20 pb-12 md:pt-24">
      <Logo />
      <ResultsTracker
        slug={result.slug}
        primary={result.primary}
        archetype={result.archetype.id}
      />

      <div className="space-y-10">
        {/* Output #1 — The Number */}
        <NumberBlock number={result.number} />

        {/* Output #2 — Your Type */}
        <ArchetypeBlock archetype={result.archetype} />

        {/* Category breakdown (keeps the core insight from the original quiz) */}
        {result.breakdown && Object.keys(result.breakdown).length > 0 && (
          <CategoryBreakdown breakdown={result.breakdown} />
        )}

        {/* Share */}
        <ShareButtons
          slug={result.slug}
          primary={result.primary}
          archetypeName={result.archetype.name}
          shareUrl={sharePath}
        />

        {/* Email capture */}
        <EmailCapture
          slug={result.slug}
          archetype={result.archetype.id}
          primary={result.primary}
        />

        {/* Output #3 — The Maple Connection */}
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
            <div className="mb-1 flex items-baseline justify-between">
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

function InvalidResult() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <Logo />
      <h1 className="font-display text-3xl font-bold text-maple-dark">
        We couldn&rsquo;t read that result.
      </h1>
      <p className="mt-4 font-body text-maple-dark/70">
        The link may be broken. Take the quiz to get your number.
      </p>
      <Link
        href="/mental-load"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-maple-teal px-8 py-3 font-body font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Take the Mental Load Calculator
      </Link>
    </main>
  );
}
