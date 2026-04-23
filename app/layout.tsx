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

export const metadata: Metadata = {
  metadataBase: new URL('https://growmaple.com'),
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
