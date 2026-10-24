"use client";

import { useState } from "react";

const STEPS = [
  { what: "The photo, glowing", say: "Who is this?", note: "Said warmly, once, by a neutral narrator. About five seconds." },
  { what: "The relationship", say: "Your granddaughter.", note: "About five seconds." },
  { what: "The first sound", say: "Ri...", note: "The first syllable of the name. About five seconds." },
  { what: "Her own voice", say: "“It’s me, Riya!”", note: "Riya's real recording, never a synthetic voice." },
  { what: "The answer, always", say: "Yes, this is Riya.", note: "Any tap, any word, or silence ends here. Every path ends with the name and a kind word." },
];

export default function HintLadder() {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="ladder" role="group" aria-label="Hint steps">
        {STEPS.map((s, k) => (
          <button key={k} aria-pressed={i === k} onClick={() => setI(k)}>
            <span className="ladder-step">Step {k}</span>
            <span className="ladder-what">{s.what}</span>
          </button>
        ))}
      </div>
      <div className="ladder-stage" aria-live="polite">
        <div className="ladder-face" aria-hidden="true" />
        <div>
          <p className="ladder-say">{STEPS[i].say}</p>
          <p className="ladder-note">{STEPS[i].note}</p>
        </div>
      </div>
    </div>
  );
}
