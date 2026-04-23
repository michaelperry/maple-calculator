'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { encodeAnswers } from '@/lib/calculators/encode';
import { isComplete } from '@/lib/calculators/engine';
import { QuestionCard } from '@/components/quiz/question-card';
import { ProgressBar } from '@/components/quiz/progress-bar';
import { QuizNav } from '@/components/quiz/nav';
import { analytics } from '@/lib/analytics';

/**
 * Quiz drops users straight into question 1 — the landing page (or future hub)
 * already does the framing, so a second intro screen is just an extra tap.
 * `quiz_started` fires on mount; `quiz_completed` fires on submit.
 */
export function QuizClient() {
  const config = mentalLoad;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    analytics.quizPageViewed({ slug: config.slug });
    if (startedAt.current === null) {
      startedAt.current = Date.now();
      analytics.quizStarted(config.slug);
    }
  }, [config.slug]);

  const total = config.questions.length;
  const question = config.questions[index];
  const selected = answers[question?.id ?? ''];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    analytics.questionAnswered({
      slug: config.slug,
      question_number: index + 1,
      category: question.category,
      answer: value,
    });
  };

  const goBack = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    if (!isComplete(config, answers)) return;
    const elapsed = startedAt.current ? Date.now() - startedAt.current : 0;
    analytics.quizCompleted({ slug: config.slug, total_time_ms: elapsed });
    const encoded = encodeAnswers(answers);
    router.push(`/${config.slug}/result?r=${encoded}`);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maple-teal">
          {config.title}
        </p>
        <ProgressBar current={index + 1} total={total} />
      </header>
      <div className="flex-1">
        {question && (
          <QuestionCard
            key={question.id}
            question={question}
            selected={selected}
            onAnswer={handleAnswer}
          />
        )}
      </div>
      <div className="mt-10">
        <QuizNav
          canGoBack={index > 0}
          canGoNext={Boolean(selected)}
          isLast={index === total - 1}
          onBack={goBack}
          onNext={goNext}
        />
      </div>
    </main>
  );
}
