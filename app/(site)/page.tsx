import Link from "next/link";
import PortraitScroll from "@/components/site/PortraitScroll";
import DeviceTrio from "@/components/site/DeviceTrio";
import SignWord from "@/components/sign/SignWord";
import Rangoli from "@/components/sign/Rangoli";
import TruckBorder from "@/components/sign/TruckBorder";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <p className="hero-note">पहचान means recognition. It also means who a person is.</p>
          <SignWord className="hero-sign" />
          <h1 className="hero-title">She may forget the day. She will still feel who loves her.</h1>
          <p className="hero-sub">
            Pehchan turns a family&apos;s own photos and real recorded voices into a gentle daily reel for someone
            living with dementia.
          </p>
          <div className="hero-cta">
            <Link href="/demo" className="btn btn-ink">Open the demo</Link>
            <Link href="/how-it-works" className="btn btn-paper">See how it works</Link>
          </div>
        </div>
        <Rangoli className="hero-rangoli" />
      </section>

      <TruckBorder variant="zigzag" colours={["marigold", "peacock", "haldi"]} height={30} />

      <PortraitScroll />

      <TruckBorder variant="beads" colours={["haldi", "sindoor", "ink"]} height={30} />

      <div className="block block-haldi">
        <DeviceTrio />
      </div>

      <TruckBorder variant="chevron" colours={["sindoor", "haldi", "ink"]} height={30} />

      <section className="block block-sindoor">
        <div className="sec">
          <p className="kicker">Why it matters</p>
          <div className="ledger">
            <div className="ledger-row">
              <span className="ledger-n">8.8 million</span>
              <p>
                Indians aged 60 and over live with dementia, a prevalence of 7.4%.
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10338640/" target="_blank" rel="noreferrer">LASI-DAD, 2018 to 2020</a>
              </p>
            </div>
            <div className="ledger-row">
              <span className="ledger-n">16.9 million</span>
              <p>
                expected in India by 2036, with no coordinated system of formal long-term care.
                <a href="https://www.newslaundry.com/2025/07/28/indias-dementia-emergency-9-million-cases-set-to-double-by-2036-but-systems-unprepared" target="_blank" rel="noreferrer">Newslaundry, 2025</a>
              </p>
            </div>
            <div className="ledger-row">
              <span className="ledger-n">38.6 hours</span>
              <p>
                a week of care given by family in a Tamil Nadu study, most of them women.
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11684304/" target="_blank" rel="noreferrer">Scoping review of carers in India</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <TruckBorder variant="scallop" colours={["neel", "sindoor", "haldi"]} height={30} flip />

      <section className="block block-neel">
        <div className="sec">
          <p className="kicker">One app, three people</p>
          <h2 className="sec-title">Built for the whole family, not only the patient.</h2>
          <div className="plaques">
            <article className="plaque plaque-marigold">
              <span className="plaque-deva">दादी</span>
              <h3>The parent who feels like a stranger in her own house.</h3>
              <p>One photo at a time on a tablet or TV, with each person&apos;s name, their own recorded voice, and music from her youth.</p>
              <Link href="/screen">Her screen</Link>
            </article>
            <article className="plaque plaque-paper">
              <span className="plaque-deva">बेटी</span>
              <h3>The daughter at home, caring for her every day.</h3>
              <p>One-tap mood logs, a choice of how the reel works, and a single button for the moment it works: she smiled.</p>
              <Link href="/care">Caregiver page</Link>
            </article>
            <article className="plaque plaque-rani">
              <span className="plaque-deva">पोता</span>
              <h3>The grandson in another city.</h3>
              <p>Add photos, record a short voice letter, and hear back when his photo made her smile.</p>
              <Link href="/family">Family app</Link>
            </article>
          </div>
        </div>
      </section>

      <TruckBorder variant="lotus" colours={["ink", "marigold", "neel"]} height={34} />

      <section className="block block-ink">
        <div className="sec">
          <p className="kicker">What we chose not to build</p>
          <div className="refused">
            <div>
              <p className="refused-word"><s>A cloned voice.</s></p>
              <p>
                Other apps synthesise a son&apos;s voice saying words he never said. Every voice in Pehchan is a real
                recording, and every speaker says who they are.
              </p>
            </div>
            <div>
              <p className="refused-word"><s>A memory quiz.</s></p>
              <p>
                Testing recall means watching someone fail. Our recognition game has no wrong answer: hints arrive one
                at a time until the name is simply given.
              </p>
            </div>
          </div>
          <Link href="/principles" className="link-arrow">Read all twelve principles</Link>
        </div>
      </section>

      <TruckBorder variant="zigzag" colours={["ink", "rani", "paper"]} height={30} />

      <section className="block block-rani">
        <div className="sec loop">
          <div>
            <p className="kicker">The loop</p>
            <h2 className="sec-title">When she smiles, the person in the photo hears about it.</h2>
            <p className="loop-p">
              Her daughter taps one button. Within seconds, the grandson in another city gets a message with his photo
              attached.
            </p>
          </div>
          <div className="loop-phone" aria-label="Example of the notification a family member receives">
            <div className="loop-notch" />
            <div className="loop-card">
              <span className="loop-app">Pehchan</span>
              <span className="loop-time">now</span>
              <p className="loop-msg">Dadi smiled at your photo today.</p>
            </div>
            <p className="loop-caption">What Riya sees on her phone</p>
          </div>
        </div>
      </section>

      <TruckBorder variant="beads" colours={["marigold", "rani", "ink"]} height={30} flip />

      <section className="block block-marigold cta">
        <span className="cta-deva" aria-hidden="true">घर</span>
        <div>
          <h2>Kamla, you are at home.</h2>
          <p>Open her screen, the family app and the caregiver page side by side and watch the loop close.</p>
          <Link href="/demo" className="btn btn-ink">Open the demo</Link>
        </div>
      </section>
    </>
  );
}
