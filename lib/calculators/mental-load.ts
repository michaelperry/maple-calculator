import type { CalculatorConfig, Question, Archetype } from './types';

/**
 * Mental Load Calculator config.
 *
 * Questions, weights, category mapping, and archetype thresholds are ported
 * from the production quiz at /Users/mp/maple-mental-load (the "we built
 * together previously" version). The Maple-connection sentences are net-new
 * for the Invisible Load 3-part output format and may be tuned when the
 * full Copy Package lands.
 */

const ANSWER_WEIGHTS: Record<string, { me: number; partner: number }> = {
  me:      { me: 2, partner: 0 },
  shared:  { me: 1, partner: 1 },
  partner: { me: 0, partner: 2 },
  neither: { me: 0.5, partner: 0.5 },
};

const ANSWER_OPTIONS = [
  { value: 'me',      label: 'Mostly me' },
  { value: 'shared',  label: 'We share this' },
  { value: 'partner', label: 'Mostly my partner' },
  { value: 'neither', label: "Neither of us (it doesn't get done)" },
  { value: 'na',      label: 'N/A (kids too young)' },
] as const;

function buildOptions() {
  return ANSWER_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    weights: opt.value === 'na' ? { me: 0, partner: 0 } : ANSWER_WEIGHTS[opt.value],
  }));
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Calendar & Scheduling',
    prompt:
      'Birthday party this weekend. Who handles the gift, the RSVP, and getting there?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q2',
    category: 'Meals',
    prompt:
      "You just got home from work and activities. Everyone's hungry. Who figures out what's for dinner tonight?",
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q3',
    category: 'Household Supplies',
    prompt:
      "You're out of paper towels, the toothpaste is almost gone, and the batteries are dead in the remote. Who noticed?",
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q4',
    category: 'School',
    prompt:
      'A school email comes in about picture day, a field trip form, and spirit week. Who reads it and knows what to do?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q5',
    category: 'Health & Wellbeing',
    prompt:
      'Your kid wakes up with a fever on a workday. Who rearranges their schedule, calls the pediatrician, and handles the day?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q6',
    category: 'Finances',
    prompt:
      "Car registration is due, the kids' activities fees are coming up, and the water bill looks higher than usual. Who keeps track of where the money goes?",
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q7',
    category: 'Emotional Labor',
    prompt:
      'Who remembers to check in on how the kids are doing emotionally — friendships, stress, big feelings?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q8',
    category: 'Indoor Chores',
    prompt:
      'The laundry is piling up, the dishes are in the sink, and the kitchen counter is a mess. Who makes sure it gets done?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
  {
    id: 'q9',
    category: 'Outdoor & Errands',
    prompt:
      'The car needs gas, the trash has to go out, and the yard could use some attention. Who stays on top of it?',
    kind: 'single',
    options: buildOptions(),
    excludedValues: ['na'],
  },
];

const ARCHETYPES: Archetype[] = [
  {
    id: 'family-ceo',
    name: 'The Family CEO',
    description:
      "You run this household. Everyone knows it. Your brain never fully turns off, and the whole operation would feel it if you stepped back for a week.",
    mapleConnection:
      "Maple takes the running list out of your head and turns it into shared, accountable work — so the operation keeps moving without living inside you.",
  },
  {
    id: 'pilot',
    name: 'The Pilot',
    description:
      "You're carrying more than half, but you've got some shared ground to build on. The gap is real — and now you can see exactly where it lives.",
    mapleConnection:
      "Maple makes the gap visible to both of you and turns it into specific tasks you can hand off — not vague promises to 'help more.'",
  },
  {
    id: 'balanced-team',
    name: 'The Balanced Team',
    description:
      "You and your partner are close to even across the board. That's genuinely rare and worth celebrating.",
    mapleConnection:
      "Maple keeps the balance you've built from quietly drifting back — every task has an owner, so 'we share it' stays true week after week.",
  },
  {
    id: 'support-system',
    name: 'The Support System',
    description:
      "Your partner carries more of the overall load. Knowing that — and being curious about it — is the first step toward a more intentional split.",
    mapleConnection:
      "Maple gives you both a shared view of what's actually getting done, so you can step in where it counts most without anyone keeping score.",
  },
  {
    id: 'radar',
    name: 'The Radar',
    description:
      "Your load is concentrated in one or two areas where you see everything, even if no one else does. You're the expert in your zone.",
    mapleConnection:
      "Maple turns your zone into a system anyone in the family can run — so being the expert stops meaning being the only one who can do it.",
  },
];

const TYPE_THRESHOLDS: Record<string, { min: number; max: number }> = {
  'family-ceo':     { min: 75, max: 100 },
  pilot:            { min: 55, max: 74 },
  'balanced-team':  { min: 45, max: 54 },
  'support-system': { min: 0,  max: 44 },
};

export const mentalLoad: CalculatorConfig = {
  slug: 'mental-load',
  title: 'Mental Load Calculator',
  intro:
    "What percentage of your family's mental load do you carry? Nine quick questions. No wrong answers.",
  estimatedSeconds: 90,
  questions: QUESTIONS,
  archetypes: ARCHETYPES,

  score(answers) {
    let totalMe = 0;
    let totalPartner = 0;
    const categoryMe: Record<string, number> = {};
    const categoryPartner: Record<string, number> = {};

    for (const q of QUESTIONS) {
      const answer = answers[q.id];
      if (!answer || q.excludedValues?.includes(answer)) continue;
      const opt = q.options.find((o) => o.value === answer);
      if (!opt) continue;
      const me = opt.weights.me ?? 0;
      const partner = opt.weights.partner ?? 0;
      totalMe += me;
      totalPartner += partner;
      categoryMe[q.category] = (categoryMe[q.category] ?? 0) + me;
      categoryPartner[q.category] = (categoryPartner[q.category] ?? 0) + partner;
    }

    const total = totalMe + totalPartner;
    const primary = total === 0 ? 50 : Math.round((totalMe / total) * 100);

    const breakdown: Record<string, number> = {};
    for (const cat of Object.keys(categoryMe)) {
      const catTotal = (categoryMe[cat] ?? 0) + (categoryPartner[cat] ?? 0);
      if (catTotal > 0) {
        breakdown[cat] = Math.round((categoryMe[cat] / catTotal) * 100);
      }
    }

    return { primary, breakdown };
  },

  classify(primary, breakdown) {
    // "The Radar" — overall in 45–74 range but 1–2 categories spike above 80.
    if (primary >= 45 && primary <= 74 && breakdown) {
      const high = Object.values(breakdown).filter((v) => v > 80).length;
      if (high >= 1 && high <= 2) return 'radar';
    }
    for (const [id, { min, max }] of Object.entries(TYPE_THRESHOLDS)) {
      if (primary >= min && primary <= max) return id;
    }
    return 'support-system';
  },

  formatNumber(primary) {
    return {
      prefix: 'You carry',
      value: String(primary),
      unit: '%',
      caption: "of your family's mental load",
    };
  },
};
