import { db, save, uid } from "@/lib/server/store";
import { saveUpload } from "@/lib/server/media";
import type { Consent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(db().consents);
}

// Living consent recordings and guardian documents.
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Nothing was recorded. Try again." }, { status: 400 });
  const kind = String(form.get("kind")) === "guardian" ? "guardian" : "living";
  const d = db();
  const saved = await saveUpload(file, kind === "guardian" ? "doc_" : "consent_");
  const c: Consent = {
    id: uid("cs_"),
    personId: String(form.get("personId") || d.elderId),
    kind,
    prompt: String(form.get("prompt") ?? "") || undefined,
    recording: kind === "living" ? saved.src : undefined,
    documentPath: kind === "guardian" ? saved.src : undefined,
    createdAt: new Date().toISOString(),
  };
  d.consents.push(c);
  save();
  return Response.json(c);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const c = db().consents.find((x) => x.id === id);
  if (c) {
    c.withdrawnAt = new Date().toISOString();
    save();
  }
  return Response.json({ ok: true });
}
