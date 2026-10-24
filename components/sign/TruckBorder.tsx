// Painted borders in the style of Indian truck art and shop signs.
// Each is one repeating tile, so it runs edge to edge at any width.

type Variant = "zigzag" | "scallop" | "beads" | "chevron" | "lotus";

const C = {
  marigold: "#f5a000",
  haldi: "#ffd43b",
  sindoor: "#d62718",
  peacock: "#005f66",
  neel: "#1d4e9e",
  rani: "#e4007c",
  leaf: "#2d7d32",
  ink: "#1b1511",
  paper: "#fff6e3",
};
export type SignColour = keyof typeof C;

function Tile({ v, a, b, c }: { v: Variant; a: string; b: string; c: string }) {
  switch (v) {
    case "zigzag":
      return (
        <>
          <rect width="40" height="28" fill={a} />
          <path d="M0 28 L10 8 L20 28 L30 8 L40 28 Z" fill={b} />
          <path d="M0 28 L10 16 L20 28 L30 16 L40 28 Z" fill={c} />
        </>
      );
    case "scallop":
      return (
        <>
          <rect width="40" height="28" fill={a} />
          <circle cx="20" cy="0" r="18" fill={b} />
          <circle cx="20" cy="0" r="11" fill={c} />
          <circle cx="20" cy="22" r="3" fill={b} />
        </>
      );
    case "beads":
      return (
        <>
          <rect width="40" height="28" fill={a} />
          <rect x="0" y="12" width="40" height="4" fill={c} />
          <circle cx="10" cy="14" r="7" fill={b} />
          <circle cx="10" cy="14" r="3" fill={c} />
          <path d="M30 6 L37 14 L30 22 L23 14 Z" fill={c} />
        </>
      );
    case "chevron":
      return (
        <>
          <rect width="40" height="28" fill={a} />
          <path d="M0 4 L20 14 L40 4 L40 12 L20 22 L0 12 Z" fill={b} />
          <path d="M0 16 L20 26 L40 16 L40 20 L20 28 L0 20 Z" fill={c} />
        </>
      );
    case "lotus":
      return (
        <>
          <rect width="40" height="28" fill={a} />
          <path d="M20 4 C26 12 26 18 20 24 C14 18 14 12 20 4 Z" fill={b} />
          <path d="M20 24 C12 22 6 16 4 10 C12 12 17 16 20 24 Z" fill={c} />
          <path d="M20 24 C28 22 34 16 36 10 C28 12 23 16 20 24 Z" fill={c} />
        </>
      );
  }
}

export default function TruckBorder({
  variant = "zigzag",
  colours = ["ink", "marigold", "sindoor"],
  height = 28,
  flip = false,
  className = "",
}: {
  variant?: Variant;
  colours?: [SignColour, SignColour, SignColour];
  height?: number;
  flip?: boolean;
  className?: string;
}) {
  const id = `tb-${variant}-${colours.join("-")}${flip ? "-f" : ""}`;
  const [a, b, c] = colours.map((k) => C[k]);
  return (
    <svg
      className={`truck ${className}`}
      width="100%"
      height={height}
      aria-hidden="true"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <defs>
        <pattern id={id} width={(40 * height) / 28} height={height} patternUnits="userSpaceOnUse">
          <g transform={`scale(${height / 28})`}>
            <Tile v={variant} a={a} b={b} c={c} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}
