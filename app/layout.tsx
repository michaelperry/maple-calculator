import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Resolve the canonical origin for absolute URLs in metadata (used by
// open-graph image references). Order:
//   1. NEXT_PUBLIC_SITE_URL — explicit override (set in Vercel env when wiring a custom domain)
//   2. VERCEL_PROJECT_PRODUCTION_URL — the project's prod URL on Vercel (always set on prod builds)
//   3. VERCEL_URL — the current deployment URL (preview deploys)
//   4. localhost — dev fallback
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
);

export const metadata: Metadata = {
  metadataBase,
  title: 'The Invisible Load | Maple',
  description:
    "Calculators that put a number on what moms are carrying. Start with the Mental Load Calculator — 90 seconds.",
  openGraph: {
    title: 'The Invisible Load | Maple',
    description:
      "Calculators that put a number on what moms are carrying. Start with the Mental Load Calculator.",
    url: '/invisible-load',
    siteName: 'Maple',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-maple-cream font-body">{children}</body>
    </html>
  );
}
