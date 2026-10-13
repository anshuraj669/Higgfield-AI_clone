"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

// Persisted state only exists in the browser; render placeholders until it's loaded.
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (useStore.persist.hasHydrated()) setOk(true);
    return useStore.persist.onFinishHydration(() => setOk(true));
  }, []);
  return ok;
}
