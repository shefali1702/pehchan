import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import type { DB } from "@/lib/types";

// Local demo store: one JSON file plus an uploads folder. Swap for Supabase
// (see supabase/migrations) once the team has a project.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const SEED_FILE = path.join(process.cwd(), "seed", "sharma-family", "seed.json");

type Globals = { __pehchanDb?: DB; __pehchanBus?: EventEmitter };
const g = globalThis as unknown as Globals;

function seed(): DB {
  const raw = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  return {
    elderId: raw.elderId,
    people: raw.people,
    photos: raw.photos.map((p: DB["photos"][number], i: number) => ({
      ...p,
      createdAt: new Date(Date.now() - (raw.photos.length - i) * 86400000).toISOString(),
    })),
    voiceLetters: raw.voiceLetters ?? [],
    songs: raw.songs ?? [],
    avoid: raw.avoid ?? [],
    sessions: [],
    moods: [],
    recognition: [],
    notifications: [],
    settings: { ...DEFAULT_SETTINGS },
    consents: [],
  };
}

export const DEFAULT_SETTINGS = { mode: "remember" as const, photos: 6, eveningFrom: 17 };

export function db(): DB {
  if (g.__pehchanDb) return g.__pehchanDb;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    g.__pehchanDb = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
    // Older demo files predate these fields.
    g.__pehchanDb.settings ??= { ...DEFAULT_SETTINGS };
    g.__pehchanDb.consents ??= [];
  } else {
    g.__pehchanDb = seed();
    save();
  }
  return g.__pehchanDb;
}

export function save() {
  if (!g.__pehchanDb) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(g.__pehchanDb, null, 2));
}

export function reset() {
  fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
  fs.rmSync(DB_FILE, { force: true });
  g.__pehchanDb = undefined;
  db();
}

export function bus(): EventEmitter {
  if (!g.__pehchanBus) {
    g.__pehchanBus = new EventEmitter();
    g.__pehchanBus.setMaxListeners(200);
  }
  return g.__pehchanBus;
}

export function emit(event: string, data: unknown) {
  bus().emit("event", { event, data });
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function person(id: string | null | undefined) {
  return db().people.find((p) => p.id === id);
}
