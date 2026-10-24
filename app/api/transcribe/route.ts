import fs from "node:fs";
import path from "node:path";
import { db, save, UPLOAD_DIR } from "@/lib/server/store";
import { transcribe } from "@/lib/server/sarvam";

// Re-run transcription for a stored voice letter.
export async function POST(req: Request) {
  const { id } = await req.json();
  const v = db().voiceLetters.find((x) => x.id === id);
  if (!v) return Response.json({ error: "No such voice letter." }, { status: 404 });
  const file = path.join(UPLOAD_DIR, path.basename(v.src));
  if (!fs.existsSync(file)) return Response.json({ error: "Recording file is missing." }, { status: 404 });
  if (!process.env.SARVAM_API_KEY) return Response.json({ error: "Transcription is off. Add SARVAM_API_KEY to turn it on." }, { status: 501 });
  const t = await transcribe(file, "audio/webm");
  if (t) { v.transcript = t; save(); }
  return Response.json({ transcript: t });
}
