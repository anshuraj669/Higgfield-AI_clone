"use client";

import { useEffect, useRef, useState } from "react";
import { Dice5, Film, ImageIcon, Sparkles, Upload, Wand2, X, Zap } from "lucide-react";
import { ASPECTS, MODELS, PRESETS, RESOLUTIONS, SAMPLE_PROMPTS, STYLES, costFor, fmtCredits, mockImage } from "@/lib/catalog";
import { styleFilter, useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { readImage } from "@/lib/upload";

const ENHANCERS = ["shot on 35mm", "volumetric light", "shallow depth of field", "rich color grade", "highly detailed"];

export function Composer() {
  const c = useStore((s) => s.composer);
  const set = useStore((s) => s.setComposer);
  const credits = useStore((s) => s.credits);
  const generate = useStore((s) => s.generate);
  const source = useStore((s) => s.generations.find((g) => g.id === s.composer.sourceId));
  const generations = useStore((s) => s.generations);
  const recentImages = generations.filter((g) => g.kind === "image" && g.status === "done").slice(0, 8);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const isVideo = c.mode === "video";
  const modelId = isVideo ? c.videoModel : c.imageModel;
  const resolution = isVideo ? c.videoRes : c.imageRes;
  const cost = costFor(modelId, c.count, c.duration, resolution);
  const short = cost > credits;

  // Remix / Animate / preset pickers push state into the composer; pull focus here.
  useEffect(() => {
    if (!c.focusKey) return;
    ref.current?.focus();
    ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [c.focusKey]);

  const submit = () => {
    const r = generate();
    if (!r.ok) {
      if (r.reason !== "Not enough credits") toast(r.reason ?? "Couldn't start");
      ref.current?.focus();
      return;
    }
    toast(isVideo ? "Video queued" : `${c.count} image${c.count > 1 ? "s" : ""} queued`);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const { dataUrl, aspect } = await readImage(file);
      const id = useStore.getState().addUpload(file.name.replace(/\.[^.]+$/, ""), dataUrl, aspect);
      set({ mode: "video", sourceId: id });
      toast("Image added as start frame");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't read that image");
    }
  };

  const enhance = () => {
    const p = c.prompt.trim();
    if (!p) return toast("Write a few words first, then enhance");
    const extra = ENHANCERS.filter((e) => !p.includes(e)).slice(0, 3);
    set({ prompt: extra.length ? `${p}, ${extra.join(", ")}` : p });
  };

  return (
    <div
      className={`relative flex h-full flex-col ${dragging ? "rounded-xl ring-2 ring-accent" : ""}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files[0]);
      }}
    >
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl bg-ink/80 text-sm font-medium">
          Drop to use as a start frame
        </div>
      )}
      {/* mode */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-raised p-1">
        {(["image", "video"] as const).map((m) => (
          <button
            key={m}
            onClick={() => set({ mode: m })}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
              c.mode === m ? "bg-fg text-ink" : "text-muted hover:text-fg"
            }`}
          >
            {m === "image" ? <ImageIcon size={15} /> : <Film size={15} />}
            {m === "image" ? "Image" : "Video"}
          </button>
        ))}
      </div>

      <div className="scrollbar-thin -mx-1 mt-4 flex-1 space-y-5 overflow-y-auto px-1 pb-4">
        {/* source frame for image→video */}
        {isVideo && source && (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-raised p-2">
            <img src={source.url} alt="" className="h-12 w-12 rounded-lg object-cover" style={{ filter: styleFilter(source) }} />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">{source.uploaded ? "Start frame · your upload" : "Start frame"}</div>
              <div className="truncate text-sm">{source.prompt}</div>
            </div>
            <button onClick={() => set({ sourceId: undefined })} className="rounded-md p-1.5 text-muted hover:bg-line hover:text-fg" aria-label="Remove source image">
              <X size={16} />
            </button>
          </div>
        )}

        {isVideo && !source && (
          <div className="rounded-xl border border-dashed border-line p-2">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs text-muted">Start frame <span className="opacity-60">(optional)</span></span>
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg hover:bg-raised">
                <Upload size={13} /> Upload
              </button>
            </div>
            {recentImages.length ? (
              <div className="scrollbar-thin flex gap-1.5 overflow-x-auto">
                {recentImages.map((g) => (
                  <button key={g.id} onClick={() => set({ sourceId: g.id })} className="shrink-0 overflow-hidden rounded-md ring-accent hover:ring-2" title={g.prompt}>
                    <img src={g.url} alt="" className="h-12 w-12 object-cover" style={{ filter: styleFilter(g) }} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-1 pb-1 text-[11px] text-muted">Drop an image here, or generate one in Image mode first.</p>
            )}
          </div>
        )}

        {/* prompt */}
        <div className="rounded-xl border border-line bg-raised focus-within:border-muted">
          <textarea
            ref={ref}
            value={c.prompt}
            onChange={(e) => set({ prompt: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={4}
            maxLength={1000}
            placeholder={isVideo && source ? "Describe the motion (optional)" : isVideo ? "Describe the shot…" : "Describe the image you want…"}
            className="block w-full resize-none bg-transparent p-3 text-[15px] leading-relaxed placeholder:text-muted focus:outline-none"
          />
          <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
            <button onClick={enhance} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-line hover:text-fg">
              <Wand2 size={13} /> Enhance
            </button>
            <button
              onClick={() => set({ prompt: SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)] })}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-line hover:text-fg"
            >
              <Dice5 size={13} /> Surprise me
            </button>
            <span className="ml-auto text-[11px] text-muted">{c.prompt.length}/1000</span>
          </div>
        </div>

        {/* model */}
        <Section label="Model">
          <div className="space-y-1.5">
            {MODELS.filter((m) => m.mode === c.mode).map((m) => {
              const active = m.id === modelId;
              return (
                <button
                  key={m.id}
                  onClick={() => set(isVideo ? { videoModel: m.id } : { imageModel: m.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    active ? "border-accent bg-accent/10" : "border-line hover:border-muted"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {m.name}
                      {m.badge && <span className="rounded bg-line px-1.5 py-px text-[10px] uppercase tracking-wide text-muted">{m.badge}</span>}
                    </div>
                    <div className="text-xs text-muted">{m.tagline}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Zap size={12} /> {m.cost}
                    {isVideo && <span>/5s</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {isVideo ? (
          <Section label="Camera motion" hint={PRESETS.find((p) => p.id === c.presetId)?.description}>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => set({ presetId: p.id })}
                  className={`group overflow-hidden rounded-lg border text-left transition ${c.presetId === p.id ? "border-accent" : "border-line hover:border-muted"}`}
                >
                  <div className="aspect-video overflow-hidden bg-raised">
                    <img
                      src={mockImage(p.seed, "16:9", 0.3)}
                      alt=""
                      className={`h-full w-full object-cover motion motion-${p.id} ${c.presetId === p.id ? "" : "paused"}`}
                      style={{ ["--dur" as string]: "3s" }}
                    />
                  </div>
                  <div className={`truncate px-1.5 py-1 text-[11px] ${c.presetId === p.id ? "text-fg" : "text-muted"}`}>{p.name}</div>
                </button>
              ))}
            </div>
          </Section>
        ) : (
          <Section label="Style">
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <Chip key={s.id} active={c.styleId === s.id} onClick={() => set({ styleId: s.id })}>
                  {s.name}
                </Chip>
              ))}
            </div>
          </Section>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Section label="Aspect">
            <div className="flex flex-wrap gap-1.5">
              {ASPECTS.map((a) => (
                <Chip key={a.id} active={(source?.aspect ?? c.aspect) === a.id} disabled={!!(isVideo && source)} onClick={() => set({ aspect: a.id })}>
                  {a.id}
                </Chip>
              ))}
            </div>
          </Section>
          {isVideo ? (
            <Section label="Duration">
              <div className="flex gap-1.5">
                {([5, 10] as const).map((d) => (
                  <Chip key={d} active={c.duration === d} onClick={() => set({ duration: d })}>
                    {d}s
                  </Chip>
                ))}
              </div>
            </Section>
          ) : (
            <Section label="Outputs">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <Chip key={n} active={c.count === n} onClick={() => set({ count: n })}>
                    {n}
                  </Chip>
                ))}
              </div>
            </Section>
          )}
        </div>

        <Section label="Resolution">
          <div className="flex gap-1.5">
            {RESOLUTIONS[c.mode].map((r) => (
              <Chip key={r.id} active={resolution === r.id} onClick={() => set(isVideo ? { videoRes: r.id } : { imageRes: r.id })}>
                {r.id}
                {r.mult > 1 && <span className="ml-1 opacity-60">×{r.mult}</span>}
              </Chip>
            ))}
          </div>
        </Section>
      </div>

      {/* submit */}
      <div className="border-t border-line pt-3">
        <button
          onClick={submit}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold transition active:scale-[.99] ${
            short ? "bg-raised text-fg ring-1 ring-line hover:ring-muted" : "bg-accent text-accent-ink hover:brightness-110"
          }`}
        >
          <Sparkles size={16} />
          {short ? "Get credits to generate" : `Generate${isVideo ? " video" : ""}`}
          <span className={`ml-1 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs ${short ? "bg-line" : "bg-black/15"}`}>
            <Zap size={11} /> {fmtCredits(cost)}
          </span>
        </button>
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>{fmtCredits(credits)} credits left</span>
          <span className="hidden sm:inline">Ctrl / ⌘ + Enter</span>
        </div>
      </div>
    </div>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
        {hint && <span className="truncate text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "border-fg bg-fg text-ink" : "border-line text-muted hover:border-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
