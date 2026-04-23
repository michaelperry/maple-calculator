import Link from 'next/link';
import { Blobs } from '@/components/decorative/blobs';

/**
 * Landing page = the Invisible Load entry point. For v1, the only live
 * calculator is Mental Load, so the primary CTA goes straight there.
 * As more calculators ship, this becomes the soft directory described
 * in the strategy brief (Stage 1 of the hub rollout).
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-maple-green via-emerald-400 to-maple-teal">
      <Blobs />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12 text-center text-maple-dark">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-maple-dark/70">
          The Invisible Load
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          Put a number on what you&rsquo;re carrying.
        </h1>
        <p className="mt-6 max-w-md text-lg text-maple-dark/80 md:text-xl">
          Calculators that name the invisible work of running a family. Start with
          the one that started it all.
        </p>

        <Link
          href="/mental-load"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-maple-dark px-8 py-4 font-body text-lg font-semibold text-maple-cream shadow-lg transition-transform hover:scale-[1.02]"
        >
          Take the Mental Load Calculator
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-3 text-sm text-maple-dark/70">9 questions. About 90 seconds.</p>

        <div className="mt-16 w-full rounded-2xl bg-white/40 p-6 text-left backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-maple-dark/70">
            What is the mental load?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-maple-dark/80">
            The invisible work of running a family — noticing, planning, remembering,
            anticipating. The stuff that keeps the wheels on but never makes it onto
            anyone&rsquo;s to-do list.
          </p>
        </div>
      </div>
    </main>
  );
}
