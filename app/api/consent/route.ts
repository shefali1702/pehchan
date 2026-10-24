import fs from "node:fs";
import path from "node:path";
import { db, save, emit, UPLOAD_DIR } from "@/lib/server/store";

// Grant or withdraw a contributor's consent. Withdrawal removes their content.
export async function POST(req: Request) {
  const { personId, face, voice, phone } = await req.json();
  const d = db();
  const p = d.people.find((x) => x.id === personId);
  if (!p || p.isElder || p.isDeceased) return Response.json({ error: "Unknown person." }, { status: 400 });
  if (typeof phone === "string") p.phone = phone.trim();
  if (typeof face === "boolean" || typeof voice === "boolean") {
    p.consent = { face: !!face, voice: !!voice, at: new Date().toISOString() };
    if (!face) {
      const gone = d.photos.filter((ph) => ph.uploadedBy === p.id || ph.faces.some((f) => f.personId === p.id));
      for (const ph of gone) if (!ph.placeholder) fs.rmSync(path.join(UPLOAD_DIR, path.basename(ph.src)), { force: true });
      d.photos = d.photos.filter((ph) => !gone.includes(ph));
    }
    if (!voice) {
      for (const v of d.voiceLetters.filter((v) => v.speakerId === p.id)) fs.rmSync(path.join(UPLOAD_DIR, path.basename(v.src)), { force: true });
      d.voiceLetters = d.voiceLetters.filter((v) => v.speakerId !== p.id);
    }
  }
  save();
  emit("family", { kind: "consent", id: p.id });
  return Response.json(p);
}
