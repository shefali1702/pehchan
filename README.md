# Pehchan (पहचान)

A family's own photos and real recorded voices, made into a gentle daily reel for someone living with dementia. Full product context is in `PEHCHAN_CONTEXT_1.md`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dev server listens on your network too, so phones on the same Wi-Fi can open `http://<laptop-ip>:3000`. The Demo tab shows the exact address.

| Page | Who | Device |
| --- | --- | --- |
| `/` and the tabs | Judges, visitors | Anything |
| `/screen` | Kamla (the elder) | Tablet, TV or projector, landscape |
| `/family` | Riya, Arjun, Meera | Phone |
| `/care` | Meera, the caregiver at home | Phone or tablet |
| `/consent` | Kamla, with family beside her | Laptop or tablet |
| `/care/summary` | Her doctor | Print or PDF |

`/screen?theme=evening` or `?theme=morning` forces a theme. Otherwise it follows the clock, from the hour set on the caregiver page (17:00 by default).

The caregiver page switches her reel between three modes: **Tell** (she talks over her photos and whoever added the photo can hear it), **Remember** (the reel with the recognition game) and **Comfort** (nothing to tap, slower). Relatives can record "Evening words" that open her evening reel.

## Offline at the venue

The offline cache only runs in a production build:

```bash
npm run build
npm start
```

Open `/screen` once while online. After that its photos, voices and last reel are served from the cache if the Wi-Fi drops. This was not verified in a real browser yet; check it in Chrome by turning Wi-Fi off and reloading `/screen`.

## Before the demo

1. In `/family`, each relative picks their name and gives consent.
2. Add at least three real photos and tag the faces. Once three real photos exist, the drawn placeholders leave the reel.
3. Record a voice letter and a short "It's me, Riya!" hello for the game.
4. Optional: add a song in the You tab (one you have the right to play). Without one, a soft tanpura-style drone plays.
5. Add a phone number in the You tab so "Call Riya" dials.
6. Rehearse, then press "Reset demo data" on the Demo tab only if you want to start from the seed again. Reset deletes every upload.

Microphones need a secure page: record on the laptop at `http://localhost:3000/family`, or serve over HTTPS for phones (`npx next dev --experimental-https -H 0.0.0.0`, then accept the certificate warning on the phone).

## Optional keys

Copy `.env.example` to `.env.local`.

- `ANTHROPIC_API_KEY`: captions are written by Claude, then checked against the same rules as family captions. Without it, a rule-based writer is used.
- `SARVAM_API_KEY`: voice letters get a transcript from Sarvam Saaras. Without it, they are stored without one. This path has not been tested against the live API.

## How it is built

- Next.js 16, React 19, TypeScript, plain CSS with tokens in `app/globals.css`.
- Data lives in `data/db.json` and `data/uploads/` (git-ignored), seeded from `seed/sharma-family/seed.json`. `supabase/migrations/` holds the schema for moving to Supabase later.
- Live updates use server-sent events (`/api/events`), with polling as a fallback in the inbox.
- Face detection uses Human, served from `public/vendor/human`, so it works offline. Face prints stay in the browser's IndexedDB.
- The neutral narrator for "Who is this?" uses the browser's speech voice. Family voices are only ever real recordings.

## Not done yet

Read-aloud and voice control on her screen, WhatsApp contributions, Supabase in place of the local store, a test with an older relative, and the launch checklist (custom domain, privacy policy, terms).
