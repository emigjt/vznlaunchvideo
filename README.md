# vznlaunchvideo

Launch video for Vision Studios (VZN), built with [Remotion](https://www.remotion.dev)
(videos written in React). Companion to the website repo `emigjt/vznstudiowebpage`.

## Run it

```bash
npm i
npm run dev            # Remotion Studio: preview and scrub in the browser
npm run render         # out/vzn-launch-vertical.mp4, ready to upload
npm run render:master  # out/VZN-Launch-Vertical-ProRes-HQ.mov, best quality (~960 MB)
```

`render:master` is the file to keep and compress from: ProRes 422 HQ (10-bit), lossless
frames, uncompressed audio. To write it somewhere else, e.g. straight into Downloads:
`npx remotion render LaunchVertical ~/Downloads/VZN-Launch-Vertical-ProRes-HQ.mov --codec=prores --prores-profile=hq --image-format=png --audio-codec=pcm-16 --color-space=bt709`

`npm run render` caps the bitrate at 14 Mbps (about 60 MB). The film grain changes every
frame, which video compression can't squeeze, so an uncapped render comes out around
470 MB, too big for the apps' upload limits and no better once they re-compress it.

## Compositions

- `LaunchVertical`: 1080×1920, 30 fps, 33 s. The social cut (TikTok, Reels, Shorts).
- `LaunchWide`: 1920×1080. Parked for now: it renders from the same scenes but hasn't been
  tuned since the focus moved to vertical.
- `Scenes/…`: each scene on its own (9:16, without the music, grain and HUD) for editing.

## The video

The script is set as typography over **Wanderer** (VZN, 122 BPM), lowercase except
"Vision Studios". Every line lands whole on its beat and stays on screen together while
it's read. Each piece of the portfolio first appears with the service that introduces it,
and the services get the most time:

| Time | Line | On screen |
|---|---|---|
| 0–3.9 s | every artist has a vision. | "vision." morphs into the eye logo in its place, and the eye grows to fill the screen |
| 3.9–7.9 s | at Vision Studios, we bring that vision to life. | the whole line, large, type only |
| 7.9–9.8 s | whatever you need. | type only |
| 9.8–12.8 s | music production | the beat catalogue and a live spectrum |
| 12.8–15.8 s | mixing / mastering | a live waveform and level meters |
| 15.8–18.7 s | cover art | all five artworks, large, cutting on the hits |
| 18.7–21.6 s | merchandising | the hoodie in both colours, front and back |
| 21.6–23.6 s | we handle it all. | all four services around it at once |
| 23.6–26.6 s | completely streamlined so you focus on creating. | the work flickers around it |
| 26.6–29.5 s | let us help build your vision. | across the loudest downbeat |
| 29.5 s to end | Vision Studios: your sound. your vision. | the logo on the last bar, held 1.5 s past the music |

Look: black and bone, greyscale only, Sactione for the words ("vision" in its italic) and
Patchcode for the HUD. `DISPLAY_FONT` in `src/brand.ts` switches the words to Hitchcut or to
Coldag Serif (the website's face). Cuts are hard and stutter for a frame or two on the
way in and out; heavy hits add a white flash, an inverted frame, a tape tear or a small
shake. Film grain and scratches change every frame.

In 9:16 the type and artwork stay out of the bottom fifth and the right edge, where the
apps put their caption and buttons.

## Changing it

- **Timing:** `src/beat.ts` maps the beat (`hit(bar, step)` = the frame of a sixteenth-step,
  counted like the music, bar 1–16, step 1–16). Scenes place everything with it.
- **Words and images:** one file per scene in `src/scenes/`.
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
src/metrics.ts          Display font glyph widths, to size words to the frame
src/brand.ts            Colours, fonts, site address
src/fonts.ts            Loads the self-hosted brand fonts
public/brand/           Logos (white, black, currentColor)
public/fonts/           Sactione (Regular, Italic), Hitchcut, Coldag Serif (Bold, Italic,
                        Outline), Patchcode; source/ holds the uploaded originals
public/audio/           The seven beats (320 kbps MP3)
public/visual/          Posters and artwork (1600 px)
public/shop/            VZN Logo Hoodie, charcoal and grey, front and back
public/texture/         Vintage scratches
references/             Reference videos for tone
```

Assets are copied from the website repo. Rendered videos go in `out/` (not committed).

Remotion is free for individuals and companies of up to 3 people; see remotion.dev/license.
