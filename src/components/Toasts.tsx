"use client";

import { useToasts } from "@/lib/toast";

export function Toasts() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="rise pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-raised px-4 py-2 text-sm shadow-xl">
          <span>{t.text}</span>
          {t.action && (
            <button
              className="font-medium text-accent hover:underline"
              onClick={() => {
                t.action!.run();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
