# vznlaunchvideo

Launch video for Vision Studios (VZN), built with [Remotion](https://www.remotion.dev)
(videos written in React). Companion to the website repo `emigjt/vznstudiowebpage`.

## Run it

```bash
npm i
npm run dev            # Remotion Studio: preview and scrub in the browser
npx remotion render LaunchWide out/launch-wide.mp4
npx remotion render LaunchVertical out/launch-vertical.mp4
```

## Compositions

- `LaunchWide`: 1920×1080 (YouTube, website)
- `LaunchVertical`: 1080×1920 (Reels, TikTok, Stories)

Both are placeholders until the brief (references, music, visuals, narrative) is in.

## Structure

```
src/brand.ts      Colours and fonts, matching the website
src/fonts.ts      Loads the self-hosted brand fonts
src/Composition.tsx, src/Root.tsx
public/brand/     Logos (white, black, currentColor)
public/fonts/     Coldag Serif (Bold, Italic, Outline), Patchcode
public/audio/     The seven beats (320 kbps MP3)
public/visual/    Posters and artwork (1600 px)
public/shop/      VZN Logo Hoodie, charcoal and grey, front and back
public/texture/   Vintage scratches
```

Assets are copied from the website repo. Rendered videos go in `out/` (not committed).

Remotion is free for individuals and companies of up to 3 people; see remotion.dev/license.
