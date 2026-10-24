import { db, save, uid, emit } from "@/lib/server/store";
import type { Reel, Session } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const d = db();
  const live = [...d.sessions].reverse().find((s) => !s.endedAt) ?? null;
  return Response.json({ live, last: d.sessions.at(-1) ?? null });
}

export async function POST(req: Request) {
  const body = await req.json();
  const d = db();
  if (body.action === "start") {
    const s: Session = { id: uid("s_"), reel: body.reel as Reel, startedAt: new Date().toISOString(), index: 0 };
    // Close any session left open by a reload.
    for (const o of d.sessions) if (!o.endedAt) o.endedAt = s.startedAt;
    d.sessions.push(s);
    save();
    emit("session", { kind: "start", session: s });
    return Response.json(s);
  }
  const s = d.sessions.find((x) => x.id === body.id);
  if (!s) return Response.json({ error: "No such session." }, { status: 404 });
  if (body.action === "progress") {
    s.index = Number(body.index) || 0;
    emit("session", { kind: "progress", session: s });
  } else if (body.action === "end") {
    s.endedAt = new Date().toISOString();
    s.endedByStop = !!body.byStop;
    save();
    emit("session", { kind: "end", session: s });
  }
  return Response.json(s);
}
