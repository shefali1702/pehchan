export type Mood = "calm" | "happy" | "confused" | "upset" | "smiled";

export interface Person {
  id: string;
  name: string;
  /** Relationship to the elder, as a noun: "granddaughter", "husband". */
  relationship: string;
  /** What this person calls the elder: "Dadi", "Ma". Used in notifications. */
  callsElder: string;
  isElder?: boolean;
  isDeceased?: boolean;
  birthYear?: number;
  phone?: string;
  consent?: { face: boolean; voice: boolean; at: string } | null;
}

export interface FaceTag {
  personId: string;
  /** Normalised 0..1 box within the photo. */
  bbox: { x: number; y: number; w: number; h: number };
}

export interface Photo {
  id: string;
  src: string;
  year?: number;
  place?: string;
  story?: string;
  caption?: string;
  faces: FaceTag[];
  uploadedBy: string;
  createdAt: string;
  placeholder?: boolean;
}

export interface VoiceLetter {
  id: string;
  speakerId: string;
  photoId?: string | null;
  /** "hello" clips ("It's me, Riya!") are used by the recognition game. */
  kind: "letter" | "hello";
  src: string;
  durationS: number;
  transcript?: string;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  year?: number;
  language?: string;
  src: string;
  addedBy: string;
}

export interface AvoidItem {
  id: string;
  text: string;
  personId?: string | null;
}

export type ReelItem =
  | {
      type: "photo";
      photoId: string;
      src: string;
      placeholder?: boolean;
      title: string;
      line: string;
      glow?: FaceTag["bbox"];
      voice?: { id: string; src: string; speakerId: string } | null;
      contributors: string[];
    }
  | {
      type: "game";
      personId: string;
      name: string;
      relationship: string;
      src: string;
      placeholder?: boolean;
      glow?: FaceTag["bbox"];
      hello?: string | null;
    };

export interface Reel {
  id: string;
  date: string;
  elderId: string;
  items: ReelItem[];
  song?: { src: string; title: string } | null;
  callPerson?: { id: string; name: string; phone?: string; photo?: string } | null;
}

export interface Session {
  id: string;
  reel: Reel;
  startedAt: string;
  endedAt?: string;
  endedByStop?: boolean;
  index: number;
}

export interface MoodLog {
  id: string;
  sessionId?: string | null;
  moment: "before" | "after" | "during";
  mood: Mood;
  at: string;
}

export interface RecognitionEvent {
  id: string;
  sessionId: string;
  personId: string;
  hintLevel: number;
  at: string;
}

export interface Notification {
  id: string;
  toPersonId: string;
  kind: "smiled";
  text: string;
  photo?: string;
  at: string;
}

export interface DB {
  elderId: string;
  people: Person[];
  photos: Photo[];
  voiceLetters: VoiceLetter[];
  songs: Song[];
  avoid: AvoidItem[];
  sessions: Session[];
  moods: MoodLog[];
  recognition: RecognitionEvent[];
  notifications: Notification[];
}
