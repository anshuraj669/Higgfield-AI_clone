export type Mode = "image" | "video";

export type Model = {
  id: string;
  mode: Mode;
  name: string;
  tagline: string;
  cost: number; // credits per output (video: per 5s)
  speed: number; // seconds to "generate"
  badge?: string;
};

export const MODELS: Model[] = [
  { id: "lumen-fast", mode: "image", name: "Lumen Fast", tagline: "Drafts in seconds", cost: 1, speed: 3, badge: "Fast" },
  { id: "lumen-hd", mode: "image", name: "Lumen HD", tagline: "Sharper detail, better text", cost: 3, speed: 6 },
  { id: "atlas-photo", mode: "image", name: "Atlas Photoreal", tagline: "Photographic realism", cost: 4, speed: 8, badge: "Best" },
  { id: "motion-lite", mode: "video", name: "Motion Lite", tagline: "Quick motion tests", cost: 6, speed: 8, badge: "Fast" },
  { id: "motion-pro", mode: "video", name: "Motion Pro", tagline: "Cinematic camera control", cost: 15, speed: 14, badge: "Best" },
];

export const ASPECTS = [
  { id: "1:1", w: 768, h: 768 },
  { id: "4:5", w: 768, h: 960 },
  { id: "9:16", w: 576, h: 1024 },
  { id: "16:9", w: 1024, h: 576 },
  { id: "3:2", w: 960, h: 640 },
] as const;
export type AspectId = (typeof ASPECTS)[number]["id"];

export type Style = { id: string; name: string; suffix: string; filter: string };
export const STYLES: Style[] = [
  { id: "none", name: "No style", suffix: "", filter: "none" },
  { id: "cinematic", name: "Cinematic", suffix: "cinematic lighting, anamorphic, film grain", filter: "contrast(1.12) saturate(1.1)" },
  { id: "noir", name: "Film Noir", suffix: "black and white, hard shadows", filter: "grayscale(1) contrast(1.35)" },
  { id: "vintage", name: "70s Film", suffix: "faded kodak film, warm tones", filter: "sepia(.45) saturate(1.2) contrast(.95)" },
  { id: "vivid", name: "Vivid Pop", suffix: "bold saturated colors", filter: "saturate(1.8) contrast(1.1)" },
  { id: "dream", name: "Dreamy", suffix: "soft haze, pastel", filter: "brightness(1.08) saturate(.8) blur(.3px)" },
];

export type Preset = {
  id: string;
  name: string;
  category: "Camera" | "Energy" | "Mood";
  description: string;
  seed: string; // thumbnail
};

// Each preset maps to a `.motion-<id>` keyframe animation in globals.css
export const PRESETS: Preset[] = [
  { id: "push-in", name: "Slow Push In", category: "Camera", description: "Steady dolly toward the subject. Builds tension.", seed: "portrait-rain" },
  { id: "pull-out", name: "Pull Back Reveal", category: "Camera", description: "Starts tight, reveals the world around it.", seed: "mountain-lake" },
  { id: "pan-left", name: "Truck Left", category: "Camera", description: "Lateral slide across the scene.", seed: "city-street" },
  { id: "crane-up", name: "Crane Up", category: "Camera", description: "Rises vertically for an establishing feel.", seed: "forest-mist" },
  { id: "orbit", name: "Orbit", category: "Camera", description: "Arcs around the subject with a slight tilt.", seed: "statue-sun" },
  { id: "crash-zoom", name: "Crash Zoom", category: "Energy", description: "Fast punch-in. Great for reveals and beats.", seed: "car-night" },
  { id: "handheld", name: "Handheld", category: "Energy", description: "Organic shake, documentary energy.", seed: "crowd-concert" },
  { id: "whip", name: "Whip Pan", category: "Energy", description: "Snappy pan with motion blur.", seed: "skate-park" },
  { id: "dutch", name: "Dutch Roll", category: "Mood", description: "Slow roll off-axis. Uneasy, dreamlike.", seed: "hallway-neon" },
  { id: "float", name: "Float", category: "Mood", description: "Gentle drift, like breathing.", seed: "ocean-calm" },
  { id: "vertigo", name: "Vertigo", category: "Mood", description: "Zoom against a dolly. Disorienting.", seed: "stairs-spiral" },
  { id: "static", name: "Locked Off", category: "Mood", description: "Tripod shot. Let the subject move.", seed: "cafe-window" },
];

export const SAMPLE_PROMPTS = [
  "A lighthouse keeper reading by lantern light, storm outside the window",
  "Neon-soaked Tokyo alley after rain, reflections on wet asphalt",
  "Astronaut floating above a field of sunflowers at golden hour",
  "Macro shot of a dewdrop on a spider web, morning backlight",
  "Vintage red convertible on a desert highway, heat haze",
  "A fox curled up in fresh snow, soft blue dusk light",
  "Brutalist concrete library with a single beam of sunlight",
  "Street food vendor at night, steam rising, warm bokeh",
];

export const getModel = (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0];
export const getPreset = (id?: string) => PRESETS.find((p) => p.id === id);
export const getStyle = (id?: string) => STYLES.find((s) => s.id === id) ?? STYLES[0];
export const getAspect = (id: string) => ASPECTS.find((a) => a.id === id) ?? ASPECTS[0];

export const RESOLUTIONS: Record<Mode, { id: string; mult: number }[]> = {
  image: [
    { id: "1K", mult: 1 },
    { id: "2K", mult: 1.5 },
    { id: "4K", mult: 3 },
  ],
  video: [
    { id: "720p", mult: 1 },
    { id: "1080p", mult: 1.5 },
  ],
};

const resMult = (mode: Mode, res: string) => RESOLUTIONS[mode].find((r) => r.id === res)?.mult ?? 1;

export function costFor(modelId: string, count: number, duration: number, res: string) {
  const m = getModel(modelId);
  const base = m.mode === "video" ? m.cost * (duration / 5) : m.cost * count;
  return Math.round(base * resMult(m.mode, res) * 10) / 10;
}

export const fmtCredits = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

export const mockImage = (seed: string, aspect: string, scale = 1) => {
  const a = getAspect(aspect);
  return `https://picsum.photos/seed/${seed}/${Math.round(a.w * scale)}/${Math.round(a.h * scale)}`;
};
