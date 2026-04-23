import { QuizClient } from './quiz-client';

/**
 * Server entry for the Mental Load Calculator.
 * The QuizClient imports its config directly — the config contains function
 * fields (score/classify/formatNumber) which can't cross the RSC serialization
 * boundary. This keeps the server shell trivial and the config cohesive.
 */
export default function MentalLoadPage() {
  return <QuizClient />;
}
