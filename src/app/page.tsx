"use client";

import { Composer } from "@/components/Composer";
import { Feed } from "@/components/Feed";
import { useHydrated } from "@/lib/useHydrated";

export default function Studio() {
  const hydrated = useHydrated();
  return (
    <main className="md:flex">
      <aside className="border-b border-line bg-panel p-4 md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-[380px] md:shrink-0 md:border-b-0 md:border-r">
        {hydrated ? <Composer /> : <div className="shimmer h-full min-h-96 rounded-xl" />}
      </aside>
      <section className="min-w-0 flex-1 px-4 pb-16 md:px-6">{hydrated ? <Feed /> : null}</section>
    </main>
  );
}
