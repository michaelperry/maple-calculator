'use client';

import type { Question } from '@/lib/calculators/types';

interface QuestionCardProps {
  question: Question;
  selected?: string;
  onAnswer: (value: string) => void;
}

export function QuestionCard({ question, selected, onAnswer }: QuestionCardProps) {
  return (
    <div className="animate-slide-in space-y-6">
      <p className="font-body text-sm font-semibold uppercase tracking-wide text-maple-teal">
        {question.category}
      </p>
      <h2 className="font-display text-2xl font-semibold leading-snug text-maple-dark md:text-3xl">
        {question.prompt}
      </h2>
      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(opt.value)}
              className={[
                'w-full rounded-2xl border-2 p-4 text-left font-body text-base transition-all duration-150 md:text-lg',
                isSelected
                  ? 'border-maple-green bg-maple-soft-green text-maple-dark'
                  : 'border-maple-dark/10 bg-white text-maple-dark/80 hover:border-maple-green/50',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
