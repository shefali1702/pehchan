"use client";

import { useEffect, useRef, useState } from "react";

// A rangoli drawn line by line, the way it is drawn at a doorstep each
// morning: petals first, then colour poured into them. It draws once, when it
// comes into view, then rests.

type Ring = { r0: number; r1: number; n: number; stroke: string; fill: string; shape: "petal" | "leaf" | "drop" };

const RINGS: Ring[] = [
  { r0: 150, r1: 238, n: 16, stroke: "#1b1511", fill: "#d62718", shape: "petal" },
  { r0: 104, r1: 172, n: 12, stroke: "#1b1511", fill: "#ffd43b", shape: "leaf" },
  { r0: 62, r1: 118, n: 8, stroke: "#1b1511", fill: "#005f66", shape: "petal" },
  { r0: 28, r1: 70, n: 8, stroke: "#1b1511", fill: "#e4007c", shape: "drop" },
];

function petal(cx: number, cy: number, ring: Ring, i: number) {
  const a = (i / ring.n) * Math.PI * 2 - Math.PI / 2;
  const half = (Math.PI / ring.n) * (ring.shape === "drop" ? 0.55 : 0.9);
  const p = (r: number, t: number) => `${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`;
  const tip = p(ring.r1, a);
  const l = p(ring.r0, a - half);
  const r = p(ring.r0, a + half);
  const bulge = ring.shape === "leaf" ? 1.02 : ring.shape === "drop" ? 0.9 : 1.12;
  const cl = p((ring.r0 + ring.r1) / 2 * bulge, a - half * 1.15);
  const cr = p((ring.r0 + ring.r1) / 2 * bulge, a + half * 1.15);
  return `M ${l} Q ${cl} ${tip} Q ${cr} ${r} Z`;
}

export default function Rangoli({ size = 520, className = "" }: { size?: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.25 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  const c = 260;
  let k = 0;
  return (
    <svg
      ref={ref}
      className={`rangoli${on ? " is-on" : ""} ${className}`}
      viewBox="0 0 520 520"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {/* outer dots, like the dot grid a kolam is drawn around */}
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2;
        return <circle key={`d${i}`} className="rg-dot" cx={+(c + Math.cos(a) * 250).toFixed(1)} cy={+(c + Math.sin(a) * 250).toFixed(1)} r={i % 2 ? 4 : 6.5} fill={i % 2 ? "#1b1511" : "#fff6e3"} style={{ animationDelay: `${(i * 0.03).toFixed(2)}s` }} />;
      })}
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, i) => (
          <path
            key={`${ri}-${i}`}
            d={petal(c, c, ring, i)}
            pathLength={1}
            className="rg-line"
            stroke={ring.stroke}
            strokeWidth={3}
            fill={ring.fill}
            style={{ animationDelay: `${(0.4 + ri * 0.5 + (k++ % ring.n) * 0.04).toFixed(2)}s, ${(1.2 + ri * 0.5).toFixed(2)}s` }}
          />
        )),
      )}
      <circle className="rg-line" pathLength={1} cx={c} cy={c} r={26} fill="#f5a000" stroke="#1b1511" strokeWidth={3} style={{ animationDelay: "2.4s, 2.8s" }} />
      <circle className="rg-dot" cx={c} cy={c} r={9} fill="#d62718" style={{ animationDelay: "3s" }} />
    </svg>
  );
}
