import type { Archetype } from '@/lib/calculators/types';

interface ArchetypeBlockProps {
  archetype: Archetype;
}

/** Output #2 — type/archetype name + short description. */
export function ArchetypeBlock({ archetype }: ArchetypeBlockProps) {
  return (
    <div className="space-y-4 text-center">
      <p className="font-body text-sm font-semibold uppercase tracking-wider text-maple-dark/60">
        Your type
      </p>
      <div className="inline-block rounded-full border border-maple-amber bg-maple-amber/30 px-6 py-3 font-display text-2xl font-bold text-maple-dark">
        {archetype.name}
      </div>
      <p className="mx-auto max-w-md font-body text-base leading-relaxed text-maple-dark/80 md:text-lg">
        {archetype.description}
      </p>
    </div>
  );
}
