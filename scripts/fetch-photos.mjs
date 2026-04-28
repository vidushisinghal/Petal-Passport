#!/usr/bin/env node
// Fetch Unsplash photos for every bloom.
//
// Usage:
//   UNSPLASH_ACCESS_KEY=abc node scripts/fetch-photos.mjs
//
// Flags:
//   --only=<id,id>    only fetch these bloom ids
//   --skip-existing   skip blooms that already have hero.jpg
//   --dry-run         log queries but don't download
//   --per-bloom=7     how many photos to keep (1 hero + rest gallery, default 7)
//
// Writes:
//   public/blooms/<id>/hero.jpg
//   public/blooms/<id>/01.jpg … 06.jpg
//   public/blooms/manifest.json   (bloom-id → {heroCredit, galleryCredits[]})

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public", "blooms");
const BLOOMS_JSON = path.join(ROOT, "petal_passport_blooms.json");
const MANIFEST_PATH = path.join(ROOT, "lib", "generated", "photos-manifest.json");

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error("❌ UNSPLASH_ACCESS_KEY not set. Get one at https://unsplash.com/developers");
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const only = flag("only")?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
const skipExisting = has("skip-existing");
const dryRun = has("dry-run");
const perBloom = Number(flag("per-bloom") ?? 4);  // 1 hero + 3 gallery
const limit = flag("limit") ? Number(flag("limit")) : null;  // cap per run for hourly batching

const blooms = JSON.parse(fs.readFileSync(BLOOMS_JSON, "utf-8"));
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

const manifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
  : {};

// Per-bloom query overrides for names that Unsplash doesn't index well.
// (Local-language names, scientific names, or regional terms.)
const QUERY_OVERRIDES = {
  "fuji-shibazakura": "moss phlox flowers",
  "pohutukawa-nz": "pohutukawa",
  "munnar-neelakurinji": "purple wildflowers hills",
  "sri-lanka-kadupul": "night blooming cereus",
  "madeira-bird-of-paradise": "strelitzia flower",
  "rio-ipe": "yellow trumpet tree",
  "sao-paulo-ipe-roxo": "purple trumpet tree",
  "spider-lily-japan": "red spider lily",
  "kangaroo-paw-perth": "kangaroo paw flower",
  "ladakh-wildflowers": "alpine wildflowers himalaya",
  "valley-flowers": "himalayan wildflowers meadow",
  "olympic-wildflowers": "alpine meadow wildflowers",
  "wildflowers-colorado": "rocky mountain wildflowers",
  "swiss-meadows": "alpine meadow",
  "lake-baikal-edelweiss": "edelweiss",
  "atacama-bloom": "atacama desert bloom",
  "namaqualand-daisies": "namaqualand daisies",
  "cape-fynbos": "king protea fynbos",
  "tulip-cape-town": "king protea",
  "rice-terraces-bali": "frangipani flower",
  "south-africa-frangipani": "frangipani",
  "darwin-flame-trees": "royal poinciana flame tree",
  "ha-giang-peach": "peach blossom",
  "anza-borrego-wildflowers": "desert wildflowers superbloom",
  "savannah-magnolia": "southern magnolia flower",
  "valensole-sunflowers": "sunflower field provence",
  "kozani-saffron": "saffron crocus",
  "morges-tulips": "tulips lake geneva",
  "harare-jacaranda": "jacaranda tree",
  "socotra-desert-rose": "adenium desert rose",
  "madagascar-baobab": "baobab tree madagascar",
  "korea-plum": "plum blossom",
  "luoping-canola": "canola flower field",
  "jeju-canola": "canola flower",
  "wuhan-magnolia": "magnolia flower",
  "nanjing-plum": "plum blossom",
  "udaipur-lotus": "pink lotus",
  "dal-lake-lotus": "pink lotus",
  "lotus-vietnam": "lotus flower",
  "chiang-mai-orchid": "orchids",
  "costa-rica-orchids": "orchids",
};

// Flower-dominant query. Unsplash keyword search returns flower-focused photos
// when the flower name leads; adding location drags results toward the place
// rather than the bloom.
function queryFor(bloom) {
  if (QUERY_OVERRIDES[bloom.id]) return QUERY_OVERRIDES[bloom.id];
  return bloom.flower
    .replace(/\(.*?\)/g, "")
    .split(/\s+&\s+|\s+and\s+|\s*,\s*/i)[0]
    .replace(/\s+(Flowers|Gardens|Festival|Trees|Blossoms)$/i, (m) =>
      // Keep "Blossoms" — important for cherry/plum/almond. Drop the others.
      /Blossoms/i.test(m) ? m : ""
    )
    .trim();
}

async function searchUnsplash(query, count) {
  // Pull a bigger pool than we need — gives us variety in the gallery and lets
  // us rank the hero by ordering, not by being stuck with the first match.
  const poolSize = Math.max(count * 2, 15);
  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(query)}` +
    `&per_page=${poolSize}` +
    `&orientation=landscape` +
    `&content_filter=high` +
    `&order_by=relevant`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });
  if (!res.ok) throw new Error(`Unsplash search failed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.results ?? [];
}

async function triggerDownload(photo) {
  // Per Unsplash API guidelines — hit this endpoint when you actually use a photo.
  await fetch(photo.links.download_location, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  }).catch(() => {});
}

async function downloadSized(photo, width, out) {
  const url = `${photo.urls.raw}&w=${width}&q=75&fm=jpg&fit=crop&crop=entropy`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  return buf.length;
}

function creditFor(photo) {
  return {
    photographer: photo.user?.name ?? "Unknown",
    photographerUrl: photo.user?.links?.html ?? null,
    source: "Unsplash",
    sourceUrl: photo.links?.html ?? null,
    unsplashId: photo.id,
  };
}

let target = blooms.filter((b) => (only ? only.includes(b.id) : true));
if (skipExisting) {
  target = target.filter((b) => !manifest[b.id]);
}
if (limit) {
  target = target.slice(0, limit);
}
console.log(`Fetching for ${target.length} bloom${target.length === 1 ? "" : "s"}…`);

let ok = 0;
let skipped = 0;
let failed = 0;

for (const bloom of target) {
  const dir = path.join(PUBLIC_DIR, bloom.id);
  const heroPath = path.join(dir, "hero.jpg");

  if (skipExisting && fs.existsSync(heroPath)) {
    console.log(`↷ ${bloom.id} (exists)`);
    skipped++;
    continue;
  }

  const query = queryFor(bloom);
  console.log(`→ ${bloom.id}  "${query}"`);
  if (dryRun) continue;

  try {
    const photos = await searchUnsplash(query, perBloom);
    if (photos.length === 0) {
      console.warn(`  ⚠ no results — try a broader query manually`);
      failed++;
      continue;
    }

    fs.mkdirSync(dir, { recursive: true });

    const [heroPhoto, ...gallery] = photos;
    await triggerDownload(heroPhoto);
    const heroSize = await downloadSized(heroPhoto, 1600, heroPath);
    console.log(`  ✓ hero ${(heroSize / 1024).toFixed(0)}KB — ${heroPhoto.user.name}`);

    const galleryCredits = [];
    for (let i = 0; i < gallery.length && i < 3; i++) {
      const photo = gallery[i];
      await triggerDownload(photo);
      const out = path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`);
      const size = await downloadSized(photo, 800, out);
      galleryCredits.push(creditFor(photo));
      console.log(`  ✓ ${String(i + 1).padStart(2, "0")} ${(size / 1024).toFixed(0)}KB — ${photo.user.name}`);
      // light throttle — Unsplash production rate is generous but be nice
      await new Promise((r) => setTimeout(r, 150));
    }

    manifest[bloom.id] = {
      heroCredit: creditFor(heroPhoto),
      galleryCredits,
      query,
      fetchedAt: new Date().toISOString(),
    };

    // write manifest after each bloom so a crash doesn't lose progress
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    ok++;
  } catch (e) {
    console.error(`  ✗ ${bloom.id}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} downloaded, ${skipped} skipped, ${failed} failed.`);
if (failed > 0) {
  console.log(`\nRe-run failed blooms with:  node scripts/fetch-photos.mjs --only=<id,id>`);
}
