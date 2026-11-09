import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, random, Series, staticFile, useCurrentFrame } from "remotion";
import { env } from "./audio-envelope";
import { colors } from "./brand";
import { hit, MUSIC_END, SCENE_START, TOTAL } from "./beat";
import "./fonts";
import { HUD } from "./fx/HUD";
import { useLayout } from "./fx/layout";
import { Echoes, GlitchLines, Scanlines, Static, Streaks, type Echo } from "./fx/Overlays";
import { Slices } from "./fx/Slices";
import { Grain, Scratches, Vignette } from "./fx/Texture";
import { CreateScene } from "./scenes/CreateScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { StudioScene } from "./scenes/StudioScene";
import { VisionScene } from "./scenes/VisionScene";

// ------------------------------------------------------------------ the edit, on the beat
// Every event below is placed on the beat grid (hit(bar, step)), so the camera, flashes
// and damage land with the music.

const OUT = Easing.bezier(0.12, 0.9, 0.2, 1);

/** The picture arrives zoomed in and snaps back: [frame, how far]. */
const PUNCHES: [number, number][] = [
  [hit(2, 1), 0.25],
  [hit(2, 9), 0.12],
  [hit(3, 9) + 2, 0.3],
  [hit(4, 3), 0.2],
  [hit(4, 9), 0.1],
  [hit(5, 1), 0.35],
  [hit(6, 1), 0.1],
  [hit(7, 3), 0.15],
  [hit(8, 3), 0.1],
  [hit(8, 9), 0.22],
  [hit(9, 9), 0.1],
  [hit(10, 9), 0.1],
  [hit(11, 1) + 2, 0.35],
  [hit(11, 3), 0.12],
  [hit(11, 8), 0.12],
  [hit(11, 9), 0.18],
  [hit(11, 13), 0.12],
  [hit(12, 9), 0.1],
  [hit(13, 1), 0.25],
  [hit(13, 9), 0.12],
  [hit(14, 9) + 2, 0.4],
  [hit(15, 1) + 2, 0.35],
  [hit(15, 3), 0.15],
  [hit(15, 8), 0.12],
  [hit(15, 13), 0.2],
  [hit(16, 1) + 2, 0.45],
];

/** The camera dives forward into the next cut: [from, cut]. */
const DIVES: [number, number][] = [
  [hit(4, 15), hit(5, 1)],
  [hit(10, 13), hit(11, 1)],
  [hit(15, 15), hit(16, 1)],
];

/** Whip pans across a cut: [cut, direction]. */
const WHIPS: [number, number][] = [
  [hit(10, 1), -1],
  [hit(12, 1), 1],
  [hit(13, 1), -1],
];

/** The picture collapses to a line like a TV switching off, then back on: [from, cut]. */
const SQUEEZES: [number, number][] = [[hit(8, 15), hit(9, 1)]];

const WHITE = new Set([hit(3, 9), hit(9, 1), hit(11, 1), hit(14, 9), hit(15, 1), hit(16, 1)]);
const INVERT = new Set([hit(3, 9) + 1, hit(5, 1), hit(11, 1) + 1, hit(14, 9) + 1, hit(15, 1) + 1, hit(16, 1) + 1, hit(9, 1) + 6]);
const MIRROR = new Set([hit(13, 13), hit(13, 13) + 1, hit(13, 13) + 2, hit(14, 1), hit(14, 1) + 1]);

const tear = (bar: number, step: number) => [hit(bar, step), hit(bar, step) + 1];
const SLICES = new Set([
  ...tear(1, 15),
  ...tear(4, 13),
  ...tear(8, 13),
  ...tear(12, 13),
  ...tear(12, 15),
  hit(13, 11),
  hit(13, 15),
  hit(14, 5),
  hit(14, 7),
  hit(14, 13),
  hit(16, 1) + 2,
  hit(16, 1) + 3,
  ...tear(16, 13),
  ...tear(16, 15),
]);

/** Bursts of static: [frame, strength]. */
const STATIC: [number, number][] = [
  [hit(4, 13), 0.5],
  [hit(4, 13) + 1, 0.3],
  [hit(8, 13), 0.6],
  [hit(8, 13) + 1, 0.35],
  [hit(12, 13), 0.7],
  [hit(12, 13) + 1, 0.4],
  [hit(12, 15), 0.5],
  [hit(13, 13), 0.55],
  [hit(14, 1), 0.9],
  [hit(14, 1) + 1, 0.7],
  [hit(14, 3), 0.5],
  [hit(16, 13), 0.5],
  [hit(16, 15), 0.4],
];

// Claps on step 9 of every bar get a ghost double for two frames.
const CLAPS = new Set(Array.from({ length: 16 }, (_, i) => [hit(i + 1, 9), hit(i + 1, 9) + 1]).flat());
// The main hits, which stray dropouts must never land on.
const HITS = new Set(Array.from({ length: 16 }, (_, i) => [1, 3, 9].map((s) => hit(i + 1, s))).flat());

type Camera = { x: number; y: number; scale: number; sx: number; sy: number; rot: number; echoes: Echo[]; streaks: number };

const camera = (frame: number, W: number, u: number): Camera => {
  const kick = env("kick", frame);
  // Handheld sway, and a nudge on every bass hit.
  let x = Math.sin(frame / 37) * 7 * u + Math.sin(frame / 11.3) * 2 * u;
  let y = Math.cos(frame / 29) * 6 * u;
  const rot = Math.sin(frame / 53) * 0.35 + (kick > 0.4 ? (random(`kr-${frame}`) - 0.5) * kick * 1.2 : 0);
  let scale = 1 + kick * 0.03;
  let sx = 1;
  let sy = 1;
  if (kick > 0.4) {
    x += (random(`kx-${frame}`) - 0.5) * kick * kick * 18 * u;
    y += (random(`ky-${frame}`) - 0.5) * kick * kick * 10 * u;
  }
  const echoes: Echo[] = [];
  let streaks = frame < MUSIC_END ? 0.1 + env("level", frame) * 0.35 : 0.04;
  if (frame >= hit(9) && frame < hit(13)) streaks += 0.2;
  if (frame >= hit(15) && frame < hit(16)) streaks += 0.25;

  for (const [at, amount] of PUNCHES) {
    const t = frame - at;
    if (t >= 0 && t < 7) {
      const r = 1 - OUT(t / 7);
      scale *= 1 + amount * r;
      if (t < 3) echoes.push({ scale: 1 + amount * 0.25, opacity: 0.3 * r }, { scale: 1 + amount * 0.5, opacity: 0.15 * r });
    }
  }
  for (const [from, cut] of DIVES) {
    if (frame >= from && frame < cut) {
      const k = Math.pow((frame - from + 1) / (cut - from), 2.2);
      scale *= 1 + 2.4 * k;
      streaks = Math.max(streaks, 0.4 + k * 0.6);
      echoes.push({ scale: 1 + 0.08 * k, opacity: 0.35 }, { scale: 1 + 0.18 * k, opacity: 0.22 }, { scale: 1 + 0.3 * k, opacity: 0.12 });
    }
  }
  for (const [cut, dir] of WHIPS) {
    const t = frame - cut;
    if (t >= -3 && t < 0) {
      const k = Math.pow((t + 4) / 4, 2);
      x += -dir * W * 0.55 * k;
      echoes.push({ x: dir * W * 0.08, opacity: 0.35 }, { x: dir * W * 0.16, opacity: 0.2 }, { x: dir * W * 0.25, opacity: 0.1 });
    } else if (t >= 0 && t < 5) {
      const r = 1 - OUT(t / 5);
      x += dir * W * 0.55 * r;
      echoes.push({ x: dir * W * 0.08 * r, opacity: 0.35 * r }, { x: dir * W * 0.16 * r, opacity: 0.2 * r }, { x: dir * W * 0.25 * r, opacity: 0.1 * r });
    }
  }
  for (const [from, cut] of SQUEEZES) {
    if (frame >= from && frame < cut) {
      const k = Math.pow((frame - from + 1) / (cut - from), 2);
      sy *= 1 - 0.985 * k;
      sx *= 1 + 0.25 * k;
    }
    const t = frame - cut - 1;
    if (t >= 0 && t < 5) sy *= interpolate(t, [0, 4], [0.03, 1], { easing: OUT, extrapolateRight: "clamp" });
  }
  if (CLAPS.has(frame)) echoes.push({ x: 16 * u, opacity: 0.32 }, { x: -12 * u, y: 4 * u, opacity: 0.22 });
  return { x, y, scale, sx, sy, rot, echoes, streaks };
};

export const LaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, u, cy } = useLayout();
  const cam = camera(frame, width, u);
  const white = WHITE.has(frame);
  const tearing = SLICES.has(frame);
  const staticAmount =
    STATIC.find(([f]) => f === frame)?.[1] ??
    // "get in the way": interference builds until "creation." breaks through.
    (frame >= hit(13, 9) && frame < hit(14, 9)
      ? interpolate(frame, [hit(13, 9), hit(14, 9) - 1], [0.06, 0.3])
      : random(`st-${frame}`) < 0.03 && frame < MUSIC_END
        ? 0.25
        : 0);
  // Stray flicker: now and then the picture drops out (black) or dims for a frame, but
  // never on or right by a hit, or while the camera is moving through a transition.
  const near = [0, 1, 2].some((d) => HITS.has(frame - d) || HITS.has(frame + d));
  const moving =
    DIVES.some(([a, b]) => frame >= a && frame < b) ||
    WHIPS.some(([c]) => frame >= c - 3 && frame < c + 5) ||
    SQUEEZES.some(([a, c]) => frame >= a && frame < c + 6);
  const drop = !near && !moving && !white && frame > 10 && frame < MUSIC_END ? random(`drop-${frame}`) : 1;
  const contentOpacity = drop < 0.012 ? 0 : drop < 0.025 ? 0.35 : 1;
  const lines = HITS.has(frame) ? 1 : frame >= hit(13, 9) && frame < hit(14, 9) && random(`gl-${frame}`) < 0.5 ? 2 : random(`gl2-${frame}`) < 0.05 ? 1 : 0;
  const flickerLight = 0.93 + random(`fl-${frame}`) * 0.12;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: "hidden" }}>
      <Audio
        src={staticFile("audio/wanderer.mp3")}
        volume={(f) => interpolate(f, [MUSIC_END - 3, MUSIC_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      <AbsoluteFill
        style={{
          translate: `${cam.x}px ${cam.y}px`,
          scale: `${cam.scale * cam.sx * (MIRROR.has(frame) ? -1 : 1)} ${cam.scale * cam.sy}`,
          rotate: `${cam.rot}deg`,
          transformOrigin: `50% ${cy}px`,
          opacity: contentOpacity,
          filter: `${INVERT.has(frame) ? "invert(1) " : ""}brightness(${flickerLight})`,
        }}
      >
        <Echoes copies={cam.echoes}>
          <Slices active={tearing} seed={`tear-${frame}`} amount={80 * u}>
            <Series>
              <Series.Sequence name="every artist has a vision." durationInFrames={SCENE_START[1] - SCENE_START[0]}>
                <VisionScene />
              </Series.Sequence>
              <Series.Sequence name="at Vision Studios, we bring that vision to life." durationInFrames={SCENE_START[2] - SCENE_START[1]}>
                <StudioScene />
              </Series.Sequence>
              <Series.Sequence name="services" durationInFrames={SCENE_START[3] - SCENE_START[2]}>
                <ServicesScene />
              </Series.Sequence>
              <Series.Sequence name="don't let it get in the way... let us help build your vision." durationInFrames={TOTAL - SCENE_START[3]}>
                <CreateScene />
              </Series.Sequence>
            </Series>
          </Slices>
        </Echoes>
      </AbsoluteFill>

      <Streaks frame={frame} amount={cam.streaks} cy={cy} />
      <Static frame={frame} amount={staticAmount} />
      <GlitchLines frame={frame} count={lines} />
      <Scanlines frame={frame} />
      <Scratches amount={0.14} frame={frame} />
      <Grain frame={frame} amount={0.9 + 0.3 * env("level", frame)} />
      <Vignette amount={0.5} />
      <HUD frame={frame} hidden={white} glitch={tearing || staticAmount > 0.4} crosshair={frame < hit(1, 9)} />

      {white ? <AbsoluteFill style={{ backgroundColor: colors.paper }} /> : null}
    </AbsoluteFill>
  );
};
