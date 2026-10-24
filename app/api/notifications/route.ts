import { db } from "@/lib/server/store";

export const dynamic = "force-dynamic";

// Polling fallback for the inbox when the live stream drops.
export async function GET(req: Request) {
  const person = new URL(req.url).searchParams.get("person");
  return Response.json(db().notifications.filter((n) => n.toPersonId === person).slice(-30));
}
