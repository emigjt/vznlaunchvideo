import React from "react";
import { AbsoluteFill, random } from "remotion";

type SlicesProps = {
  /** Tears the picture while true; renders it untouched otherwise. */
  active: boolean;
  /** Changes the tear; pass something that changes per frame for a jittery tear. */
  seed: number | string;
  /** How many horizontal bands. */
  bands?: number;
  /** Largest sideways shift, px. */
  amount?: number;
  children: React.ReactNode;
};

/**
 * Tape-tracking tear: the picture is cut into horizontal bands that shift sideways,
 * some of them with a hard edge of light. Used for a frame or two on the heavy hits.
 */
export const Slices: React.FC<SlicesProps> = ({ active, seed, bands = 7, amount = 60, children }) => {
  if (!active) return <AbsoluteFill>{children}</AbsoluteFill>;
  // Random cut lines, sorted, between 0 and 100%.
  const cuts = [0, ...Array.from({ length: bands - 1 }, (_, i) => random(`cut-${seed}-${i}`) * 100).sort((a, b) => a - b), 100];
  return (
    <AbsoluteFill>
      {cuts.slice(0, -1).map((top, i) => {
        const bottom = cuts[i + 1];
        const r = random(`shift-${seed}-${i}`);
        // About a third of the bands stay put, the rest jump left or right.
        const dx = r < 0.35 ? 0 : (r - 0.675) * 2 * amount;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${100 - bottom}% 0)`,
              translate: `${dx}px 0px`,
              filter: random(`lit-${seed}-${i}`) > 0.8 ? "brightness(1.8) contrast(1.4)" : undefined,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
