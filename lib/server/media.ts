import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, uid } from "./store";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

export async function saveUpload(file: File, prefix: string) {
  const type = file.type.split(";")[0];
  const ext = EXT[type] ?? (file.name.split(".").pop() || "bin");
  const name = `${uid(prefix)}.${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { name, src: `/api/media/${name}`, type };
}
