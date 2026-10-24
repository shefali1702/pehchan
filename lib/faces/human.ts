// On-device face detection and matching with Human. The library and its models
// are served from /vendor so the demo works without internet. Face prints
// (embeddings) live only in this browser's IndexedDB, never on the server.

type HumanFace = { box: [number, number, number, number]; embedding?: number[]; score: number };
type HumanLib = {
  load: () => Promise<void>;
  warmup: () => Promise<unknown>;
  detect: (input: HTMLImageElement | HTMLCanvasElement) => Promise<{ face: HumanFace[] }>;
  match: { similarity: (a: number[], b: number[]) => number };
};

let instance: Promise<HumanLib> | null = null;

export function loadHuman(): Promise<HumanLib> {
  if (instance) return instance;
  instance = (async () => {
    // Bypass the bundler: load the prebuilt ESM file as-is.
    const mod = await (new Function("u", "return import(u)") as (u: string) => Promise<{ Human: new (c: object) => HumanLib }>)(
      "/vendor/human/human.esm.js",
    );
    const human = new mod.Human({
      modelBasePath: "/vendor/human/models/",
      backend: "webgl",
      debug: false,
      cacheSensitivity: 0,
      face: {
        enabled: true,
        detector: { rotation: false, maxDetected: 12, minConfidence: 0.35, return: false },
        mesh: { enabled: true },
        iris: { enabled: false },
        description: { enabled: true },
        emotion: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false },
        attention: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      object: { enabled: false },
      gesture: { enabled: false },
      segmentation: { enabled: false },
    });
    await human.load();
    return human;
  })();
  instance.catch(() => (instance = null));
  return instance;
}

export type DetectedFace = {
  bbox: { x: number; y: number; w: number; h: number };
  embedding?: number[];
};

export async function detectFaces(img: HTMLImageElement): Promise<DetectedFace[]> {
  const human = await loadHuman();
  // Work on a downscaled copy for speed.
  const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  const res = await human.detect(c);
  return res.face.map((f) => ({
    bbox: { x: f.box[0] / c.width, y: f.box[1] / c.height, w: f.box[2] / c.width, h: f.box[3] / c.height },
    embedding: f.embedding,
  }));
}

// ---- local face prints ----

const DB_NAME = "pehchan-faces";

function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("prints", { autoIncrement: true });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function rememberFace(personId: string, embedding: number[]) {
  const d = await idb();
  d.transaction("prints", "readwrite").objectStore("prints").add({ personId, embedding });
}

async function allPrints(): Promise<{ personId: string; embedding: number[] }[]> {
  const d = await idb();
  return new Promise((res) => {
    const r = d.transaction("prints").objectStore("prints").getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => res([]);
  });
}

export async function suggestPerson(embedding?: number[]): Promise<string | null> {
  if (!embedding?.length) return null;
  const human = await loadHuman();
  let best: { id: string; s: number } | null = null;
  for (const p of await allPrints()) {
    const s = human.match.similarity(embedding, p.embedding);
    if (s > 0.55 && (!best || s > best.s)) best = { id: p.personId, s };
  }
  return best?.id ?? null;
}
