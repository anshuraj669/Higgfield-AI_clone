"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clapperboard, Copy, Download, Heart, Maximize2, Pause, Play, RotateCcw, Trash2, X } from "lucide-react";
import { fmtCredits, getAspect, getModel, getPreset, getStyle } from "@/lib/catalog";
import { download } from "@/lib/download";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Media } from "./Media";

export function Viewer() {
  const id = useStore((s) => s.viewerId);
  const all = useStore((s) => s.generations);
  const { openViewer, toggleFavorite, remix, animate, upscale, remove } = useStore.getState();
  const [playing, setPlaying] = useState(true);

  const done = all.filter((g) => g.status === "done");
  const i = done.findIndex((g) => g.id === id);
  const g = done[i];
  const source = g?.sourceId ? all.find((x) => x.id === g.sourceId) : undefined;

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") openViewer(undefined);
      if (e.key === "ArrowRight" && done[i + 1]) openViewer(done[i + 1].id);
      if (e.key === "ArrowLeft" && done[i - 1]) openViewer(done[i - 1].id);
      if (e.key === " " && g?.kind === "video") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, i, done, g, openViewer]);

  if (!g) return null;
  const a = getAspect(g.aspect);

  const meta: [string, string][] = g.uploaded ? [["Source", "Your upload"], ["Aspect", `≈ ${g.aspect}`]] : [
    ["Model", getModel(g.modelId).name],
    ["Aspect", g.aspect],
    g.kind === "video" ? ["Motion", `${getPreset(g.presetId)?.name} · ${g.duration}s`] : ["Style", getStyle(g.styleId).name],
    ["Resolution", g.upscaledFrom ? "2× upscale" : g.resolution ?? "—"],
    ["Seed", g.seed],
  ];
  meta.push(
    ["Cost", g.uploaded ? "Free" : `${fmtCredits(g.cost)} credits`],
    ["Created", new Date(g.createdAt).toLocaleString()],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm md:flex-row" role="dialog" aria-modal>
      <div className="relative min-h-0 min-w-0 flex-1 p-4 md:p-10" onClick={() => openViewer(undefined)}>
        <div className="flex h-full w-full items-center justify-center [container-type:size]">
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl"
          style={{ aspectRatio: `${a.w} / ${a.h}`, width: `min(100cqw, calc(100cqh * ${a.w / a.h}))` }}
          onClick={(e) => e.stopPropagation()}
        >
          <Media g={g} playing={playing} />
          {g.kind === "video" && (
            <button
              onClick={() => setPlaying((p) => !p)}
              className="absolute bottom-3 left-3 rounded-full bg-black/60 p-2 backdrop-blur hover:bg-black/80"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
        </div>
        {i > 0 && <NavBtn side="left" onClick={() => openViewer(done[i - 1].id)} />}
        {i < done.length - 1 && <NavBtn side="right" onClick={() => openViewer(done[i + 1].id)} />}
      </div>

      <aside className="scrollbar-thin flex max-h-[45vh] w-full flex-col overflow-y-auto border-t border-line bg-panel p-5 md:max-h-none md:w-[360px] md:shrink-0 md:border-l md:border-t-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">{g.kind === "video" ? "Video" : g.uploaded ? "Upload" : g.upscaledFrom ? "Upscaled image" : "Image"}</span>
          <button onClick={() => openViewer(undefined)} className="rounded-md p-1.5 text-muted hover:bg-raised hover:text-fg" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="group relative rounded-xl bg-raised p-3 text-sm leading-relaxed">
          {g.prompt}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(g.prompt);
              toast("Prompt copied");
            }}
            className="absolute right-2 top-2 rounded-md p-1 text-muted opacity-0 hover:text-fg group-hover:opacity-100"
            aria-label="Copy prompt"
          >
            <Copy size={14} />
          </button>
        </div>

        {source && (
          <button onClick={() => openViewer(source.id)} className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-fg">
            <img src={source.url} alt="" className="h-8 w-8 rounded object-cover" /> Animated from this image →
          </button>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {meta.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="truncate">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {g.kind === "image" && (
            <Action primary onClick={() => animate(g.id)} icon={<Clapperboard size={15} />}>
              Animate
            </Action>
          )}
          {!g.uploaded && (
            <Action primary={g.kind === "video"} onClick={() => remix(g.id)} icon={<RotateCcw size={15} />}>
              Remix
            </Action>
          )}
          {g.kind === "image" && !g.upscaledFrom && !g.uploaded && (
            <Action
              onClick={() => {
                if (upscale(g.id).ok) toast("Upscaling 2× · 2 credits");
              }}
              icon={<Maximize2 size={15} />}
            >
              Upscale 2×
            </Action>
          )}
          <Action onClick={() => download(g)} icon={<Download size={15} />}>
            Download
          </Action>
          <Action onClick={() => toggleFavorite(g.id)} icon={<Heart size={15} className={g.favorite ? "fill-accent text-accent" : ""} />}>
            {g.favorite ? "Favorited" : "Favorite"}
          </Action>
          <Action
            onClick={() => {
              const snapshot = g;
              remove(g.id);
              toast("Deleted", {
                label: "Undo",
                run: () => useStore.setState((s) => ({ generations: [snapshot, ...s.generations].sort((a, b) => b.createdAt - a.createdAt) })),
              });
            }}
            icon={<Trash2 size={15} />}
          >
            Delete
          </Action>
        </div>
        <p className="mt-auto pt-6 text-[11px] text-muted">← → to browse · Esc to close{g.kind === "video" ? " · Space to pause" : ""}</p>
      </aside>
    </div>
  );
}

function NavBtn({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20 md:block ${side === "left" ? "left-3" : "right-3"}`}
      aria-label={side === "left" ? "Previous" : "Next"}
    >
      {side === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}

function Action({ onClick, icon, primary, children }: { onClick: () => void; icon: React.ReactNode; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
        primary ? "bg-accent text-accent-ink hover:brightness-110" : "border border-line hover:border-muted"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
