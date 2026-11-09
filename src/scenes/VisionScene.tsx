import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors, display, fonts } from "../brand";
import { BEAT, hit, SCENE_START } from "../beat";
import { textWidthEm } from "../metrics";
import { flicker, jolt } from "../fx/flicker";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";

// Bars 1–2: "every artist has a vision."
// The whole line lands on the first beat. Through the first half of bar 2 the word
// "vision." glitches, cutting to the eye logo in its place on the sixteenths; on the clap
// it becomes the eye, which grows from where the word was to fill the screen while the
// rest of the line breaks up. No portfolio pieces yet.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const STEP = BEAT / 4;
const LOGO_RATIO = 1056 / 1075;

const LAND = at(1, 1);
const GLITCH_FROM = at(2, 1);
const BECOMES_EYE = at(2, 9);
const END = at(3, 1);

/** Which of the word and the eye shows at `frame` while "vision." glitches. */
const showEye = (frame: number): boolean => {
  if (frame < GLITCH_FROM) return false;
  if (frame >= BECOMES_EYE) return true;
  const step = Math.floor((frame - GLITCH_FROM) / STEP);
  const inStep = frame - (GLITCH_FROM + Math.round(step * STEP));
  // The eye cuts in for a frame or two on every other sixteenth, more often as the clap nears,
  // with the odd stray frame in between.
  const odd = step % 2 === 1 && inStep < 1 + Math.floor(step / 3);
  return odd || random(`eye-stray-${frame}`) < 0.12 + step * 0.03;
};

export const VisionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u, cy } = useLayout();

  // Two rows, "every artist" over "has a vision.", centred.
  const rows = ["every artist", "has a vision."];
  const size = Math.min(vertical ? width * 0.3 : height * 0.3, (width * (vertical ? 0.84 : 0.7)) / Math.max(...rows.map((r) => textWidthEm(r))));
  const lh = size * 1.05;
  const push = interpolate(frame, [LAND, END], [1, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Where "vision." sits, so the eye can take its place.
  const row2Width = textWidthEm(rows[1]) * size;
  const visionWidth = textWidthEm("vision.") * size;
  const visionX = width / 2 - row2Width / 2 + textWidthEm("has a ") * size + visionWidth / 2;
  const row2Y = cy + lh / 2;

  // On the clap the eye grows from the word's place to the centre of the screen.
  const grow = interpolate(frame, [BECOMES_EYE, BECOMES_EYE + 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const bigLogo = vertical ? width * 0.68 : height * 0.6;
  const eyeSize = interpolate(grow, [0, 1], [visionWidth * 0.9, bigLogo]);
  const eyeX = interpolate(grow, [0, 1], [visionX, width / 2]);
  const eyeY = interpolate(grow, [0, 1], [row2Y - size * 0.04, cy]);

  const eye = showEye(frame);
  // The rest of the line holds, then breaks up just after the clap.
  const line = flicker(frame, LAND, BECOMES_EYE + 4, "s1-line");
  const [dx, dy] = jolt(frame - LAND, "s1-line", 16 * u);
  const text = (t: string, style?: React.CSSProperties) => (
    <span style={{ fontFamily: fonts.display, fontSize: size, lineHeight: 1, whiteSpace: "pre", color: colors.text, position: "relative", top: display.lift, ...style }}>{t}</span>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill style={{ opacity: line, translate: `${dx}px ${dy}px`, scale: push, transformOrigin: `50% ${cy}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - lh, height: lh, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {text(rows[0])}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy, height: lh, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {text("has a ")}
          {text("vision.", { fontStyle: "italic", opacity: eye ? 0 : 1 })}
        </div>
      </AbsoluteFill>

      {eye && frame < BECOMES_EYE ? (
        // Glitch cuts: the eye in the word's place, the size of the word.
        <Img
          src={staticFile("brand/logo-white.svg")}
          style={{
            position: "absolute",
            width: visionWidth,
            height: visionWidth * LOGO_RATIO,
            left: visionX - visionWidth / 2 + (random(`eye-x-${frame}`) - 0.5) * 20 * u,
            top: row2Y - (visionWidth * LOGO_RATIO) / 2,
            scale: push,
          }}
        />
      ) : null}
      {frame >= BECOMES_EYE ? <Logo size={eyeSize} x={eyeX} y={eyeY} push={0} ghost={0.25 * grow} /> : null}
    </AbsoluteFill>
  );
};
