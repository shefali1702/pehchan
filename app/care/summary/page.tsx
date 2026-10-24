import { db } from "@/lib/server/store";
import PrintButton from "./PrintButton";
import "../../app.css";
import "./summary.css";

export const metadata = { title: "Summary · Pehchan" };
export const dynamic = "force-dynamic";

const HINT = ["named right away", "after the relationship", "after the first sound", "after hearing their voice"];

// A plain record to share with a doctor: what happened, not what it means.
export default function Summary() {
  const d = db();
  const elder = d.people.find((p) => p.id === d.elderId)!;
  const since = Date.now() - 30 * 86400000;
  const sessions = d.sessions.filter((s) => new Date(s.startedAt).getTime() > since);
  const moods = d.moods.filter((m) => new Date(m.at).getTime() > since);
  const count = (moment: string, mood: string) => moods.filter((m) => m.moment === moment && m.mood === mood).length;
  const people = d.people.filter((p) => !p.isElder && !p.isDeceased);
  const minutes = sessions.reduce(
    (a, s) => a + (s.endedAt ? (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000 : 0),
    0,
  );

  return (
    <div className="sm">
      <header className="sm-head">
        <div>
          <p className="sm-kicker">Pehchan, last 30 days</p>
          <h1>{elder.name}</h1>
          <p>Prepared {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} by her family</p>
        </div>
        <PrintButton />
      </header>

      <section>
        <h2>Sessions</h2>
        <table>
          <tbody>
            <tr><th>Reels watched</th><td>{sessions.length}</td></tr>
            <tr><th>Total time</th><td>{Math.round(minutes)} minutes</td></tr>
            <tr><th>Ended early with Stop</th><td>{sessions.filter((s) => s.endedByStop).length}</td></tr>
            <tr><th>Times the family was told she smiled</th><td>{moods.filter((m) => m.mood === "smiled").length}</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Mood logged by the caregiver</h2>
        <table>
          <thead>
            <tr><th></th><th>Before a reel</th><th>After a reel</th></tr>
          </thead>
          <tbody>
            {["calm", "happy", "confused", "upset"].map((m) => (
              <tr key={m}>
                <th>{m[0].toUpperCase() + m.slice(1)}</th>
                <td>{count("before", m)}</td>
                <td>{count("after", m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Recognition game</h2>
        <p className="sm-note">How much help each face needed. The game has no wrong answers; this only counts hints.</p>
        <table>
          <thead>
            <tr><th>Person</th><th>Times shown</th><th>Most often</th></tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const ev = d.recognition.filter((r) => r.personId === p.id && new Date(r.at).getTime() > since);
              const freq = [0, 1, 2, 3].map((h) => ev.filter((e) => e.hintLevel === h).length);
              const top = ev.length ? freq.indexOf(Math.max(...freq)) : -1;
              return (
                <tr key={p.id}>
                  <th>{p.name}, {p.relationship}</th>
                  <td>{ev.length}</td>
                  <td>{top >= 0 ? HINT[top] : "Not shown yet"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="sm-foot">
        Pehchan is a comfort and connection tool for families. It does not diagnose, treat or slow dementia, and these
        counts are not clinical measures.
      </p>
    </div>
  );
}
