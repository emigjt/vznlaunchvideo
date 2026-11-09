import React from "react";
import { random, useCurrentFrame } from "remotion";
import { colors, display, fonts } from "../brand";
import { textWidthEm } from "../metrics";

type BentProps = {
  text: string;
  size: number;
  /** Slant, like an italic (deg). */
  slant?: number;
  /** How much the middle letters swell, like a fisheye (0.3 = 30% taller). */
  bulge?: number;
  /** Wobble height in em. */
  wave?: number;
  /** Lens lines above and below. */
  rings?: boolean;
  color?: string;
  seed: string;
};

/**
 * A word seen through a warped lens: the middle letters swell, the line wobbles like a
 * stretched tape, and curved scan lines bow around it.
 */
export const Bent: React.FC<BentProps> = ({ text, size, slant = -12, bulge = 0.35, wave = 0.05, rings = true, color = colors.text, seed }) => {
  const frame = useCurrentFrame();
  const letters = [...text];
  const width = textWidthEm(text) * size;
  // Tape wobble: changes on every other frame, like a bad playback head.
  const step = Math.floor(frame / 2);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: width * 1.3, height: size * 2.2 }}>
      {rings ? <Rings width={width * 1.3} height={size * 2.2} size={size} color={color} step={step} seed={seed} /> : null}
      <div style={{ display: "flex", alignItems: "center", fontFamily: fonts.display, fontSize: size, lineHeight: 1, color, transform: `skewX(${slant}deg)` }}>
        {letters.map((c, i) => {
          const t = letters.length > 1 ? i / (letters.length - 1) : 0.5;
          const swell = 1 + bulge * (1 - (2 * t - 1) ** 2);
          const y = Math.sin(step * 0.9 + i * 1.3) * wave * size + (random(`bj-${seed}-${step}-${i}`) - 0.5) * 0.02 * size;
          return (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", scale: `1 ${swell}`, translate: `0px ${y}px`, position: "relative", top: display.lift }}>
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Two bowed lines above and two below, broken into dashes that shift each step. */
const Rings: React.FC<{ width: number; height: number; size: number; color: string; step: number; seed: string }> = ({
  width,
  height,
  size,
  color,
  step,
  seed,
}) => {
  const cy = height / 2;
  const lines = [-0.62, -0.82, 0.62, 0.82];
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {lines.map((k, i) => {
        const y = cy + k * size;
        // Lines bow away from the word, more the further out they are.
        const bow = Math.sign(k) * size * (0.18 + Math.abs(k) * 0.12) + Math.sin(step * 0.7 + i) * size * 0.03;
        const dash = 30 + random(`rd-${seed}-${step}-${i}`) * 140;
        return (
          <path
            key={i}
            d={`M 0 ${y} Q ${width / 2} ${y + bow} ${width} ${y}`}
            fill="none"
            stroke={color}
            strokeWidth={Math.max(1.5, size * 0.018)}
            strokeDasharray={`${dash} ${4 + random(`rg-${seed}-${step}-${i}`) * 18}`}
            strokeDashoffset={random(`ro-${seed}-${step}-${i}`) * 200}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
};
