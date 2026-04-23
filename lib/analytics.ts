'use client';

import * as amplitude from '@amplitude/analytics-browser';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return; // No key → no-op (dev / pre-launch).
  amplitude.init(apiKey, { defaultTracking: false });
  initialized = true;
}

function track(event: string, properties?: Record<string, unknown>) {
  ensureInit();
  if (!initialized) return;
  amplitude.track(event, properties);
}

/**
 * Event vocabulary — kept consistent with the previous Mental Load quiz so
 * dashboards and funnels carry over.
 */
export const analytics = {
  quizPageViewed: (props: { slug: string; source?: string }) =>
    track('quiz_page_viewed', props),

  quizStarted: (slug: string) => track('quiz_started', { slug }),

  questionAnswered: (props: {
    slug: string;
    question_number: number;
    category: string;
    answer: string;
  }) => track('question_answered', props),

  quizCompleted: (props: { slug: string; total_time_ms: number }) =>
    track('quiz_completed', props),

  emailSubmitted: (props: { slug: string; archetype: string; primary: number }) =>
    track('email_submitted', props),

  resultsViewed: (props: { slug: string; archetype: string; primary: number }) =>
    track('results_viewed', props),

  shareClicked: (props: { slug: string; platform: string; primary: number }) =>
    track('share_clicked', props),

  mapleCtaClicked: (props: { slug: string; cta_location: string }) =>
    track('maple_cta_clicked', props),
};
