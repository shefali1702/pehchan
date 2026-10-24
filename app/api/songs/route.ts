import { db, save, uid } from "@/lib/server/store";
import { saveUpload } from "@/lib/server/media";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an audio file." }, { status: 400 });
  const title = String(form.get("title") ?? "").trim();
  if (!title) return Response.json({ error: "Add the song's name so the family can find it later." }, { status: 400 });
  const saved = await saveUpload(file, "song_");
  const d = db();
  const song = {
    id: uid("song_"),
    title,
    artist: String(form.get("artist") ?? "").trim() || undefined,
    year: Number(form.get("year")) || undefined,
    language: String(form.get("language") ?? "").trim() || undefined,
    src: saved.src,
    addedBy: String(form.get("addedBy") ?? ""),
  };
  d.songs.push(song);
  save();
  return Response.json(song);
}
