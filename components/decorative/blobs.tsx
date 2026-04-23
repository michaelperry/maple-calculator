/**
 * Floating semi-transparent circles for the landing-page hero.
 * Pure decoration — purely positional, no interactivity.
 */
export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-white/20 blur-2xl animate-float" />
      <div
        className="absolute top-24 -right-16 h-72 w-72 rounded-full bg-maple-amber/30 blur-2xl animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-white/15 blur-2xl animate-float"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-maple-soft-green/40 blur-xl animate-float"
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
}
