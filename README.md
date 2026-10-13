# Kino Studio

A rebuild of the core of [higgsfield.ai](https://higgsfield.ai): **prompt → still → shot**. You generate images, choose the best one and animate it with a cinematic camera move.

## What I chose to build, and why

The full teardown of higgsfield.ai, with screenshots, is in [`research/NOTES.md`](research/NOTES.md).

Higgsfield's homepage spreads one core action across dozens of separate apps, banners and promos (Ads Studio, Cinema Studio, Katana, Genjutsu, effects, agents, a festival). What users keep coming back for is a loop:

1. **Describe** something in the prompt box.
2. **Generate** a few variations.
3. **Choose** the best one.
4. **Animate** it with a camera move.
5. **Iterate** with remix, upscale, favorite or download.

Kino puts that whole loop on one screen.

| Built | Why |
| --- | --- |
| Single studio: composer on the left, results on the right | No hunting across apps. Every setting is visible before you spend credits. |
| Image and video modes, plus **Animate** on any image | Image-to-video is the product's signature move, so it takes one click from any result. |
| **Start frame**: upload or drag in your own image, or pick a recent result | "Use your own image" is everywhere in Higgsfield (`+`, first/last frame, references). |
| Resolution (1K/2K/4K, 720p/1080p) priced into the cost | Higgsfield shows quality as a chip next to the price. Kept that: settings and cost always visible together. |
| 12 camera-motion presets with live hover previews | You see the motion before you choose it, not just its name. |
| Credit cost on the Generate button, before you click | No surprise charges. A short balance turns the button into "Get credits". |
| Render queue (2 at a time) with progress, cancel and refund | Generation is slow, so the waiting state is part of the UX. |
| Viewer: full metadata, remix, upscale 2×, download, favorite, delete with undo | Iterating is the actual workflow. |
| Filters (images, videos, favorites) and prompt search | Your library grows fast. |
| Keyboard: ⌘/Ctrl+Enter generates; ←/→, Esc and Space work in the viewer | For heavy users. |
| No sign-up wall | The demo works for anyone who opens the link, with state saved in localStorage. |

**Left out on purpose:** accounts and auth, real payments, community feed, agents, film festival, ads tooling and enterprise pages. None of them are part of the core loop, and auth would only add friction to a demo.

## Simulated renders

There's no AI provider connected. `src/components/Engine.tsx` runs a fake job queue. Images are seeded stock photos, styles are CSS filters, and "videos" are the source frame with the preset's camera move applied as a CSS animation. The whole store (`src/lib/store.ts`) is written against a job model (`queued → running → done / canceled`, cost charged up front and refunded on cancel). Connecting a real provider such as fal.ai or Replicate means replacing `generate()` and `tick()` with an API call and polling. The UI doesn't change.

## Run it

```bash
npm install
npm run dev
```

Stack: Next.js 15 (App Router), Tailwind v4, Zustand. All pages are static, so it deploys anywhere.
