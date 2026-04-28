import manifest from "./generated/photos-manifest.json";

export interface PhotoCredit {
  photographer: string;
  photographerUrl: string | null;
  source: string;
  sourceUrl: string | null;
  unsplashId?: string;
}

export interface BloomPhotos {
  heroCredit: PhotoCredit;
  galleryCredits: PhotoCredit[];
  query?: string;
  fetchedAt?: string;
}

const m = manifest as Record<string, BloomPhotos>;

export function hasHero(bloomId: string): boolean {
  return Boolean(m[bloomId]?.heroCredit);
}

export function heroSrc(bloomId: string): string | null {
  return m[bloomId]?.heroCredit ? `/blooms/${bloomId}/hero.jpg` : null;
}

export function gallerySrcs(bloomId: string): string[] {
  const credits = m[bloomId]?.galleryCredits ?? [];
  return credits.map((_, i) => `/blooms/${bloomId}/${String(i + 1).padStart(2, "0")}.jpg`);
}

export function photosFor(bloomId: string): BloomPhotos | null {
  return m[bloomId] ?? null;
}

export function allManifest(): Record<string, BloomPhotos> {
  return m;
}
