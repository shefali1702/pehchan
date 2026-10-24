import fs from "node:fs";
import path from "node:path";
import { db, save, uid, emit, UPLOAD_DIR } from "@/lib/server/store";
import { saveUpload } from "@/lib/server/media";
import { transcribe } from "@/lib/server/sarvam";
import type { VoiceLetter } from "@/lib/types";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No recording received. Record again." }, { status: 400 });
  const speakerId = String(form.get("speakerId") ?? "");
  const d = db();
  const speaker = d.people.find((p) => p.id === speakerId);
  if (!speaker) return Response.json({ error: "Pick who you are first." }, { status: 400 });
  // The elder's own stories are covered by her living consent.
  if (!speaker.isElder && !speaker.consent?.voice) return Response.json({ error: "Give consent for your voice to be played before recording." }, { status: 403 });

  const saved = await saveUpload(file, "voice_");
  const letter: VoiceLetter = {
    id: uid("vl_"),
    speakerId,
    photoId: String(form.get("photoId") ?? "") || null,
    kind: (["hello", "orientation", "story"].includes(String(form.get("kind"))) ? form.get("kind") : "letter") as VoiceLetter["kind"],
    src: saved.src,
    durationS: Number(form.get("durationS")) || 0,
    createdAt: new Date().toISOString(),
  };
  d.voiceLetters.push(letter);

  // When she tells a story about a photo, whoever added it gets to hear it.
  if (letter.kind === "story" && letter.photoId) {
    const photo = d.photos.find((p) => p.id === letter.photoId);
    const to = d.people.find((p) => p.id === photo?.uploadedBy);
    if (photo && to && !to.isElder) {
      const n = {
        id: uid("nt_"),
        toPersonId: to.id,
        kind: "story" as const,
        text: `${to.callsElder || speaker.name} told a story about your photo.`,
        photo: photo.placeholder ? undefined : photo.src,
        audio: letter.src,
        at: new Date().toISOString(),
      };
      d.notifications.push(n);
      emit("notification", n);
    }
  }
  save();
  emit("family", { kind: "voice", id: letter.id });

  // Transcript is a nice-to-have; never block the upload on it.
  transcribe(path.join(UPLOAD_DIR, saved.name), saved.type)
    .then((t) => {
      if (!t) return;
      const v = db().voiceLetters.find((x) => x.id === letter.id);
      if (v) { v.transcript = t; save(); }
    })
    .catch(() => {});
  return Response.json(letter);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const d = db();
  const v = d.voiceLetters.find((x) => x.id === id);
  if (v) fs.rmSync(path.join(UPLOAD_DIR, path.basename(v.src)), { force: true });
  d.voiceLetters = d.voiceLetters.filter((x) => x.id !== id);
  save();
  return Response.json({ ok: true });
}
