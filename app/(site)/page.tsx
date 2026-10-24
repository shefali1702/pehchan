import Link from "next/link";
import PortraitScroll from "@/components/site/PortraitScroll";
import Garland from "@/components/site/Garland";
import DeviceTrio from "@/components/site/DeviceTrio";

export default function Home() {
  return (
    <>
      <PortraitScroll />

      <Garland />

      <DeviceTrio />

      <section className="sec family-index">
        <p className="kicker">One app, three people</p>
        <h2 className="sec-title">Built for the whole family, not only the patient.</h2>
        <ol className="fi-list">
          <li>
            <span className="fi-deva">दादी</span>
            <div>
              <h3>The parent who feels like a stranger in her own house.</h3>
              <p>
                Her screen on a tablet or TV: one photo at a time, a large caption with each person&apos;s name and
                relationship, their own recorded voice, and music from her youth.
              </p>
            </div>
            <Link href="/screen" className="fi-go">Her screen</Link>
          </li>
          <li>
            <span className="fi-deva">बेटी</span>
            <div>
              <h3>The daughter at home, caring for her every day.</h3>
              <p>
                A caregiver page with one-tap mood logs and a single button for the moment it works:
                <em> she smiled.</em>
              </p>
            </div>
            <Link href="/care" className="fi-go">Caregiver</Link>
          </li>
          <li>
            <span className="fi-deva">पोता</span>
            <div>
              <h3>The grandson in another city.</h3>
              <p>
                A family app on his phone to add photos, record a short voice letter, and hear back when his photo
                made her smile.
              </p>
            </div>
            <Link href="/family" className="fi-go">Family app</Link>
          </li>
        </ol>
      </section>

      <section className="sec ledger">
        <p className="kicker">Why it matters</p>
        <div className="ledger-rows">
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
              a week of care given by family members in a Tamil Nadu study, most of them women.
              <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11684304/" target="_blank" rel="noreferrer">Scoping review of carers in India</a>
            </p>
          </div>
        </div>
      </section>

      <section className="sec refused">
        <p className="kicker">What we chose not to build</p>
        <div className="refused-grid">
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
      </section>

      <section className="sec loop">
        <div className="loop-copy">
          <p className="kicker">The loop</p>
          <h2 className="sec-title">When she smiles, the person in the photo hears about it.</h2>
          <p>
            Her daughter taps one button. Within seconds, the grandson in another city gets a message with his
            photo attached. A person who is forgetting, and a family that is far away, stay connected.
          </p>
        </div>
        <div className="loop-phone" aria-label="Example of the notification a family member receives">
          <div className="loop-notch" />
          <div className="loop-card">
            <span className="loop-app">Pehchan</span>
            <p className="loop-msg">Dadi smiled at your photo today.</p>
            <span className="loop-time">now</span>
          </div>
          <p className="loop-caption">What Riya sees on her phone</p>
        </div>
      </section>

      <section className="cta-block">
        <p className="cta-deva">घर</p>
        <div>
          <h2>Kamla, you are at home.</h2>
          <p>Open her screen, the family app and the caregiver page side by side and watch the loop close.</p>
          <Link href="/demo" className="btn btn-kohl">Open the demo</Link>
        </div>
      </section>
    </>
  );
}
