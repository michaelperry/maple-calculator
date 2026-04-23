'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { FormattedNumber } from '@/lib/calculators/types';

interface NumberBlockProps {
  number: FormattedNumber;
}

/**
 * Output #1 — the headline number.
 * Count-up animation + confetti burst on reveal.
 */
export function NumberBlock({ number }: NumberBlockProps) {
  const targetN = Number.parseInt(number.value, 10);
  const isNumeric = !Number.isNaN(targetN);
  const [display, setDisplay] = useState(isNumeric ? 0 : targetN);
  const [revealed, setRevealed] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!isNumeric) {
      setRevealed(true);
      return;
    }
    const duration = 1500;
    const steps = 60;
    const step = targetN / steps;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const v = Math.min(targetN, Math.round(step * i));
      setDisplay(v);
      if (i >= steps) {
        clearInterval(id);
        setDisplay(targetN);
        setRevealed(true);
        if (!fired.current) {
          fired.current = true;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.4 },
            colors: ['#5CE07A', '#F5C842', '#2A9D8F', '#0F2D1E'],
          });
        }
      }
    }, duration / steps);
    return () => clearInterval(id);
  }, [targetN, isNumeric]);

  return (
    <div className="text-center">
      <div className={revealed ? 'animate-count-up' : ''}>
        <p className="mb-2 font-body text-lg text-maple-dark/60">{number.prefix}</p>
        <p
          className="font-display font-bold leading-none text-maple-dark"
          style={{ fontSize: 'clamp(5rem, 20vw, 10rem)' }}
        >
          {isNumeric ? display : number.value}
          <span className="ml-1 text-maple-green">{number.unit}</span>
        </p>
        <p className="mt-2 font-body text-lg text-maple-dark/60">{number.caption}</p>
      </div>
    </div>
  );
}
