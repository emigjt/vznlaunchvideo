import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import type { Face } from "../metrics";
import { Cut } from "../fx/Cut";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { ScriptLine, Word } from "../fx/Type";

// Bars 1–4: "every artist has a vision."
// One word per hit, filling the frame, and on "vision." the word turns into the eye.
// No portfolio pieces yet: each one first appears with the service that introduces it.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;

const WORDS: [string, Face, number, number][] = [
  ["every", "bold", at(1, 9), at(2, 3)],
  ["artist", "bold", at(2, 3), at(2, 9)],
  ["has", "bold", at(2, 9), at(3, 3)],
  ["a", "bold", at(3, 3), at(3, 9)],
  ["vision.", "italic", at(3, 9), at(4, 3)],
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
