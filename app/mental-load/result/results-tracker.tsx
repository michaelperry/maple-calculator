'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface ResultsTrackerProps {
  slug: string;
  primary: number;
  archetype: string;
}

/**
 * Client-only side effect: fire the results_viewed event once on mount.
 * Kept as its own tiny component so the parent can stay a Server Component.
 */
export function ResultsTracker({ slug, primary, archetype }: ResultsTrackerProps) {
  useEffect(() => {
    analytics.resultsViewed({ slug, archetype, primary });
  }, [slug, primary, archetype]);
  return null;
}
