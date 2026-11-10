import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, display, fonts } from "../brand";
import { BEAT, hit, SCENE_START } from "../beat";
import { textWidthEm } from "../metrics";
import { flicker, jolt } from "../fx/flicker";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";

// Bars 1–2: "every artist has a vision."
// The whole line lands on the first beat. Through the first half of bar 2 the word
// "vision." morphs into the eye logo in its own place: the letters draw together, blur and
// dissolve while the eye comes into focus out of them, with a slight shudder on the
// sixteenths. On the clap the eye glides to the centre and grows to fill the screen while
// the rest of the line dissolves. No portfolio pieces yet.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const STEP = BEAT / 4;

const LAND = at(1, 1);
const MORPH_FROM = at(2, 1);
const BECOMES_EYE = at(2, 9);
const END = at(3, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INOUT = Easing.bezier(0.45, 0, 0.25, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const VisionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u, cy } = useLayout();

  // Two rows, "every artist" over "has a vision.", centred.
  const rows = ["every artist", "has a vision."];
  const size = Math.min(vertical ? width * 0.3 : height * 0.3, (width * (vertical ? 0.84 : 0.7)) / Math.max(...rows.map((r) => textWidthEm(r))));
  const lh = size * 1.05;
  const push = interpolate(frame, [LAND, END], [1, 1.05], clamp);

  // Where "vision." sits, so the eye can form in its place.
  const row2Width = textWidthEm(rows[1]) * size;
  const visionWidth = textWidthEm("vision.", "italic") * size;
  const visionX = width / 2 - row2Width / 2 + textWidthEm("has a ") * size + visionWidth / 2;
  const row2Y = cy + lh / 2;

  // 0 → 1 across the first half of bar 2: the word turns into the eye.
  const m = interpolate(frame, [MORPH_FROM, BECOMES_EYE], [0, 1], { ...clamp, easing: INOUT });
  // 0 → 1 just after the clap: the eye moves to the centre and grows.
  const grow = interpolate(frame, [BECOMES_EYE, BECOMES_EYE + 10], [0, 1], { ...clamp, easing: OUT });
  // The rest of the line dissolves as the eye takes over.
  const fade = interpolate(frame, [BECOMES_EYE - 2, BECOMES_EYE + 7], [1, 0], clamp);

  // A one-frame shudder on each sixteenth while it morphs.
  const stepFrame = frame >= MORPH_FROM && frame < BECOMES_EYE && (frame - MORPH_FROM) % STEP < 1;
  const shudder = stepFrame ? (((frame * 7) % 5) - 2) * 6 * u : 0;

  // The eye starts at roughly the word's footprint, so one reads as becoming the other.
  const eyeStart = visionWidth * 0.62;
  const bigLogo = vertical ? width * 0.68 : height * 0.6;
  const eyeSize = interpolate(grow, [0, 1], [eyeStart * interpolate(m, [0, 1], [0.85, 1]), bigLogo]);
  const eyeX = interpolate(grow, [0, 1], [visionX, width / 2]) + shudder;
  const eyeY = interpolate(grow, [0, 1], [row2Y - size * 0.02, cy]);

  const line = flicker(frame, LAND, Infinity, "s1-line");
  const [dx, dy] = jolt(frame - LAND, "s1-line", 16 * u);
  const text = (t: string, style?: React.CSSProperties) => (
    <span style={{ fontFamily: fonts.display, fontSize: size, lineHeight: 1, whiteSpace: "pre", color: colors.text, position: "relative", top: display.lift, ...style }}>{t}</span>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          opacity: line * fade,
          filter: fade < 1 ? `blur(${(1 - fade) * 12 * u}px)` : undefined,
          translate: `${dx}px ${dy}px`,
          scale: push * interpolate(fade, [0, 1], [1.04, 1]),
          transformOrigin: `50% ${cy}px`,
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - lh, height: lh, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {text(rows[0])}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy, height: lh, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {text("has a ")}
          {/* The word draws together, blurs and fades as the eye forms. */}
          {text("vision.", {
            fontStyle: "italic",
            display: "inline-block",
            opacity: 1 - m,
            filter: m > 0 ? `blur(${m * 10 * u}px)` : undefined,
            scale: `${1 - 0.55 * m} ${1 + 0.35 * m}`,
            translate: `${shudder}px 0px`,
          })}
        </div>
      </AbsoluteFill>

      {frame >= MORPH_FROM ? (
        <AbsoluteFill
          style={{
            opacity: line * m,
            filter: m < 1 ? `blur(${(1 - m) * 10 * u}px)` : undefined,
          }}
        >
          <Logo size={eyeSize} x={eyeX} y={eyeY} push={0} ghost={0.25 * grow} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
