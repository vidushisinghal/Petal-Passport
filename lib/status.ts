import type { Bloom } from "./blooms";
import { isInRange, weeksUntil, weeksSince } from "./date";

export type BloomStatus = "peak" | "starting" | "ending" | "upcoming";

export interface BloomStatusInfo {
  status: BloomStatus;
  label: string;
  color: string;
  isActive: boolean;
}

const STATUS_COLORS: Record<BloomStatus, string> = {
  peak: "#00B894",
  starting: "#E17055",
  ending: "#FDCB6E",
  upcoming: "#6C5CE7",
};

export function getStatus(bloom: Bloom, today: Date = new Date()): BloomStatusInfo {
  const inSeason = isInRange(today, { start: bloom.seasonStart, end: bloom.seasonEnd });
  const inPeak = isInRange(today, { start: bloom.peakStart, end: bloom.peakEnd });

  if (inPeak) {
    return { status: "peak", label: "Peak now", color: STATUS_COLORS.peak, isActive: true };
  }
  if (inSeason) {
    const beforePeak = isInRange(today, { start: bloom.seasonStart, end: bloom.peakStart });
    if (beforePeak) {
      return { status: "starting", label: "Starting", color: STATUS_COLORS.starting, isActive: true };
    }
    return { status: "ending", label: "Ending soon", color: STATUS_COLORS.ending, isActive: true };
  }
  const weeks = weeksUntil(today, bloom.seasonStart);
  const label = weeks <= 6 ? `${weeks} weeks` : `in ${Math.round(weeks / 4)} mo`;
  return { status: "upcoming", label, color: STATUS_COLORS.upcoming, isActive: false };
}

export function formatSeason(bloom: Bloom): string {
  return `${bloom.seasonStart} — ${bloom.seasonEnd}`;
}

export function formatBestTime(bloom: Bloom): string {
  return `${bloom.peakStart} — ${bloom.peakEnd}`;
}

export { weeksSince };
