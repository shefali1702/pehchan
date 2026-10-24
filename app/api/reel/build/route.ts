import { db } from "@/lib/server/store";
import { buildReel } from "@/lib/server/reel";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Response.json(buildReel(db(), { evening: !!body.evening }));
}
