// Music and voice layers for the elder screen. Music ducks to about 20% while a
// family voice or the narrator speaks, then comes back.

const MUSIC_LEVEL = 0.5;
const DUCK = 0.2; // suggested default

export class Mixer {
  ctx: AudioContext;
  master: GainNode;
  music: GainNode;
  analyser: AnalyserNode;
  private stops: (() => void)[] = [];
  private songEl: HTMLAudioElement | null = null;
  private voiceEl: HTMLAudioElement | null = null;

  /** Muted mixers drive the silent preview inside the home page's tablet. */
  constructor(private muted = false) {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    if (muted) this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.connect(this.master);
  }

  startMusic(src?: string | null) {
    if (src) {
      const el = new Audio(src);
      el.loop = true;
      this.ctx.createMediaElementSource(el).connect(this.music);
      el.play().catch(() => {});
      this.songEl = el;
    } else {
      this.drone();
    }
    this.music.gain.setTargetAtTime(MUSIC_LEVEL, this.ctx.currentTime, 2.5);
  }

  /** Placeholder until the family adds a song: a soft tanpura-like drone on Sa and Pa. */
  private drone() {
    const c = this.ctx;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1100;
    const bus = c.createGain();
    bus.gain.value = 0.22;
    filter.connect(bus).connect(this.music);
    const sa = 130.81;
    const pattern = [sa * 1.5, sa * 2, sa * 2, sa];
    let k = 0;
    const pluck = () => {
      const t = c.currentTime;
      const f = pattern[k++ % pattern.length];
      for (const mult of [1, 2, 3.01]) {
        const o = c.createOscillator();
        o.type = "triangle";
        o.frequency.value = f * mult;
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.32 / mult, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 3.6);
        o.connect(g).connect(filter);
        o.start(t);
        o.stop(t + 3.7);
      }
    };
    pluck();
    const id = setInterval(pluck, 1500);
    const hum = c.createOscillator();
    hum.frequency.value = sa / 2;
    const hg = c.createGain();
    hg.gain.value = 0.06;
    hum.connect(hg).connect(filter);
    hum.start();
    this.stops.push(() => {
      clearInterval(id);
      hum.stop();
    });
  }

  duck(on: boolean) {
    this.music.gain.setTargetAtTime(on ? MUSIC_LEVEL * DUCK : MUSIC_LEVEL, this.ctx.currentTime, 0.35);
  }

  playVoice(src: string): Promise<void> {
    return new Promise((resolve) => {
      const el = new Audio(src);
      this.voiceEl = el;
      try {
        this.ctx.createMediaElementSource(el).connect(this.analyser);
      } catch {}
      const done = () => {
        this.duck(false);
        resolve();
      };
      el.onended = done;
      el.onerror = done;
      this.duck(true);
      el.play().catch(done);
    });
  }

  stopVoice() {
    this.voiceEl?.pause();
    this.voiceEl = null;
    speechSynthesis.cancel();
    this.duck(false);
  }

  /** Neutral narrator. Clearly not a family member. */
  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.muted) return void setTimeout(resolve, 1500);
      if (!("speechSynthesis" in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      u.voice = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
      u.rate = 0.82;
      u.pitch = 1;
      const finish = () => {
        clearTimeout(t);
        this.duck(false);
        resolve();
      };
      const t = setTimeout(finish, 6000);
      u.onend = finish;
      u.onerror = finish;
      this.duck(true);
      speechSynthesis.speak(u);
    });
  }

  fadeOut(seconds: number) {
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + seconds);
    setTimeout(() => this.close(), seconds * 1000 + 200);
  }

  close() {
    this.stops.forEach((s) => s());
    this.stops = [];
    this.songEl?.pause();
    this.voiceEl?.pause();
    speechSynthesis.cancel();
    this.ctx.close().catch(() => {});
  }
}
