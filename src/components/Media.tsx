"use client";

import { useState } from "react";
import { Generation, styleFilter } from "@/lib/store";

/** Renders an output. Videos are mocked as the source frame + a camera-motion animation. */
export function Media({ g, playing = true, className = "" }: { g: Generation; playing?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const motion = g.kind === "video" ? `motion motion-${g.presetId ?? "static"} ${playing ? "" : "paused"}` : "";
  return (
    <div className={`relative h-full w-full overflow-hidden ${loaded ? "" : "shimmer"} ${className}`}>
      <img
        src={g.url}
        alt={g.prompt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{ filter: styleFilter(g), ["--dur" as string]: `${g.duration ?? 5}s` }}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${motion}`}
      />
    </div>
  );
}
