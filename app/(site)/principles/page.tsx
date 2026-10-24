export const metadata = { title: "Principles · Pehchan" };

const NUM = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२"];

const RULES = [
  ["Real voices only.", "We never clone, synthesise or imitate a family member's voice. A neutral narrator may speak, and it is clearly not family."],
  ["No failure on her screen.", "No wrong answers, scores, timers, streaks, pop-ups or red error states. If she does nothing, the reel simply carries on."],
  ["Never a memory test.", "No “Do you remember?” and no “Try again”. We say “This is” and “Here is”."],
  ["Every face is named.", "Each caption shows the name and the relationship: Riya, your granddaughter."],
  ["The dead are memories.", "Someone who has died is shown in the past tense, and never as calling, visiting or coming soon."],
  ["The family's avoid list wins.", "Topics and people the family flags never appear. Anything linked to an upset mood twice is held back."],
  ["Stop is always there.", "One tap ends the session at once with a calm fade, and no confirmation dialog."],
  ["Consent before content.", "A relative's face or voice appears only after they agree. Withdrawing removes their content."],
  ["Faces stay on the phone.", "Face detection runs in the browser. Only confirmed tags are stored, never face prints, and photos never train a model."],
  ["No clinical claims.", "Pehchan offers comfort and connection. It does not slow, treat or diagnose dementia."],
  ["The AI never invents a memory.", "Captions may only rephrase what the family wrote, without adding places, dates, events or feelings."],
  ["Every session ends with a real person.", "The last screen is a large button to call someone who loves her."],
];

export default function Principles() {
  return (
    <>
      <header className="page-head ph-rani">
        <h1>Twelve things we will not bend on.</h1>
        <span className="page-deva" aria-hidden="true">वचन</span>
        <p className="lede">
          These come from the research on dementia care. When a feature would break one of them, we
          do not build the feature.
        </p>
      </header>
      <div className="reading">
      <section className="sec" style={{ paddingTop: 70 }}>
        <ol className="rules">
          {RULES.map(([h, p], i) => (
            <li key={h}>
              <span className="rn" aria-hidden="true">{NUM[i]}</span>
              <div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="block block-ink"><div className="sec">
        <p className="kicker">What we chose not to build</p>
        <div className="refused">
          <div>
            <p className="refused-word"><s>A cloned voice.</s></p>
            <p>
              Voice clones make a parent believe their child is on the line when they are not. They also create a
              copy of a relative&apos;s voice that scammers could misuse. With real recordings, there is nothing to steal.
            </p>
          </div>
          <div>
            <p className="refused-word"><s>A memory quiz.</s></p>
            <p>
              Studies of face and name learning in dementia found errorless methods beat trial and error. A quiz that
              marks her wrong teaches failure. Our game always ends with the answer and a kind word.
            </p>
          </div>
        </div>
      </div></section>
      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">स</span>
          <h2>Her own say</h2>
        </div>
        <div className="chapter-body">
          <p>
            While she still can, she records a living consent in her own words: what she wants kept, who may see it,
            and what to avoid. Under India&apos;s DPDP Rules 2025, a court or authority appointed guardian must give
            verifiable consent where one exists, so Pehchan stores those documents too. Many families have no formal
            guardian, which is why her own voice comes first.
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
