import { Generation } from "./store";
import { toast } from "./toast";

export async function download(g: Generation) {
  const name = `${g.prompt.slice(0, 40).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "kino"}-${g.seed}.jpg`;
  try {
    const blob = await (await fetch(g.url)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    if (g.kind === "video") toast("Mock mode: saved the source frame");
  } catch {
    window.open(g.url, "_blank", "noopener");
  }
}
