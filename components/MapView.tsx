"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Bloom } from "@/lib/blooms";
import { getStatus } from "@/lib/status";
import { currentMonthName } from "@/lib/date";
import { emojiFor } from "@/lib/emoji";
import BottomSheet from "./BottomSheet";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const CONTINENTS: Array<{ name: string; center: [number, number]; zoom: number }> = [
  { name: "Asia", center: [95, 30], zoom: 2.4 },
  { name: "Europe", center: [15, 50], zoom: 3.2 },
  { name: "N. America", center: [-100, 40], zoom: 2.6 },
  { name: "S. America", center: [-60, -20], zoom: 2.4 },
  { name: "Africa", center: [20, 5], zoom: 2.4 },
  { name: "Oceania", center: [150, -25], zoom: 2.6 },
];

export default function MapView({ blooms }: { blooms: Bloom[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selected, setSelected] = useState<Bloom | null>(null);
  const today = useMemo(() => new Date(), []);

  const activeBlooms = useMemo(
    () => blooms.filter((b) => getStatus(b, today).isActive),
    [blooms, today]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      projection: { name: "mercator" },
      renderWorldCopies: false,  // don't repeat the world horizontally
      center: [10, 25],
      zoom: 1.6,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });
    mapRef.current = map;

    // Force resize at multiple checkpoints in case the container dimensions are
    // still settling when Mapbox initializes its canvas + marker projection.
    const resizeTimer1 = setTimeout(() => map.resize(), 0);
    const resizeTimer2 = setTimeout(() => map.resize(), 100);
    const resizeTimer3 = setTimeout(() => map.resize(), 500);
    const onWinResize = () => map.resize();
    window.addEventListener("resize", onWinResize);

    // Click on empty map → fly there. Mapbox fires this after any non-marker click.
    map.on("click", (e) => {
      map.flyTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: Math.max(map.getZoom(), 2.8),
        duration: 1400,
        speed: 1.0,
        curve: 1.42,
        essential: true,
      });
    });

    map.on("load", () => {
      map.resize();
      // Paint the whole map in the same pink/peach/botanical family as the app chrome.
      // Water goes blush-pink, land peach, vegetation a softer sage green.
      const overrides: Array<[string, string]> = [
        ["water", "#F6D3C9"],
        ["waterway", "#F6D3C9"],
        ["water-shadow", "#E8BFB5"],
        ["land", "#FCEFE8"],
        ["background", "#FCEFE8"],
        ["landcover", "#E9DECF"],
        ["landuse", "#F4E5D8"],
        ["national-park", "#D9E3C7"],
        ["national_park", "#D9E3C7"],
        ["park", "#D9E3C7"],
        ["pitch", "#D9E3C7"],
        ["hillshade", "#EAD9C8"],
        ["land-structure-polygon", "#F8E5D9"],
        ["sand", "#F5E1CB"],
      ];
      const layers = map.getStyle().layers ?? [];
      layers.forEach((layer) => {
        const match = overrides.find(([id]) =>
          layer.id === id || layer.id.startsWith(id + "-") || layer.id.endsWith("-" + id)
        );
        if (!match) return;
        const [, color] = match;
        try {
          if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", color);
          else if (layer.type === "fill") map.setPaintProperty(layer.id, "fill-color", color);
          else if (layer.type === "line") map.setPaintProperty(layer.id, "line-color", color);
        } catch {}
      });
      // Fade heavy label clutter at low zoom so the pretty colors can breathe
      layers.forEach((layer) => {
        if (layer.type === "symbol" && /road|place-city|transit/.test(layer.id)) {
          try {
            map.setPaintProperty(layer.id, "text-opacity", 0.55);
          } catch {}
        }
      });
    });

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      clearTimeout(resizeTimer3);
      window.removeEventListener("resize", onWinResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers when the map is ready or active blooms change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];
    let labelVisibility = true;

    const toggleLabels = () => {
      const show = map.getZoom() >= 2.2;
      if (show === labelVisibility) return;
      labelVisibility = show;
      document
        .querySelectorAll<HTMLElement>(".petal-pin__label")
        .forEach((el) => {
          el.style.display = show ? "" : "none";
        });
    };

    const addMarkers = () => {
      // DIAG: dump map size + projection so we can compare to actual marker positions
      const canvas = map.getCanvas();
      console.log("[MAP]", {
        canvasW: canvas.width,
        canvasH: canvas.height,
        cssW: canvas.style.width,
        cssH: canvas.style.height,
        zoom: map.getZoom(),
        projection: map.getProjection().name,
        center: map.getCenter().toArray(),
      });

      activeBlooms.forEach((bloom) => {
        const info = getStatus(bloom, today);
        const el = document.createElement("div");
        el.className = `petal-pin petal-pin--${info.status}`;
        el.style.setProperty("--pin-color", info.color);

        const bubble = document.createElement("div");
        bubble.className = "petal-pin__bubble";
        bubble.textContent = emojiFor(bloom.flower);
        el.appendChild(bubble);

        if (bloom.isPersonal) {
          const heart = document.createElement("div");
          heart.className = "petal-pin__heart";
          heart.textContent = "♥";
          bubble.appendChild(heart);
        }

        const label = document.createElement("div");
        label.className = "petal-pin__label";
        label.textContent = info.label;
        el.appendChild(label);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelected(bloom);
          // Offset upward so the pin sits in the visible half when the bottom sheet covers ~50%.
          const sheetOffsetPx = Math.min(window.innerHeight * 0.22, 180);
          map.flyTo({
            center: [bloom.lng, bloom.lat],
            zoom: Math.max(map.getZoom(), 4.2),
            duration: 1600,
            speed: 1.1,
            curve: 1.42,
            offset: [0, -sheetOffsetPx],
            essential: true,
          });
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([bloom.lng, bloom.lat])
          .addTo(map);
        markers.push(marker);

        // DIAG: log expected pixel position vs marker's actual positioning
        const point = map.project([bloom.lng, bloom.lat]);
        console.log(`[PIN] ${bloom.id.padEnd(28)} lng=${bloom.lng} lat=${bloom.lat} → px=(${Math.round(point.x)},${Math.round(point.y)}) elTransform="${el.style.transform || "<none>"}"`);
      });
    };

    if (map.loaded()) {
      addMarkers();
      toggleLabels();
    } else {
      map.once("load", () => {
        addMarkers();
        toggleLabels();
      });
    }
    map.on("zoom", toggleLabels);

    return () => {
      markers.forEach((m) => m.remove());
      map.off("zoom", toggleLabels);
    };
  }, [activeBlooms, today]);

  const month = currentMonthName(today);

  return (
    <main className="fixed inset-0 bg-cream">
      <div ref={containerRef} className="absolute inset-0" />

      {!MAPBOX_TOKEN && <NoTokenFallback blooms={activeBlooms} onSelect={setSelected} />}

      {/* Atmospheric overlay — non-interactive, pure polish */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(252, 228, 222, 0.55) 0%, rgba(252, 228, 222, 0.18) 30%, transparent 55%), radial-gradient(100% 60% at 50% 100%, rgba(196, 101, 46, 0.14) 0%, transparent 60%)",
        }}
      />
      {/* Soft blossom decorations drifting in the corners */}
      <div
        className="pointer-events-none absolute -right-12 -top-16 z-10 opacity-50"
        aria-hidden
      >
        <Blossom size={200} from="#FBC1B5" to="#E85A70" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 z-10 opacity-35"
        aria-hidden
      >
        <Blossom size={260} from="#FCE4DE" to="#C4652E" rotate={25} />
      </div>

      {/* Top-left app name */}
      <div className="pointer-events-none absolute left-5 top-5 z-20">
        <h1 className="brand-title font-serif text-[30px] font-semibold leading-none">
          Petal Passport
        </h1>
        <p
          className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-terracotta/80"
          style={{ textShadow: "0 1px 8px rgba(252,228,222,0.95)" }}
        >
          {activeBlooms.length} in bloom today
        </p>
      </div>

      {/* Top-right current month */}
      <div className="pointer-events-none absolute right-5 top-5 z-20 text-right">
        <p className="font-serif text-lg text-charcoal" style={{ textShadow: "0 2px 10px rgba(248,245,238,0.9)" }}>
          {month}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-gray">Today</p>
      </div>

      {/* Legend — desktop bottom-left; mobile compact horizontal row above the pills */}
      <div className="absolute bottom-[68px] left-3 z-20 rounded-full border border-border bg-surface/90 px-3 py-1.5 shadow-bloom backdrop-blur sm:bottom-5 sm:left-5 sm:rounded-2xl sm:p-3">
        <div className="flex items-center gap-3 sm:hidden">
          <LegendDot color="#00B894" label="Peak" pulse />
          <LegendDot color="#E17055" label="Starting" />
          <LegendDot color="#FDCB6E" label="Ending" />
        </div>
        <div className="hidden sm:block">
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-warm-gray">On the map</p>
          <div className="space-y-1.5">
            <LegendDot color="#00B894" label="Peak now" pulse />
            <LegendDot color="#E17055" label="Starting" />
            <LegendDot color="#FDCB6E" label="Ending soon" />
          </div>
        </div>
      </div>

      {/* Continent quick-nav — desktop bottom-right; mobile horizontal-scroll strip across bottom */}
      <div className="absolute bottom-3 left-0 right-0 z-20 sm:bottom-5 sm:left-auto sm:right-5">
        <div className="gallery-scroll flex gap-1.5 overflow-x-auto px-3 sm:flex-wrap sm:justify-end sm:px-0 sm:max-w-[calc(100vw-2.5rem)]">
          {CONTINENTS.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                mapRef.current?.flyTo({
                  center: c.center,
                  zoom: c.zoom,
                  duration: 1800,
                  speed: 1.0,
                  curve: 1.42,
                  essential: true,
                })
              }
              className="shrink-0 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-charcoal shadow-bloom backdrop-blur transition hover:border-botanical/40 hover:text-botanical"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <BottomSheet bloom={selected} onClose={() => setSelected(null)} today={today} />
    </main>
  );
}

function Blossom({
  size,
  from,
  to,
  rotate = 0,
}: {
  size: number;
  from: string;
  to: string;
  rotate?: number;
}) {
  const id = `${from}-${to}`.replace(/[^a-z0-9]/gi, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      style={{
        transform: `rotate(${rotate}deg)`,
        filter: "blur(1px) drop-shadow(0 8px 32px rgba(232, 90, 112, 0.18))",
      }}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={from} stopOpacity="0.9" />
          <stop offset="100%" stopColor={to} stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="60"
          rx="32"
          ry="48"
          fill={`url(#${id})`}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="14" fill="#FBCD5C" opacity="0.7" />
    </svg>
  );
}

function LegendDot({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${pulse ? "animate-bloom-pulse" : ""}`}
        style={{ background: color }}
      />
      <span className="text-[11px] text-charcoal">{label}</span>
    </div>
  );
}

function NoTokenFallback({
  blooms,
  onSelect,
}: {
  blooms: Bloom[];
  onSelect: (b: Bloom) => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-cream px-6 py-12">
      <div className="max-w-md rounded-3xl border border-border bg-surface p-6 shadow-bloom">
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-gray">Setup needed</p>
        <h2 className="mt-2 font-serif text-2xl text-botanical">
          Add a Mapbox token to bring the atlas to life
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/80">
          Create a free token at{" "}
          <span className="font-medium text-terracotta">mapbox.com</span>, then add{" "}
          <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to
          a <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs">.env.local</code> file.
        </p>
      </div>
      <div className="w-full max-w-md">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          In bloom today · {blooms.length}
        </p>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {blooms.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition hover:border-terracotta/40 hover:shadow-bloom"
            >
              <span className="text-2xl">{emojiFor(b.flower)}</span>
              <span className="flex-1">
                <span className="block font-serif text-base text-charcoal">{b.flower}</span>
                <span className="block text-xs text-warm-gray">{b.location}</span>
              </span>
              <span className="text-warm-gray">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
