"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SAMPLE_PROMPTS, mockImage, hash } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { GenCard } from "./GenCard";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "fav", label: "Favorites" },
] as const;

export function Feed() {
  const generations = useStore((s) => s.generations);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return generations.filter(
      (g) =>
        (filter === "all" || (filter === "fav" ? g.favorite : g.kind === filter)) &&
        (!needle || g.prompt.toLowerCase().includes(needle)),
    );
  }, [generations, filter, q]);

  const active = generations.filter((g) => g.status === "queued" || g.status === "running").length;

  if (!generations.length) return <EmptyState />;

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-2 bg-ink/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${filter === f.id ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {active > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> {active} rendering
          </span>
        )}
        <label className="ml-auto flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-sm focus-within:border-muted sm:w-56">
          <Search size={14} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts" className="w-full bg-transparent placeholder:text-muted focus:outline-none" />
        </label>
      </div>
      {shown.length ? (
        // justified rows: every card shares a row height and grows by its aspect ratio
        <div className="flex flex-wrap gap-3 [--row:150px] sm:[--row:200px] xl:[--row:240px]">
          {shown.map((g) => (
            <GenCard key={g.id} g={g} />
          ))}
          <div className="grow-[999]" aria-hidden />
        </div>
      ) : (
        <p className="py-20 text-center text-sm text-muted">Nothing here yet.</p>
      )}
    </div>
  );
}

function EmptyState() {
  const set = useStore((s) => s.setComposer);
  return (
    <div className="py-6 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">What are we making?</h1>
      <p className="mt-2 max-w-md text-muted">
        Write a prompt, generate a few stills, then animate the best one with a camera move. Start from one of these:
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => set({ prompt: p, mode: "image", focusKey: Date.now() })}
            className="group overflow-hidden rounded-xl border border-line bg-panel text-left transition hover:border-muted"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img src={mockImage(hash(p), "4:5", 0.5)} alt="" className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
            </div>
            <p className="line-clamp-2 p-3 text-sm">{p}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
