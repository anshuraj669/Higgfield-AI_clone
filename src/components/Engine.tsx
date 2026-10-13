"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

const STEP = 200;

// Drives the mock render queue. Swap this for polling a real provider's job API.
export function Engine() {
  useEffect(() => {
    const t = setInterval(() => useStore.getState().tick(STEP), STEP);
    return () => clearInterval(t);
  }, []);
  return null;
}
