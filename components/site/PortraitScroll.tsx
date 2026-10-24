"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// A portrait of two grandparents that starts as drifting grey dust and, as the
// visitor scrolls, gathers into shape and then develops colour like a print in
// a darkroom tray. The drawing is made with canvas shapes, then sampled into
// particles.

const SIZE = 1000;

function drawPortrait(c: CanvasRenderingContext2D) {
  const ellipse = (x: number, y: number, rx: number, ry: number, fill: string, start = 0, end = Math.PI * 2) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, start, end);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };
  const stroke = (w: number, col: string, fn: () => void) => {
    c.beginPath();
    fn();
    c.lineWidth = w;
    c.lineCap = "round";
    c.strokeStyle = col;
    c.stroke();
  };

  // Toran of marigolds above them
  for (let i = 0; i < 19; i++) {
    const t = i / 18;
    const x = 70 + t * 860;
    const y = 96 + Math.sin(Math.PI * t) * 64;
    if (i % 3 === 1) {
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x - 16, y + 30, x, y + 58);
      c.quadraticCurveTo(x + 16, y + 30, x, y);
      c.fillStyle = "#3f7a3f";
      c.fill();
      continue;
    }
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ellipse(x + Math.cos(a) * 14, y + Math.sin(a) * 14, 10, 10, i % 2 ? "#f2c230" : "#e8a33d");
    }
    ellipse(x, y, 10, 10, i % 2 ? "#e8a33d" : "#c97a1e");
  }

  // Grandfather, behind and to the right
  ellipse(526, 400, 24, 30, "#a86b42");
  ellipse(754, 400, 24, 30, "#a86b42");
  ellipse(536, 352, 40, 44, "#ebe5d9");
  ellipse(744, 352, 40, 44, "#ebe5d9");
  ellipse(640, 385, 112, 138, "#b5784c");
  ellipse(640, 286, 92, 46, "#ebe5d9", Math.PI, Math.PI * 2);
  stroke(7, "#ebe5d9", () => {
    c.moveTo(574, 350);
    c.quadraticCurveTo(598, 338, 622, 348);
    c.moveTo(658, 348);
    c.quadraticCurveTo(682, 338, 706, 350);
  });
  stroke(6, "#2a1d15", () => {
    c.roundRect(566, 364, 66, 48, 10);
    c.roundRect(648, 364, 66, 48, 10);
    c.moveTo(632, 384);
    c.lineTo(648, 384);
  });
  stroke(5, "#2a1d15", () => {
    c.arc(599, 396, 13, Math.PI, Math.PI * 2);
    c.moveTo(694, 396);
    c.arc(681, 396, 13, Math.PI, Math.PI * 2);
  });
  stroke(5, "#8a5532", () => {
    c.moveTo(640, 414);
    c.quadraticCurveTo(628, 440, 646, 446);
  });
  ellipse(616, 466, 32, 14, "#ebe5d9");
  ellipse(664, 466, 32, 14, "#ebe5d9");
  stroke(5, "#4a2a18", () => c.arc(640, 470, 26, 0.2 * Math.PI, 0.8 * Math.PI));
  c.fillStyle = "#b5784c";
  c.fillRect(604, 505, 72, 70);
  c.beginPath();
  c.moveTo(470, 1000);
  c.bezierCurveTo(476, 700, 500, 592, 640, 576);
  c.bezierCurveTo(780, 592, 806, 700, 812, 1000);
  c.closePath();
  c.fillStyle = "#e9e1cf";
  c.fill();
  stroke(4, "#bdb39c", () => {
    c.moveTo(612, 578);
    c.lineTo(640, 650);
    c.lineTo(668, 578);
  });
  stroke(72, "#0f5c5a", () => {
    c.moveTo(752, 596);
    c.bezierCurveTo(730, 720, 712, 860, 700, 1010);
  });

  // Grandmother, in front and leaning towards him
  c.save();
  c.translate(388, 430);
  c.rotate(0.11);
  c.translate(-388, -430);
  ellipse(380, 380, 136, 160, "#a8a196");
  ellipse(258, 330, 60, 60, "#a8a196");
  ellipse(388, 396, 112, 135, "#c68b5e");
  ellipse(388, 322, 118, 72, "#a8a196", Math.PI, Math.PI * 2);
  stroke(6, "#c8361e", () => {
    c.moveTo(388, 266);
    c.lineTo(388, 302);
  });
  ellipse(388, 346, 10, 10, "#c8361e");
  ellipse(334, 444, 20, 16, "rgba(214,120,96,0.75)");
  ellipse(442, 444, 20, 16, "rgba(214,120,96,0.75)");
  stroke(5, "#3a2a20", () => {
    c.arc(345, 399, 34, 0, Math.PI * 2);
    c.moveTo(465, 399);
    c.arc(431, 399, 34, 0, Math.PI * 2);
    c.moveTo(379, 396);
    c.quadraticCurveTo(388, 388, 397, 396);
  });
  stroke(5, "#3a2a20", () => {
    c.arc(345, 406, 13, Math.PI, Math.PI * 2);
    c.moveTo(444, 406);
    c.arc(431, 406, 13, Math.PI, Math.PI * 2);
  });
  stroke(4, "#9a6340", () => {
    c.moveTo(388, 420);
    c.quadraticCurveTo(378, 444, 394, 448);
  });
  stroke(5, "#5a2c1c", () => c.arc(388, 462, 30, 0.18 * Math.PI, 0.82 * Math.PI));
  ellipse(278, 446, 10, 10, "#f2c230");
  ellipse(498, 446, 10, 10, "#f2c230");
  c.fillStyle = "#c68b5e";
  c.fillRect(354, 515, 68, 62);
  c.restore();

  c.beginPath();
  c.moveTo(176, 1000);
  c.bezierCurveTo(186, 720, 214, 604, 382, 586);
  c.bezierCurveTo(534, 596, 562, 704, 578, 1000);
  c.closePath();
  c.fillStyle = "#8e2a1e";
  c.fill();
  stroke(50, "#e8a33d", () => {
    c.moveTo(508, 600);
    c.bezierCurveTo(430, 720, 300, 860, 232, 1010);
  });
  stroke(6, "#f2c230", () => {
    c.moveTo(538, 614);
    c.bezierCurveTo(460, 736, 332, 874, 266, 1010);
  });
}

const BEATS = [
  { from: -0.12, to: 0.17, text: "Some days, the faces blur." },
  { from: 0.17, to: 0.38, text: "A name slips away. Then a room. Then the voice on the phone." },
  { from: 0.38, to: 0.6, text: "Yet a song from when she was twenty, and a voice she has loved for fifty years, can still reach her." },
  { from: 0.6, to: 0.82, text: "Pehchan puts her family's real faces and real voices in front of her, every day." },
];

export default function PortraitScroll() {
  const wrap = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const beats = useRef<(HTMLParagraphElement | null)[]>([]);
  const finale = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build particles from the drawing.
    const off = document.createElement("canvas");
    off.width = off.height = SIZE;
    const oc = off.getContext("2d", { willReadFrequently: true })!;
    drawPortrait(oc);
    const img = oc.getImageData(0, 0, SIZE, SIZE).data;
    const small = innerWidth < 700;
    const step = small ? 9 : 7;
    const pts: number[] = [];
    for (let y = 0; y < SIZE; y += step) {
      for (let x = 0; x < SIZE; x += step) {
        const i = (y * SIZE + x) * 4;
        if (img[i + 3] < 128) continue;
        pts.push(x, y, img[i], img[i + 1], img[i + 2]);
      }
    }
    const n = pts.length / 5;
    const tx = new Float32Array(n), ty = new Float32Array(n);
    const sx = new Float32Array(n), sy = new Float32Array(n);
    const col = new Array<[number, number, number]>(n);
    const delay = new Float32Array(n), phase = new Float32Array(n), freq = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      tx[k] = pts[k * 5];
      ty[k] = pts[k * 5 + 1];
      col[k] = [pts[k * 5 + 2], pts[k * 5 + 3], pts[k * 5 + 4]];
      // Scatter in a wide loose cloud, a little biased outward from the centre.
      const a = Math.random() * Math.PI * 2;
      const r = 260 + Math.random() * 900;
      sx[k] = 500 + Math.cos(a) * r * 1.2;
      sy[k] = 500 + Math.sin(a) * r * 0.75;
      // Faces gather first, garland and clothing after.
      const dFace = Math.hypot(tx[k] - 510, ty[k] - 400) / 700;
      delay[k] = Math.min(1, dFace * 0.7 + Math.random() * 0.45);
      phase[k] = Math.random() * Math.PI * 2;
      freq[k] = 0.5 + Math.random();
    }

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
    };
    resize();
    addEventListener("resize", resize);

    let target = reduce ? 1 : 0;
    let cur = target;
    const onScroll = () => {
      if (reduce) return;
      const el = wrap.current!;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - innerHeight;
      target = Math.min(1, Math.max(0, -rect.top / total));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap.current!);

    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let raf = 0;

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      cur += (target - cur) * 0.07;
      const p = cur;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const wide = W > 900;
      const scale = (wide ? Math.min(W * 0.6, H * 0.96) : Math.min(W * 0.92, H * 0.46)) / SIZE;
      const ox = wide ? W * 0.66 - 500 * scale : W / 2 - 500 * scale;
      const oy = wide ? H / 2 - 470 * scale : 96;

      // Warm light behind them once the picture has come back.
      const glow = clamp((p - 0.62) / 0.3);
      if (glow > 0) {
        const gx = ox + 510 * scale, gy = oy + 420 * scale;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 560 * scale);
        g.addColorStop(0, `rgba(232,163,61,${0.26 * glow})`);
        g.addColorStop(1, "rgba(232,163,61,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      const sz = step * scale;
      for (let k = 0; k < n; k++) {
        const e = ease(clamp((p * 1.25 - delay[k] * 0.5) / 0.55));
        const drift = (1 - e) * 46;
        const t = time * 0.00035 * freq[k] + phase[k];
        const x = sx[k] + (tx[k] - sx[k]) * e + Math.sin(t) * drift;
        const y = sy[k] + (ty[k] - sy[k]) * e + Math.cos(t * 1.3) * drift;
        // Colour develops after the shape returns.
        const dev = clamp((p - 0.3 - delay[k] * 0.25) / 0.38);
        const [r, g, b] = col[k];
        const grey = 0.3 * r + 0.59 * g + 0.11 * b;
        const gr = 96 + grey * 0.3;
        const rr = gr + (r - gr) * dev, gg = gr + (g - gr) * dev, bb = gr + (b - gr) * dev;
        const a = 0.42 + 0.58 * e;
        ctx.fillStyle = `rgba(${rr | 0},${gg | 0},${bb | 0},${a})`;
        const s = sz * (0.42 + 0.42 * e);
        ctx.fillRect(ox + x * scale - s / 2, oy + y * scale - s / 2, s, s);
      }

      // Text beats
      BEATS.forEach((b, i) => {
        const el = beats.current[i];
        if (!el) return;
        const mid = (b.from + b.to) / 2, half = (b.to - b.from) / 2;
        const d = Math.abs(p - mid) / half;
        const o = clamp(1.6 - d * 1.6);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(p - mid) * -120}px)`;
      });
      const f = clamp((p - 0.84) / 0.1);
      if (finale.current) {
        finale.current.style.opacity = String(f);
        finale.current.style.pointerEvents = f > 0.5 ? "auto" : "none";
      }
      if (meter.current) meter.current.textContent = `${Math.round(p * 100)}%`;
      if (hint.current) hint.current.style.opacity = String(clamp(1 - p * 12));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <section className="ps" ref={wrap} aria-label="Introduction">
      <div className="ps-stick">
        <canvas ref={canvas} className="ps-canvas" aria-hidden="true" />
        <div className="ps-text">
          {BEATS.map((b, i) => (
            <p key={i} className="ps-beat" ref={(el) => { beats.current[i] = el; }}>
              {b.text}
            </p>
          ))}
          <div className="ps-finale" ref={finale}>
            <h1 className="ps-title">
              <span className="ps-title-deva">पहचान</span>
              <span className="ps-title-latin">Pehchan</span>
            </h1>
            <p className="ps-tag">She may forget the day. She will still feel who loves her.</p>
            <div className="ps-cta">
              <Link href="/demo" className="btn btn-marigold">Open the demo</Link>
              <Link href="/how-it-works" className="btn btn-line">See how it works</Link>
            </div>
          </div>
        </div>
        <div className="ps-hint" ref={hint}>
          <span>Scroll slowly</span>
          <span className="ps-hint-line" />
        </div>
        <div className="ps-meter" aria-hidden="true">
          Developing <span ref={meter}>0%</span>
        </div>
      </div>
    </section>
  );
}
