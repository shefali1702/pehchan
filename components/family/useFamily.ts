"use client";

import { useCallback, useEffect, useState } from "react";
import type { AvoidItem, MoodLog, Notification, Person, Photo, RecognitionEvent, Session, Song, VoiceLetter } from "@/lib/types";

export type FamilyData = {
  elderId: string;
  people: Person[];
  photos: Photo[];
  voiceLetters: VoiceLetter[];
  songs: Song[];
  avoid: AvoidItem[];
  sessions: Session[];
  moods: MoodLog[];
  recognition: RecognitionEvent[];
  notifications: Notification[];
};

export function useFamily() {
  const [data, setData] = useState<FamilyData | null>(null);
  const reload = useCallback(async () => {
    const d = await fetch("/api/family", { cache: "no-store" }).then((r) => r.json());
    setData(d);
    return d as FamilyData;
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, reload };
}

/** Live events from the server, with automatic reconnect. */
export function useEvents(handlers: Record<string, (data: never) => void>) {
  useEffect(() => {
    let es: EventSource | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;
    const open = () => {
      es = new EventSource("/api/events");
      for (const [name, fn] of Object.entries(handlers)) {
        es.addEventListener(name, (e) => fn(JSON.parse((e as MessageEvent).data) as never));
      }
      es.onerror = () => {
        es?.close();
        if (!closed) retry = setTimeout(open, 2000);
      };
    };
    open();
    return () => {
      closed = true;
      clearTimeout(retry);
      es?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export async function postJSON(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || "Something went wrong. Try again.");
  return json;
}

export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function chime() {
  try {
    const c = new AudioContext();
    [659.25, 987.77].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = c.currentTime + i * 0.16;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 1);
    });
    setTimeout(() => c.close(), 1500);
  } catch {}
}
