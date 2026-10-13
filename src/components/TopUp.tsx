"use client";

import { Check, X, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";

const PACKS = [
  { credits: 100, price: 5, note: "≈ 33 HD images" },
  { credits: 500, price: 20, note: "≈ 33 Pro videos", best: true },
  { credits: 1500, price: 50, note: "For production work" },
];

export function TopUp() {
  const open = useStore((s) => s.topUpOpen);
  const { setTopUp, addCredits } = useStore.getState();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" onClick={() => setTopUp(false)}>
      <div className="rise w-full max-w-md rounded-2xl border border-line bg-panel p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Add credits</h2>
            <p className="text-sm text-muted">Credits never expire. Failed or canceled renders are refunded.</p>
          </div>
          <button onClick={() => setTopUp(false)} className="rounded-md p-1.5 text-muted hover:bg-raised hover:text-fg" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {PACKS.map((p) => (
            <button
              key={p.credits}
              onClick={() => {
                addCredits(p.credits);
                toast(`+${p.credits} credits added`);
              }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-muted ${p.best ? "border-accent" : "border-line"}`}
            >
              <Zap size={18} className="text-accent" />
              <div className="flex-1">
                <div className="font-medium">
                  {p.credits.toLocaleString()} credits {p.best && <span className="ml-1 rounded bg-accent px-1.5 py-px text-[10px] font-semibold uppercase text-accent-ink">Popular</span>}
                </div>
                <div className="text-xs text-muted">{p.note}</div>
              </div>
              <div className="font-semibold">${p.price}</div>
            </button>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <Check size={13} /> Demo build: no payment is taken, credits are added instantly.
        </p>
      </div>
    </div>
  );
}
