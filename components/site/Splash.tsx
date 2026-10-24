"use client";

import { useEffect, useState } from "react";

// The opening: a single marigold line is drawn, the name hangs from it the way
// Devanagari letters hang from their headline, then the line opens like an eye.
export default function Splash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.splash === "off") {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem("pehchan-splash", "1");
    } catch {}
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => finish(), reduce ? 900 : 4300);
    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  function finish() {
    document.documentElement.dataset.splash = "off";
    setGone(true);
  }

  if (gone) return null;
  return (
    <div className="splash" aria-hidden="true" onClick={finish}>
      <div className="splash-lid splash-lid-top" />
      <div className="splash-lid splash-lid-bottom" />
      <div className="splash-seam" />
      <div className="splash-word">
        <span className="splash-deva">
          {["प", "ह", "चा", "न"].map((c, i) => (
            <span key={i} style={{ animationDelay: `${0.95 + i * 0.09}s` }}>
              {c}
            </span>
          ))}
        </span>
        <span className="splash-latin">Pehchan</span>
        <span className="splash-gloss">recognition, and who a person is</span>
      </div>
    </div>
  );
}
