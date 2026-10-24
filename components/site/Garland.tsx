// A toran: a string of marigolds and mango leaves, used as a section divider.
export default function Garland({ count = 22, className = "" }: { count?: number; className?: string }) {
  const w = 1200;
  const step = w / (count - 1);
  const sag = 26;
  const pts = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return { x: i * step, y: 18 + Math.sin(Math.PI * t) * sag };
  });
  return (
    <svg className={`garland ${className}`} viewBox={`-20 0 ${w + 40} 90`} preserveAspectRatio="none" aria-hidden="true">
      <path
        d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
        fill="none"
        stroke="#6b5a3c"
        strokeWidth="1.5"
      />
      {pts.map((p, i) =>
        i % 3 === 1 ? (
          <path
            key={i}
            d={`M ${p.x} ${p.y} q -9 18 0 34 q 9 -16 0 -34`}
            fill="#2f6b3a"
          />
        ) : (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            {Array.from({ length: 10 }, (_, k) => (
              <circle
                key={k}
                cx={Math.cos((k / 10) * Math.PI * 2) * 7}
                cy={Math.sin((k / 10) * Math.PI * 2) * 7}
                r="5.2"
                fill={i % 2 ? "#f2c230" : "#e8a33d"}
              />
            ))}
            <circle r="5" fill={i % 2 ? "#e8a33d" : "#c97a1e"} />
          </g>
        ),
      )}
    </svg>
  );
}
