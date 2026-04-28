#!/usr/bin/env node
// Generate static .mp3 narrations for every bloom, locally, once.
//
// Usage:
//   node scripts/pregen-audio.mjs                 (resumes — skips files already present)
//   node scripts/pregen-audio.mjs --force         (regenerates everything, even existing files)
//   node scripts/pregen-audio.mjs --only=id1,id2  (just these blooms)
//
// Output: public/audio/<bloom-id>.mp3
// Total cost: ~108k chars across 100 stories. Plan accordingly.
// On Pro plan ($99 = 500k chars/mo) this uses ~22% of monthly quota.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "audio");

// Load env
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split(/\r?\n/)
    .forEach((line) => {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    });
}

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID;
if (!KEY || !VOICE) {
  console.error("✗ ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const has = (n) => args.includes(`--${n}`);

const force = has("force");
const only = flag("only")?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;

const blooms = JSON.parse(fs.readFileSync(path.join(ROOT, "petal_passport_blooms.json"), "utf-8"));
fs.mkdirSync(OUT_DIR, { recursive: true });

const target = blooms.filter((b) => (only ? only.includes(b.id) : true));

// Estimate before generating anything that costs money.
let toGen = target;
if (!force) toGen = toGen.filter((b) => !fs.existsSync(path.join(OUT_DIR, `${b.id}.mp3`)));
const estChars = toGen.reduce((s, b) => s + b.story.length, 0);

console.log(`Plan: generate ${toGen.length} of ${target.length} bloom${target.length === 1 ? "" : "s"} → public/audio/`);
console.log(`Estimated quota: ~${estChars.toLocaleString()} characters`);
console.log(`Voice ID:  ${VOICE.slice(0, 6)}…${VOICE.slice(-4)}`);
console.log(`Settings:  stability=0.5  similarity_boost=0.75  style=0  speaker_boost=on`);
console.log(`Model:     eleven_multilingual_v2`);
console.log("");

// SAFEGUARD: anything > 5 files needs explicit --i-confirm flag, so we never
// silently burn through 100 files based on a typo or a stale assumption.
if (toGen.length > 5 && !args.includes("--i-confirm")) {
  console.error(`✗ Refusing to generate ${toGen.length} files without --i-confirm flag.`);
  console.error(`  Re-run with this exact command if you really mean it:`);
  console.error(`    node scripts/pregen-audio.mjs ${args.join(" ")} --i-confirm`);
  console.error(`  Or run smaller batches with --only=<id,id>.`);
  process.exit(2);
}
console.log("");

let ok = 0;
let skipped = 0;
let failed = 0;
let totalChars = 0;
let totalBytes = 0;

for (let i = 0; i < target.length; i++) {
  const b = target[i];
  const out = path.join(OUT_DIR, `${b.id}.mp3`);
  const prefix = `[${String(i + 1).padStart(3)}/${target.length}] ${b.id}`;

  if (!force && fs.existsSync(out)) {
    console.log(`${prefix}  ↷ skip (exists, ${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
    skipped++;
    continue;
  }

  const chars = b.story.length;
  totalChars += chars;
  process.stdout.write(`${prefix}  ${chars}c → `);

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?optimize_streaming_latency=2`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: b.story,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          // Tuned for Pro Voice Clone — different from Instant Clone settings.
          // PVC is already accurate; pushing similarity_boost to 1.0 introduces
          // artifacts. 0.75 is ElevenLabs' recommended value for PVC.
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "?");
      console.log(`✗ HTTP ${res.status}  ${msg.slice(0, 80)}`);
      failed++;
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(out, buf);
    totalBytes += buf.length;
    console.log(`✓ ${(buf.length / 1024).toFixed(0)}KB`);
    ok++;

    // Tiny throttle so we don't blast their API
    await new Promise((r) => setTimeout(r, 200));
  } catch (e) {
    console.log(`✗ ${e.message}`);
    failed++;
  }
}

console.log("");
console.log(`Done. ${ok} generated, ${skipped} skipped, ${failed} failed.`);
console.log(`Total characters used: ~${totalChars.toLocaleString()}`);
console.log(`Total audio size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
if (failed > 0) {
  console.log(`\nRetry failed blooms with:  node scripts/pregen-audio.mjs --only=<id,id>`);
}
