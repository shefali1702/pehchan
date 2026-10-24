import Link from "next/link";
import HintLadder from "@/components/site/HintLadder";

export const metadata = { title: "How it works · Pehchan" };

export default function How() {
  return (
    <>
      <header className="page-head ph-peacock">
        <h1>Three screens. One family.</h1>
        <span className="page-deva" aria-hidden="true">घर</span>
        <p className="lede">
          Relatives add photos and voices from anywhere. She watches a short reel at home. When it works, the people
          in it find out.
        </p>
      </header>
      <div className="reading">

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">१</span>
          <h2>The family adds a memory</h2>
        </div>
        <div className="chapter-body">
          <p>
            On their phone, a relative uploads a photo, taps the faces to say who is in it, and adds one sentence: what
            it is, the year, the place. Face detection runs on their own phone. Only the confirmed name and position
            are saved, never a face print.
          </p>
          <p>
            Then they record a voice letter of 20 to 30 seconds in their own voice, starting with who they are:
            &ldquo;Hi Dadi, it&apos;s Riya, your granddaughter.&rdquo; No cloning, no synthesis. The recording you
            hear is the recording they made.
          </p>
          <p>
            A caption writer turns their sentence into a gentle line that starts with &ldquo;This is&rdquo;. It may
            only rephrase what the family wrote. It never adds a place, a date or a feeling.
          </p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">२</span>
          <h2>She watches today&apos;s reel</h2>
        </div>
        <div className="chapter-body">
          <p>
            Five to eight photos, each held for about nine seconds with a slow pan. A soft marigold light rests on the
            face. Below it, a large caption: the name and relationship, then one line of story. The relative&apos;s
            voice plays while the music dips underneath.
          </p>
          <p>
            The corner always says where she is: &ldquo;Kamla, you are at home. Thursday evening.&rdquo; A Stop button
            is always on screen and ends the session at once, with no question asked. The reel ends with one large
            button: <em>Call Riya</em>. The app points back to real people, not away from them.
          </p>
          <p>
            Photos come first from the years she was 10 to 30, then faces that need more help lately, then whatever the
            family added most recently, so every contributor sees their photo used.
          </p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">३</span>
          <h2>A game with no wrong answer</h2>
        </div>
        <div className="chapter-body">
          <p>
            Sometimes a face appears and the narrator asks, once, &ldquo;Who is this?&rdquo; Nothing waits for her to get
            it right. Help arrives one step at a time. Tap the steps to see them.
          </p>
          <HintLadder />
          <p style={{ marginTop: 28 }}>
            The only thing recorded is how many hints a face needed. If that number creeps up over a week, the family
            sees a gentle note: &ldquo;Riya might be worth an extra visit this week.&rdquo; People who have died are never
            part of the game.
          </p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">४</span>
          <h2>The loop closes</h2>
        </div>
        <div className="chapter-body">
          <div className="flow">
            <div className="flow-node"><b>Her daughter</b><span>taps &ldquo;She smiled&rdquo; on the caregiver page</span></div>
            <span className="flow-arrow" aria-hidden="true">&rarr;</span>
            <div className="flow-node"><b>Pehchan</b><span>finds whose photos and voices were in the reel</span></div>
            <span className="flow-arrow" aria-hidden="true">&rarr;</span>
            <div className="flow-node"><b>Riya&apos;s phone</b><span>&ldquo;Dadi smiled at your photo today.&rdquo;</span></div>
          </div>
          <p>
            Nothing appears on her screen when this happens. No alerts, no scores, no streaks: her screen only ever
            shows faces, names and kind words.
          </p>
          <Link href="/demo" className="link-arrow">Try it in the demo</Link>
        </div>
      </section>
      </div>
    </>
  );
}
