import fs from "node:fs";

// Sarvam Saaras speech-to-text. Only runs when SARVAM_API_KEY is set.
export async function transcribe(filePath: string, type: string): Promise<string | null> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) return null;
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(filePath)], { type }), filePath.split("/").pop());
  form.append("model", process.env.SARVAM_STT_MODEL || "saaras:v3");
  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": key },
    body: form,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { transcript?: string };
  return json.transcript ?? null;
}
