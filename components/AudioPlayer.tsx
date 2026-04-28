"use client";

import { useEffect, useRef, useState } from "react";
import type { Bloom } from "@/lib/blooms";

interface Props {
  bloom: Bloom;
  narrator: string;
}

const CACHE_PREFIX = "bloom-audio-v7-";   // Pro Voice Clone shipped — clear all old Instant clones

if (typeof window !== "undefined") {
  // One-time cleanup of pre-tune cached audio so users don't keep hearing the old voice
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("bloom-audio-") && !k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
  });
}

function estimateMinutes(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = words / 155;
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`;
  return `${Math.max(1, Math.round(minutes))} min`;
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ bloom, narrator }: Props) {
  const accent = bloom.accentColor || "#2D5016";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "playing" | "paused" | "error">(
    "idle"
  );
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const SPEED_KEY = "bloom-audio-speed";
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(() => {
    if (typeof window === "undefined") return 1;
    const stored = parseFloat(localStorage.getItem(SPEED_KEY) || "1");
    return stored === 1.5 || stored === 2 ? (stored as 1.5 | 2) : 1;
  });

  // Apply speed changes to the live audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
    if (typeof window !== "undefined") localStorage.setItem(SPEED_KEY, String(speed));
  }, [speed]);

  // Pre-create the audio element on mount. This lets us "unlock" it inside the
  // user-gesture window of the first tap — iOS Safari otherwise blocks play()
  // after async work (ElevenLabs takes 5-10s) with NotAllowedError.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.playbackRate = speed;
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setTotal(audio.duration));
    audio.addEventListener("timeupdate", () => setElapsed(audio.currentTime));
    audio.addEventListener("ended", () => {
      setState("paused");
      setElapsed(0);
    });
    audio.addEventListener("play", () => setState("playing"));
    audio.addEventListener("pause", () => setState((s) => (s === "playing" ? "paused" : s)));
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const fetchAudio = async (): Promise<string> => {
    // ?fresh=1 in the URL bypasses cache and regenerates — useful when testing
    // a newly-uploaded voice sample without clearing localStorage by hand.
    const skipCache =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("fresh");

    // Try the pre-generated static MP3 first — zero API cost, instant playback,
    // works offline. Only falls through to live ElevenLabs if file isn't there.
    if (!skipCache) {
      const staticUrl = `/audio/${bloom.id}.mp3`;
      try {
        const head = await fetch(staticUrl, { method: "HEAD" });
        if (head.ok) return staticUrl;
      } catch {}

      try {
        const cacheKey = CACHE_PREFIX + bloom.id;
        const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          const res = await fetch(cached);
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch {}
    }

    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: bloom.story, bloomId: bloom.id }),
    });
    if (!res.ok) {
      let msg = "";
      try {
        const body = await res.json();
        msg = body?.error || "";
      } catch {
        msg = await res.text().catch(() => "");
      }
      throw new Error(msg ? `${msg} (HTTP ${res.status})` : `Audio failed (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    if (!skipCache) {
      try {
        const dataUrl = await blobToDataURL(blob);
        localStorage.setItem(CACHE_PREFIX + bloom.id, dataUrl);
      } catch {}
    }
    return URL.createObjectURL(blob);
  };

  const handleTap = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state === "playing") {
      audio.pause();
      return;
    }
    if (state === "paused" || state === "ready") {
      audio.play();
      return;
    }
    // Synchronously prime the element inside the user-gesture window so a later
    // play() (after the ~5-10s ElevenLabs round-trip) doesn't throw NotAllowedError.
    try {
      audio.play().catch(() => {});
    } catch {}

    setState("loading");
    setError(null);
    try {
      const url = await fetchAudio();
      urlRef.current = url;
      audio.src = url;
      audio.playbackRate = speed;
      await audio.play();
    } catch (e: any) {
      setState("error");
      setError(e?.message || "Couldn't load audio");
    }
  };

  const isPlaying = state === "playing";
  const isLoading = state === "loading";
  const progress = total > 0 ? (elapsed / total) * 100 : 0;

  return (
    <div
      className="mt-[-28px] flex gap-4 rounded-3xl p-5 shadow-bloom-lg relative z-10"
      style={{
        background: `linear-gradient(135deg, ${tint(accent, 0.92)} 0%, ${tint(accent, 0.96)} 100%)`,
        border: `1px solid ${tint(accent, 0.82)}`,
      }}
    >
      <button
        onClick={handleTap}
        disabled={isLoading}
        aria-label={isPlaying ? "Pause" : "Play story"}
        className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full text-surface transition active:scale-95 disabled:cursor-wait"
        style={{ background: accent, boxShadow: `0 8px 24px ${tint(accent, 0.35, true)}` }}
      >
        {isLoading ? <span className="petal-spinner" /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="min-w-0 flex-1 self-center">
        <p className="font-serif text-[17px] leading-tight text-charcoal">
          {isLoading ? "Preparing story…" : "Listen to this story"}
        </p>
        <p className="mt-0.5 text-[12px] text-warm-gray">
          A short story · {estimateMinutes(bloom.story)}
        </p>

        {/* Speed pills — always visible so the listener can choose before tapping play */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.16em] text-warm-gray">Speed</span>
          {([1, 1.5, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium transition"
              style={{
                background: speed === s ? accent : "rgba(255,255,255,0.55)",
                color: speed === s ? "#fff" : "var(--charcoal)",
                border: `1px solid ${speed === s ? accent : tint(accent, 0.78)}`,
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        {(state === "playing" || state === "paused" || state === "ready") && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10.5px] text-warm-gray">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(total)}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: accent }}
              />
            </div>
            <div className={`waveform mt-3 ${isPlaying ? "playing" : ""}`} style={{ color: accent }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ height: "35%" }} />
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="mt-2 text-[12px] text-danger">
            <p>{error || "Couldn't reach the narrator"}</p>
            <button
              onClick={handleTap}
              className="mt-1 underline decoration-danger/40 underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <path d="M6 4.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 6 4.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <rect x="5" y="4" width="4.5" height="14" rx="1.2" />
      <rect x="12.5" y="4" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function tint(hexColor: string, amount: number, rgbaShadow = false): string {
  const v = hexColor.replace("#", "");
  const n = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  if (rgbaShadow) return `rgba(${r}, ${g}, ${b}, ${amount})`;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
