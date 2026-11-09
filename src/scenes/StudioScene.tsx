import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, fonts } from "../brand";
import { hit, SCENE_START } from "../beat";
import { textWidthEm } from "../metrics";
import { flicker } from "../fx/flicker";
import { useLayout } from "../fx/layout";

// Bars 5–6: "at Vision Studios, we bring that vision to life."
// Type only, and fast: a word on nearly every other sixteenth, building down the screen
// line by line, the newest line bright and the earlier ones stepping back. It completes on
// the clap of bar 6 and holds for a beat before the services.
const START = SCENE_START[1];
const at = (bar: number, step = 1) => hit(bar, step) - START;

type W = { text: string; at: number; slant?: boolean };
const LINES: W[][] = [
  [
    { text: "at", at: at(5, 1) },
    { text: "Vision", at: at(5, 3) },
  ],
  [{ text: "Studios,", at: at(5, 5) }],
  [
    { text: "we", at: at(5, 9) },
    { text: "bring", at: at(5, 11) },
  ],
  [
    { text: "that", at: at(5, 13) },
    { text: "vision", at: at(6, 3), slant: true },
  ],
  [
    { text: "to", at: at(6, 7) },
    { text: "life.", at: at(6, 9) },
  ],
];

export const StudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, pad, cy } = useLayout();

  const textLeft = vertical ? pad * 1.4 : width * 0.18;
  const textWidth = vertical ? width - pad * 2.8 : width * 0.64;
  const widest = Math.max(...LINES.map((line) => textWidthEm(line.map((w) => w.text).join(" "))));
  const size = Math.min(textWidth / widest, (height * 0.8) / (LINES.length * 1.05));
  const lineHeight = size * 1.05;
  const top = cy - (lineHeight * LINES.length) / 2;

  // The newest line is bright; the ones before it step back.
  const current = LINES.reduce((c, line, i) => (frame >= line[0].at ? i : c), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <div style={{ position: "absolute", left: textLeft, top, width: textWidth }}>
        {LINES.map((line, li) => (
          <div
            key={li}
            style={{
              height: lineHeight,
              display: "flex",
              alignItems: "center",
              gap: `0 ${size * 0.24}px`,
              opacity: li === current ? 1 : 0.45,
            }}
          >
            {line.map((w, wi) => (
              <span
                key={wi}
                style={{
                  fontFamily: fonts.display,
                  fontStyle: w.slant ? "italic" : "normal",
                  fontSize: size,
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  color: colors.text,
                  opacity: flicker(frame, w.at, Infinity, `s2-w${li}-${wi}`),
                }}
              >
                {w.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
