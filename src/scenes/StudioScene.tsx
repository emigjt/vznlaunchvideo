import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import { Cut } from "../fx/Cut";
import { useLayout } from "../fx/layout";
import { TextBlock } from "../fx/Type";

// Bars 5–6: "at Vision Studios, we bring that vision to life."
// The whole line lands on the downbeat of bar 5, large and filling the screen, and holds
// for the two bars before the services. Type only.
const START = SCENE_START[1];
const at = (bar: number, step = 1) => hit(bar, step) - START;

export const StudioScene: React.FC = () => {
  const { width, height, vertical, pad, u, cy } = useLayout();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="at Vision Studios, we bring that vision to life." at={at(5, 1)} until={at(7, 1)} seed="s2-line" shake={16 * u} burn>
        <TextBlock
          lines={["at Vision", "Studios,", "we bring", [{ text: "that" }, { text: "vision", slant: true }], "to life."]}
          align="left"
          maxWidth={vertical ? width - pad * 2.8 : width * 0.64}
          maxSize={vertical ? width * 0.2 : height * 0.15}
          duration={at(7, 1) - at(5, 1)}
          push={0.05}
          style={{ translate: `0px ${cy - height / 2}px` }}
        />
      </Cut>
    </AbsoluteFill>
  );
};
