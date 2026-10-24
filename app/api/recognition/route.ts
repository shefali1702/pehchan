import { db, save, uid, emit } from "@/lib/server/store";

export async function POST(req: Request) {
  const { sessionId, personId, hintLevel } = await req.json();
  const d = db();
  const ev = { id: uid("rc_"), sessionId, personId, hintLevel: Math.max(0, Math.min(3, Number(hintLevel) || 0)), at: new Date().toISOString() };
  d.recognition.push(ev);
  save();
  emit("recognition", ev);
  return Response.json(ev);
}
