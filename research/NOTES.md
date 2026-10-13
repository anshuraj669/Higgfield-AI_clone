# Higgsfield teardown (12 Oct 2026)

Public, logged-out pages, rendered in headless Chrome. Screenshots are in `screenshots/`.

## What's there

- **Nav sprawl.** The top bar has about 25 entries: Explore, Image, Video, Audio, MCP, API, Katana, AI Influencer, ChatGPT Plugin, Genjutsu, Ads Studio, Effects, Cinema Studio, Contests, Marketing Studio, Supercomputer, 3D Jutsu, Edit, Academy, Community, Plugins, Canvas, Originals, Pricing, Enterprise. Many carry "New" or "Top" badges.
- **Apps page.** Roughly 45 single-purpose apps in 8 categories: Professional, Enhance & Style, Face & Identity, Video Editing, Ads & Products, Games & Characters, Extras, Trending Templates. Most are one-click templates over the same image and video models.
- **Image generator** (`/ai/image`). An empty canvas with a prompt bar docked at the bottom. The bar has chips for `+` (reference upload), `@` (mention saved characters or elements), model, aspect (Auto), quality (High), resolution (2K) and batch (1/4). The Generate button shows the credit cost, with a strikethrough discount (8.5 → 6.5).
- **Video generator** (`/ai-video`). Same prompt bar, plus duration (8s), first and last frame, video-to-video editing, motion reference video, and about 7 third-party models (Kling 3.0, Seedance 2.0/2.5, Wan 2.7, Sora 2, Veo 3.1…).
- **Cinema Studio** (`/generate`). A separate app shell: sidebar with My generations / elements / favorites, plus projects. Its "shot builder" exposes Film setup, Camera, Color palette and Lighting (each defaulting to Auto), up to 50 references, and `@` for characters and locations. It claims 30+ camera-movement presets and the ability to stack up to 3 moves.
- **Effects.** Named presets (Floating Fall, Burning Man, Melting…), each with a "Recreate" CTA.
- **Pricing.** Rendered client-side and gated; credit-based, with heavy promotions ("Unlimited Seedance 2.5 for 30 days", "30% OFF", "extra discount" banners on nearly every screen).
- **Community.** Projects and shots with likes and views. Projects expose the prompts and assets used.

## What I took from it

1. **The core loop is good. Getting to it is the problem.** Prompt → model → settings → generate → iterate is solid. But it sits behind ~25 nav items, 45 apps, a separate Cinema Studio shell and promo banners on every page. A first-time user can't tell where to start.
2. **The prompt bar's chip row is the right pattern.** Every setting is visible as a compact chip, and the price is shown on the button. I kept "price before you click" and the visible settings.
3. **Camera motion is the signature.** Presets plus image-to-video is what separates it from a generic image tool, so it gets first-class space in my build.
4. **Using a reference or start frame matters.** "Use your own image" shows up everywhere (`+`, first/last frame, references).
5. **Promotions are noise for a creator mid-task.** No upsells inside the workspace. Credits come up only when you're actually short.

## Deliberately not rebuilt

The template apps, agents (Supercomputer), Genjutsu, Katana, the film festival, Academy, MCP/API, enterprise, and real accounts and payments. Each is a separate product on top of the same generate loop. In a 24h build I would rather ship one loop that feels finished than 20 shallow ones.
