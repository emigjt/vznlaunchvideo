import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import type { Face } from "../metrics";
import { Cut } from "../fx/Cut";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { ScriptLine, Word } from "../fx/Type";

// Bars 1–4: "Every artist has a vision."
// One word per hit, filling the frame. The work flashes through for a frame on the
// downbeats, and on "vision" the word turns into the eye.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;

const WORDS: [string, Face, number, number][] = [
  ["Every", "bold", at(1, 9), at(2, 3)],
  ["artist", "bold", at(2, 3), at(2, 9)],
  ["has", "bold", at(2, 9), at(3, 3)],
  ["a", "bold", at(3, 3), at(3, 9)],
  ["vision", "italic", at(3, 9), at(4, 3)],
];

// Single-frame flashes of the portfolio on the downbeats: [image, focus point].
const FLASHES: [string, [number, number]][] = [
  ["visual/snake-eyes.jpg", [0.32, 0.45]],
  ["visual/staring-at-the-sun.jpg", [0.5, 0.3]],
  ["visual/three-blind-mice.jpg", [0.5, 0.25]],
];

export const VisionScene: React.FC = () => {
  const { width, height, vertical, u, pad, cy, safeBottom } = useLayout();
  const maxWidth = width * (vertical ? 0.8 : 0.72);
  const maxSize = vertical ? width * 0.36 : height * 0.4;
  const logo = vertical ? width * 0.68 : height * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {WORDS.map(([text, face, from, to], i) => (
        <Cut key={text} name={text} at={from} until={to} seed={`s1-${i}`} shake={16 * u} burn>
          <Word text={text} face={face} maxWidth={maxWidth} maxSize={maxSize} duration={to - from} push={0.06} style={{ translate: `0px ${cy - height / 2}px` }} />
        </Cut>
      ))}

      {FLASHES.map(([src, focus], i) => (
        <Cut key={src} name={`Flash ${i + 1}`} at={at(i + 2, 1)} until={at(i + 2, 1) + 2} seed={`s1-flash-${i}`}>
          <Frag src={src} width={width} height={height} x={width / 2} y={height / 2} duration={2} crop={1.7} focus={focus} marks={false} />
        </Cut>
      ))}

      <Cut name="Eye" at={at(4, 3)} until={at(5, 1)} seed="s1-eye" shake={24 * u}>
        <Logo size={logo} x={width / 2} y={cy} duration={at(5, 1) - at(4, 3)} push={0.05} ghost={0.25} />
      </Cut>

      <ScriptLine
        words={WORDS.map(([text, , from]) => [text, from])}
        size={(vertical ? 26 : 22) * u}
        bottom={vertical ? height - safeBottom : pad + 16 * u}
        seed="s1-line"
      />
    </AbsoluteFill>
  );
};
