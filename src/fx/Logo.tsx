import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

// The eye logo is 1075 × 1056.
const RATIO = 1056 / 1075;

type LogoProps = {
  /** Width in px. */
  size: number;
  /** Centre, px. */
  x: number;
  y: number;
  /** Slow growth over `duration` frames. */
  push?: number;
  duration?: number;
  /** A faint offset double exposure, like the hero logo on the site. */
  ghost?: number;
};

/** The VZN eye, in white. */
export const Logo: React.FC<LogoProps> = ({ size, x, y, push = 0.04, duration = 60, ghost = 0 }) => {
  const frame = useCurrentFrame();
  const h = size * RATIO;
  const scale = interpolate(frame, [0, duration], [1, 1 + push], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - h / 2, width: size, height: h, scale }}>
      {ghost > 0 ? (
        <Img
          src={staticFile("brand/logo-white.svg")}
          style={{ position: "absolute", inset: 0, width: size, height: h, opacity: ghost, translate: `${size * 0.025}px ${size * -0.012}px`, filter: "blur(2px)" }}
        />
      ) : null}
      <Img src={staticFile("brand/logo-white.svg")} style={{ position: "absolute", inset: 0, width: size, height: h }} />
    </div>
  );
};
