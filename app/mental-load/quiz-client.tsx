'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { encodeAnswers } from '@/lib/calculators/encode';
import { isComplete } from '@/lib/calculators/engine';
import { QuestionCard } from '@/components/quiz/question-card';
import { ProgressBar } from '@/components/quiz/progress-bar';
import { QuizNav } from '@/components/quiz/nav';
import { analytics } from '@/lib/analytics';

type Stage = 'intro' | 'questions';

export function QuizClient() {
  const config = mentalLoad;
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    analytics.quizPageViewed({ slug: config.slug });
  }, [config.slug]);

  const total = config.questions.length;
  const question = config.questions[index];
  const selected = answers[question?.id ?? ''];

  const begin = () => {
    startedAt.current = Date.now();
    analytics.quizStarted(config.slug);
    setStage('questions');
  };

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

  const headerCopy = useMemo(() => {
    if (stage === 'intro') return null;
    return <ProgressBar current={index + 1} total={total} />;
  }, [stage, index, total]);

  if (stage === 'intro') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="space-y-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maple-teal">
            The Invisible Load
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-maple-dark md:text-5xl">
            {config.title}
          </h1>
          <p className="text-lg text-maple-dark/70">{config.intro}</p>
          <button
            type="button"
            onClick={begin}
            className="rounded-full bg-maple-dark px-10 py-4 font-body text-lg font-semibold text-maple-cream shadow-md transition-transform hover:scale-[1.02]"
          >
            Start the {config.estimatedSeconds}-second quiz
          </button>
          <p className="text-sm text-maple-dark/50">
            We&rsquo;ll ask {config.questions.length} questions about the invisible work of
            running your family. No wrong answers.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12">
      <div className="mb-10">{headerCopy}</div>
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
