import { db } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const d = db();
  return Response.json({
    elderId: d.elderId,
    people: d.people,
    photos: d.photos,
    voiceLetters: d.voiceLetters,
    songs: d.songs,
    avoid: d.avoid,
    sessions: d.sessions.slice(-10),
    moods: d.moods.slice(-50),
    recognition: d.recognition.slice(-100),
    notifications: d.notifications.slice(-50),
  });
}
