import os from "node:os";
import Link from "next/link";
import ResetDemo from "@/components/site/ResetDemo";

export const metadata = { title: "Demo · Pehchan" };
export const dynamic = "force-dynamic";

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) if (a.family === "IPv4" && !a.internal) return a.address;
  }
  return null;
}

export default function Demo() {
  const ip = lanAddress();
  const base = ip ? `http://${ip}:3000` : null;
  return (
    <>
      <header className="page-head">
        <h1>Open all three. Watch the loop close.</h1>
        <span className="page-deva" aria-hidden="true">देखो</span>
        <p className="lede">
          The demo family is the Sharmas. Kamla is the grandmother. Riya, her granddaughter, and Arjun, her grandson,
          live in other cities. Her daughter Meera looks after her at home.
        </p>
      </header>

      <div className="doors">
        <Link href="/screen" className="door door-elder" target="_blank">
          <span className="door-glow" aria-hidden="true" />
          <span className="door-device">Tablet or TV, landscape</span>
          <div>
            <h2>Kamla&apos;s screen</h2>
            <p>Today&apos;s reel, the gentle recognition game, and the Call card at the end.</p>
            <p className="door-open">Open her screen</p>
          </div>
        </Link>
        <Link href="/family" className="door door-family" target="_blank">
          <span className="door-device">Phone</span>
          <div>
            <h2>Family app</h2>
            <p>Add a photo, tag faces on the phone, record a voice letter, and get the smile.</p>
            <p className="door-open">Open the family app</p>
          </div>
        </Link>
        <Link href="/care" className="door door-care" target="_blank">
          <span className="door-device">Phone or tablet</span>
          <div>
            <h2>Caregiver</h2>
            <p>Mood before and after, and the &ldquo;She smiled&rdquo; button.</p>
            <p className="door-open">Open the caregiver page</p>
          </div>
        </Link>
      </div>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">क्रम</span>
          <h2>Running it on stage</h2>
        </div>
        <div className="chapter-body">
          <ol className="steps">
            <li>
              Put the laptop and every phone on the same Wi-Fi. On phones, open
              {base ? <> <code>{base}/family</code> and <code>{base}/care</code></> : <> this laptop&apos;s address on port 3000</>}.
            </li>
            <li>Before the pitch, in the family app, each relative gives consent, then records a voice letter and a short hello for the game.</li>
            <li>Add real family photos and tag the faces. They take the place of the drawn placeholders in the reel.</li>
            <li>Open Kamla&apos;s screen on the projector and tap Begin. The music and voices start with that tap.</li>
            <li>When she smiles, tap &ldquo;She smiled&rdquo; on the caregiver page. Riya&apos;s phone shows the message within a second or two.</li>
            <li>
              Microphones only work on a secure page. Record voice letters on the laptop itself at
              <code> http://localhost:3000/family</code>, or on a phone over HTTPS.
            </li>
          </ol>
          <ResetDemo />
        </div>
      </section>
    </>
  );
}
