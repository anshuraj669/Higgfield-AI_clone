"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRESETS, Preset, mockImage } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const CATS = ["All", "Camera", "Energy", "Mood"] as const;

export default function Presets() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const router = useRouter();
  const set = useStore((s) => s.setComposer);

  const use = (p: Preset) => {
    set({ mode: "video", presetId: p.id, focusKey: Date.now() });
    router.push("/");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Motion presets</h1>
      <p className="mt-2 max-w-lg text-muted">
        Camera moves you can apply to any prompt or to one of your images. Hover to preview, click to shoot with it.
      </p>
      <div className="mt-6 flex gap-1">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${cat === c ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.filter((p) => cat === "All" || p.category === cat).map((p) => (
          <button key={p.id} onClick={() => use(p)} className="group rise overflow-hidden rounded-2xl border border-line bg-panel text-left transition hover:border-muted">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={mockImage(p.seed, "16:9", 0.6)}
                alt=""
                className={`h-full w-full object-cover motion motion-${p.id} paused`}
                style={{ ["--dur" as string]: "4s" }}
              />
              <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] backdrop-blur">{p.category}</span>
              <span className="absolute bottom-3 right-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink opacity-0 transition group-hover:opacity-100">
                Use preset
              </span>
            </div>
            <div className="p-4">
              <div className="font-medium">{p.name}</div>
              <div className="mt-0.5 text-sm text-muted">{p.description}</div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
