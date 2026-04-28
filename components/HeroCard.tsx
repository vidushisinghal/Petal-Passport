"use client";

import { useState } from "react";
import type { Bloom } from "@/lib/blooms";
import { emojiFor } from "@/lib/emoji";
import { heroSrc } from "@/lib/photos";

export default function HeroCard({
  bloom,
  height,
  rounded = "none",
}: {
  bloom: Bloom;
  height: number | string;
  rounded?: "none" | "top" | "all";
}) {
  const accent = bloom.accentColor || "#2D5016";
  const radius =
    rounded === "top" ? "rounded-none" : rounded === "all" ? "rounded-3xl overflow-hidden" : "";
  // Always try the conventional path. If the manifest lists this bloom, that wins
  // (so credits show); otherwise we still try /blooms/<id>/hero.jpg, which lets
  // user-supplied photos drop in without editing the manifest.
  const photo = heroSrc(bloom.id) ?? `/blooms/${bloom.id}/hero.jpg`;
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden ${radius}`}
      style={{
        height,
        background: errored
          ? `linear-gradient(135deg, ${accent} 0%, ${mix(accent, "#2D5016", 0.35)} 100%)`
          : accent,
      }}
    >
      {!errored && (
        <img
          src={photo}
          alt={`${bloom.flower} in ${bloom.location}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
      {errored && (
        <>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.45) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(255,255,255,0.25) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 9px)",
            }}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-7xl opacity-80 drop-shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
            {emojiFor(bloom.flower)}
          </div>
        </>
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
      />
    </div>
  );
}

function mix(a: string, b: string, amt: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * amt);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * amt);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * amt);
  return `rgb(${r}, ${g}, ${bl})`;
}
function hex(s: string): [number, number, number] {
  const v = s.replace("#", "");
  const n = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
