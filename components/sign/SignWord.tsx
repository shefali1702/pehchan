// The name, painted as four signboard panels, one per letter.
const TILES = [
  { g: "प", bg: "var(--s-sindoor)", fg: "var(--s-paper)" },
  { g: "ह", bg: "var(--s-peacock)", fg: "var(--s-haldi)" },
  { g: "चा", bg: "var(--s-ink)", fg: "var(--s-marigold)" },
  { g: "न", bg: "var(--s-rani)", fg: "var(--s-paper)" },
];

export default function SignWord({ className = "", animate = false }: { className?: string; animate?: boolean }) {
  return (
    <span className={`signword${animate ? " is-anim" : ""} ${className}`} role="img" aria-label="पहचान, Pehchan">
      {TILES.map((t, i) => (
        <span key={i} className="sw-tile" style={{ background: t.bg, color: t.fg, animationDelay: `${(0.15 + i * 0.12).toFixed(2)}s` }}>
          <span className="sw-glyph">{t.g}</span>
        </span>
      ))}
    </span>
  );
}
