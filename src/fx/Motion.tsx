import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";

// Everything that lands on a hit arrives fast and settles (a sharp ease-out over a few
// frames), smeared along its path like a camera shutter dragging, then keeps drifting.

export type Enter = "punch" | "slam" | "whip-left" | "whip-right" | "drop" | "rise" | "spin" | "flip" | "none";

export type Pose = { x: number; y: number; scale: number; sx: number; rot: number };

const OUT = Easing.bezier(0.12, 0.9, 0.2, 1);
const DRIFT = Easing.bezier(0.25, 0.1, 0.25, 1);

/** Where an element is `t` frames after it appears (fractional `t` for the smear). */
export const enterPose = (t: number, enter: Enter, dist: number, seed: string, len = 6): Pose => {
  const r = 1 - OUT(Math.min(1, Math.max(0, t / len)));
  const tilt = (random(`tilt-${seed}`) - 0.5) * 2;
  const base: Pose = { x: 0, y: 0, scale: 1, sx: 1, rot: 0 };
  switch (enter) {
    case "punch":
      return { ...base, scale: 1 + 0.6 * r, rot: tilt * 6 * r };
    case "slam":
      return { ...base, scale: 1 + 2.4 * r, rot: tilt * 12 * r };
    case "whip-left":
      return { ...base, x: dist * r, rot: -4 * r };
    case "whip-right":
      return { ...base, x: -dist * r, rot: 4 * r };
    case "drop":
      return { ...base, y: -dist * r, rot: tilt * 5 * r };
    case "rise":
      return { ...base, y: dist * r, rot: tilt * 5 * r };
    case "spin":
      return { ...base, scale: 1 + 0.5 * r, rot: (tilt >= 0 ? 1 : -1) * 70 * r };
    case "flip":
      return { ...base, sx: 1 - r };
    default:
      return base;
  }
};

type KineticProps = {
  /** How it arrives. */
  enter?: Enter;
  /** Distance (px) for whips, drops and rises. */
  dist?: number;
  /** Frames the arrival takes. */
  len?: number;
  seed: string;
  /** Frames it holds, for the drift. */
  duration: number;
  /** Slow growth over `duration` (0.06 = 6%). */
  push?: number;
  /** Slow slide (px) and turn (deg) over `duration`. */
  drift?: [number, number];
  spin?: number;
  /** Motion-smear copies while it moves fast. */
  smear?: boolean;
  /** Point it scales and turns around (CSS transform-origin); the frame's centre by default. */
  origin?: string;
  children: React.ReactNode;
};

// Copies drawn behind the moving element: how far back along its path, and how strong.
const TRAIL: [number, number][] = [
  [0.6, 0.38],
  [1.2, 0.24],
  [1.8, 0.14],
  [2.6, 0.07],
];

/** Moves its children in with `enter`, smears them while fast, then drifts them. */
export const Kinetic: React.FC<KineticProps> = ({
  enter = "punch",
  dist = 600,
  len = 6,
  seed,
  duration,
  push = 0.05,
  drift = [0, 0],
  spin = 0,
  smear = true,
  origin,
  children,
}) => {
  const frame = useCurrentFrame();
  const pose = (t: number): Pose => {
    const e = enterPose(t, enter, dist, seed, len);
    const d = interpolate(t, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
    return { ...e, x: e.x + drift[0] * d, y: e.y + drift[1] * d, scale: e.scale * (1 + push * d), rot: e.rot + spin * d };
  };
  const moving = smear && enter !== "none" && frame < len;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {moving
        ? TRAIL.map(([dt, alpha]) => (
            <Layer key={`trail-${dt}`} pose={pose(frame - dt)} opacity={alpha} origin={origin}>
              {children}
            </Layer>
          ))
        : null}
      <Layer key="main" pose={pose(frame)} opacity={1} origin={origin}>
        {children}
      </Layer>
    </div>
  );
};

const Layer: React.FC<{ pose: Pose; opacity: number; origin?: string; children: React.ReactNode }> = ({ pose, opacity, origin, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      translate: `${pose.x}px ${pose.y}px`,
      scale: `${pose.scale * pose.sx} ${pose.scale}`,
      rotate: `${pose.rot}deg`,
      transformOrigin: origin,
    }}
  >
    {children}
  </div>
);
