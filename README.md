# vznlaunchvideo

Launch video for Vision Studios (VZN), built with [Remotion](https://www.remotion.dev)
(videos written in React). Companion to the website repo `emigjt/vznstudiowebpage`.

## Run it

```bash
npm i
npm run dev            # Remotion Studio: preview and scrub in the browser
npm run render         # out/vzn-launch-vertical.mp4, ready to upload
```

`npm run render` caps the bitrate at 14 Mbps (about 60 MB). The film grain changes every
frame, which video compression can't squeeze, so an uncapped render comes out around
470 MB, too big for the apps' upload limits and no better once they re-compress it.

## Compositions

- `LaunchVertical`: 1080×1920, 30 fps, 33 s. The social cut (TikTok, Reels, Shorts).
- `LaunchWide`: 1920×1080. Parked for now: it renders from the same scenes but hasn't been
  tuned since the focus moved to vertical.
- `Scenes/…`: each scene on its own (9:16, without the music, grain and HUD) for editing.

## The video

The script is set as typography over **Wanderer** (VZN, 122 BPM), one 4-bar phrase per
line, with every cut landing on a hit of the beat:

| Bars | Line | Portfolio |
|---|---|---|
| 1–4 | Every artist has a vision. | posters flash for a frame on the downbeats; "vision" becomes the eye logo |
| 5–8 | At Vision Studios, we help bring that vision to life. | a poster per bar; the work strobes on "life" |
| 9–12 | Music production / Mixing, Mastering / Cover art / Merchandising | beat catalogue and live spectrum; live waveform and meters; artwork cutting on the 808s; the hoodie |
| 13–16 | Don't let it all slow you down from creating. Vision Studios: Your sound. Your vision. | the work flickers around "creating"; logo lockup and site address |

Look: black and bone, greyscale only, Coldag Serif for the words ("vision" in italic, as on
the site) and Patchcode for the HUD. Cuts are hard and stutter for a frame or two on the
way in and out; heavy hits add a white flash, an inverted frame, a tape tear or a small
shake. Film grain and scratches change every frame.

In 9:16 the type and artwork stay out of the bottom fifth and the right edge, where the
apps put their caption and buttons.

## Changing it

- **Timing:** `src/beat.ts` maps the beat (`hit(bar, step)` = the frame of a sixteenth-step,
  counted like the music, bar 1–16, step 1–16). Scenes place everything with it.
- **Words and images:** one file per scene in `src/scenes/`.
- **Site address on the end card:** `SITE_URL` in `src/brand.ts`.
- **Flashes and tears:** the `WHITE`, `INVERT` and `GLITCH` lists in `src/LaunchVideo.tsx`.

## Structure

```
src/Root.tsx            Compositions
src/LaunchVideo.tsx     The full video: scenes in order, music, flashes, tears, grain, HUD
src/scenes/             VisionScene, StudioScene, ServicesScene, CreateScene (one per phrase)
src/fx/                 Cut (flickering layer), Word and Mono (type), Frag (artwork),
                        Logo, Slices (tape tear), HUD, Grain, Scratches, layout
src/beat.ts             Beat grid of Wanderer
src/audio-envelope.ts   Per-frame bass, loudness and hit levels of Wanderer (precomputed)
src/metrics.ts          Coldag Serif glyph widths, to size words to the frame
src/brand.ts            Colours, fonts, site address
src/fonts.ts            Loads the self-hosted brand fonts
public/brand/           Logos (white, black, currentColor)
public/fonts/           Coldag Serif (Bold, Italic, Outline), Patchcode
public/audio/           The seven beats (320 kbps MP3)
public/visual/          Posters and artwork (1600 px)
public/shop/            VZN Logo Hoodie, charcoal and grey, front and back
public/texture/         Vintage scratches
references/             Reference videos for tone
```

Assets are copied from the website repo. Rendered videos go in `out/` (not committed).

Remotion is free for individuals and companies of up to 3 people; see remotion.dev/license.
