import { ASPECTS, AspectId } from "./catalog";

const MAX_SIDE = 1280;

/** Downscale to a JPEG data URL (keeps localStorage small) and snap to the nearest supported aspect. */
export async function readImage(file: File): Promise<{ dataUrl: string; aspect: AspectId }> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const ratio = bitmap.width / bitmap.height;
  const aspect = ASPECTS.reduce((best, a) => (Math.abs(a.w / a.h - ratio) < Math.abs(best.w / best.h - ratio) ? a : best)).id;
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.82), aspect };
}
