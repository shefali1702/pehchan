import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/server/store";
import { checkCaption, writeCaption } from "@/lib/captions";
import type { FaceTag } from "@/lib/types";

const SYSTEM = `You write captions for photos shown to an older person living with dementia.
Rules:
- Use only the facts supplied. Never add details, feelings, places, dates or events that were not given.
- One or two short sentences in plain English, starting "This is" (or "This was" when someone in the photo has died).
- No questions. Never use the words remember, recall, forgot or "can you".
- No medical words.
- At most about 15 words per sentence.
- relationship_line is "<name>, your <relationship>" for one person, or the names joined with "and" for several.`;

export async function POST(req: Request) {
  const body = (await req.json()) as { story?: string; year?: number; place?: string; faces?: FaceTag[]; text?: string };
  const d = db();

  // Check mode: the family wrote their own caption.
  if (body.text) return Response.json({ issues: checkCaption(body.text) });

  const photo = { story: body.story, year: body.year, place: body.place, faces: body.faces ?? [] };
  const fallback = writeCaption(photo, d.people);
  const people = photo.faces
    .map((f) => d.people.find((p) => p.id === f.personId))
    .filter(Boolean)
    .map((p) => ({ name: p!.name, relationship: p!.relationship, deceased: !!p!.isDeceased }));

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ caption: fallback.line, relationship_line: fallback.title, source: "rules" });
  }

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { caption: { type: "string" }, relationship_line: { type: "string" } },
            required: ["caption", "relationship_line"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: JSON.stringify({ family_note: body.story ?? "", year: body.year ?? null, place: body.place ?? null, people, language: "English" }),
        },
      ],
    });
    if (res.stop_reason === "refusal") throw new Error("refusal");
    const text = res.content.find((b) => b.type === "text");
    const out = JSON.parse(text && text.type === "text" ? text.text : "{}") as { caption?: string; relationship_line?: string };
    // The model's output goes through the same rules as a family caption.
    if (!out.caption || checkCaption(out.caption).length) throw new Error("caption failed checks");
    return Response.json({ ...out, source: "claude" });
  } catch {
    return Response.json({ caption: fallback.line, relationship_line: fallback.title, source: "rules" });
  }
}
