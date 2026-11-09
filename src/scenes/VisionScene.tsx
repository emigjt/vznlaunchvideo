import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import { Cut } from "../fx/Cut";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { TextBlock } from "../fx/Type";

// Bars 1–4: "every artist has a vision."
// The whole line lands on the first clap and holds, drifting toward the viewer. On the
// clap of bar 3 it flashes and becomes the eye, which holds through the fill.
// No portfolio pieces yet: each one first appears with the service that introduces it.
const START = SCENE_START[0];
const at = (bar: number, step = 1) => hit(bar, step) - START;

export const VisionScene: React.FC = () => {
  const { width, height, vertical, u, cy } = useLayout();
  const logo = vertical ? width * 0.68 : height * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="every artist has a vision." at={at(1, 9)} until={at(3, 9)} seed="s1-line" shake={16 * u} burn>
        <TextBlock
          lines={["every artist", [{ text: "has a" }, { text: "vision.", slant: true }]]}
          maxWidth={width * (vertical ? 0.84 : 0.7)}
          maxSize={vertical ? width * 0.3 : height * 0.3}
          duration={at(3, 9) - at(1, 9)}
          push={0.08}
          style={{ translate: `0px ${cy - height / 2}px` }}
        />
      </Cut>

      <Cut name="Eye" at={at(3, 9)} until={at(5, 1)} seed="s1-eye" shake={24 * u}>
        <Logo size={logo} x={width / 2} y={cy} duration={at(5, 1) - at(3, 9)} push={0.06} ghost={0.25} />
      </Cut>
    </AbsoluteFill>
  );
};
