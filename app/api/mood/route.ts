import { db, save, uid, emit } from "@/lib/server/store";
import type { MoodLog } from "@/lib/types";

const MOODS = ["calm", "happy", "confused", "upset", "smiled"];

export async function POST(req: Request) {
  const { sessionId, moment, mood } = await req.json();
  if (!MOODS.includes(mood)) return Response.json({ error: "Unknown mood." }, { status: 400 });
  const d = db();
  const log: MoodLog = { id: uid("md_"), sessionId: sessionId || null, moment: moment ?? "during", mood, at: new Date().toISOString() };
  d.moods.push(log);
  save();
  emit("mood", log);
  return Response.json(log);
}
