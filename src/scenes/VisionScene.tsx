import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import { textWidthEm } from "../metrics";
import { Bent } from "../fx/Bent";
import { Cut } from "../fx/Cut";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { Kinetic } from "../fx/Motion";
import { Mono, ScriptLine, Word } from "../fx/Type";

// Bars 1–4: "every artist has a vision."
// Bar 1 types the line like a terminal, cut by a one-frame flash of the work. Then one
// word per hit, each arriving differently: a punch, a whip, turned on its side, a giant
// outline. "vision." lands bent through a lens and turns into the eye, which the camera
// dives into for the next phrase.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const LINE = "every artist has a vision.";

/** The line typed in two-character bursts on each sixteenth of bar 1. */
const Terminal: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const steps = Math.floor((frame - at(1, 2)) / ((at(2, 1) - at(1, 1)) / 16)) + 1;
  const shown = Math.max(0, Math.min(LINE.length, steps * 2));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Mono text={`> ${LINE.slice(0, shown)}`} size={size} upper={false} cursor />
    </AbsoluteFill>
  );
};

// One- and two-frame flashes of the portfolio between the hits: [image, focus, bar, step].
const FLASHES: [string, [number, number], number, number][] = [
  ["visual/staring-at-the-sun.jpg", [0.5, 0.3], 1, 9],
  ["visual/snake-eyes.jpg", [0.32, 0.45], 2, 13],
  ["visual/three-blind-mice.jpg", [0.5, 0.25], 3, 1],
  ["visual/staring-at-the-sun.jpg", [0.5, 0.32], 3, 15],
];

export const VisionScene: React.FC = () => {
  const { width, height, vertical, u, pad, cy, safeBottom } = useLayout();
  const maxWidth = width * (vertical ? 0.8 : 0.72);
  const maxSize = vertical ? width * 0.36 : height * 0.4;
  const logo = vertical ? width * 0.7 : height * 0.6;
  const lift = { translate: `0px ${cy - height / 2}px` };
  const bentSize = (width * 0.9) / (textWidthEm("vision.") * 1.3);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="Terminal" at={0} until={at(2, 1)} seed="s1-term">
        <div style={{ position: "absolute", inset: 0, ...lift }}>
          <Terminal size={34 * u} />
        </div>
      </Cut>

      <Cut name="every" at={at(2, 1)} until={at(2, 3)} seed="s1-every" burn>
        <Word text="every" maxWidth={maxWidth} maxSize={maxSize} enter="punch" duration={at(2, 3) - at(2, 1)} style={lift} />
      </Cut>
      <Cut name="artist" at={at(2, 3)} until={at(2, 9)} seed="s1-artist">
        <Word text="artist" maxWidth={maxWidth} maxSize={maxSize} enter="whip-left" dist={width} duration={at(2, 9) - at(2, 3)} drift={[-30 * u, 0]} style={lift} />
      </Cut>
      <Cut name="has" at={at(2, 9)} until={at(3, 3)} seed="s1-has" burn>
        <Word text="has" maxWidth={height * 0.62} maxSize={width * 0.62} turn enter="spin" duration={at(3, 3) - at(2, 9)} push={0.08} style={lift} />
      </Cut>
      <Cut name="a" at={at(3, 3)} until={at(3, 9)} seed="s1-a">
        <Word text="a" face="outline" maxWidth={width * 0.9} maxSize={height * 0.55} enter="slam" duration={at(3, 9) - at(3, 3)} spin={-6} style={lift} />
      </Cut>
      <Cut name="vision." at={at(3, 9)} until={at(4, 3)} seed="s1-vision">
        <Kinetic enter="punch" seed="s1-vision-k" duration={at(4, 3) - at(3, 9)} push={0.08}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...lift }}>
            <Bent text="vision." size={bentSize} seed="s1-bent" />
          </AbsoluteFill>
        </Kinetic>
      </Cut>

      {FLASHES.map(([src, focus, bar, step], i) => (
        <Cut key={i} name={`Flash ${i + 1}`} at={at(bar, step)} until={at(bar, step) + (i % 2 === 0 ? 1 : 2)} seed={`s1-flash-${i}`}>
          <Frag src={src} width={width} height={height} x={width / 2} y={height / 2} duration={2} crop={1.8} focus={focus} marks={false} />
        </Cut>
      ))}

      <Cut name="Eye" at={at(4, 3)} until={at(5, 1)} seed="s1-eye" shake={24 * u} cleanExit>
        <Kinetic enter="slam" len={5} seed="s1-eye-k" duration={at(5, 1) - at(4, 3)} push={0.06} origin={`${width / 2}px ${cy}px`}>
          <Logo size={logo} x={width / 2} y={cy} duration={at(5, 1) - at(4, 3)} push={0} ghost={0.25} />
        </Kinetic>
      </Cut>

      <ScriptLine
        words={[
          ["every", at(2, 1)],
          ["artist", at(2, 3)],
          ["has", at(2, 9)],
          ["a", at(3, 3)],
          ["vision.", at(3, 9)],
        ]}
        size={(vertical ? 26 : 22) * u}
        bottom={vertical ? height - safeBottom : pad + 16 * u}
        seed="s1-line"
      />
    </AbsoluteFill>
  );
};
