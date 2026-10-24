import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/server/store";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic",
  webm: "audio/webm", ogg: "audio/ogg", m4a: "audio/mp4", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf",
};

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safe = path.basename(file);
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) return new Response("Not found", { status: 404 });
  const buf = fs.readFileSync(full);
  const type = TYPES[safe.split(".").pop()!.toLowerCase()] ?? "application/octet-stream";
  const size = buf.length;
  // Range support so Safari will play audio.
  const range = req.headers.get("range");
  if (range) {
    const [s, e] = range.replace("bytes=", "").split("-");
    const start = Number(s);
    const end = e ? Number(e) : size - 1;
    return new Response(buf.subarray(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
      },
    });
  }
  return new Response(buf, {
    headers: { "Content-Type": type, "Content-Length": String(size), "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
