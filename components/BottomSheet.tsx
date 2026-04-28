"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Bloom } from "@/lib/blooms";
import { getStatus, formatSeason } from "@/lib/status";
import { emojiFor } from "@/lib/emoji";
import HeroCard from "./HeroCard";

export default function BottomSheet({
  bloom,
  onClose,
  today,
}: {
  bloom: Bloom | null;
  onClose: () => void;
  today: Date;
}) {
  const [visible, setVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const DRAG_THRESHOLD = 10; // px of vertical movement before we treat it as a drag

  useEffect(() => {
    if (bloom) {
      setVisible(true);
      setDragOffset(0);
      dragging.current = false;
    } else {
      setVisible(false);
    }
  }, [bloom]);

  if (!bloom) return null;
  const info = getStatus(bloom, today);

  const handleTouchStart = (e: React.TouchEvent) => {
    // If the touch started on something interactive (link/button), leave it alone.
    // Drag tracking on the whole sheet otherwise steals the click.
    if ((e.target as HTMLElement).closest("a, button")) {
      startY.current = null;
      dragging.current = false;
      return;
    }
    startY.current = e.touches[0].clientY;
    dragging.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    // Ignore micro-movements that accompany a tap. Only commit to a drag past the threshold.
    if (!dragging.current) {
      if (dy > DRAG_THRESHOLD) dragging.current = true;
      else return;
    }
    if (dy > 0) setDragOffset(dy);
  };
  const handleTouchEnd = () => {
    if (dragging.current && dragOffset > 100) {
      onClose();
    } else {
      setDragOffset(0);
    }
    startY.current = null;
    dragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end" onClick={onClose}>
      <div
        className={`absolute inset-0 bg-charcoal transition-opacity duration-300 ${
          visible ? "opacity-20" : "opacity-0"
        }`}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full"
        style={{
          transform: `translate3d(0, ${dragOffset}px, 0)`,
          transition:
            startY.current === null || !dragging.current
              ? "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)"
              : "none",
          touchAction: "pan-y",
        }}
      >
        <div className="animate-sheet-up rounded-t-[28px] border border-border bg-surface shadow-bloom-lg">
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>

          <HeroCard bloom={bloom} height={120} rounded="top" />

          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[26px] leading-tight text-charcoal">{bloom.flower}</h2>
                <p className="mt-0.5 text-sm text-warm-gray">{bloom.location}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white"
                style={{ background: info.color }}
              >
                {info.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-warm-gray">
              <span className="text-base leading-none">{emojiFor(bloom.flower)}</span>
              <span>{formatSeason(bloom)}</span>
            </div>

            {bloom.isPersonal && (
              <div className="flex items-center gap-2 rounded-xl bg-[#FFF6EA] px-3 py-2 text-sm text-terracotta">
                <span>♥</span>
                <span className="font-serif italic">I was here</span>
              </div>
            )}

            <Link
              href={`/bloom/${bloom.id}`}
              prefetch
              className="mt-2 flex items-center justify-between rounded-2xl bg-botanical px-5 py-4 text-surface transition hover:bg-botanical-light active:scale-[0.99] active:bg-botanical-light"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="font-serif text-[17px]">Explore this bloom</span>
              <span className="text-xl transition-transform group-active:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
