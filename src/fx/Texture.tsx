import React from "react";
import { AbsoluteFill, CanvasImage, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Film grain that changes every frame: light specks for the blacks and dark specks
 * for the type, so both get texture. `amount` 0–1.
 */
export const Grain: React.FC<{ amount?: number; frame?: number }> = ({ amount = 1, frame: frameProp }) => {
  const own = useCurrentFrame();
  const frame = frameProp ?? own;
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: amount }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <filter id="vzn-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={0.72} numOctaves={2} seed={frame % 997} stitchTiles="stitch" />
          {/* Red channel → light specks, green channel → dark specks. */}
          <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.91  0 0 0 0 0.89  2.2 0 0 0 -1.25" result="light" />
          <feTurbulence type="fractalNoise" baseFrequency={0.72} numOctaves={2} seed={(frame + 431) % 997} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 2.4 0 0 -1.3" result="dark" />
          <feMerge>
            <feMergeNode in="light" />
            <feMergeNode in="dark" />
          </feMerge>
        </filter>
        <rect width={width} height={height} filter="url(#vzn-grain)" opacity={0.55} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Dust and scratches from a film texture, jumping to a new position every couple of
 * frames like a worn print.
 */
export const Scratches: React.FC<{ amount?: number; frame?: number }> = ({ amount = 0.1, frame: frameProp }) => {
  const own = useCurrentFrame();
  const frame = frameProp ?? own;
  const { width, height } = useVideoConfig();
  const hold = Math.floor(frame / 2);
  const flipX = random(`sx-${hold}`) > 0.5;
  const flipY = random(`sy-${hold}`) > 0.5;
  // The texture is 2400 × 1600; cover the frame with some room to move.
  const s = Math.max(width / 2400, height / 1600) * 1.25;
  const w = Math.round(2400 * s);
  const h = Math.round(1600 * s);
  const x = -random(`px-${hold}`) * (w - width);
  const y = -random(`py-${hold}`) * (h - height);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: amount, mixBlendMode: "screen", overflow: "hidden" }}>
      <CanvasImage
        src={staticFile("texture/scratches.webp")}
        width={w}
        height={h}
        fit="cover"
        style={{ position: "absolute", left: x, top: y, scale: `${flipX ? -1 : 1} ${flipY ? -1 : 1}` }}
      />
    </AbsoluteFill>
  );
};

/** Darkened edges, like an old lens. */
export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${amount}) 100%)`,
    }}
  />
);
