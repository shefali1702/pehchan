"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FaceTag, Notification, Person } from "@/lib/types";
import { checkCaption } from "@/lib/captions";
import { ago, chime, postJSON, useEvents, useFamily, type FamilyData } from "./useFamily";
import { detectFaces, rememberFace, suggestPerson, type DetectedFace } from "@/lib/faces/human";

type Tab = "add" | "record" | "inbox" | "you";
const ME_KEY = "pehchan-me";

export default function FamilyApp() {
  const { data, reload } = useFamily();
  const [me, setMe] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("add");
  const [fresh, setFresh] = useState<Notification | null>(null);
  const [inbox, setInbox] = useState<Notification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setMe(localStorage.getItem(ME_KEY));
    } catch {}
    const t = new URLSearchParams(location.search).get("tab") as Tab | null;
    if (t) setTab(t);
    setReady(true);
  }, []);

  const person = data?.people.find((p) => p.id === me) ?? null;
  const elder = data?.people.find((p) => p.id === data.elderId);

  // Inbox: live stream first, polling as a fallback if the network drops.
  useEffect(() => {
    if (!me) return;
    let stop = false;
    const poll = async () => {
      try {
        const list: Notification[] = await fetch(`/api/notifications?person=${me}`, { cache: "no-store" }).then((r) => r.json());
        if (!stop) setInbox((cur) => merge(cur, list));
      } catch {}
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [me]);

  useEvents({
    notification: (n: Notification) => {
      if (n.toPersonId !== localStorage.getItem(ME_KEY)) return;
      setInbox((cur) => merge(cur, [n]));
      announce(n);
    },
  });

  const seen = useRef(new Set<string>());
  function announce(n: Notification) {
    if (seen.current.has(n.id)) return;
    seen.current.add(n.id);
    setFresh(n);
    setTimeout(() => setFresh((f) => (f?.id === n.id ? null : f)), 12000);
    chime();
    navigator.vibrate?.([120, 80, 120]);
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Pehchan", { body: n.text, icon: "/icon.svg" });
      } catch {}
    }
  }
  useEffect(() => {
    // Polled notifications also announce once, if they are new this session.
    const latest = inbox[0];
    if (latest && Date.now() - new Date(latest.at).getTime() < 15000) announce(latest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox]);

  const choose = (id: string | null) => {
    try {
      if (id) localStorage.setItem(ME_KEY, id);
      else localStorage.removeItem(ME_KEY);
    } catch {}
    seen.current.clear();
    setInbox([]);
    setMe(id);
  };

  if (!data || !ready) return <div className="fa fa-loading">Loading the Sharma family</div>;

  if (!person) return <WhoAreYou data={data} onPick={choose} />;
  if (!person.consent) return <Consent person={person} elderName={elder?.name ?? ""} onDone={reload} />;

  return (
    <div className="fa">
      <header className="fa-top">
        <div className="fa-brand">
          <span className="fa-deva">पहचान</span>
          <span>for {elder?.name}&apos;s family</span>
        </div>
        <button className="fa-me" onClick={() => setTab("you")}>
          <span className="fa-initial">{person.name[0]}</span>
          {person.name}
        </button>
      </header>

      {fresh && (
        <button className="fa-toast" onClick={() => { setTab("inbox"); setFresh(null); }}>
          {fresh.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fresh.photo} alt="" />
          )}
          <span>
            <b>{fresh.text}</b>
            <small>Tap to open your inbox</small>
          </span>
        </button>
      )}

      <main className="fa-main">
        {tab === "add" && <AddPhoto data={data} me={person} onSaved={reload} />}
        {tab === "record" && <Record data={data} me={person} onSaved={reload} />}
        {tab === "inbox" && <Inbox list={inbox} onOpen={() => setFresh(null)} />}
        {tab === "you" && <You data={data} me={person} onChange={reload} onSwitch={() => choose(null)} />}
      </main>

      <nav className="fa-tabs" aria-label="Family app">
        {(
          [
            ["add", "Add photo"],
            ["record", "Record"],
            ["inbox", "Inbox"],
            ["you", "You"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} className={tab === k ? "is-on" : ""} onClick={() => setTab(k)} aria-current={tab === k ? "page" : undefined}>
            {label}
            {k === "inbox" && inbox.length > 0 && <span className="fa-count">{inbox.length}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function merge(cur: Notification[], add: Notification[]) {
  const m = new Map(cur.map((n) => [n.id, n]));
  for (const n of add) m.set(n.id, n);
  return [...m.values()].sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------------- Who are you ---------------- */

function WhoAreYou({ data, onPick }: { data: FamilyData; onPick: (id: string) => void }) {
  const elder = data.people.find((p) => p.id === data.elderId);
  const family = data.people.filter((p) => !p.isElder && !p.isDeceased);
  return (
    <div className="fa fa-center">
      <div className="fa-hello">
        <span className="fa-deva fa-deva-big">पहचान</span>
        <h1>Who is adding to {elder?.name}&apos;s photos?</h1>
        <p>Pick your name. You can switch later.</p>
      </div>
      <ul className="fa-people">
        {family.map((p) => (
          <li key={p.id}>
            <button onClick={() => onPick(p.id)}>
              <span className="fa-initial fa-initial-lg">{p.name[0]}</span>
              <span>
                <b>{p.name}</b>
                <small>{elder?.name}&apos;s {p.relationship}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Consent ---------------- */

function Consent({ person, elderName, onDone }: { person: Person; elderName: string; onDone: () => void }) {
  const [face, setFace] = useState(true);
  const [voice, setVoice] = useState(true);
  const [phone, setPhone] = useState(person.phone ?? "");
  const [err, setErr] = useState("");
  return (
    <div className="fa fa-center">
      <div className="fa-hello">
        <h1>Before {elderName} sees your face or hears your voice</h1>
        <p>
          Your photos and recordings appear on {elderName}&apos;s screen only after you agree. You can withdraw at any
          time from the You tab, and your content is removed.
        </p>
      </div>
      <div className="fa-card">
        <label className="fa-check">
          <input type="checkbox" checked={face} onChange={(e) => setFace(e.target.checked)} />
          <span>
            <b>My face may appear in {elderName}&apos;s reel</b>
            <small>Faces are found on this phone. Only your name and where you are in the photo are saved.</small>
          </span>
        </label>
        <label className="fa-check">
          <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
          <span>
            <b>My recorded voice may be played to {elderName}</b>
            <small>Only recordings you make yourself. Pehchan never creates or copies your voice.</small>
          </span>
        </label>
        <label className="fa-field">
          <span>Your phone number, for the &ldquo;Call {person.name}&rdquo; button at the end of her reel</span>
          <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </label>
        {err && <p className="fa-err">{err}</p>}
        <button
          className="fa-btn"
          onClick={async () => {
            try {
              await postJSON("/api/consent", { personId: person.id, face, voice, phone });
              onDone();
            } catch (e) {
              setErr((e as Error).message);
            }
          }}
        >
          Agree and continue
        </button>
      </div>
    </div>
  );
}

/* ---------------- Add photo ---------------- */

type Tagged = DetectedFace & { personId: string | null };

function AddPhoto({ data, me, onSaved }: { data: FamilyData; me: Person; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [faces, setFaces] = useState<Tagged[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [scan, setScan] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [story, setStory] = useState("");
  const [year, setYear] = useState("");
  const [place, setPlace] = useState("");
  const [caption, setCaption] = useState("");
  const [titleLine, setTitleLine] = useState("");
  const [writing, setWriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  const people = data.people;
  const issues = useMemo(() => (caption ? checkCaption(caption) : []), [caption]);

  if (!me.consent?.face)
    return (
      <Empty title="Photos are off for you" body="You withdrew consent for your face. Turn it back on in the You tab to add photos." />
    );

  const pick = (f: File | null) => {
    setFile(f);
    setFaces([]);
    setActive(null);
    setScan("idle");
    setCaption("");
    setSaved(false);
    setErr("");
    if (url) URL.revokeObjectURL(url);
    setUrl(f ? URL.createObjectURL(f) : null);
  };

  const onImgLoad = async () => {
    if (!img.current) return;
    setScan("busy");
    try {
      const found = await detectFaces(img.current);
      const tagged: Tagged[] = [];
      for (const f of found) tagged.push({ ...f, personId: await suggestPerson(f.embedding) });
      setFaces(tagged);
      setActive(tagged.findIndex((t) => !t.personId));
      setScan("done");
    } catch {
      setScan("failed");
    }
  };

  const tapPhoto = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".fa-box")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const w = 0.2, h = 0.2 * (r.width / r.height);
    setFaces((f) => [...f, { bbox: { x: Math.max(0, x - w / 2), y: Math.max(0, y - h / 2), w, h }, personId: null }]);
    setActive(faces.length);
  };

  const tags: FaceTag[] = faces.filter((f) => f.personId).map((f) => ({ personId: f.personId!, bbox: f.bbox }));

  const write = async () => {
    setWriting(true);
    setErr("");
    try {
      const r = await postJSON("/api/caption", { story, year: Number(year) || undefined, place, faces: tags });
      setCaption(r.caption);
      setTitleLine(r.relationship_line);
    } catch (e) {
      setErr((e as Error).message);
    }
    setWriting(false);
  };

  const save = async () => {
    if (!file) return;
    setSaving(true);
    setErr("");
    const form = new FormData();
    form.append("file", file);
    form.append("uploadedBy", me.id);
    form.append("faces", JSON.stringify(tags));
    form.append("story", story);
    form.append("year", year);
    form.append("place", place);
    form.append("caption", caption);
    try {
      const r = await fetch("/api/photos", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "The photo did not upload. Check the connection and try again.");
      // Face prints stay on this phone.
      for (const f of faces) if (f.personId && f.embedding) await rememberFace(f.personId, f.embedding).catch(() => {});
      setSaved(true);
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    }
    setSaving(false);
  };

  if (saved)
    return (
      <div className="fa-done">
        <h2>Added to her photos.</h2>
        <p>It will appear in {data.people.find((p) => p.id === data.elderId)?.name}&apos;s next reel.</p>
        <button className="fa-btn" onClick={() => pick(null)}>Add another photo</button>
      </div>
    );

  return (
    <div className="fa-flow">
      {!url ? (
        <label className="fa-drop">
          <input type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          <span className="fa-drop-plus" aria-hidden="true">+</span>
          <b>Add photo</b>
          <small>Choose from your gallery or take one now</small>
        </label>
      ) : (
        <>
          <section className="fa-step">
            <h2>Who is in this photo?</h2>
            <p className="fa-help">
              {scan === "busy"
                ? "Looking for faces on this phone. Nothing is sent yet."
                : scan === "failed"
                  ? "Face finding is not available on this device. Tap each face in the photo to tag it."
                  : faces.length
                    ? "Tap a box, then pick who it is. Tap the photo to add a face we missed."
                    : "No faces found. Tap each face in the photo to tag it."}
            </p>
            <div className="fa-photo" onClick={tapPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={img} src={url} alt="The photo you chose" onLoad={onImgLoad} />
              {faces.map((f, i) => {
                const who = people.find((p) => p.id === f.personId);
                return (
                  <button
                    key={i}
                    className={`fa-box${active === i ? " is-active" : ""}${who ? " is-tagged" : ""}`}
                    style={{ left: `${f.bbox.x * 100}%`, top: `${f.bbox.y * 100}%`, width: `${f.bbox.w * 100}%`, height: `${f.bbox.h * 100}%` }}
                    onClick={() => setActive(i)}
                  >
                    <span>{who ? who.name : i + 1}</span>
                  </button>
                );
              })}
              {scan === "busy" && <span className="fa-scan" aria-hidden="true" />}
            </div>
            {active !== null && active >= 0 && faces[active] && (
              <div className="fa-who">
                <p>Face {active + 1} is</p>
                <div className="fa-chips">
                  {data.people.map((p) => (
                    <button
                      key={p.id}
                      className={faces[active].personId === p.id ? "is-on" : ""}
                      onClick={() => {
                        setFaces((fs) => fs.map((f, k) => (k === active ? { ...f, personId: p.id } : f)));
                        const nextUntagged = faces.findIndex((f, k) => k !== active && !f.personId);
                        setActive(nextUntagged >= 0 ? nextUntagged : null);
                      }}
                    >
                      {p.isElder ? `${p.name} herself` : p.name}
                      {p.isDeceased ? " (late)" : ""}
                    </button>
                  ))}
                  <button
                    className="fa-chip-quiet"
                    onClick={() => {
                      setFaces((fs) => fs.filter((_, k) => k !== active));
                      setActive(null);
                    }}
                  >
                    Not someone she knows
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="fa-step">
            <h2>Tell her about it</h2>
            <label className="fa-field">
              <span>What is happening, in one sentence</span>
              <input value={story} onChange={(e) => setStory(e.target.value)} placeholder="For example, Diwali at the old house" maxLength={140} />
            </label>
            <div className="fa-row">
              <label className="fa-field">
                <span>Year</span>
                <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="For example, 1975" />
              </label>
              <label className="fa-field">
                <span>Place</span>
                <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="For example, Lucknow" />
              </label>
            </div>
            <button className="fa-btn fa-btn-line" onClick={write} disabled={writing}>
              {writing ? "Writing a gentle caption" : caption ? "Write it again" : "Write her caption"}
            </button>
          </section>

          {caption && (
            <section className="fa-step">
              <h2>How {data.people.find((p) => p.id === data.elderId)?.name} will see it</h2>
              <div className="fa-preview">
                <p className="fa-preview-title">{titleLine || "Your family"}</p>
                <p className="fa-preview-line">{caption}</p>
              </div>
              <label className="fa-field">
                <span>Change the words if you like</span>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
              </label>
              {issues.length > 0 && (
                <ul className="fa-issues">
                  {issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {err && <p className="fa-err">{err}</p>}
          <div className="fa-actions">
            <button className="fa-btn" onClick={save} disabled={saving || issues.length > 0}>
              {saving ? "Adding" : "Add to her photos"}
            </button>
            <button className="fa-link" onClick={() => pick(null)}>Choose a different photo</button>
          </div>
        </>
      )}

      <MyPhotos data={data} me={me} />
    </div>
  );
}

function MyPhotos({ data, me }: { data: FamilyData; me: Person }) {
  const mine = data.photos.filter((p) => p.uploadedBy === me.id && !p.placeholder);
  if (!mine.length) return null;
  return (
    <section className="fa-step">
      <h2>Your photos in her reel</h2>
      <div className="fa-grid">
        {mine.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.src} alt={p.story ?? "Family photo"} />
        ))}
      </div>
    </section>
  );
}

/* ---------------- Record ---------------- */

function Record({ data, me, onSaved }: { data: FamilyData; me: Person; onSaved: () => void }) {
  const [kind, setKind] = useState<"letter" | "hello">("letter");
  const [photoId, setPhotoId] = useState("");
  const [state, setState] = useState<"idle" | "rec" | "review" | "saving" | "saved">("idle");
  const [secs, setSecs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [err, setErr] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const started = useRef(0);
  const meter = useRef<HTMLCanvasElement>(null);
  const elder = data.people.find((p) => p.id === data.elderId);
  const limit = kind === "hello" ? 6 : 30;
  const blobUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  const photos = data.photos.filter((p) => p.uploadedBy === me.id || p.faces.some((f) => f.personId === me.id));
  const mine = data.voiceLetters.filter((v) => v.speakerId === me.id);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  if (!me.consent?.voice)
    return <Empty title="Recording is off for you" body="You withdrew consent for your voice. Turn it back on in the You tab to record." />;

  const start = async () => {
    setErr("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("This page cannot use the microphone here. Open it on a secure address (https or localhost).");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(s, type ? { mimeType: type } : undefined);
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        setBlob(new Blob(chunks, { type: r.mimeType }));
        setState("review");
        s.getTracks().forEach((t) => t.stop());
      };
      rec.current = r;
      r.start();
      started.current = Date.now();
      setSecs(0);
      setState("rec");
      drawMeter(s);
    } catch {
      setErr("The microphone is blocked. Allow microphone access for this page in your browser settings.");
    }
  };

  const drawMeter = (s: MediaStream) => {
    const ac = new AudioContext();
    const an = ac.createAnalyser();
    an.fftSize = 256;
    ac.createMediaStreamSource(s).connect(an);
    const d = new Uint8Array(an.frequencyBinCount);
    const loop = () => {
      if (rec.current?.state !== "recording") {
        ac.close();
        return;
      }
      const el = (Date.now() - started.current) / 1000;
      setSecs(el);
      if (el >= limit) rec.current.stop();
      an.getByteFrequencyData(d);
      const cv = meter.current;
      if (cv) {
        const c = cv.getContext("2d")!;
        cv.width = cv.clientWidth * 2;
        cv.height = cv.clientHeight * 2;
        const bars = 32;
        const bw = cv.width / bars;
        for (let i = 0; i < bars; i++) {
          const v = d[Math.floor(i * 2.5)] / 255;
          const h = Math.max(4, v * cv.height);
          c.fillStyle = "#c8361e";
          c.fillRect(i * bw + 2, (cv.height - h) / 2, bw - 4, h);
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  };

  const upload = async () => {
    if (!blob) return;
    setState("saving");
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    form.append("file", new File([blob], `voice.${ext}`, { type: blob.type.split(";")[0] }));
    form.append("speakerId", me.id);
    form.append("kind", kind);
    form.append("photoId", kind === "letter" ? photoId : "");
    form.append("durationS", String(Math.round(secs)));
    try {
      const r = await fetch("/api/voice", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setState("saved");
      onSaved();
    } catch (e) {
      setErr((e as Error).message || "The recording did not upload. Try again.");
      setState("review");
    }
  };

  return (
    <div className="fa-flow">
      <div className="fa-seg" role="tablist">
        <button className={kind === "letter" ? "is-on" : ""} onClick={() => { setKind("letter"); setState("idle"); setBlob(null); }}>
          Voice letter
          <small>20 to 30 seconds</small>
        </button>
        <button className={kind === "hello" ? "is-on" : ""} onClick={() => { setKind("hello"); setState("idle"); setBlob(null); }}>
          Hello for the game
          <small>A few words</small>
        </button>
      </div>

      <div className="fa-prompt">
        {kind === "letter" ? (
          <>
            <p className="fa-prompt-say">&ldquo;Hi {me.callsElder || elder?.name}, it&apos;s {me.name}, your {me.relationship}...&rdquo;</p>
            <ul>
              <li>Start with your name and how you are related.</li>
              <li>Speak slowly, as if you are sitting next to her.</li>
              <li>Say &ldquo;this is&rdquo; rather than &ldquo;do you remember&rdquo;.</li>
            </ul>
          </>
        ) : (
          <>
            <p className="fa-prompt-say">&ldquo;It&apos;s me, {me.name}!&rdquo;</p>
            <ul>
              <li>This plays in her recognition game, just before your name appears.</li>
              <li>Say it warmly, the way you would at the door.</li>
            </ul>
          </>
        )}
      </div>

      {kind === "letter" && photos.length > 0 && state !== "saved" && (
        <label className="fa-field">
          <span>Play it with a photo (optional)</span>
          <select value={photoId} onChange={(e) => setPhotoId(e.target.value)}>
            <option value="">Any photo of me</option>
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.story || p.caption || (p.placeholder ? "Placeholder photo" : "Photo")}
                {p.year ? `, ${p.year}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="fa-recorder">
        {state === "idle" && (
          <button className="fa-rec" onClick={start} aria-label="Start recording">
            <span />
          </button>
        )}
        {state === "rec" && (
          <>
            <canvas ref={meter} className="fa-meter" aria-hidden="true" />
            <p className="fa-secs">
              {Math.floor(secs)} s <small>of {limit}</small>
            </p>
            <button className="fa-rec is-rec" onClick={() => rec.current?.stop()} aria-label="Stop recording">
              <span />
            </button>
          </>
        )}
        {(state === "review" || state === "saving") && blobUrl && (
          <>
            <audio controls src={blobUrl} className="fa-audio" />
            <div className="fa-actions">
              <button className="fa-btn" onClick={upload} disabled={state === "saving"}>
                {state === "saving" ? "Sending" : "Send to her reel"}
              </button>
              <button className="fa-link" onClick={() => { setBlob(null); setState("idle"); }}>
                Record again
              </button>
            </div>
          </>
        )}
        {state === "saved" && (
          <div className="fa-done">
            <h2>{kind === "hello" ? "Your hello is in her game." : "Your voice letter is in her next reel."}</h2>
            <button className="fa-btn fa-btn-line" onClick={() => { setBlob(null); setState("idle"); }}>
              Record another
            </button>
          </div>
        )}
        {state === "idle" && <p className="fa-help">Tap to start. It stops by itself after {limit} seconds.</p>}
      </div>
      {err && <p className="fa-err">{err}</p>}

      {mine.length > 0 && (
        <section className="fa-step">
          <h2>Your recordings</h2>
          <ul className="fa-list">
            {mine.map((v) => (
              <li key={v.id}>
                <span>
                  <b>{v.kind === "hello" ? "Hello for the game" : "Voice letter"}</b>
                  <small>
                    {v.durationS} s, {ago(v.createdAt)}
                    {v.transcript ? `: "${v.transcript}"` : ""}
                  </small>
                </span>
                <audio controls src={v.src} preload="none" />
                <button
                  className="fa-link"
                  onClick={async () => {
                    await fetch("/api/voice", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id }) });
                    onSaved();
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ---------------- Inbox ---------------- */

function Inbox({ list, onOpen }: { list: Notification[]; onOpen: () => void }) {
  useEffect(onOpen, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [perm, setPerm] = useState<string>("default");
  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
    else setPerm("unsupported");
  }, []);
  return (
    <div className="fa-flow">
      <h2 className="fa-h">Inbox</h2>
      {perm === "default" && (
        <button className="fa-btn fa-btn-line" onClick={async () => setPerm(await Notification.requestPermission())}>
          Turn on phone alerts
        </button>
      )}
      {list.length === 0 ? (
        <Empty title="Nothing yet" body="When your photo or voice makes her smile, you will hear about it here." />
      ) : (
        <ul className="fa-inbox">
          {list.map((n, i) => (
            <li key={n.id} className={i === 0 && Date.now() - new Date(n.at).getTime() < 60000 ? "is-new" : ""}>
              {n.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.photo} alt="" />
              ) : (
                <span className="fa-inbox-dot" aria-hidden="true" />
              )}
              <span>
                <b>{n.text}</b>
                <small>{ago(n.at)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- You ---------------- */

function You({ data, me, onChange, onSwitch }: { data: FamilyData; me: Person; onChange: () => void; onSwitch: () => void }) {
  const [phone, setPhone] = useState(me.phone ?? "");
  const [avoid, setAvoid] = useState("");
  const [song, setSong] = useState({ title: "", year: "", file: null as File | null });
  const [msg, setMsg] = useState("");
  const elder = data.people.find((p) => p.id === data.elderId);
  const set = async (body: object) => {
    await postJSON("/api/consent", { personId: me.id, ...body });
    onChange();
  };
  return (
    <div className="fa-flow">
      <h2 className="fa-h">You</h2>
      <section className="fa-card">
        <label className="fa-check">
          <input type="checkbox" checked={!!me.consent?.face} onChange={(e) => set({ face: e.target.checked, voice: !!me.consent?.voice })} />
          <span>
            <b>My face may appear</b>
            <small>Turning this off removes the photos you added and photos tagged with you.</small>
          </span>
        </label>
        <label className="fa-check">
          <input type="checkbox" checked={!!me.consent?.voice} onChange={(e) => set({ face: !!me.consent?.face, voice: e.target.checked })} />
          <span>
            <b>My voice may be played</b>
            <small>Turning this off deletes your recordings.</small>
          </span>
        </label>
        <label className="fa-field">
          <span>Phone number for the Call button</span>
          <div className="fa-inline">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="fa-btn fa-btn-line" onClick={() => set({ phone }).then(() => setMsg("Number saved."))}>Save</button>
          </div>
        </label>
      </section>

      <section className="fa-card">
        <h3>Keep away from her screen</h3>
        <p className="fa-help">Topics or people that upset her. Anything matching never appears.</p>
        <div className="fa-inline">
          <input value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="For example, the hospital" />
          <button
            className="fa-btn fa-btn-line"
            onClick={async () => {
              if (!avoid.trim()) return;
              await postJSON("/api/avoid", { text: avoid });
              setAvoid("");
              onChange();
            }}
          >
            Add
          </button>
        </div>
        {data.avoid.length > 0 && (
          <ul className="fa-list">
            {data.avoid.map((a) => (
              <li key={a.id}>
                <span>{a.text || data.people.find((p) => p.id === a.personId)?.name}</span>
                <button
                  className="fa-link"
                  onClick={async () => {
                    await fetch("/api/avoid", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id }) });
                    onChange();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="fa-card">
        <h3>A song she loved</h3>
        <p className="fa-help">
          Songs from when {elder?.name} was 10 to 30 (around {(elder?.birthYear ?? 1950) + 10} to {(elder?.birthYear ?? 1950) + 30})
          play first. Use a recording you have the right to use.
        </p>
        <label className="fa-field">
          <span>Song name</span>
          <input value={song.title} onChange={(e) => setSong({ ...song, title: e.target.value })} />
        </label>
        <div className="fa-row">
          <label className="fa-field">
            <span>Year</span>
            <input inputMode="numeric" value={song.year} onChange={(e) => setSong({ ...song, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
          </label>
          <label className="fa-field">
            <span>Audio file</span>
            <input type="file" accept="audio/*" onChange={(e) => setSong({ ...song, file: e.target.files?.[0] ?? null })} />
          </label>
        </div>
        <button
          className="fa-btn fa-btn-line"
          disabled={!song.file || !song.title}
          onClick={async () => {
            const f = new FormData();
            f.append("file", song.file!);
            f.append("title", song.title);
            f.append("year", song.year);
            f.append("addedBy", me.id);
            const r = await fetch("/api/songs", { method: "POST", body: f });
            setMsg(r.ok ? "Song added. It plays under her next reel." : "The song did not upload. Try a smaller mp3 file.");
            setSong({ title: "", year: "", file: null });
            onChange();
          }}
        >
          Add song
        </button>
        {data.songs.length > 0 && <p className="fa-help">In her music: {data.songs.map((s) => s.title).join(", ")}</p>}
      </section>
      {msg && <p className="fa-ok">{msg}</p>}
      <button className="fa-link" onClick={onSwitch}>I am not {me.name}</button>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="fa-empty">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
