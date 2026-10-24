"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Person, Reel, ReelItem } from "@/lib/types";
import { Mixer } from "@/lib/audio/mixer";
import { dayInWords, partOfDay } from "@/lib/time";

type Phase = "begin" | "reel" | "end" | "stopped";

const HOLD_MS = 9000; // suggested default, 8 to 10 s
const HINT_MS = 5000; // suggested default per hint step
const FADE_MS = 1500;

type Size = { w: number; h: number };

export default function ElderScreen() {
  const [elder, setElder] = useState<Person | null>(null);
  const [phase, setPhase] = useState<Phase>("begin");
  const [reel, setReel] = useState<Reel | null>(null);
  const [index, setIndex] = useState(0);
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [theme, setTheme] = useState<"evening" | "morning">("evening");
  const [now, setNow] = useState<Date | null>(null);
  const [leaving, setLeaving] = useState(false);
  const mixer = useRef<Mixer | null>(null);
  const session = useRef<string | null>(null);
  const wake = useRef<WakeLockSentinel | null>(null);
  // ?preview=1: silent, self-starting, looping, and never logged as a session.
  const preview = useRef(false);

  useEffect(() => {
    fetch("/api/family")
      .then((r) => r.json())
      .then((d) => {
        setElder(d.people.find((p: Person) => p.id === d.elderId));
        // Evening calm starts at the hour the caregiver chose (17:00 by default).
        const q = new URLSearchParams(location.search).get("theme");
        const h = new Date().getHours();
        const evening = h >= (d.settings?.eveningFrom ?? 17) || h < 5;
        setTheme(q === "morning" || q === "evening" ? q : evening ? "evening" : "morning");
      });
    setNow(new Date());
    preview.current = new URLSearchParams(location.search).has("preview");
    if (preview.current) setTimeout(() => beginRef.current(), 900);
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Evening calm and Comfort mode both slow everything down.
  const slow = (theme === "evening" ? 1.2 : 1) * (reel?.mode === "comfort" ? 1.4 : 1);

  const begin = async () => {
    if (phase === "reel") return;
    const m = new Mixer(preview.current);
    mixer.current = m;
    setLeaving(false);
    if (!preview.current) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      try {
        wake.current = await navigator.wakeLock?.request("screen");
      } catch {}
    }
    const r: Reel = await fetch("/api/reel/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evening: theme === "evening" }),
    }).then((x) => x.json());
    // Preload images so the cross-fades never stutter.
    const s: Record<string, Size> = {};
    await Promise.all(
      [...new Set(r.items.map((i) => i.src).concat(r.callPerson?.photo ?? []))].map(
        (src) =>
          new Promise<void>((res) => {
            const img = new Image();
            img.onload = () => {
              s[src] = { w: img.naturalWidth || 1600, h: img.naturalHeight || 1000 };
              res();
            };
            img.onerror = () => res();
            img.src = src;
          }),
      ),
    );
    setSizes(s);
    setReel(r);
    setIndex(0);
    setPhase("reel");
    m.startMusic(r.song?.src);
    if (preview.current) return;
    const sess = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", reel: r }),
    }).then((x) => x.json());
    session.current = sess.id;
  };

  const beginRef = useRef(begin);
  beginRef.current = begin;

  const post = (body: object) =>
    fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});

  const next = useCallback(() => {
    setIndex((i) => {
      const n = i + 1;
      if (reel && n >= reel.items.length) {
        setPhase("end");
        mixer.current?.duck(true);
        if (session.current) post({ action: "end", id: session.current });
        return i;
      }
      if (session.current) post({ action: "progress", id: session.current, index: n });
      return n;
    });
  }, [reel]);

  // Stop: instant, calm, no confirmation.
  const stop = () => {
    setLeaving(true);
    mixer.current?.stopVoice();
    mixer.current?.fadeOut(1.4);
    mixer.current = null;
    wake.current?.release().catch(() => {});
    if (session.current && phase !== "end") post({ action: "end", id: session.current, byStop: true });
    session.current = null;
    setTimeout(() => {
      setPhase("stopped");
      setLeaving(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }, 1400);
  };

  useEffect(() => {
    if (phase !== "end") return;
    if (preview.current) {
      const t = setTimeout(() => {
        mixer.current?.close();
        setPhase("begin");
        setTimeout(() => beginRef.current(), 50);
      }, 6000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => mixer.current?.fadeOut(8), 20000);
    return () => clearTimeout(t);
  }, [phase]);

  const name = elder?.name ?? "";

  return (
    <div className={`es es-${theme}${leaving ? " es-leaving" : ""}`}>
      <div className="es-anchor" aria-live="polite">
        <p className="es-anchor-main">{name ? `${name}, you are at home.` : "You are at home."}</p>
        <p className="es-anchor-time">{now ? dayInWords(now) : " "}</p>
      </div>

      {(phase === "begin" || phase === "stopped") && (
        <button className="es-begin" onClick={begin}>
          <span className="es-begin-hello">
            {phase === "stopped" ? `Rest now, ${name}.` : `Good ${partOfDay(now ?? new Date())}, ${name}.`}
          </span>
          <span className="es-begin-sub">
            {phase === "stopped" ? "Your family's photos are here whenever you like." : "Your family has sent you their photos."}
          </span>
          <span className="es-begin-btn">{phase === "stopped" ? "Show the photos again" : "Begin"}</span>
        </button>
      )}

      {phase === "reel" && reel && (
        <Stage
          items={reel.items}
          index={index}
          sizes={sizes}
          mixer={mixer}
          slow={slow}
          onDone={next}
          sessionId={session}
          elder={elder}
        />
      )}

      {phase === "end" && reel && <CallCard reel={reel} />}

      {(phase === "reel" || phase === "end") && (
        <button className="es-stop" onClick={stop}>
          Stop
        </button>
      )}
    </div>
  );
}

function fit(size: Size | undefined, maxW: number, maxH: number) {
  const ar = size ? size.w / size.h : 1.6;
  let w = maxW, h = maxW / ar;
  if (h > maxH) {
    h = maxH;
    w = maxH * ar;
  }
  return { w, h };
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const on = () => setVp({ w: innerWidth, h: innerHeight });
    on();
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return vp;
}

const PANS = ["kb-a", "kb-b", "kb-c", "kb-d"];

function Stage({
  items,
  index,
  sizes,
  mixer,
  slow,
  onDone,
  sessionId,
  elder,
}: {
  elder: Person | null;
  items: ReelItem[];
  index: number;
  sizes: Record<string, Size>;
  mixer: React.RefObject<Mixer | null>;
  slow: number;
  onDone: () => void;
  sessionId: React.RefObject<string | null>;
}) {
  const vp = useViewport();
  const item = items[index];
  const [caption, setCaption] = useState<{ title: string; line: string }>({ title: "", line: "" });
  const [voiceOn, setVoiceOn] = useState(false);
  const [step, setStep] = useState(0);
  const answered = useRef(false);
  const top = vp.h < 700 ? 84 : 110;
  const bottom = vp.h < 700 ? 190 : 250;

  // Photo items: caption, voice letter, then hold.
  useEffect(() => {
    if (item.type !== "photo" && item.type !== "orient") return;
    let alive = true;
    setCaption({ title: item.title, line: item.line });
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      const rest = Math.max(HOLD_MS * slow - (Date.now() - started), 2500);
      timer = setTimeout(() => alive && onDone(), rest);
    };
    if (item.voice && mixer.current) {
      const v = item.voice;
      const t = setTimeout(async () => {
        if (!alive) return;
        setVoiceOn(true);
        await mixer.current?.playVoice(v.src);
        if (!alive) return;
        setVoiceOn(false);
        finish();
      }, 1400);
      return () => {
        alive = false;
        clearTimeout(t);
        clearTimeout(timer);
        mixer.current?.stopVoice();
        setVoiceOn(false);
      };
    }
    finish();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tell mode: her photos with an open invitation to talk. Silence is fine too.
  const [telling, setTelling] = useState<"no" | "rec" | "thanks">("no");
  const recorder = useRef<MediaRecorder | null>(null);
  const tellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canRecord = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  useEffect(() => {
    if (item.type !== "tell") return;
    setTelling("no");
    setCaption({ title: item.title, line: item.line });
    tellTimer.current = setTimeout(onDone, HOLD_MS * slow * 2);
    return () => {
      if (tellTimer.current) clearTimeout(tellTimer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTelling = async () => {
    if (item.type !== "tell") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (tellTimer.current) clearTimeout(tellTimer.current);
      mixer.current?.duck(true);
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: BlobPart[] = [];
      const started = Date.now();
      const photoId = item.photoId;
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        mixer.current?.duck(false);
        const blob = new Blob(chunks, { type: r.mimeType });
        const f = new FormData();
        f.append("file", new File([blob], "story.webm", { type: blob.type.split(";")[0] }));
        f.append("speakerId", elder?.id ?? "");
        f.append("kind", "story");
        f.append("photoId", photoId);
        f.append("durationS", String(Math.round((Date.now() - started) / 1000)));
        fetch("/api/voice", { method: "POST", body: f }).catch(() => {});
      };
      recorder.current = r;
      r.start();
      setTelling("rec");
      setCaption((c) => ({ ...c, line: "We are listening." }));
      tellTimer.current = setTimeout(() => finishTelling(), 120000);
    } catch {
      // No microphone: the photo simply stays a little longer.
    }
  };
  const finishTelling = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    if (tellTimer.current) clearTimeout(tellTimer.current);
    setTelling("thanks");
    setCaption((c) => ({ ...c, line: `Thank you${elder ? `, ${elder.name}` : ""}. Your family will hear this.` }));
    tellTimer.current = setTimeout(onDone, 5000);
  };

  // Gentle recognition game: hints arrive one at a time. Nothing can go wrong.
  useEffect(() => {
    if (item.type !== "game") return;
    let alive = true;
    answered.current = false;
    setStep(0);
    setCaption({ title: "Who is this?", line: "" });
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    const syllable = item.name.slice(0, item.name.length > 3 ? 2 : 1);
    (async () => {
      await wait(900);
      if (!alive || answered.current) return;
      await mixer.current?.speak("Who is this?");
      await wait(HINT_MS * slow);
      if (!alive || answered.current) return;
      setStep(1);
      setCaption({ title: "Who is this?", line: `Your ${item.relationship}.` });
      await wait(HINT_MS * slow);
      if (!alive || answered.current) return;
      setStep(2);
      setCaption({ title: `${syllable}...`, line: `Your ${item.relationship}.` });
      await wait(HINT_MS * slow);
      if (!alive || answered.current) return;
      if (item.hello) {
        setStep(3);
        setVoiceOn(true);
        await mixer.current?.playVoice(item.hello);
        setVoiceOn(false);
        if (!alive || answered.current) return;
      }
      reveal(item.hello ? 3 : 2);
    })();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      mixer.current?.stopVoice();
      setVoiceOn(false);
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reveal = (hintLevel: number) => {
    if (item.type !== "game" || answered.current) return;
    answered.current = true;
    mixer.current?.stopVoice();
    setVoiceOn(false);
    setStep(4);
    setCaption({ title: `${item.name}, your ${item.relationship}`, line: `Yes, this is ${item.name}.` });
    mixer.current?.speak(`Yes, this is ${item.name}.`);
    if (sessionId.current)
      fetch("/api/recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, personId: item.personId, hintLevel }),
      }).catch(() => {});
    revealTimer.current = setTimeout(onDone, 6500 * slow);
  };
  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, [index]);

  const tap = () => {
    if (item.type === "game" && step < 4) reveal(Math.min(step, 3));
  };

  return (
    <>
      <div className="es-stage" style={{ top, bottom }} onClick={tap}>
        {items.map((it, i) => {
          const b = fit(sizes[it.src], vp.w * 0.9, vp.h - top - bottom);
          const active = i === index;
          // Only the current, previous and next slide are mounted.
          if (Math.abs(i - index) > 1) return null;
          return (
            <div
              key={i}
              className={`es-frame${active ? " is-on" : ""}${it.type === "game" ? " is-game" : ""}`}
              style={{ width: b.w, height: b.h, transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={!active}
            >
              <div
                className={`es-pan ${active ? PANS[i % PANS.length] : ""}`}
                style={{ animationDuration: `${(HOLD_MS * slow + 6000) / 1000}s` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" draggable={false} />
                {it.glow && (
                  <span
                    className="es-glow"
                    style={{
                      left: `${(it.glow.x - it.glow.w * 0.12) * 100}%`,
                      top: `${(it.glow.y - it.glow.h * 0.1) * 100}%`,
                      width: `${it.glow.w * 1.24 * 100}%`,
                      height: `${it.glow.h * 1.2 * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="es-caption" style={{ height: bottom - 30 }} aria-live="polite">
        <p key={`t-${index}-${caption.title}`} className="es-title">
          {caption.title}
        </p>
        <p key={`l-${index}-${caption.line}`} className="es-line">
          {caption.line}
        </p>
        {item.type === "tell" && canRecord && telling !== "thanks" ? (
          <button className={`es-tell${telling === "rec" ? " is-rec" : ""}`} onClick={telling === "rec" ? finishTelling : startTelling}>
            {telling === "rec" ? "I have finished" : "Tell a story"}
          </button>
        ) : (
          <Wave mixer={mixer} on={voiceOn} />
        )}
      </div>
    </>
  );
}

function Wave({ mixer, on }: { mixer: React.RefObject<Mixer | null>; on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let amp = 0;
    const data = new Uint8Array(1024);
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = (cv.width = cv.clientWidth * 2);
      const h = (cv.height = cv.clientHeight * 2);
      ctx.clearRect(0, 0, w, h);
      amp += ((on ? 1 : 0) - amp) * 0.06;
      const an = mixer.current?.analyser;
      if (an) an.getByteTimeDomainData(data);
      ctx.beginPath();
      const n = 160;
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * w;
        const v = an ? (data[Math.floor((i / n) * 1023)] - 128) / 128 : 0;
        const env = Math.sin((i / n) * Math.PI);
        const y = h / 2 + v * h * 0.9 * env * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(232,163,61,${0.25 + 0.75 * amp})`;
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [on, mixer]);
  return <canvas ref={ref} className="es-wave" aria-hidden="true" />;
}

function CallCard({ reel }: { reel: Reel }) {
  const p = reel.callPerson;
  if (!p) return null;
  const href = p.phone ? `tel:${p.phone.replace(/\s/g, "")}` : undefined;
  return (
    <div className="es-end">
      {p.photo && (
        <div className="es-end-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt="" />
        </div>
      )}
      <div className="es-end-copy">
        <p className="es-end-line">That was {p.name}.</p>
        <a className="es-call" href={href} onClick={(e) => !href && e.preventDefault()}>
          Call {p.name}
        </a>
      </div>
    </div>
  );
}
