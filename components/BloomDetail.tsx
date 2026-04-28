"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Bloom } from "@/lib/blooms";
import { getStatus, formatSeason, formatBestTime } from "@/lib/status";
import { emojiFor } from "@/lib/emoji";
import { gallerySrcs, photosFor } from "@/lib/photos";
import HeroCard from "./HeroCard";
import AudioPlayer from "./AudioPlayer";

const NARRATOR_NAME = process.env.NEXT_PUBLIC_NARRATOR_NAME || "Me";

export default function BloomDetail({ bloom }: { bloom: Bloom }) {
  const today = useMemo(() => new Date(), []);
  const info = getStatus(bloom, today);
  const accent = bloom.accentColor || "#2D5016";

  const paragraphs = bloom.story.split(/\n+/).filter(Boolean);

  return (
    <main className="min-h-screen bg-cream">
      <article className="mx-auto max-w-[640px] pb-20">
        {/* 1. Hero */}
        <div className="relative animate-fade-in">
          <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
            <HeroCard bloom={bloom} height="100%" rounded="none" />

            <Link
              href="/"
              aria-label="Back to map"
              className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-surface backdrop-blur transition hover:bg-black/45"
            >
              ←
            </Link>

            <span
              className="absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white shadow-sm"
              style={{ background: info.color }}
            >
              {info.label}
            </span>

            {bloom.isPersonal && (
              <span className="absolute right-4 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-surface shadow">
                ♥
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 pb-5 text-surface">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-85">{bloom.country}</p>
              <h1 className="mt-1 font-serif text-[34px] leading-tight drop-shadow">{bloom.flower}</h1>
              <p className="mt-1 text-sm opacity-90">{bloom.location}</p>
            </div>
          </div>
        </div>

        <div className="px-5">
          {/* 2. Audio player */}
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <AudioPlayer bloom={bloom} narrator={NARRATOR_NAME} />
          </div>

          {/* 3. Story */}
          <section className="mt-10 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h2 className="font-serif text-[22px] text-botanical">The story</h2>
            <div className="mt-4 space-y-4 text-[16px] leading-[1.75] text-charcoal/90">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* 4. Photo gallery */}
          <section className="mt-10 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <h2 className="mb-4 font-serif text-[22px] text-botanical">A closer look</h2>
            <GallerySection bloom={bloom} />
          </section>

          {/* 5. Details grid */}
          <section className="mt-10 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <h2 className="mb-4 font-serif text-[22px] text-botanical">Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <DetailTile label="Best time" value={formatBestTime(bloom)} />
              <DetailTile label="Season" value={formatSeason(bloom)} />
              <DetailTile label="Varieties" value={bloom.variety} />
              <DetailTile label="Country" value={bloom.country} />
            </div>
          </section>

          {/* 6. Insider tip */}
          <section className="mt-10 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <div
              className="rounded-2xl bg-surface p-5 shadow-bloom"
              style={{ borderLeft: `4px solid ${accent}` }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>
                Insider tip
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-charcoal/90">{bloom.tip}</p>
            </div>
          </section>

          {/* 7. Personal note */}
          {bloom.isPersonal && bloom.personalNote && (
            <section className="mt-10 animate-fade-up" style={{ animationDelay: "360ms" }}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, #FFF6EA 0%, #F9EDD6 100%)",
                  border: "1.5px dashed #C4652E",
                }}
              >
                <div className="mb-3 flex items-center gap-2 text-terracotta">
                  <span className="text-lg">♥</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em]">From me to you</span>
                </div>
                <p className="font-serif italic text-[18px] leading-relaxed text-charcoal/90">
                  {bloom.personalNote}
                </p>
              </div>
            </section>
          )}

          {/* 8. Footer */}
          <footer className="mt-14 flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: "420ms" }}>
            <PhotoCredits bloom={bloom} />
            <p className="font-serif italic text-warm-gray">built with love for mom</p>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-botanical transition hover:border-botanical/40"
            >
              <span>←</span>
              <span>Back to the map</span>
            </Link>
          </footer>
        </div>
      </article>
    </main>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-alt p-4">
      <p className="text-[9.5px] font-medium uppercase tracking-[0.2em] text-warm-gray">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-charcoal">{value}</p>
    </div>
  );
}

function GallerySection({ bloom }: { bloom: Bloom }) {
  // Always try 3 conventional paths. Anything that 404s gets hidden via onError.
  const candidates = [1, 2, 3].map((i) => `/blooms/${bloom.id}/${String(i).padStart(2, "0")}.jpg`);
  return (
    <div className="gallery-scroll -mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
      {candidates.map((src, i) => (
        <GalleryItem key={src} src={src} bloom={bloom} index={i} />
      ))}
    </div>
  );
}

function GalleryItem({ src, bloom, index }: { src: string; bloom: Bloom; index: number }) {
  // Server-side detection of file presence isn't possible here, so the client
  // tries the image and falls back to a tinted gradient tile on error.
  return (
    <div className="relative h-[160px] w-[220px] shrink-0 overflow-hidden rounded-2xl shadow-bloom">
      <GalleryTile bloom={bloom} index={index} />
      <img
        src={src}
        alt={`${bloom.flower} ${index + 1}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function GalleryTile({ bloom, index }: { bloom: Bloom; index: number }) {
  const accent = bloom.accentColor || "#2D5016";
  const tints = [
    `linear-gradient(135deg, ${accent}, #2D5016)`,
    `linear-gradient(155deg, #4A7C2E, ${accent})`,
    `linear-gradient(135deg, #C4652E, ${accent})`,
    `linear-gradient(120deg, ${accent}, #8A8480)`,
    `linear-gradient(150deg, #2D5016, #C4652E)`,
    `linear-gradient(135deg, #F4F1EA, ${accent})`,
  ];
  return (
    <div
      className="relative h-[140px] w-[200px] shrink-0 overflow-hidden rounded-2xl shadow-bloom"
      style={{ background: tints[index % tints.length] }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 9px)",
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl opacity-80">{emojiFor(bloom.flower)}</div>
    </div>
  );
}

function PhotoCredits({ bloom }: { bloom: Bloom }) {
  const p = photosFor(bloom.id);
  if (!p) return null;
  const all = [p.heroCredit, ...p.galleryCredits];
  const unique = Array.from(new Map(all.map((c) => [c.photographer, c])).values());
  return (
    <div className="w-full max-w-md text-center text-[10.5px] leading-relaxed text-warm-gray-light">
      <span className="mr-1 uppercase tracking-[0.16em] text-warm-gray">Photos</span>
      {unique.map((c, i) => (
        <span key={i}>
          {i > 0 ? ", " : " "}
          {c.photographerUrl ? (
            <a
              href={c.photographerUrl + "?utm_source=petal_passport&utm_medium=referral"}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-2 hover:text-terracotta"
            >
              {c.photographer}
            </a>
          ) : (
            c.photographer
          )}
        </span>
      ))}
      <span>
        {" "}
        via{" "}
        <a
          href="https://unsplash.com?utm_source=petal_passport&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border underline-offset-2 hover:text-terracotta"
        >
          Unsplash
        </a>
      </span>
    </div>
  );
}
