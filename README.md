# Maple Calculator — The Invisible Load

The Mental Load Calculator, rebuilt as the template for Maple's seven-calculator
"Invisible Load" program. Stack: **Next.js 16, Tailwind CSS v4, Fraunces + DM
Sans, Amplitude, Mailchimp (server-side, env-gated)**.

## What's here

- **`/`** — Landing page (gradient hero, CTA into the calculator)
- **`/mental-load`** — The quiz: 9 questions, ~90 seconds
- **`/mental-load/result?r=...`** — Result page with the three unified outputs:
  1. **The Number** — the % of family mental load carried
  2. **Your Type** — archetype (CEO / Pilot / Balanced Team / Support System / Radar)
  3. **The Maple Connection** — how Maple reduces this number
- **`/api/subscribe`** — Server-side Mailchimp subscriber (stub until env vars land)

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in what's ready:

```
MAILCHIMP_API_KEY=        # optional — stub mode when unset
MAILCHIMP_LIST_ID=
MAILCHIMP_DC=us2
NEXT_PUBLIC_AMPLITUDE_API_KEY=   # optional — analytics no-op when unset
```

Both subsystems gracefully no-op when env isn't set, so local dev works out
of the box.

## Architecture

A **config-driven calculator engine** powers Mental Load today and the
remaining six calculators later. Each calculator is a `CalculatorConfig` in
`lib/calculators/`:

```
lib/calculators/
├── types.ts         # CalculatorConfig, Question, Archetype, Result
├── engine.ts        # buildResult(), isComplete()
├── encode.ts        # URL-safe encode/decode of answers
└── mental-load.ts   # The Mental Load config
```

Answers are encoded into the result URL as base64url JSON, so shares are
stateless and comparison flows (partner / retake) can derive their result
purely from the URL — no database in v1.

## Design

Design tokens (colors, fonts, animations) are ported verbatim from the
production Mental Load quiz to keep the brand continuous. Palette:
`maple-green #5CE07A`, `amber #F5C842`, `dark #0F2D1E`, `cream #F7F5F0`,
`teal #2A9D8F`, `soft-green #EDFAF3`.

## What's next (not in v1)

- Share-card OG image generation (`opengraph-image.tsx`)
- Partner comparison flow (requires persistence)
- The six additional calculators — each a new file in `lib/calculators/` plus
  a route under `app/<slug>/`
- Hub at `/invisible-load` (the soft directory launches after the second
  calculator ships)
