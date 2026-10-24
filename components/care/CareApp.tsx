"use client";

import { useEffect, useMemo, useState } from "react";
import type { Mode, Mood, MoodLog, RecognitionEvent, Session, Settings } from "@/lib/types";
import { ago, postJSON, useEvents, useFamily } from "@/components/family/useFamily";

const MOODS: Mood[] = ["calm", "happy", "confused", "upset"];

export default function CareApp() {
  const { data, reload } = useFamily();
  const [session, setSession] = useState<Session | null>(null);
  const [live, setLive] = useState(false);
  const [moment, setMoment] = useState<"before" | "after">("before");
  const [logged, setLogged] = useState<Record<string, Mood>>({});
  const [sent, setSent] = useState<{ names: string[]; at: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        setSession(s.live ?? s.last);
        setLive(!!s.live);
        if (s.live) setMoment("after");
      });
  }, []);

  useEvents({
    session: (e: { kind: string; session: Session }) => {
      setSession(e.session);
      setLive(e.kind !== "end");
      if (e.kind === "start") {
        setSent(null);
        setLogged({});
      }
      if (e.kind === "end") setMoment("after");
      if (e.kind !== "progress") reload();
    },
    recognition: () => reload(),
    mood: () => reload(),
  });

  const elder = data?.people.find((p) => p.id === data.elderId);
  const she = elder?.name ?? "She";
  const item = session?.reel.items[session.index];

  const smiled = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await postJSON("/api/smiled", { sessionId: session?.id });
      setSent({ names: r.sent.map((s: { to: string }) => s.to), at: Date.now() });
      navigator.vibrate?.(60);
      reload();
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  const logMood = async (mood: Mood) => {
    setLogged((l) => ({ ...l, [moment]: mood }));
    await postJSON("/api/mood", { sessionId: session?.id, moment, mood }).catch(() => {});
  };

  const insights = useMemo(() => (data ? buildInsights(data.recognition, data.moods, data.sessions, data.people) : []), [data]);

  if (!data) return <div className="cg cg-loading">Loading</div>;

  return (
    <div className="cg">
      <header className="cg-top">
        <h1>Looking after {she}</h1>
        <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </header>

      <div className="cg-grid">
        <div>
          <section className="cg-panel">
            <h2>On {she}&apos;s screen</h2>
            {session && item ? (
              <>
                {live && <span className="cg-live">Playing now</span>}
                <div className="cg-now">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" />
                  <div>
                    <b>{item.type === "game" ? `Who is this? ${item.name}` : item.title}</b>
                    <small>
                      {item.type === "game" ? "The gentle recognition game" : item.type === "tell" ? "Tell mode: her own stories" : item.line}
                      {!live && session.endedAt ? ` · reel ended ${ago(session.endedAt)}` : ""}
                    </small>
                  </div>
                </div>
              </>
            ) : (
              <p className="cg-idle">No reel yet today. Tap Begin on {she}&apos;s screen.</p>
            )}

            <button className={`cg-smile${sent ? " is-sent" : ""}`} onClick={smiled} disabled={busy || !session}>
              <span>
                She smiled
                <small>
                  {sent
                    ? sent.names.length
                      ? `Sent to ${sent.names.join(" and ")}`
                      : "Logged. No family photos were on screen yet."
                    : "Lets the family in this reel know"}
                </small>
              </span>
            </button>
            {err && <p className="fa-err">{err}</p>}
          </section>

          <section className="cg-panel" style={{ marginTop: 16 }}>
            <h2>How is {she}?</h2>
            <div className="cg-moment" role="tablist">
              {(["before", "after"] as const).map((m) => (
                <button key={m} className={moment === m ? "is-on" : ""} onClick={() => setMoment(m)}>
                  {m === "before" ? "Before the reel" : "After the reel"}
                </button>
              ))}
            </div>
            <div className="cg-moods">
              {MOODS.map((m) => (
                <button key={m} className={logged[moment] === m ? "is-on" : ""} onClick={() => logMood(m)}>
                  {m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div>
          <section className="cg-panel">
            <h2>What we are noticing</h2>
            {insights.length ? (
              insights.map((i, k) => (
                <p key={k} className={`cg-insight${i.calm ? " is-calm" : ""}`}>
                  {i.text}
                </p>
              ))
            ) : (
              <p className="cg-idle">Notes appear here after a few reels and mood logs.</p>
            )}
          </section>
          <section className="cg-panel" style={{ marginTop: 16 }}>
            <h2>Today</h2>
            <ul className="cg-log">
              {timeline(data.moods, data.recognition, data.people).slice(0, 10).map((t, k) => (
                <li key={k}>
                  <span>{t.text}</span>
                  <small>{ago(t.at)}</small>
                </li>
              ))}
            </ul>
          </section>
          <StagePanel she={she} />
          <CheckIn />
          <p className="cg-links">
            <a href="/care/summary">Summary for her doctor</a> · <a href="/consent">Record her living consent</a>
          </p>
          <p className="cg-links">
            Looking after someone is hard work. The <a href="https://ardsi.org/" target="_blank" rel="noreferrer">Alzheimer&apos;s and Related Disorders Society of India</a> runs helplines and carer support.
          </p>
        </div>
      </div>
    </div>
  );
}

type People = { id: string; name: string }[];

function timeline(moods: MoodLog[], rec: RecognitionEvent[], people: People) {
  const name = (id: string) => people.find((p) => p.id === id)?.name ?? "";
  const hints = ["right away", "after the relationship hint", "after the first sound", "after hearing their voice"];
  return [
    ...moods.map((m) => ({
      at: m.at,
      text: m.mood === "smiled" ? "She smiled. Family told." : `${m.moment === "before" ? "Before" : m.moment === "after" ? "After" : "During"} the reel: ${m.mood}`,
    })),
    ...rec.map((r) => ({ at: r.at, text: `${name(r.personId)} named ${hints[r.hintLevel] ?? ""}` })),
  ].sort((a, b) => b.at.localeCompare(a.at));
}

function buildInsights(rec: RecognitionEvent[], moods: MoodLog[], sessions: Session[], people: People) {
  const out: { text: string; calm?: boolean }[] = [];
  // Fading: a face whose hint level is rising over the past week.
  const week = Date.now() - 7 * 86400000;
  for (const p of people) {
    const ev = rec.filter((r) => r.personId === p.id && new Date(r.at).getTime() > week);
    if (ev.length < 3) continue;
    const half = Math.floor(ev.length / 2);
    const avg = (a: RecognitionEvent[]) => a.reduce((s, r) => s + r.hintLevel, 0) / a.length;
    if (avg(ev.slice(half)) - avg(ev.slice(0, half)) >= 0.5) out.push({ text: `${p.name} might be worth an extra visit this week.` });
  }
  // What brings calm: reels followed by a calm or happy "after" mood, or a smile.
  const good = new Map<string, number>();
  for (const m of moods) {
    if (!["calm", "happy", "smiled"].includes(m.mood)) continue;
    const s = sessions.find((x) => x.id === m.sessionId);
    s?.reel.items.forEach((i) => i.type === "photo" && good.set(i.title, (good.get(i.title) ?? 0) + 1));
  }
  const top = [...good.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) out.push({ text: `Reels with ${top[0].split(",")[0]} have been followed by calm or smiles ${top[1]} times.`, calm: true });
  return out;
}

const MODES: { id: Mode; label: string; body: string }[] = [
  { id: "tell", label: "Tell", body: "Early stage. She talks over her photos and her own voice is saved for the family." },
  { id: "remember", label: "Remember", body: "Middle stage. The daily reel with the gentle recognition game." },
  { id: "comfort", label: "Comfort", body: "Late stage. Faces, voices and music only. Nothing to tap, slower." },
];

function StagePanel({ she }: { she: string }) {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()).then(setS);
  }, []);
  const set = async (patch: Partial<Settings>) => setS(await postJSON("/api/settings", patch));
  if (!s) return null;
  return (
    <section className="cg-panel" style={{ marginTop: 16 }}>
      <h2>How {she}&apos;s reel works</h2>
      <div className="cg-modes" role="radiogroup" aria-label="Stage">
        {MODES.map((m) => (
          <button key={m.id} role="radio" aria-checked={s.mode === m.id} className={s.mode === m.id ? "is-on" : ""} onClick={() => set({ mode: m.id })}>
            <b>{m.label}</b>
            <span>{m.body}</span>
          </button>
        ))}
      </div>
      <div className="cg-length">
        <span>Photos in each reel</span>
        <div className="cg-stepper">
          <button onClick={() => set({ photos: s.photos - 1 })} disabled={s.photos <= 4} aria-label="Fewer photos">&minus;</button>
          <b>{s.photos}</b>
          <button onClick={() => set({ photos: s.photos + 1 })} disabled={s.photos >= 8} aria-label="More photos">+</button>
        </div>
      </div>
      <div className="cg-length">
        <span>Evening calm starts at</span>
        <div className="cg-stepper">
          <button onClick={() => set({ eveningFrom: s.eveningFrom - 1 })} disabled={s.eveningFrom <= 12} aria-label="Earlier">&minus;</button>
          <b>{s.eveningFrom}:00</b>
          <button onClick={() => set({ eveningFrom: s.eveningFrom + 1 })} disabled={s.eveningFrom >= 23} aria-label="Later">+</button>
        </div>
      </div>
    </section>
  );
}

function CheckIn() {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <section className="cg-panel cg-checkin" style={{ marginTop: 16 }}>
      <h2>And how are you doing?</h2>
      {answer ? (
        <p className="cg-idle">
          {answer === "hard"
            ? "Thank you for saying so. A helpline or a carers' group can share the load, and a short break is not a failure."
            : "Good to hear. Look after yourself too."}
        </p>
      ) : (
        <div className="cg-moods cg-moods-3">
          <button onClick={() => setAnswer("ok")}>Doing alright</button>
          <button onClick={() => setAnswer("ok")}>Tired</button>
          <button onClick={() => setAnswer("hard")}>It is hard today</button>
        </div>
      )}
    </section>
  );
}
