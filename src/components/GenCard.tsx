"use client";

import { useState } from "react";
import { Clapperboard, Download, Heart, Play, RotateCcw, Trash2, X } from "lucide-react";
import { fmtCredits, getAspect, getPreset } from "@/lib/catalog";
import { download } from "@/lib/download";
import { Generation, useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Media } from "./Media";

export function GenCard({ g }: { g: Generation }) {
  const [hover, setHover] = useState(false);
  const { openViewer, cancel, remove, toggleFavorite, remix, animate } = useStore.getState();
  const a = getAspect(g.aspect);
  const done = g.status === "done";

  return (
    <div
      className="rise group relative h-[var(--row)] max-w-full overflow-hidden rounded-xl bg-panel"
      style={{ flexGrow: a.w / a.h, flexBasis: `calc(var(--row) * ${a.w / a.h})` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {done && (
        <button className="absolute inset-0 block h-full w-full cursor-zoom-in" onClick={() => openViewer(g.id)} aria-label={`Open ${g.prompt}`}>
          <Media g={g} playing={hover} />
        </button>
      )}

      {(g.status === "queued" || g.status === "running") && (
        <div className="shimmer absolute inset-0 flex flex-col justify-end p-3">
          <div className="mb-2 line-clamp-2 text-xs text-muted">{g.prompt}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="tabular-nums">{g.status === "queued" ? "In queue" : `${Math.floor(g.progress * 100)}%`}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${g.progress * 100}%` }} />
            </div>
            <button
              onClick={() => {
                cancel(g.id);
                toast(`Canceled · ${fmtCredits(g.cost)} credits refunded`);
              }}
              className="rounded-md p-1 text-muted hover:bg-line hover:text-fg"
              aria-label="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {g.status === "canceled" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-line text-xs text-muted">
          Canceled · refunded
          <div className="flex gap-1">
            <SmallBtn onClick={() => remix(g.id)} label="Retry"><RotateCcw size={13} /></SmallBtn>
            <SmallBtn onClick={() => remove(g.id)} label="Remove"><Trash2 size={13} /></SmallBtn>
          </div>
        </div>
      )}

      {done && (
        <>
          <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
            {g.kind === "video" && (
              <span className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] backdrop-blur">
                <Play size={10} fill="currentColor" /> {g.duration}s · {getPreset(g.presetId)?.name}
              </span>
            )}
            {g.uploaded && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] backdrop-blur">Upload</span>}
            {g.upscaledFrom && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] backdrop-blur">2× upscaled</span>}
          </div>
          {g.favorite && <Heart size={16} className="pointer-events-none absolute right-2 top-2 fill-accent text-accent group-hover:hidden" />}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 pt-10 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <p className="line-clamp-2 flex-1 text-xs text-white/90">{g.prompt}</p>
          </div>
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <SmallBtn onClick={() => toggleFavorite(g.id)} label={g.favorite ? "Unfavorite" : "Favorite"}>
              <Heart size={13} className={g.favorite ? "fill-accent text-accent" : ""} />
            </SmallBtn>
            {g.kind === "image" && (
              <SmallBtn onClick={() => animate(g.id)} label="Animate">
                <Clapperboard size={13} />
              </SmallBtn>
            )}
            {!g.uploaded && (
              <SmallBtn onClick={() => remix(g.id)} label="Remix">
                <RotateCcw size={13} />
              </SmallBtn>
            )}
            <SmallBtn onClick={() => download(g)} label="Download">
              <Download size={13} />
            </SmallBtn>
          </div>
        </>
      )}
    </div>
  );
}

function SmallBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur transition hover:bg-black/80"
    >
      {children}
    </button>
  );
}
