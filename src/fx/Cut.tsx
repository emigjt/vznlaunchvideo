import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { flicker, jolt } from "./flicker";

type CutProps = {
  /** Shown in the Studio timeline. */
  name: string;
  /** First frame (relative to the scene). */
  at: number;
  /** Frame it is gone again (exclusive). */
  until: number;
  /** Picks the flicker pattern and the jolt; give each cut its own. */
  seed?: number | string;
  /** Chance of a stray one-frame blink while it holds. */
  dropout?: number;
  /** How far (px) it jumps on its first frames. */
  shake?: number;
  /** Draws the first frame as a blown-out photocopy. */
  burn?: boolean;
  /** Holds to its last frame without the stutter (for the end card). */
  cleanExit?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * A layer that cuts in at `at` and out at `until` with a ragged, flickering edge.
 * It is a <Sequence>, so its timing can be dragged in the Studio timeline, and its
 * children count frames from their own start.
 */
export const Cut: React.FC<CutProps> = ({ name, at, until, ...rest }) => (
  <Sequence name={name} from={at} durationInFrames={Math.max(1, until - at)} layout="none">
    <Flicker duration={Math.max(1, until - at)} {...rest} />
  </Sequence>
);

const Flicker: React.FC<Omit<CutProps, "name" | "at" | "until"> & { duration: number }> = ({
  duration,
  seed = 0,
  dropout = 0,
  shake = 0,
  burn = false,
  cleanExit = false,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const visible = flicker(frame, 0, cleanExit ? Infinity : duration, seed, dropout);
  const [dx, dy] = jolt(frame, seed, shake);
  return (
    <AbsoluteFill
      style={{
        opacity: visible,
        translate: `${dx}px ${dy}px`,
        filter: burn && frame === 0 ? "contrast(3) brightness(1.4)" : undefined,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
