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
  if (!speaker.consent?.voice) return Response.json({ error: "Give consent for your voice to be played before recording." }, { status: 403 });

  const saved = await saveUpload(file, "voice_");
  const letter: VoiceLetter = {
    id: uid("vl_"),
    speakerId,
    photoId: String(form.get("photoId") ?? "") || null,
    kind: form.get("kind") === "hello" ? "hello" : "letter",
    src: saved.src,
    durationS: Number(form.get("durationS")) || 0,
    createdAt: new Date().toISOString(),
  };
  d.voiceLetters.push(letter);
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
