"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw, Zap } from "lucide-react";
import { fmtCredits } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { toast } from "@/lib/toast";

const NAV = [
  { href: "/", label: "Studio" },
  { href: "/presets", label: "Presets" },
];

export function Header() {
  const path = usePathname();
  const credits = useStore((s) => s.credits);
  const hydrated = useHydrated();
  const { setTopUp, resetDemo } = useStore.getState();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-ink/90 px-4 backdrop-blur md:gap-6 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-ink">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden><path d="M3 1.5v11l9-5.5z" /></svg>
        </span>
        <span className="hidden sm:inline">Kino</span>
      </Link>
      <nav className="flex gap-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition md:px-3 ${path === n.href ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden rounded-full border border-line px-2.5 py-1 text-[11px] text-muted lg:inline" title="Renders are simulated; no AI provider is connected">
          Demo · simulated renders
        </span>
        <button
          onClick={() => {
            if (confirmReset()) {
              resetDemo();
              toast("Demo reset");
            }
          }}
          className="rounded-lg p-2 text-muted hover:bg-raised hover:text-fg"
          title="Reset demo"
          aria-label="Reset demo"
        >
          <RotateCcw size={15} />
        </button>
        <button onClick={() => setTopUp(true)} className="flex items-center gap-1.5 rounded-full border border-line bg-raised py-1 pl-2.5 pr-1 text-sm hover:border-muted">
          <Zap size={13} className="text-accent" />
          <span className="tabular-nums">{hydrated ? fmtCredits(credits) : "—"}</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink">Add</span>
        </button>
      </div>
    </header>
  );
}

// Only ask when there's something to lose.
function confirmReset() {
  return useStore.getState().generations.length === 0 || window.confirm("Clear all generations and restore starting credits?");
}
