import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";
import { hit, SCENE_START } from "../beat";
import { Cut } from "../fx/Cut";
import { useLayout } from "../fx/layout";
import { TextBlock } from "../fx/Type";

// Bars 3–5: "at Vision Studios, we bring that vision to life." lands whole on the downbeat
// of bar 3, large and filling the screen, for two bars; then "whatever you need." on the
// downbeat of bar 5, where the second half of the track's phrasing begins, leading into
// the services. Type only.
const START = SCENE_START[1];
const at = (bar: number, step = 1) => hit(bar, step) - START;

export const StudioScene: React.FC = () => {
  const { width, height, vertical, pad, u, cy } = useLayout();
  const lift = { translate: `0px ${cy - height / 2}px` };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="at Vision Studios, we bring that vision to life." at={at(3, 1)} until={at(5, 1)} seed="s2-line" shake={16 * u} burn>
        <TextBlock
          lines={["at Vision", "Studios,", "we bring", [{ text: "that" }, { text: "vision", slant: true }], "to life."]}
          align="left"
          maxWidth={vertical ? width - pad * 2.8 : width * 0.64}
          maxSize={vertical ? width * 0.2 : height * 0.15}
          duration={at(5, 1) - at(3, 1)}
          push={0.05}
          style={lift}
        />
      </Cut>
      <Cut name="whatever you need." at={at(5, 1)} until={at(6, 1)} seed="s2-whatever" shake={18 * u} burn>
        <TextBlock
          lines={["whatever", "you need."]}
          maxWidth={width * (vertical ? 0.84 : 0.6)}
          maxSize={vertical ? width * 0.26 : height * 0.25}
          duration={at(6, 1) - at(5, 1)}
          push={0.06}
          style={lift}
        />
      </Cut>
    </AbsoluteFill>
  );
};
