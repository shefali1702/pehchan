"use client";

import { useEffect, useRef, useState } from "react";
import type { Consent, Person } from "@/lib/types";
import { ago } from "@/components/family/useFamily";

// Her own say, in her own words, recorded while she can give it.
const PROMPTS = [
  { id: "keep", ask: "What would you like your family to keep?", hint: "Photos, songs, stories, people." },
  { id: "who", ask: "Who may see your photos and hear your stories?", hint: "Names are enough." },
  { id: "avoid", ask: "Is there anything you would rather not see?", hint: "A place, a time, a person. It is fine to say nothing." },
];

export default function LivingConsent() {
  const [elder, setElder] = useState<Person | null>(null);
  const [list, setList] = useState<Consent[]>([]);
  const [step, setStep] = useState(0);
  const [rec, setRec] = useState(false);
  const [err, setErr] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);

  const load = () => fetch("/api/consents", { cache: "no-store" }).then((r) => r.json()).then(setList);
  useEffect(() => {
    fetch("/api/family").then((r) => r.json()).then((d) => setElder(d.people.find((p: Person) => p.id === d.elderId)));
    load();
  }, []);

  const p = PROMPTS[step];
  const done = (id: string) => list.some((c) => c.kind === "living" && c.prompt === id && !c.withdrawnAt);

  const start = async () => {
    setErr("");
    if (!navigator.mediaDevices?.getUserMedia) return setErr("The microphone needs a secure page. Open this on the laptop at localhost.");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(s, type ? { mimeType: type } : undefined);
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = async () => {
        s.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType });
        const f = new FormData();
        f.append("file", new File([blob], "consent.webm", { type: blob.type.split(";")[0] }));
        f.append("kind", "living");
        f.append("prompt", p.id);
        f.append("personId", elder?.id ?? "");
        await fetch("/api/consents", { method: "POST", body: f });
        await load();
        setStep((n) => Math.min(PROMPTS.length, n + 1));
      };
      recorder.current = r;
      r.start();
      setRec(true);
    } catch {
      setErr("The microphone is blocked. Allow it for this page in the browser settings.");
    }
  };
  const stop = () => {
    recorder.current?.stop();
    setRec(false);
  };

  const uploadDoc = async (file: File | null) => {
    if (!file) return;
    const f = new FormData();
    f.append("file", file);
    f.append("kind", "guardian");
    f.append("personId", elder?.id ?? "");
    await fetch("/api/consents", { method: "POST", body: f });
    load();
  };

  return (
    <div className="lc">
      <header className="lc-top">
        <span className="lc-deva">अपनी बात</span>
        <span>Living consent{elder ? ` for ${elder.name}` : ""}</span>
      </header>

      {step < PROMPTS.length ? (
        <section className="lc-stage">
          <p className="lc-count">
            {step + 1} of {PROMPTS.length}
          </p>
          <h1 className="lc-ask">{p.ask}</h1>
          <p className="lc-hint">{p.hint}</p>
          <div className="lc-actions">
            <button className={`lc-rec${rec ? " is-rec" : ""}`} onClick={rec ? stop : start}>
              {rec ? "I have finished" : done(p.id) ? "Record again" : "Start speaking"}
            </button>
            {!rec && (
              <button className="lc-skip" onClick={() => setStep(step + 1)}>
                {done(p.id) ? "Next" : "Skip this one"}
              </button>
            )}
          </div>
          {err && <p className="lc-err">{err}</p>}
        </section>
      ) : (
        <section className="lc-stage">
          <h1 className="lc-ask">Thank you{elder ? `, ${elder.name}` : ""}.</h1>
          <p className="lc-hint">Your family will follow what you said.</p>
          <button className="lc-skip" onClick={() => setStep(0)}>Start again</button>
        </section>
      )}

      <section className="lc-log">
        <h2>For the family</h2>
        <p>
          Under India&apos;s DPDP Rules 2025, when a court or authority has appointed a guardian, the guardian&apos;s
          consent is needed too. Keep a copy of that order here.
        </p>
        <label className="lc-doc">
          <input type="file" accept="application/pdf,image/*" onChange={(e) => uploadDoc(e.target.files?.[0] ?? null)} />
          Add guardian document
        </label>
        <ul>
          {list.map((c) => (
            <li key={c.id} className={c.withdrawnAt ? "is-off" : ""}>
              <span>
                <b>{c.kind === "guardian" ? "Guardian document" : PROMPTS.find((x) => x.id === c.prompt)?.ask ?? "Living consent"}</b>
                <small>
                  {ago(c.createdAt)}
                  {c.withdrawnAt ? ", withdrawn" : ""}
                </small>
              </span>
              {c.recording && <audio controls src={c.recording} preload="none" />}
              {c.documentPath && (
                <a href={c.documentPath} target="_blank" rel="noreferrer">
                  Open
                </a>
              )}
              {!c.withdrawnAt && (
                <button
                  onClick={async () => {
                    await fetch("/api/consents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
                    load();
                  }}
                >
                  Withdraw
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
