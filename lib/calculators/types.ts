/**
 * Shared types for the Invisible Load calculator engine.
 * One config-driven engine powers Mental Load (v1) and the six follow-on calculators.
 */

export type Answer = string;

export type QuestionKind = 'single' | 'multi' | 'scale';

export interface AnswerOption {
  value: string;
  label: string;
  /** Per-option weights. Mental Load uses { me, partner }; future calculators may use other axes. */
  weights: Record<string, number>;
}

export interface Question {
  id: string;
  category: string;
  prompt: string;
  kind: QuestionKind;
  options: AnswerOption[];
  /** Answer values that should be excluded from scoring (e.g. "n/a"). */
  excludedValues?: string[];
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  /** Output #3 — the Maple connection sentence shown on the result page. */
  mapleConnection: string;
}

export interface FormattedNumber {
  /** The big number itself (e.g. "72") */
  value: string;
  /** Unit suffix (e.g. "%") */
  unit: string;
  /** Caption shown under the number (e.g. "of your family's mental load") */
  caption: string;
  /** Small label shown above the number (e.g. "You carry") */
  prefix: string;
}

export interface CalculatorConfig {
  slug: string;
  title: string;
  intro: string;
  estimatedSeconds: number;
  questions: Question[];
  archetypes: Archetype[];
  /**
   * Score the answers down to a single primary number plus any per-category breakdown.
   * For Mental Load: returns the % of load carried by "me" plus a per-category map.
   */
  score: (answers: Record<string, string>) => {
    primary: number;
    breakdown?: Record<string, number>;
  };
  /** Map a primary score (and optional breakdown) to an archetype id. */
  classify: (
    primary: number,
    breakdown?: Record<string, number>,
  ) => string;
  /** Format the primary score into the big-number block. */
  formatNumber: (primary: number) => FormattedNumber;
}

export interface QuizResult {
  slug: string;
  primary: number;
  breakdown?: Record<string, number>;
  number: FormattedNumber;
  archetype: Archetype;
}
