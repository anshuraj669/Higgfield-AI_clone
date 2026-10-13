"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AspectId, Mode, costFor, getModel, getStyle, hash, mockImage } from "./catalog";

export type Status = "queued" | "running" | "done" | "canceled";

export type Generation = {
  id: string;
  kind: Mode;
  prompt: string;
  modelId: string;
  aspect: AspectId;
  styleId: string;
  presetId?: string;
  duration?: number;
  sourceId?: string; // image this video was animated from
  upscaledFrom?: string;
  uploaded?: boolean;
  resolution?: string;
  seed: string;
  url: string;
  status: Status;
  progress: number; // 0..1
  cost: number;
  favorite: boolean;
  createdAt: number;
};

export type Composer = {
  mode: Mode;
  prompt: string;
  imageModel: string;
  videoModel: string;
  aspect: AspectId;
  count: number;
  styleId: string;
  presetId: string;
  duration: 5 | 10;
  imageRes: string;
  videoRes: string;
  sourceId?: string;
  focusKey?: number; // bumped when another view loads settings into the composer
};

export const STARTING_CREDITS = 120;
const MAX_CONCURRENT = 2;

const defaultComposer: Composer = {
  mode: "image",
  prompt: "",
  imageModel: "lumen-hd",
  videoModel: "motion-pro",
  aspect: "16:9",
  count: 2,
  styleId: "cinematic",
  presetId: "push-in",
  duration: 5,
  imageRes: "2K",
  videoRes: "1080p",
};

type State = {
  credits: number;
  generations: Generation[];
  composer: Composer;
  topUpOpen: boolean;
  viewerId?: string;
  setComposer: (patch: Partial<Composer>) => void;
  generate: () => { ok: boolean; reason?: string };
  tick: (dtMs: number) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  toggleFavorite: (id: string) => void;
  remix: (id: string) => void;
  animate: (id: string) => void;
  upscale: (id: string) => { ok: boolean };
  addUpload: (name: string, dataUrl: string, aspect: AspectId) => string;
  addCredits: (n: number) => void;
  setTopUp: (open: boolean) => void;
  openViewer: (id?: string) => void;
  resetDemo: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      credits: STARTING_CREDITS,
      generations: [],
      composer: defaultComposer,
      topUpOpen: false,

      setComposer: (patch) => set((s) => ({ composer: { ...s.composer, ...patch } })),

      generate: () => {
        const { composer: c, credits, generations } = get();
        const source = c.sourceId ? generations.find((g) => g.id === c.sourceId) : undefined;
        const prompt = c.prompt.trim();
        if (!prompt && !source) return { ok: false, reason: "Describe what you want to see" };
        const modelId = c.mode === "image" ? c.imageModel : c.videoModel;
        const resolution = c.mode === "image" ? c.imageRes : c.videoRes;
        const cost = costFor(modelId, c.count, c.duration, resolution);
        if (cost > credits) {
          set({ topUpOpen: true });
          return { ok: false, reason: "Not enough credits" };
        }
        const now = Date.now();
        const n = c.mode === "image" ? c.count : 1;
        const per = Math.round((cost / n) * 10) / 10;
        const items: Generation[] = Array.from({ length: n }, (_, i) => {
          const seed = hash(`${prompt}|${modelId}|${now}|${i}`);
          const aspect = source ? source.aspect : c.aspect;
          return {
            id: uid(),
            kind: c.mode,
            prompt: prompt || source!.prompt,
            modelId,
            aspect,
            styleId: source ? source.styleId : c.mode === "image" ? c.styleId : "none",
            presetId: c.mode === "video" ? c.presetId : undefined,
            duration: c.mode === "video" ? c.duration : undefined,
            sourceId: source?.id,
            resolution,
            seed,
            url: source ? source.url : mockImage(seed, aspect),
            status: "queued",
            progress: 0,
            cost: per,
            favorite: false,
            createdAt: now + i,
          };
        });
        set({ credits: credits - cost, generations: [...items.reverse(), ...generations] });
        return { ok: true };
      },

      // Advances the fake render queue. Called on an interval by <Engine/>.
      tick: (dt) => {
        const gens = get().generations;
        let running = gens.filter((g) => g.status === "running").length;
        let changed = false;
        // oldest first so the queue is FIFO
        const next = [...gens].reverse().map((g) => {
          if (g.status === "queued" && running < MAX_CONCURRENT) {
            running++;
            changed = true;
            return { ...g, status: "running" as const };
          }
          if (g.status === "running") {
            changed = true;
            const seconds = getModel(g.modelId).speed * (g.upscaledFrom ? 0.6 : 1) * (g.duration === 10 ? 1.5 : 1);
            const progress = Math.min(1, g.progress + dt / 1000 / seconds);
            if (progress >= 1) running--;
            return { ...g, progress, status: progress >= 1 ? ("done" as const) : g.status };
          }
          return g;
        });
        if (changed) set({ generations: next.reverse() });
      },

      cancel: (id) =>
        set((s) => {
          const g = s.generations.find((x) => x.id === id);
          if (!g || g.status === "done" || g.status === "canceled") return s;
          return {
            credits: s.credits + g.cost,
            generations: s.generations.map((x) => (x.id === id ? { ...x, status: "canceled" } : x)),
          };
        }),

      remove: (id) =>
        set((s) => {
          const g = s.generations.find((x) => x.id === id);
          const refund = g && (g.status === "queued" || g.status === "running") ? g.cost : 0;
          return {
            credits: s.credits + refund,
            generations: s.generations.filter((x) => x.id !== id),
            viewerId: s.viewerId === id ? undefined : s.viewerId,
          };
        }),

      toggleFavorite: (id) =>
        set((s) => ({
          generations: s.generations.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)),
        })),

      remix: (id) => {
        const g = get().generations.find((x) => x.id === id);
        if (!g) return;
        const source = g.sourceId ? get().generations.find((x) => x.id === g.sourceId) : undefined;
        set((s) => ({
          viewerId: undefined,
          composer: {
            ...s.composer,
            mode: g.kind,
            prompt: g.prompt,
            aspect: g.aspect,
            styleId: g.kind === "image" ? g.styleId : s.composer.styleId,
            presetId: g.presetId ?? s.composer.presetId,
            duration: (g.duration as 5 | 10) ?? s.composer.duration,
            ...(g.resolution ? (g.kind === "image" ? { imageRes: g.resolution } : { videoRes: g.resolution }) : {}),
            sourceId: source?.id,
            focusKey: Date.now(),
            ...(g.kind === "video" ? { videoModel: g.modelId } : g.uploaded ? {} : { imageModel: g.modelId }),
          },
        }));
      },

      animate: (id) => {
        const g = get().generations.find((x) => x.id === id);
        if (!g || g.kind !== "image") return;
        set((s) => ({
          viewerId: undefined,
          composer: { ...s.composer, mode: "video", sourceId: g.id, prompt: g.prompt, aspect: g.aspect, focusKey: Date.now() },
        }));
      },

      upscale: (id) => {
        const { generations, credits } = get();
        const g = generations.find((x) => x.id === id);
        const cost = 2;
        if (!g || g.kind !== "image" || g.uploaded) return { ok: false };
        if (credits < cost) {
          set({ topUpOpen: true });
          return { ok: false };
        }
        const up: Generation = {
          ...g,
          id: uid(),
          upscaledFrom: g.id,
          url: mockImage(g.seed, g.aspect, 2),
          status: "queued",
          progress: 0,
          cost,
          favorite: false,
          createdAt: Date.now(),
        };
        set({ credits: credits - cost, generations: [up, ...generations], viewerId: undefined });
        return { ok: true };
      },

      // Uploaded images live alongside generations so they can be animated, favorited, etc.
      addUpload: (name, dataUrl, aspect) => {
        const g: Generation = {
          id: uid(),
          kind: "image",
          prompt: name,
          modelId: "upload",
          aspect,
          styleId: "none",
          uploaded: true,
          seed: hash(dataUrl.slice(-64)),
          url: dataUrl,
          status: "done",
          progress: 1,
          cost: 0,
          favorite: false,
          createdAt: Date.now(),
        };
        set((s) => ({ generations: [g, ...s.generations] }));
        return g.id;
      },

      addCredits: (n) => set((s) => ({ credits: s.credits + n, topUpOpen: false })),
      setTopUp: (open) => set({ topUpOpen: open }),
      openViewer: (id) => set({ viewerId: id }),
      resetDemo: () =>
        set({ credits: STARTING_CREDITS, generations: [], composer: defaultComposer, viewerId: undefined }),
    }),
    {
      name: "kino-studio-v1",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return { ...current, ...p, composer: { ...current.composer, ...p.composer } };
      },
      partialize: (s) => ({ credits: s.credits, generations: s.generations, composer: { ...s.composer, focusKey: undefined } }),
    },
  ),
);

export const styleFilter = (g: Pick<Generation, "styleId">) => getStyle(g.styleId).filter;
