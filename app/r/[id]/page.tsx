import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { buildResult, isComplete } from '@/lib/calculators/engine';
import { getAnswers } from '@/lib/result-store';
import { buildResultMetadata } from '@/lib/result-metadata';
import { MentalLoadResultView } from '@/components/result/mental-load-result-view';
import { Logo } from '@/components/brand/logo';

/**
 * Short-ID result route.
 *
 * URL shape: /r/<id>  (e.g. /r/k7m3xy2q)
 *
 * The id is looked up in Upstash Redis (see lib/result-store.ts). For now
 * we only serve Mental Load results — when more calculators ship, we can
 * either namespace by slug in the key (already done — `r:<slug>:<id>`) and
 * scan across known slugs here, or move to `/r/<slug>/<id>`. Single slug
 * for v1 keeps URLs maximally short.
 *
 * Short URLs replace the old base64 `?r=...` URLs for anything freshly
 * shared. The old URLs keep working — this is purely a nicer-looking
 * share target, not a replacement.
 */

interface Params {
  params: Promise<{ id: string }>;
}

async function resolveResult(id: string) {
  const answers = await getAnswers(mentalLoad.slug, id);
  if (!answers || !isComplete(mentalLoad, answers)) return null;
  return { answers, result: buildResult(mentalLoad, answers) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const resolved = await resolveResult(id);
  if (!resolved) return {};
  return buildResultMetadata(resolved.result, resolved.answers);
}

export default async function ShortIdResultPage({ params }: Params) {
  const { id } = await params;
  const resolved = await resolveResult(id);
  if (!resolved) return <ExpiredOrMissing />;

  // The sharePath stays on the short URL — it's what we want recipients to see.
  const sharePath = `/r/${id}`;

  return <MentalLoadResultView result={resolved.result} sharePath={sharePath} />;
}

function ExpiredOrMissing() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <Logo />
      <h1 className="font-display text-3xl font-bold text-maple-dark">
        This link has expired.
      </h1>
      <p className="mt-4 font-body text-maple-dark/70">
        Result links last about a year. Take the quiz to get your own number.
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

// Silence TS "unused" warning for the imported notFound helper until/if we
// prefer 404 semantics over the custom ExpiredOrMissing page.
void notFound;
