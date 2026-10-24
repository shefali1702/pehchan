import { db, save, uid, emit } from "@/lib/server/store";
import type { Notification } from "@/lib/types";

// Log "she smiled" and tell everyone whose photo or voice was in the reel.
export async function POST(req: Request) {
  const { sessionId } = await req.json().catch(() => ({}));
  const d = db();
  const s = (sessionId && d.sessions.find((x) => x.id === sessionId)) || d.sessions.at(-1);
  if (!s) return Response.json({ error: "Start a reel on Kamla's screen first." }, { status: 400 });

  d.moods.push({ id: uid("md_"), sessionId: s.id, moment: "during", mood: "smiled", at: new Date().toISOString() });

  // Items shown so far (or the whole reel if it has finished).
  const shown = s.endedAt ? s.reel.items : s.reel.items.slice(0, s.index + 1);
  const byPerson = new Map<string, string | undefined>();
  for (const item of shown) {
    if (item.type !== "photo") continue;
    for (const c of item.contributors) byPerson.set(c, item.placeholder ? undefined : item.src);
  }
  const sent: Notification[] = [];
  for (const [pid, photo] of byPerson) {
    const p = d.people.find((x) => x.id === pid);
    if (!p || p.isElder || p.isDeceased) continue;
    const elder = d.people.find((x) => x.id === d.elderId);
    const n: Notification = {
      id: uid("nt_"),
      toPersonId: pid,
      kind: "smiled",
      text: `${p.callsElder || elder?.name} smiled at your photo today.`,
      photo,
      at: new Date().toISOString(),
    };
    d.notifications.push(n);
    sent.push(n);
    emit("notification", n);
  }
  save();
  return Response.json({ sent: sent.map((n) => ({ to: d.people.find((p) => p.id === n.toPersonId)?.name, id: n.id })) });
}
