import type { Metadata } from 'next';
import Link from 'next/link';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { buildResult, isComplete } from '@/lib/calculators/engine';
import { decodeAnswers } from '@/lib/calculators/encode';
import { buildResultMetadata } from '@/lib/result-metadata';
import { MentalLoadResultView } from '@/components/result/mental-load-result-view';
import { Logo } from '@/components/brand/logo';

interface ResultPageProps {
  searchParams: Promise<{ r?: string }>;
}

/**
 * Legacy/fallback result URL — `/mental-load/result?r=<base64>`.
 *
 * The short-ID route at `/r/[id]` is the canonical shape for anything
 * freshly shared (once Upstash Redis is provisioned). This URL still
 * works indefinitely so links already in the wild keep resolving, and
 * it's also what the client falls back to when Redis is unavailable.
 */
export async function generateMetadata({ searchParams }: ResultPageProps): Promise<Metadata> {
  const { r } = await searchParams;
  if (!r) return {};
  const answers = decodeAnswers(r);
  if (!answers || !isComplete(mentalLoad, answers)) return {};
  return buildResultMetadata(buildResult(mentalLoad, answers), answers);
}

export default async function MentalLoadResultPage({ searchParams }: ResultPageProps) {
  const { r } = await searchParams;

  if (!r) return <InvalidResult />;
  const answers = decodeAnswers(r);
  if (!answers || !isComplete(mentalLoad, answers)) return <InvalidResult />;

  const result = buildResult(mentalLoad, answers);
  const sharePath = `/${mentalLoad.slug}/result?r=${r}`;

  return <MentalLoadResultView result={result} sharePath={sharePath} />;
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
