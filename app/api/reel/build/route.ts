import { db } from "@/lib/server/store";
import { buildReel } from "@/lib/server/reel";

export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(buildReel(db()));
}
