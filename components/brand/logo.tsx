import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /** Inverted (white) variant for dark/gradient backgrounds. */
  invert?: boolean;
  /** Positioning mode. 'corner' = absolutely positioned top-left. 'inline' = in flow. */
  position?: 'corner' | 'inline';
  /** Pixel height of the logo. Defaults match the previous quiz (24px normal, 32px inverted). */
  size?: number;
}

/**
 * Maple wordmark, matching the previous Mental Load quiz placement.
 * Uses next/image for optimization. The PNG already has transparency;
 * `invert` flips luminance for dark backgrounds (hero gradient, Maple CTA).
 */
export function Logo({ invert = false, position = 'corner', size = 24 }: LogoProps) {
  const img = (
    <Image
      src="/maple-logo.png"
      alt="Maple"
      width={size * 3}
      height={size}
      priority
      className={invert ? 'h-auto invert' : 'h-auto'}
      style={{ height: size, width: 'auto' }}
    />
  );

  const content = (
    <Link
      href="/"
      aria-label="Maple home"
      className="inline-block transition-opacity hover:opacity-80"
    >
      {img}
    </Link>
  );

  if (position === 'inline') return content;

  return (
    <div className="absolute left-6 top-6 z-20 md:left-8 md:top-8">{content}</div>
  );
}
