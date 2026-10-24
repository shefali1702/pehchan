import type { DB, Photo, Reel, ReelItem } from "@/lib/types";
import { writeCaption } from "@/lib/captions";
import { uid } from "./store";

// Spaced retrieval: a game face returns after 1, then 3 more photos.
const GAME_GAPS = [1, 3];

function avgHint(d: DB, personId: string) {
  const ev = d.recognition.filter((r) => r.personId === personId).slice(-10);
  return ev.length ? ev.reduce((a, r) => a + r.hintLevel, 0) / ev.length : 0;
}

function excluded(d: DB, photo: Photo) {
  const text = `${photo.story ?? ""} ${photo.place ?? ""} ${photo.caption ?? ""}`.toLowerCase();
  for (const a of d.avoid) {
    if (a.personId && photo.faces.some((f) => f.personId === a.personId)) return true;
    if (a.text && text.includes(a.text.toLowerCase())) return true;
  }
  // Any photo linked to "upset" twice is held back.
  const upsetSessions = d.moods.filter((m) => m.mood === "upset").map((m) => m.sessionId);
  const upsetCount = d.sessions.filter(
    (s) => upsetSessions.includes(s.id) && s.reel.items.some((i) => i.type === "photo" && i.photoId === photo.id),
  ).length;
  if (upsetCount >= 2) return true;
  // Content only appears once its contributor has consented.
  const uploader = d.people.find((p) => p.id === photo.uploadedBy);
  if (uploader && uploader.consent && !uploader.consent.face) return true;
  return false;
}

export function buildReel(d: DB, opts: { evening?: boolean } = {}): Reel {
  const { mode, photos: MAX_ITEMS } = d.settings;
  const elder = d.people.find((p) => p.id === d.elderId)!;
  const bumpFrom = (elder.birthYear ?? 1950) + 10;
  const bumpTo = (elder.birthYear ?? 1950) + 30;

  let pool = d.photos.filter((p) => !excluded(d, p));
  // Once the family has added a few real photos, the drawn placeholders step aside.
  if (pool.filter((p) => !p.placeholder).length >= 3) pool = pool.filter((p) => !p.placeholder);
  const chosen: Photo[] = [];
  const take = (p?: Photo) => p && !chosen.includes(p) && chosen.length < MAX_ITEMS && chosen.push(p);

  // 1. One photo from her reminiscence-bump years.
  take(pool.find((p) => p.year && p.year >= bumpFrom && p.year <= bumpTo));
  // 2. Faces that needed more hints lately.
  const fading = [...d.people]
    .filter((p) => !p.isElder && !p.isDeceased)
    .sort((a, b) => avgHint(d, b.id) - avgHint(d, a.id));
  for (const f of fading) take(pool.find((p) => p.faces.some((x) => x.personId === f.id) && !chosen.includes(p)));
  // 3. Recently added, then 4. variety (whatever is left).
  const recent = [...pool].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const p of recent) take(p);

  // Real uploads first in the slideshow order, placeholders after them.
  const ordered = [chosen[0], ...chosen.slice(1).sort((a, b) => Number(!!a.placeholder) - Number(!!b.placeholder))].filter(
    Boolean,
  ) as Photo[];

  if (mode === "tell") {
    // Her own stories: photos with an open invitation, no game, no voices over hers.
    const items: ReelItem[] = ordered.map((photo) => {
      const main = photo.faces.find((f) => !d.people.find((p) => p.id === f.personId)?.isElder);
      return {
        type: "tell",
        photoId: photo.id,
        src: photo.src,
        placeholder: photo.placeholder,
        title: writeCaption(photo, d.people).title,
        line: "Tell us about this photo, whenever you like.",
        glow: main?.bbox,
      };
    });
    return finish(d, elder.id, mode, withOrientation(d, items, opts.evening), pool, [], bumpFrom, bumpTo);
  }

  const photoItems: ReelItem[] = ordered.map((photo) => {
    const auto = writeCaption(photo, d.people);
    const people = photo.faces.map((f) => f.personId);
    const voice =
      d.voiceLetters.filter((v) => v.kind === "letter" && v.photoId === photo.id).at(-1) ??
      d.voiceLetters.filter((v) => v.kind === "letter" && !v.photoId && people.includes(v.speakerId)).at(-1) ??
      null;
    const contributors = [...new Set([photo.uploadedBy, voice?.speakerId].filter(Boolean) as string[])];
    const main = photo.faces.find((f) => !d.people.find((p) => p.id === f.personId)?.isElder);
    return {
      type: "photo",
      photoId: photo.id,
      src: photo.src,
      placeholder: photo.placeholder,
      title: auto.title,
      line: photo.caption?.trim() || auto.line,
      glow: main?.bbox,
      voice: voice ? { id: voice.id, src: voice.src, speakerId: voice.speakerId } : null,
      contributors,
    };
  });

  // The gentle game: one living person, never someone who has died.
  const candidates = d.people.filter(
    (p) => !p.isElder && !p.isDeceased && d.photos.some((ph) => ph.faces.length === 1 && ph.faces[0].personId === p.id),
  );
  candidates.sort((a, b) => {
    const ha = d.voiceLetters.some((v) => v.kind === "hello" && v.speakerId === a.id) ? 1 : 0;
    const hb = d.voiceLetters.some((v) => v.kind === "hello" && v.speakerId === b.id) ? 1 : 0;
    return hb - ha || avgHint(d, b.id) - avgHint(d, a.id);
  });
  const target = candidates[0];
  const items: ReelItem[] = [...photoItems];
  // Comfort mode asks nothing of her: no game.
  if (mode === "remember" && target && photoItems.length >= 2) {
    const solo = [...pool]
      .filter((ph) => ph.faces.length === 1 && ph.faces[0].personId === target.id)
      .sort((a, b) => Number(!!a.placeholder) - Number(!!b.placeholder))[0];
    const hello = d.voiceLetters.filter((v) => v.kind === "hello" && v.speakerId === target.id).at(-1);
    if (solo) {
      const game: ReelItem = {
        type: "game",
        personId: target.id,
        name: target.name,
        relationship: target.relationship,
        src: solo.src,
        placeholder: solo.placeholder,
        glow: solo.faces[0].bbox,
        hello: hello?.src ?? null,
      };
      let at = 0;
      for (const gap of GAME_GAPS) {
        at += gap;
        if (at > items.filter((i) => i.type === "photo").length) break;
        // insert after `at` photos
        let seen = 0;
        const idx = items.findIndex((i) => i.type === "photo" && ++seen === at);
        items.splice(idx + 1, 0, game);
      }
    }
  }

  return finish(d, elder.id, mode, withOrientation(d, items, opts.evening), pool, photoItems, bumpFrom, bumpTo);
}

// An evening reel opens with a familiar voice saying where she is.
function withOrientation(d: DB, items: ReelItem[], evening?: boolean): ReelItem[] {
  if (!evening) return items;
  const clip = d.voiceLetters.filter((v) => v.kind === "orientation").at(-1);
  const speaker = d.people.find((p) => p.id === clip?.speakerId);
  if (!clip || !speaker || speaker.isDeceased) return items;
  const photo =
    d.photos.find((ph) => ph.faces.length === 1 && ph.faces[0].personId === speaker.id && !ph.placeholder) ??
    d.photos.find((ph) => ph.faces.length === 1 && ph.faces[0].personId === speaker.id);
  if (!photo) return items;
  return [
    {
      type: "orient",
      src: photo.src,
      placeholder: photo.placeholder,
      title: `${speaker.name}, your ${speaker.relationship}`,
      line: "You are at home. It is evening.",
      glow: photo.faces[0].bbox,
      voice: { id: clip.id, src: clip.src, speakerId: speaker.id },
    },
    ...items,
  ];
}

function finish(
  d: DB,
  elderId: string,
  mode: Reel["mode"],
  items: ReelItem[],
  pool: Photo[],
  photoItems: ReelItem[],
  bumpFrom: number,
  bumpTo: number,
): Reel {
  // Song: family songs from her ages 10 to 30 first, then any family song.
  const song =
    d.songs.find((s) => s.year && s.year >= bumpFrom && s.year <= bumpTo) ?? d.songs.at(-1) ?? null;

  // End by pointing to a real person: the last living contributor shown.
  const lastPhoto = [...photoItems].reverse().find((i) => i.type === "photo") as Extract<ReelItem, { type: "photo" }> | undefined;
  const lastAny = [...items].reverse().find((i) => i.type === "tell") as Extract<ReelItem, { type: "tell" }> | undefined;
  const lastUploader = d.photos.find((p) => p.id === lastAny?.photoId)?.uploadedBy;
  const callId =
    lastPhoto?.contributors.find((c) => !d.people.find((p) => p.id === c)?.isDeceased) ??
    (lastUploader && !d.people.find((p) => p.id === lastUploader)?.isDeceased ? lastUploader : undefined) ??
    d.people.find((p) => !p.isElder && !p.isDeceased)?.id;
  const call = d.people.find((p) => p.id === callId);
  const callPhoto =
    pool.find((ph) => ph.faces.length === 1 && ph.faces[0].personId === call?.id && !ph.placeholder) ??
    pool.find((ph) => ph.faces.length === 1 && ph.faces[0].personId === call?.id);

  return {
    id: uid("reel_"),
    date: new Date().toISOString().slice(0, 10),
    elderId,
    mode,
    items,
    song: song ? { src: song.src, title: song.title } : null,
    callPerson: call ? { id: call.id, name: call.name, phone: call.phone, photo: callPhoto?.src } : null,
  };
}
