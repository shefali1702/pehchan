"use client";

import { useEffect, useState } from "react";
import SignWord from "@/components/sign/SignWord";
import TruckBorder from "@/components/sign/TruckBorder";

// Opening: the four painted panels swing down on their hinges, then the whole
// board rolls up like a shop shutter in the morning.
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
    const t = setTimeout(() => finish(), reduce ? 900 : 3600);
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
      <div className="splash-board">
        <TruckBorder variant="zigzag" colours={["marigold", "ink", "sindoor"]} height={30} />
        <div className="splash-mid">
          <SignWord animate className="splash-sign" />
          <p className="splash-latin">Pehchan</p>
          <p className="splash-gloss">recognition, and who a person is</p>
        </div>
        <TruckBorder variant="zigzag" colours={["marigold", "ink", "sindoor"]} height={30} flip />
      </div>
    </div>
  );
}
