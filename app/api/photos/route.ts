import { db, save, uid, emit } from "@/lib/server/store";
import { saveUpload } from "@/lib/server/media";
import type { FaceTag, Photo } from "@/lib/types";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a photo to upload." }, { status: 400 });
  const uploadedBy = String(form.get("uploadedBy") ?? "");
  const d = db();
  const uploader = d.people.find((p) => p.id === uploadedBy);
  if (!uploader) return Response.json({ error: "Pick who you are first." }, { status: 400 });
  if (!uploader.consent?.face) return Response.json({ error: "Give consent for your face to appear before adding photos." }, { status: 403 });

  const saved = await saveUpload(file, "photo_");
  const faces = JSON.parse(String(form.get("faces") ?? "[]")) as FaceTag[];
  const year = Number(form.get("year")) || undefined;
  const photo: Photo = {
    id: uid("ph_"),
    src: saved.src,
    year,
    place: String(form.get("place") ?? "").trim() || undefined,
    story: String(form.get("story") ?? "").trim() || undefined,
    caption: String(form.get("caption") ?? "").trim() || undefined,
    faces: faces.filter((f) => d.people.some((p) => p.id === f.personId)),
    uploadedBy,
    createdAt: new Date().toISOString(),
  };
  d.photos.push(photo);
  save();
  emit("family", { kind: "photo", id: photo.id });
  return Response.json(photo);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const d = db();
  d.photos = d.photos.filter((p) => p.id !== id);
  save();
  return Response.json({ ok: true });
}
