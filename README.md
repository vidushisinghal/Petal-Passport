# Petal Passport

A full-screen interactive world map of 100 bloom locations. Only blooms currently in season appear on the map — pins are color-coded by status (peak, starting, ending) with a gentle pulsing glow on peak. Tapping a pin opens a bottom sheet; tapping through opens a detail page with hero, voice narration in a real cloned voice, story, photo gallery, details grid, and an insider tip.

Built as a personal gift, then opened up. Read-only content, no auth, no database, no users to manage.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with custom design tokens (`tailwind.config.ts`)
- **Mapbox GL JS** with `outdoors-v12` base, warmed via runtime paint overrides — water blush-pink, land peach, vegetation soft sage
- **Custom circular pins** built in DOM (no default Mapbox markers)
- **ElevenLabs TTS** for voice narration — pre-generated to static MP3s for production, with a live API fallback for development

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill in the values (see below)
npm run dev
```

### Environment variables

| Key | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | both | Mapbox public token (`pk.…`) |
| `NEXT_PUBLIC_NARRATOR_NAME` | both | First name shown under the play button |
| `ELEVENLABS_API_KEY` | local only | Server-side, only needed when (re)generating audio |
| `ELEVENLABS_VOICE_ID` | local only | The cloned voice's ID |
| `UNSPLASH_ACCESS_KEY` | local only | Only needed when running the photo fetch |
| `DISABLE_LIVE_NARRATION` | **production** | Set to `true` on Vercel to hard-disable the live `/api/narrate` route |

> ⚠️ **Production deploys should NOT have ElevenLabs credentials in env vars.** Set `DISABLE_LIVE_NARRATION=true` instead. All audio is pre-generated as static `.mp3` files in `/public/audio/`. Visitors play those directly; the live API is only for the developer regenerating audio locally.

Without a Mapbox token the home screen shows a cream fallback with a browsable list of active blooms; the rest of the app still works.

## File tour

- `petal_passport_blooms.json` — 100 entries, each with a 150–250 word story
- `lib/blooms.ts`, `lib/status.ts`, `lib/date.ts`, `lib/emoji.ts`, `lib/photos.ts` — data + season math + photo manifest loader
- `lib/generated/photos-manifest.json` — credits map written by the photo fetch
- `app/page.tsx` + `components/MapView.tsx` — map with custom pins
- `components/BottomSheet.tsx` — spring-animated preview
- `app/bloom/[id]/page.tsx` + `components/BloomDetail.tsx` — detail page
- `components/AudioPlayer.tsx` — player with localStorage cache, waveform, 1× / 1.5× / 2× speeds
- `app/api/narrate/route.ts` — ElevenLabs proxy with kill-switch
- `scripts/fetch-photos.mjs` — Unsplash photo downloader
- `scripts/pregen-audio.mjs` — TTS pre-generator (with quota safeguard)
- `scripts/depersonalize.mjs` — one-time content cleanup
- `DESIGN_SKILL.md` — design language and component conventions

## Photos

Photos come from Unsplash, fetched by a one-shot script. The convention:

```
public/blooms/<bloom-id>/
  hero.jpg     # 1600px wide
  01.jpg       # 800px wide
  02.jpg       # 800px wide
  03.jpg       # 800px wide
```

Per-photographer credits render in the detail page footer when present (sourced from `lib/generated/photos-manifest.json`).

### Fetching

```bash
# Resume — skip blooms that already have photos
npm run fetch-photos -- --skip-existing

# Specific blooms only
npm run fetch-photos -- --only=skagit-tulips,ooty-roses

# Hourly batched fetch on demo tier (50 reqs/hour)
bash scripts/hourly-fetch.sh

# Preview the queries that would run
npm run fetch-photos -- --dry-run
```

Demo-tier Unsplash is limited to ~50 requests/hour (~10 blooms). Production tier (free, apply at <https://unsplash.com/oauth/applications>) lifts that to 5000/hour. The hourly-fetch script paces requests for demo tier.

### Personal photos

Drop `hero.jpg`, `01.jpg`, `02.jpg`, `03.jpg` into `public/blooms/<bloom-id>/` and they'll appear automatically. To suppress Unsplash credits for that bloom, delete its entry from `lib/generated/photos-manifest.json`.

## Audio narration

Stories are pre-generated as static MP3 files in `/public/audio/<bloom-id>.mp3`. The `AudioPlayer` component checks for the static file first; only if missing does it fall back to the live ElevenLabs API.

### Voice setup workflow

1. Sign up at <https://elevenlabs.io>
2. Create a **Pro Voice Clone** (Pro Voice Clone is significantly more accurate than Instant Voice Clone, especially for non-American English accents — worth the extra setup time)
3. Copy the voice ID into `.env.local`
4. Pre-generate audio with the safeguard:

```bash
# Generate for specific blooms (no confirm flag needed for ≤5 files)
npm run pregen-audio -- --only=skagit-tulips,hawaii-plumeria

# Generate everything (requires --i-confirm so it can't run by accident)
npm run pregen-audio -- --i-confirm

# Force-regenerate already-existing files
npm run pregen-audio -- --force --i-confirm
```

The script prints the estimated character cost, voice ID prefix, and exact ElevenLabs settings before generating anything. Without `--i-confirm` it refuses to generate more than 5 files at once — a guardrail to avoid silently burning quota on a misconfigured run.

### Voice settings

For Pro Voice Clone, this repo uses:
```js
stability: 0.5
similarity_boost: 0.75
style: 0
use_speaker_boost: true
```

These are tuned for PVC specifically. If you're using Instant Voice Clone (which the model averages toward American English), you may want to push `similarity_boost` toward `1.0` instead — the trade-offs are different.

## Deployment notes (Vercel)

1. Push the repo to GitHub (see below)
2. Import at vercel.com → connect the GitHub repo
3. Set these env vars on Vercel:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `NEXT_PUBLIC_NARRATOR_NAME`
   - `DISABLE_LIVE_NARRATION=true`
4. Do **NOT** set `ELEVENLABS_API_KEY` or `ELEVENLABS_VOICE_ID` on Vercel — keep those local-only

`/public/audio/` and `/public/blooms/` are static assets served via Vercel's CDN. The 100 MP3s and 700 images add up to ~120 MB, well under Vercel's free-tier limits.

## Updating content

- **New blooms come into season automatically** — the active-bloom filter runs in the browser at page load using `new Date()`. No build or redeploy needed for the map to refresh on May 1 or any future date.
- **Replacing a bloom's photos** — drop new files into `public/blooms/<id>/`, redeploy. To remove Unsplash credit attribution, delete the entry from `lib/generated/photos-manifest.json`.
- **Replacing audio for a bloom** — `npm run pregen-audio -- --force --only=<id>`, then redeploy.

## License & attribution

- Photos: licensed via Unsplash, attribution in detail page footers
- Stories: written by hand for this app
- Voice: cloned from the project author
- Code: all yours
