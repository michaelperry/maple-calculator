'use client';

interface QuizNavProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function QuizNav({ canGoBack, canGoNext, isLast, onBack, onNext }: QuizNavProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="font-body text-sm text-maple-dark/60 transition-colors hover:text-maple-dark disabled:invisible"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-full bg-maple-teal px-8 py-3 font-body text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {isLast ? 'See my results →' : 'Next →'}
      </button>
    </div>
  );
}
