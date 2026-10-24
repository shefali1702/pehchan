import type { Person, Photo } from "@/lib/types";

// Words that turn a caption into a memory test or a clinical statement.
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\bremember(s|ed|ing)?\b/i, why: "Asks her to remember. Say \"This is...\" instead." },
  { pattern: /\brecall(s|ed|ing)?\b/i, why: "Asks her to recall. Say \"This is...\" instead." },
  { pattern: /\bforg(e|o)t(ten)?\b/i, why: "Mentions forgetting." },
  { pattern: /\bcan you\b/i, why: "Asks her to perform." },
  { pattern: /\btry again\b/i, why: "Implies she got something wrong." },
  { pattern: /\?/, why: "Questions can feel like a test. Use a statement." },
  { pattern: /\b(dementia|alzheimer'?s|memory loss|patient|diagnos\w*|therapy|treatment)\b/i, why: "Medical words do not belong on her screen." },
];

export function checkCaption(text: string): string[] {
  return BANNED.filter((b) => b.pattern.test(text)).map((b) => b.why);
}

export function relationshipLine(p: Person) {
  return p.relationship ? `${p.name}, your ${p.relationship}` : p.name;
}

/** Rule-based caption writer. Uses only the facts given, never adds any. */
export function writeCaption(photo: Pick<Photo, "story" | "year" | "place" | "faces">, people: Person[]) {
  const tagged = photo.faces
    .map((f) => people.find((p) => p.id === f.personId))
    .filter((p): p is Person => !!p && !p.isElder);
  const anyDeceased = tagged.some((p) => p.isDeceased);
  const names = tagged.map((p) => p.name);
  const who =
    names.length === 0 ? "" : names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

  const title = tagged.length === 1 ? relationshipLine(tagged[0]) : who || "Your family";

  let story = (photo.story ?? "").trim().replace(/[.!?]+$/, "");
  const place = photo.place?.trim();
  if (place && story && !story.toLowerCase().includes(place.toLowerCase())) story += ` at ${place}`;
  if (!story && place) story = place;

  const verb = anyDeceased ? "was" : "is";
  let line = "";
  if (story) {
    line = `This ${verb} ${lowerFirst(story)}`;
    if (photo.year && !story.includes(String(photo.year))) line += ` in ${photo.year}`;
    line += ".";
  } else if (who) {
    line = `This ${verb} ${who}${photo.year ? `, ${photo.year}` : ""}.`;
  } else if (photo.year) {
    line = `This ${verb} ${photo.year}.`;
  }
  return { title, line };
}

function lowerFirst(s: string) {
  // Keep proper nouns like "Diwali" capitalised; only lower common openers.
  return /^(The|A|An|Our|Your|My)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}
