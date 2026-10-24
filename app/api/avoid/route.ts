import { db, save, uid } from "@/lib/server/store";

export async function POST(req: Request) {
  const { text, personId } = await req.json();
  if (!text && !personId) return Response.json({ error: "Write a topic or pick a person." }, { status: 400 });
  const d = db();
  const item = { id: uid("av_"), text: String(text ?? "").trim(), personId: personId || null };
  d.avoid.push(item);
  save();
  return Response.json(item);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const d = db();
  d.avoid = d.avoid.filter((a) => a.id !== id);
  save();
  return Response.json({ ok: true });
}
