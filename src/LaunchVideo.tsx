import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, random, Series, staticFile, useCurrentFrame } from "remotion";
import { env } from "./audio-envelope";
import { colors } from "./brand";
import { hit, MUSIC_END, SCENE_START, TOTAL } from "./beat";
import "./fonts";
import { HUD } from "./fx/HUD";
import { useLayout } from "./fx/layout";
import { Slices } from "./fx/Slices";
import { Grain, Scratches, Vignette } from "./fx/Texture";
import { CreateScene } from "./scenes/CreateScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { StudioScene } from "./scenes/StudioScene";
import { VisionScene } from "./scenes/VisionScene";

// Hits that get a full-frame flash: one frame of bone, then one frame of the picture
// inverted. "vision.", cover art (where the track gets fuller and the artwork first
// appears), "don't" (the loudest downbeat) and the logo. The services and "creation."
// open on an inverted frame.
const WHITE = new Set([hit(3, 9), hit(9, 1), hit(11, 1), hit(15, 1)]);
const INVERT = new Set([hit(3, 9) + 1, hit(7, 1), hit(9, 1) + 1, hit(11, 1) + 1, hit(12, 9), hit(15, 1) + 1]);

// Frames where the picture tears sideways: the eye landing, the 808 fills that close each
// section, the service changes, "the way", and the logo landing.
const tear = (bar: number, step: number) => [hit(bar, step), hit(bar, step) + 1];
const GLITCH = new Set([
  ...tear(4, 3),
  ...tear(4, 13),
  ...tear(4, 15),
  ...tear(6, 15),
  ...tear(8, 1),
  ...tear(8, 13),
  ...tear(8, 15),
  ...tear(10, 1),
  ...tear(11, 13),
  ...tear(12, 13),
  ...tear(12, 15),
  hit(15, 1) + 2,
  hit(15, 1) + 3,
  ...tear(16, 13),
  ...tear(16, 15),
]);

export const LaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const kick = env("kick", frame);
  // Heavy hits nudge the picture: a small seeded shake and a slight push.
  const shake = kick > 0.35 ? kick * kick * 9 * u : 0;
  const dx = (random(`shake-x-${frame}`) - 0.5) * 2 * shake;
  const dy = (random(`shake-y-${frame}`) - 0.5) * shake;
  const white = WHITE.has(frame);
  const glitch = GLITCH.has(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Audio
        src={staticFile("audio/wanderer.mp3")}
        volume={(f) => interpolate(f, [MUSIC_END - 3, MUSIC_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      <AbsoluteFill
        style={{
          translate: `${dx}px ${dy}px`,
          scale: 1 + kick * 0.012,
          filter: INVERT.has(frame) ? "invert(1)" : undefined,
        }}
      >
        <Slices active={glitch} seed={`tear-${frame}`} amount={70 * u}>
          <Series>
            <Series.Sequence name="every artist has a vision." durationInFrames={SCENE_START[1] - SCENE_START[0]}>
              <VisionScene />
            </Series.Sequence>
            <Series.Sequence name="at Vision Studios, we bring that vision to life." durationInFrames={SCENE_START[2] - SCENE_START[1]}>
              <StudioScene />
            </Series.Sequence>
            <Series.Sequence name="Services" durationInFrames={SCENE_START[3] - SCENE_START[2]}>
              <ServicesScene />
            </Series.Sequence>
            <Series.Sequence name="don't let it get in the way of creation. let us help build your vision." durationInFrames={TOTAL - SCENE_START[3]}>
              <CreateScene />
            </Series.Sequence>
          </Series>
        </Slices>
      </AbsoluteFill>

      <Scratches amount={0.12} frame={frame} />
      <Grain frame={frame} amount={0.9 + 0.3 * env("level", frame)} />
      <Vignette amount={0.5} />
      <HUD frame={frame} hidden={white} glitch={glitch} crosshair={frame < hit(1, 9)} />

      {white ? <AbsoluteFill style={{ backgroundColor: colors.paper }} /> : null}
    </AbsoluteFill>
  );
};
