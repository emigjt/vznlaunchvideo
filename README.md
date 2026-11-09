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
"Vision Studios", with every cut and camera move landing on a hit of the beat:

| Bars | Line | Treatment |
|---|---|---|
| 1–4 | every artist has a vision. | typed like a terminal, then one word per hit (punch, whip, turned on its side, giant outline); "vision." bent through a lens; the camera dives into the eye |
| 5–8 | at Vision Studios, we bring that vision to life. | lines snap up like a teleprompter; posters whip in; the work strobes on "life."; the picture collapses like a TV switching off |
| 9–12 | music production, mixing/mastering, cover art, merchandising. | one service per bar with whip pans; beat catalogue and live spectrum, live waveform and meters, covers slamming in on the 808s, the hoodie flipping |
| 13–14 | don't let it get in the way of creation. | interference bars and static pile up over the words until "creation." breaks through, the work flashing around it |
| 15 | let us help build your vision. | the loudest bar: "build" drops in letter by letter; "vision." bent again |
| 16 | Vision Studios: your sound. your vision. | the logo slams in; sign-off and site address |

Look: black and bone, greyscale only, Hitchcut for the words and Patchcode for the HUD.
`DISPLAY_FONT` in `src/brand.ts` switches the words back to Coldag Serif (the website's face).
Nothing sits still: words arrive fast and smeared (`src/fx/Motion.tsx`), the camera sways,
punches on the kicks and dives, whips or squeezes through the cuts, and the picture
flickers, drops out, doubles, tears, mirrors and fills with static on the hits
(`src/LaunchVideo.tsx`). Light streaks rush past like a tunnel, faster when the track is
louder. Film grain, scratches and scanlines change every frame.

In 9:16 the type and artwork stay out of the bottom fifth and the right edge, where the
apps put their caption and buttons.

## Changing it

- **Timing:** `src/beat.ts` maps the beat (`hit(bar, step)` = the frame of a sixteenth-step,
  counted like the music, bar 1–16, step 1–16). Scenes place everything with it.
- **Words and images:** one file per scene in `src/scenes/`.
- **Site address on the end card:** `SITE_URL` in `src/brand.ts`.
- **Camera moves, flashes and damage:** the lists at the top of `src/LaunchVideo.tsx` (punches, dives, whips, squeezes, white and inverted frames, mirrors, tears, static).

## Structure

```
src/Root.tsx            Compositions
src/LaunchVideo.tsx     The full video: scenes in order, music, flashes, tears, grain, HUD
src/scenes/             VisionScene, StudioScene, ServicesScene, CreateScene (one per phrase)
src/fx/                 Cut (flickering layer), Motion (arrivals with smear), Word, InlineWord
                        and Mono (type), Bent (lens-warped word), Frag (artwork), Logo,
                        Slices (tape tear), Overlays (static, scanlines, glitch lines, tunnel
                        streaks, echoes), HUD, Grain, Scratches, layout
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
