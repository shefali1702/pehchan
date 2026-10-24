import { reset, emit } from "@/lib/server/store";

export async function POST() {
  reset();
  emit("family", { kind: "reset" });
  return Response.json({ ok: true });
}
