import type { CalculatorConfig, QuizResult } from './types';

/**
 * Run a calculator's scoring + classification end-to-end.
 * Pure function — easy to unit-test, no side effects.
 */
export function buildResult(
  config: CalculatorConfig,
  answers: Record<string, string>,
): QuizResult {
  const { primary, breakdown } = config.score(answers);
  const archetypeId = config.classify(primary, breakdown);
  const archetype =
    config.archetypes.find((a) => a.id === archetypeId) ?? config.archetypes[0];

  return {
    slug: config.slug,
    primary,
    breakdown,
    number: config.formatNumber(primary),
    archetype,
  };
}

/**
 * Are all non-optional questions answered?
 * (All Mental Load questions are required; "n/a" is an explicit answer, not absence.)
 */
export function isComplete(
  config: CalculatorConfig,
  answers: Record<string, string>,
): boolean {
  return config.questions.every((q) => Boolean(answers[q.id]));
}
