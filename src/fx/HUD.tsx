import React from "react";
import { AbsoluteFill, random } from "remotion";
import { colors } from "../brand";
import { BARS, barAt, BEAT, hit } from "../beat";
import { FPS } from "../brand";
import { flicker } from "./flicker";
import { useLayout } from "./layout";
import { Mono } from "./Type";

const pad2 = (n: number) => String(n).padStart(2, "0");
const timecode = (frame: number) => {
  const s = Math.floor(frame / FPS);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(frame % FPS)}`;
};

type HUDProps = {
  /** Frame of the whole video (the HUD runs across all scenes). */
  frame: number;
  /** Hides it entirely (e.g. on a flash frame). */
  hidden?: boolean;
  /** Small crosshair in the centre. */
  crosshair?: boolean;
  /** Tears it sideways for this frame. */
  glitch?: boolean;
};

/**
 * Camera/terminal overlay: corner marks, tiny Patchcode readouts (studio, track, BPM,
 * timecode, bar counter with beat lights). It boots on in the first bar.
 */
export const HUD: React.FC<HUDProps> = ({ frame, hidden = false, crosshair = false, glitch = false }) => {
  const { width, height, u, pad, vertical } = useLayout();
  if (hidden) return null;
  const size = Math.round(20 * u);
  const arm = 36 * u;
  const weight = Math.max(1.5, 2 * u);
  const beats = Math.max(0, frame - hit(1)) / BEAT;
  const beatIndex = Math.floor(beats) % 4;
  const onBeat = beats - Math.floor(beats) < 0.25;
  const bar = barAt(frame);
  // Boot order: corners, then the top labels type on, then the bottom readouts.
  const corners = flicker(frame, 2, Infinity, "hud-corners");
  const bottom = flicker(frame, hit(1, 9), Infinity, "hud-bottom");
  const dx = glitch ? (random(`hud-g-${frame}`) - 0.5) * 40 * u : 0;
  const line = (style: React.CSSProperties) => <div style={{ position: "absolute", background: colors.text, ...style }} />;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", translate: `${dx}px 0px`, opacity: 0.85 }}>
      <div style={{ opacity: corners }}>
        {line({ left: pad, top: pad, width: arm, height: weight })}
        {line({ left: pad, top: pad, width: weight, height: arm })}
        {line({ right: pad, top: pad, width: arm, height: weight })}
        {line({ right: pad, top: pad, width: weight, height: arm })}
        {line({ left: pad, bottom: pad, width: arm, height: weight })}
        {line({ left: pad, bottom: pad, width: weight, height: arm })}
        {line({ right: pad, bottom: pad, width: arm, height: weight })}
        {line({ right: pad, bottom: pad, width: weight, height: arm })}
      </div>

      <div style={{ position: "absolute", left: pad + arm * 0.6, top: pad + arm * 0.55, display: "flex", gap: size * 0.6, alignItems: "flex-start" }}>
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            marginTop: size * 0.3,
            borderRadius: "50%",
            background: colors.text,
            opacity: frame >= 6 && onBeat ? 1 : 0.15,
          }}
        />
        <div>
          <Mono text="VZN" size={size} typeSpeed={0.6} delay={4} />
          <Mono text="Vision Studio Co." size={size} color={colors.muted} typeSpeed={1.2} delay={8} />
        </div>
      </div>

      <div style={{ position: "absolute", right: pad + arm * 0.6, top: pad + arm * 0.55, textAlign: "right" }}>
        <Mono text={vertical ? "Wanderer" : "Now playing: Wanderer"} size={size} typeSpeed={1.2} delay={12} />
        <Mono text="Prod. VZN / 122 BPM" size={size} color={colors.muted} typeSpeed={1.2} delay={18} />
      </div>

      <div style={{ opacity: bottom }}>
        <div style={{ position: "absolute", left: pad + arm * 0.6, bottom: pad + arm * 0.45 }}>
          <Mono text={`TC ${timecode(frame)}`} size={size} />
        </div>
        <div
          style={{
            position: "absolute",
            right: pad + arm * 0.6,
            bottom: pad + arm * 0.45,
            display: "flex",
            alignItems: "center",
            gap: size * 0.7,
          }}
        >
          <Mono text={`Bar ${pad2(bar)}/${BARS}`} size={size} />
          <div style={{ display: "flex", gap: size * 0.25 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: size * 0.45,
                  height: size * 0.45,
                  border: `${weight * 0.75}px solid ${colors.text}`,
                  background: i === beatIndex ? colors.text : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {crosshair ? (
        <>
          {line({ left: width / 2 - arm * 0.5, top: height / 2, width: arm, height: weight * 0.75, opacity: 0.6 })}
          {line({ left: width / 2, top: height / 2 - arm * 0.5, width: weight * 0.75, height: arm, opacity: 0.6 })}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
