import { db, save, emit } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(db().settings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const s = db().settings;
  if (["tell", "remember", "comfort"].includes(body.mode)) s.mode = body.mode;
  if (Number.isFinite(body.photos)) s.photos = Math.min(8, Math.max(4, Math.round(body.photos)));
  if (Number.isFinite(body.eveningFrom)) s.eveningFrom = Math.min(23, Math.max(12, Math.round(body.eveningFrom)));
  save();
  emit("settings", s);
  return Response.json(s);
}
