import React from "react";
import { AbsoluteFill, random, useVideoConfig } from "remotion";
import { colors } from "../brand";
import { env } from "../audio-envelope";

/** Full-frame TV static; `amount` 0–1 (1 hides the picture). */
export const Static: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => {
  const { width, height } = useVideoConfig();
  if (amount <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: amount }}>
      <svg width={width} height={height}>
        <filter id="vzn-static" x="0" y="0" width="100%" height="100%">
          {/* Stretched sideways, like analogue snow. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.35 1.6" numOctaves={1} seed={(frame * 7) % 991} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.1 0.9 1" />
            <feFuncG type="discrete" tableValues="0 0.1 0.9 1" />
            <feFuncB type="discrete" tableValues="0 0.1 0.9 1" />
          </feComponentTransfer>
        </filter>
        <rect width={width} height={height} filter="url(#vzn-static)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Fine CRT lines over everything, and a soft bright band rolling down the frame. */
export const Scanlines: React.FC<{ frame: number }> = ({ frame }) => {
  const { height, width } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const band = 220 * u;
  const y = ((frame * 17 * u) % (height + band * 2)) - band;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) ${1.5 * u}px, transparent ${1.5 * u}px, transparent ${4 * u}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          height: band,
          mixBlendMode: "screen",
          background: "linear-gradient(180deg, rgba(232,231,227,0) 0%, rgba(232,231,227,0.06) 50%, rgba(232,231,227,0) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** One or two hard horizontal lines across the frame, for a single frame. */
export const GlitchLines: React.FC<{ frame: number; count: number }> = ({ frame, count }) => {
  const { height } = useVideoConfig();
  if (count <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const y = random(`gl-y-${frame}-${i}`) * height;
        const h = 1 + random(`gl-h-${frame}-${i}`) * 5;
        const x0 = random(`gl-x-${frame}-${i}`) < 0.5 ? 0 : random(`gl-x2-${frame}-${i}`) * 60;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: `${x0}%`, right: 0, top: y, height: h, background: colors.text, opacity: 0.6 + random(`gl-o-${frame}-${i}`) * 0.4 }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Light streaks rushing past toward the camera, like a train in a tunnel. Their speed
 * follows the loudness of the track; `amount` sets how many show.
 */
export const Streaks: React.FC<{ frame: number; amount: number; cy?: number }> = ({ frame, amount, cy }) => {
  const { width, height } = useVideoConfig();
  if (amount <= 0.01) return null;
  const cx = width / 2;
  const cY = cy ?? height / 2;
  const reach = Math.hypot(width, height) * 0.6;
  // Distance travelled so far: louder passages move faster.
  let travel = 0;
  for (let f = 0; f <= frame; f++) travel += 0.012 + env("level", f) * 0.03;
  const N = 70;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <svg width={width} height={height}>
        {Array.from({ length: N }, (_, i) => {
          const a = random(`st-a-${i}`) * Math.PI * 2;
          const speed = 0.6 + random(`st-s-${i}`) * 0.9;
          const p = (travel * speed + random(`st-p-${i}`)) % 1;
          // Starts near the vanishing point and accelerates outward, stretching as it comes.
          const r1 = reach * (0.08 + p * p * 0.95);
          const r2 = r1 + reach * (0.04 + p * p * 0.5);
          const show = random(`st-v-${i}`) < amount;
          if (!show) return null;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cY + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cY + Math.sin(a) * r2}
              stroke={colors.text}
              strokeWidth={1 + p * 5}
              strokeLinecap="round"
              opacity={Math.min(1, p * 1.4) * 0.55}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export type Echo = { x?: number; y?: number; scale?: number; opacity: number };

/**
 * Draws its children again as faint offset or scaled copies: a zoom blur when the copies
 * grow, a whip smear when they shift sideways, a ghost double when they sit just apart.
 * The original is always drawn first and unchanged.
 */
export const Echoes: React.FC<{ copies: Echo[]; children: React.ReactNode }> = ({ copies, children }) => (
  <AbsoluteFill>
    <AbsoluteFill key="main">{children}</AbsoluteFill>
    {copies.map((c, i) => (
      <AbsoluteFill
        key={`echo-${i}`}
        style={{
          opacity: c.opacity,
          mixBlendMode: "screen",
          translate: `${c.x ?? 0}px ${c.y ?? 0}px`,
          scale: c.scale ?? 1,
        }}
      >
        {children}
      </AbsoluteFill>
    ))}
  </AbsoluteFill>
);
