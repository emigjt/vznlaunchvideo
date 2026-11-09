import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import { textWidthEm } from "../metrics";
import { Bent } from "../fx/Bent";
import { Cut } from "../fx/Cut";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Kinetic, type Enter } from "../fx/Motion";
import { InlineWord } from "../fx/Type";

// Bars 5–8: "at Vision Studios, we bring that vision to life."
// The line builds like a teleprompter that snaps up one line on each new line's first
// hit, every word landing with a smear. "vision" gets a line to itself, bent through
// the lens. The posters whip in above, one per bar, and on "life." the work strobes.
const START = SCENE_START[1];
const at = (bar: number, step = 1) => hit(bar, step) - START;

type W = { text: string; at: number; enter: Enter };
const LINES: { words: W[]; bent?: boolean }[] = [
  {
    words: [
      { text: "at", at: at(5, 1), enter: "drop" },
      { text: "Vision Studios,", at: at(5, 3), enter: "whip-left" },
    ],
  },
  {
    words: [
      { text: "we", at: at(6, 1), enter: "rise" },
      { text: "bring", at: at(6, 3), enter: "punch" },
      { text: "that", at: at(6, 9), enter: "rise" },
    ],
  },
  { words: [{ text: "vision", at: at(7, 3), enter: "punch" }], bent: true },
  {
    words: [
      { text: "to", at: at(8, 3), enter: "rise" },
      { text: "life.", at: at(8, 9), enter: "slam" },
    ],
  },
];

const POSTERS: { src: string; caption: string; from: number; to: number; enter: Enter }[] = [
  { src: "visual/snake-eyes.jpg", caption: "01 / snake eyes / poster", from: at(5, 3), to: at(6, 3), enter: "whip-left" },
  { src: "visual/staring-at-the-sun.jpg", caption: "02 / staring at the sun / poster", from: at(6, 3), to: at(7, 3), enter: "whip-right" },
  { src: "visual/three-blind-mice.jpg", caption: "03 / three blind mice / poster", from: at(7, 3), to: at(8, 3), enter: "slam" },
  { src: "visual/bus-stop.jpg", caption: "04 / bus stop / album cover", from: at(8, 3), to: at(8, 9), enter: "whip-left" },
];

// "life.": a new piece on every sixteenth to the end of the bar.
const STROBE = ["blurred-vzn", "snake-eyes", "staring-at-the-sun", "three-blind-mice", "bus-stop", "blurred-vzn", "snake-eyes"];

export const StudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u, pad } = useLayout();

  const textLeft = vertical ? pad * 1.4 : pad * 2;
  const textWidth = vertical ? width - pad * 2.8 : width * 0.46;
  const size = Math.min(150 * u, textWidth / textWidthEm("at Vision Studios,"));
  const bentSize = size * 1.5;
  const heights = LINES.map((l) => (l.bent ? bentSize * 2.0 : size * 1.08));

  // Poster frame above the text (9:16) or beside it (16:9).
  const side = vertical ? width * 0.58 : Math.min(height * 0.56, width * 0.32);
  const px = vertical ? width / 2 : width * 0.74;
  const py = vertical ? height * 0.27 : height * 0.47;

  // The newest line sits at the anchor; earlier ones are pushed up above it.
  const anchor = vertical ? height * 0.6 : height * 0.55;
  const current = LINES.reduce((c, line, i) => (frame >= line.words[0].at ? i : c), 0);
  let scroll = 0;
  LINES.forEach((line, i) => {
    if (i === 0) return;
    const k = interpolate(frame, [line.words[0].at, line.words[0].at + 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.12, 0.9, 0.2, 1),
    });
    scroll += k * (heights[i - 1] / 2 + heights[i] / 2);
  });
  const centres = heights.map((_, i) => heights.slice(0, i).reduce((a, h) => a + h, 0) + heights[i] / 2 - heights[0] / 2);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {POSTERS.map((p, i) => (
        <Cut key={p.src} name={p.caption} at={p.from} until={p.to} seed={`s2-p${i}`} shake={10 * u}>
          <Kinetic enter={p.enter} dist={width * 0.9} seed={`s2-pk${i}`} duration={p.to - p.from} push={0.05} origin={`${px}px ${py}px`}>
            <Frag
              src={p.src}
              width={side}
              height={side}
              x={px}
              y={py}
              duration={p.to - p.from}
              zoom={1.08}
              drift={[0, -14 * u]}
              caption={p.caption}
              captionSize={(vertical ? 24 : 18) * u}
            />
          </Kinetic>
        </Cut>
      ))}

      {STROBE.map((name, i) => (
        <Cut key={i} name={`Strobe ${name}`} at={at(8, 9 + i)} until={at(8, 10 + i)} seed={`s2-s${i}`} cleanExit>
          <Kinetic enter="slam" len={3} seed={`s2-sk${i}`} duration={4} push={0} origin={`${px}px ${py}px`}>
            <Frag src={`visual/${name}.jpg`} width={side} height={side} x={px} y={py} duration={4} zoom={1.02} />
          </Kinetic>
        </Cut>
      ))}

      {LINES.map((line, li) => {
        const age = current - li;
        const opacity = age < 0 ? 1 : age === 0 ? 1 : age === 1 ? 0.36 : age === 2 ? 0.14 : 0;
        return (
          <div
            key={li}
            style={{
              position: "absolute",
              left: textLeft,
              width: textWidth,
              top: anchor + centres[li] - scroll - heights[li] / 2,
              height: heights[li],
              display: "flex",
              alignItems: "center",
              justifyContent: line.bent ? "center" : "flex-start",
              gap: `0 ${size * 0.24}px`,
              opacity,
            }}
          >
            {line.bent ? (
              <Cut name="vision" at={line.words[0].at} until={Infinity} seed="s2-vision">
                <Kinetic enter="punch" seed="s2-vision-k" duration={60} push={0.04} origin={`${textWidth / 2}px ${heights[li] / 2}px`}>
                  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                    <Bent text="vision" size={bentSize} seed="s2-bent" />
                  </AbsoluteFill>
                </Kinetic>
              </Cut>
            ) : (
              line.words.map((w, wi) => <InlineWord key={wi} text={w.text} at={w.at} size={size} enter={w.enter} seed={`s2-w${li}-${wi}`} />)
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
