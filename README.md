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

- `LaunchVertical`: 1080×1920, 30 fps, 34 s. The social cut (TikTok, Reels, Shorts).
- `LaunchWide`: 1920×1080. Parked for now: it renders from the same scenes but hasn't been
  tuned since the focus moved to vertical.
- `Scenes/…`: each scene on its own (9:16, without the music, grain and HUD) for editing.

## The video

The script is set as typography over **Wanderer** (VZN, 122 BPM), lowercase except
"Vision Studios". Every line lands whole on its beat and stays on screen together while
it's read. Each piece of the portfolio first appears with the service that introduces it:

| Bars | Line | On screen |
|---|---|---|
| 1–3 | every artist has a vision. | the whole line; on the clap of bar 3 it flashes and becomes the eye logo |
| 4 | (the eye) | the eye holds through the fill |
| 5–6 | at Vision Studios, we bring that vision to life. | the whole line, large, type only |
| 7 | music production | the beat catalogue and a live spectrum |
| 8 | mixing / mastering | a live waveform and level meters |
| 9 | cover art | the posters and album cover, cutting on the hits |
| 10 | merchandising | the hoodie, flipping front and back |
| 11 | we handle it all. | the loudest downbeat; all four services around it at once |
| 12 | you focus on creating. | the work flickers around it |
| 13–14 | let us help build your vision. | the whole line |
| 15–16 | Vision Studios: your sound. your vision. | the logo, with the sign-off beneath it |
| end | website live now :) | with the site address, held 2.5 s past the music |

Look: black and bone, greyscale only, Hitchcut for the words ("vision" slanted) and Patchcode
for the HUD. `DISPLAY_FONT` in `src/brand.ts` switches the words back to Coldag Serif (the
website's face). Cuts are hard and stutter for a frame or two on the
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
src/metrics.ts          Display font glyph widths, to size words to the frame
src/brand.ts            Colours, fonts, site address
src/fonts.ts            Loads the self-hosted brand fonts
public/brand/           Logos (white, black, currentColor)
public/fonts/           Hitchcut, Coldag Serif (Bold, Italic, Outline), Patchcode;
                        source/ holds Hitchcut's original OTF and TTF
public/audio/           The seven beats (320 kbps MP3)
public/visual/          Posters and artwork (1600 px)
public/shop/            VZN Logo Hoodie, charcoal and grey, front and back
public/texture/         Vintage scratches
references/             Reference videos for tone
```

Assets are copied from the website repo. Rendered videos go in `out/` (not committed).

Remotion is free for individuals and companies of up to 3 people; see remotion.dev/license.
