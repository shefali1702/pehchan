"use client";

import { useEffect, useRef, useState } from "react";

// The real app, running live inside drawn devices. Frames load only when the
// section comes into view.
function Screen({ src, w, h, title }: { src: string; w: number; h: number; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / w));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "300px" });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [w]);
  return (
    <div className="dv-screen" ref={box} style={{ aspectRatio: `${w} / ${h}` }}>
      {load && scale > 0 && (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          aria-hidden="true"
          style={{ width: w, height: h, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

export default function DeviceTrio() {
  return (
    <section className="dv" aria-label="The three screens of Pehchan, running live">
      <div className="dv-head">
        <p className="kicker">Running live below</p>
        <h2 className="sec-title">Three screens, one family.</h2>
      </div>
      <div className="dv-stage">
        <figure className="dv-phone dv-left">
          <div className="dv-bezel">
            <Screen src="/family?preview=1&as=riya&tab=record" w={390} h={844} title="Family app" />
          </div>
          <figcaption><b>Riya, in another city</b>records a voice letter</figcaption>
        </figure>
        <figure className="dv-tablet">
          <div className="dv-bezel">
            <Screen src="/screen?preview=1&theme=evening" w={1280} h={800} title="Kamla's screen" />
          </div>
          <figcaption><b>Kamla, at home</b>watches her evening reel</figcaption>
        </figure>
        <figure className="dv-phone dv-right">
          <div className="dv-bezel">
            <Screen src="/care" w={390} h={844} title="Caregiver page" />
          </div>
          <figcaption><b>Meera, beside her</b>taps &ldquo;She smiled&rdquo;</figcaption>
        </figure>
      </div>
    </section>
  );
}
