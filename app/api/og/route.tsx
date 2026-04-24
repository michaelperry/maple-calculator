import { ImageResponse } from 'next/og';
import { mentalLoad } from '@/lib/calculators/mental-load';
import { buildResult, isComplete } from '@/lib/calculators/engine';
import { decodeAnswers } from '@/lib/calculators/encode';
import { withBasePath } from '@/lib/base-path';

/**
 * Dynamic Open Graph image for shared result links.
 *
 * URL: /api/og?r=<encoded-answers>[&slug=mental-load]
 *
 * Returns a 1200×630 PNG that social crawlers (iMessage, WhatsApp, Slack,
 * Twitter, LinkedIn, Facebook) embed in link previews. Reads the same
 * URL-encoded answers as the result page itself, runs the calculator
 * engine, and renders a branded card with the user's actual number and
 * archetype.
 *
 * Runs on Vercel Fluid Compute (default Node runtime). The previous
 * `runtime = 'edge'` directive is no longer required — `next/og` works
 * across all Vercel runtimes.
 */

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Cache fetched assets at module scope. The function instance is reused across
// invocations on Fluid Compute, so this avoids re-fetching the logo + font on
// every preview hit (image previews can be requested many times in seconds).
let logoDataUri: string | null = null;
let fraunces700: ArrayBuffer | null = null;

async function getLogoDataUri(origin: string): Promise<string | null> {
  if (logoDataUri) return logoDataUri;
  try {
    // basePath prefix: the logo lives at /<basePath>/maple-logo.png on disk
    // once Next.js mounts the public folder under basePath.
    const res = await fetch(`${origin}${withBasePath('/maple-logo.png')}`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer()).toString('base64');
    logoDataUri = `data:image/png;base64,${buf}`;
    return logoDataUri;
  } catch {
    return null;
  }
}

async function getFraunces(): Promise<ArrayBuffer | null> {
  if (fraunces700) return fraunces700;
  try {
    // Fraunces 700 from Google Fonts — exact static URL is stable across versions.
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Fraunces:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then((r) => r.text());
    const match = css.match(/src:\s*url\((https:\/\/[^)]+\.woff2)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    fraunces700 = await fontRes.arrayBuffer();
    return fraunces700;
  } catch {
    return null;
  }
}

const SLUGS = { 'mental-load': mentalLoad } as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const r = url.searchParams.get('r');
  const slug = (url.searchParams.get('slug') ?? 'mental-load') as keyof typeof SLUGS;

  const config = SLUGS[slug];
  if (!config || !r) {
    return new Response('Missing or unknown calculator', { status: 400 });
  }

  const answers = decodeAnswers(r);
  if (!answers || !isComplete(config, answers)) {
    return new Response('Invalid result', { status: 400 });
  }

  const result = buildResult(config, answers);

  const [logo, fontData] = await Promise.all([
    getLogoDataUri(url.origin),
    getFraunces(),
  ]);

  const card = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, #0F2D1E 0%, #1a4a30 45%, #2A9D8F 100%)',
        color: '#F7F5F0',
        fontFamily: '"Fraunces", "DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: '#5CE07A',
          opacity: 0.18,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: '#F5C842',
          opacity: 0.14,
          display: 'flex',
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 72,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} style={{ height: 56, filter: 'invert(1)' }} alt="Maple" />
        ) : (
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.85)',
              display: 'flex',
            }}
          >
            MAPLE
          </div>
        )}
      </div>

      {/* Main content — flex column from top of card under logo, footer pinned via flex */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '160px 72px 56px 72px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            color: 'rgba(247,245,240,0.75)',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: '0.04em',
            display: 'flex',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          {result.number.prefix}
        </div>

        <div
          style={{
            color: '#5CE07A',
            fontSize: 200,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginTop: 4,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          {result.number.value}
          <span style={{ fontSize: 120, marginLeft: 6 }}>{result.number.unit}</span>
        </div>

        <div
          style={{
            color: 'rgba(247,245,240,0.85)',
            fontSize: 32,
            marginTop: 8,
            fontFamily: '"DM Sans", system-ui, sans-serif',
            display: 'flex',
          }}
        >
          {result.number.caption}
        </div>

        <div style={{ display: 'flex', marginTop: 24 }}>
          <div
            style={{
              background: 'rgba(245, 200, 66, 0.92)',
              color: '#0F2D1E',
              fontSize: 30,
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: 999,
              display: 'flex',
            }}
          >
            {result.archetype.name}
          </div>
        </div>

        {/* Spacer pushes the footer to the bottom */}
        <div style={{ flex: 1, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          <div
            style={{
              color: 'rgba(247,245,240,0.55)',
              fontSize: 22,
              fontWeight: 500,
              display: 'flex',
            }}
          >
            Take the quiz
          </div>
          <div
            style={{
              color: 'rgba(247,245,240,0.9)',
              fontSize: 28,
              fontWeight: 600,
              marginTop: 2,
              display: 'flex',
            }}
          >
            growmaple.com/mental-load
          </div>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(card, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: fontData
      ? [{ name: 'Fraunces', data: fontData, weight: 700, style: 'normal' }]
      : undefined,
    headers: {
      // Browsers and crawlers can cache for an hour; the underlying URL
      // (which encodes the answers) is the cache key, so different `?r=` values
      // are independent.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
