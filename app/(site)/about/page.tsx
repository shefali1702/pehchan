export const metadata = { title: "About · Pehchan" };

const EVIDENCE = [
  {
    title: "Reminiscence therapy",
    found:
      "A 2018 Cochrane review of 22 studies with 1,972 people found small positive effects on quality of life, communication and mood, and no harmful effects. Research on digital life-story apps is described as in its infancy.",
    so: "Short, one-to-one daily sessions. We describe Pehchan as comfort and connection, never as treatment, and build in mood logs because the evidence gap is real.",
    href: "https://www.cochrane.org/news/featured-review-reminiscence-therapy-dementia",
  },
  {
    title: "Errorless learning and spaced retrieval",
    found:
      "For learning face and name pairs in dementia, both beat trial and error. Spaced retrieval did best, and cues that add help step by step worked well.",
    so: "The recognition game never shows a wrong answer. Hints arrive one at a time until the name is given. Faces come back after growing gaps.",
    href: "https://pubmed.ncbi.nlm.nih.gov/21229436/",
  },
  {
    title: "Music from her youth",
    found:
      "Songs from when a person was 10 to 30 years old brought back more memories in Alzheimer's disease than later songs.",
    so: "Each reel plays a song from her ages 10 to 30, in her language, chosen by the family.",
    href: "https://content.iospress.com/articles/journal-of-alzheimers-disease/jad180627",
  },
  {
    title: "Voices carry warmth",
    found:
      "Recognising who a voice belongs to is impaired in Alzheimer's disease. Recognising the emotion in a voice held up better in a small study.",
    so: "Voices are there for warmth, not as a test. Every speaker says their own name and relationship: \"It's Riya, your granddaughter.\"",
    href: "https://researchportal.bath.ac.uk/en/publications/voice-processing-in-dementia-a-neuropsychological-and-neuroanatom/",
  },
  {
    title: "Truth in dementia care",
    found:
      "The Mental Health Foundation's inquiry advises starting as close to the whole truth as possible, moving away only to avoid needless distress.",
    so: "Real recordings only. A relative who has died is shown as a memory, never as someone calling or coming to visit.",
    href: "https://www.mentalhealth.org.uk/explore-mental-health/blogs/it-wrong-lie-person-dementia",
  },
];

const OTHERS = [
  ["Smriti (India)", "Clones a family member's voice and places daily calls.", "Voice only, and the voice says words the family never said."],
  ["Taiwan III system", "Turns photos and recordings into AI videos with lip-sync, in care homes.", "Needs a projection room. Generated scenes can show events that never happened."],
  ["A.I.ways Call (Korea)", "An AI that talks in a caregiver's voice and style.", "The person may believe their child is really calling."],
  ["Lisova (US)", "A voice companion; family can upload photos.", "English and US-centred, and not built for dementia."],
  ["CIRCA and BBC RemArc (UK)", "Touchscreen reminiscence using broadcast archives.", "National archive content, not the family's own life."],
  ["Memory quiz apps", "Memory books with AI quizzes that challenge recall.", "Recall quizzes work against the errorless-learning research."],
];

export default function About() {
  return (
    <>
      <header className="page-head">
        <h1>A name that means recognition.</h1>
        <span className="page-deva" aria-hidden="true">पहचान</span>
        <p className="lede">
          In Hindi, <em>pehchan</em> means both recognising someone and who a person is. It names what the app helps
          with, the faces of family, and what it protects: her identity.
        </p>
      </header>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">१</span>
          <h2>Why this, why now</h2>
        </div>
        <div className="chapter-body">
          <p>
            Around 57 million people worldwide were living with dementia in 2021, with nearly 10 million new cases a
            year and more than 60% of them in low and middle income countries. In India it is 8.8 million people aged
            60 and over, expected to reach about 16.9 million by 2036. In Japan, 4.43 million people aged 65 and
            over lived with dementia in 2022.
          </p>
          <p>
            India has no coordinated system of formal long-term care, so families carry it. A Tamil Nadu study found
            family carers giving 38.6 hours a week, most of them women. Meanwhile children and grandchildren often
            live in other cities, or other countries.
          </p>
          <p>
            Pehchan is for all of them: the tired daughter at home, the grandson far away, and the parent who
            sometimes feels like a stranger in her own house.
          </p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">२</span>
          <h2>What the research says, and what we did with it</h2>
        </div>
        <div className="chapter-body">
          <div className="evidence">
            {EVIDENCE.map((e) => (
              <div key={e.title}>
                <div>
                  <h4>{e.title}</h4>
                  <p>{e.found}</p>
                  <a href={e.href} target="_blank" rel="noreferrer">Source</a>
                </div>
                <p className="so">{e.so}</p>
              </div>
            ))}
          </div>
          <h3>The rule underneath all of it</h3>
          <p>Never ask &ldquo;Do you remember?&rdquo; Say &ldquo;This is.&rdquo; Remembering is optional. Feeling safe and loved is the point.</p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">३</span>
          <h2>Who else is working on this</h2>
        </div>
        <div className="chapter-body">
          <div className="table-wrap">
            <table className="versus">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>What it does</th>
                  <th>Where Pehchan differs</th>
                </tr>
              </thead>
              <tbody>
                {OTHERS.map(([a, b, c]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 30 }}>
            Nothing else combines the family&apos;s own photos, their real recorded voices, a recognition game with no
            wrong answers, music from her youth, and a loop that tells the family what is working.
          </p>
        </div>
      </section>

      <section className="chapter">
        <div className="chapter-side">
          <span className="chapter-num">४</span>
          <h2>Sources</h2>
        </div>
        <div className="chapter-body">
          <ul className="sources">
            <li><a href="https://www.who.int/mental_health/neurology/dementia/en/" target="_blank" rel="noreferrer">WHO, dementia fact sheet</a></li>
            <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10338640/" target="_blank" rel="noreferrer">LASI-DAD, prevalence of dementia in India</a></li>
            <li><a href="https://www.newslaundry.com/2025/07/28/indias-dementia-emergency-9-million-cases-set-to-double-by-2036-but-systems-unprepared" target="_blank" rel="noreferrer">Newslaundry, India projections to 2036</a></li>
            <li><a href="https://www.arabnews.jp/en/japan/article_121359" target="_blank" rel="noreferrer">Jiji Press, Japan 2022 estimate</a></li>
            <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11684304/" target="_blank" rel="noreferrer">Scoping review of dementia carers in India</a></li>
            <li><a href="https://mcmasteroptimalaging.org/full-article/dfd20de3cc03ad54f74a47a732517534" target="_blank" rel="noreferrer">Cochrane review of reminiscence therapy, 2018</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/21229436/" target="_blank" rel="noreferrer">Errorless learning and spaced retrieval</a></li>
            <li><a href="https://content.iospress.com/articles/journal-of-alzheimers-disease/jad180627" target="_blank" rel="noreferrer">Music and the reminiscence bump</a></li>
            <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6513122" target="_blank" rel="noreferrer">Cochrane review of music interventions</a></li>
            <li><a href="https://researchportal.bath.ac.uk/en/publications/voice-processing-in-dementia-a-neuropsychological-and-neuroanatom/" target="_blank" rel="noreferrer">Voice processing in dementia</a></li>
            <li><a href="https://www.mentalhealth.org.uk/explore-mental-health/blogs/it-wrong-lie-person-dementia" target="_blank" rel="noreferrer">Mental Health Foundation, truth in dementia care</a></li>
            <li><a href="https://www.dpdpa.com/dpdparules/rule10.html" target="_blank" rel="noreferrer">DPDP Rules 2025, guardian consent</a></li>
          </ul>
        </div>
      </section>
    </>
  );
}
