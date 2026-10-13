"use client";

import { create } from "zustand";

type Toast = { id: number; text: string; action?: { label: string; run: () => void } };

export const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void }>(
  (set) => ({
    toasts: [],
    push: (t) => {
      const id = Date.now() + Math.random();
      set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3500);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  }),
);

export const toast = (text: string, action?: Toast["action"]) => useToasts.getState().push({ text, action });
