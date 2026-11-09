import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { colors, display, fonts, SITE_URL } from "../brand";
import { hit, SCENE_START, TOTAL } from "../beat";
import { fitSize } from "../metrics";
import { Cut } from "../fx/Cut";
import { flicker } from "../fx/flicker";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { ink, Mono, ScriptLine, Word } from "../fx/Type";

// Bars 13–16: "Don't let it all slow you down from creating." and the sign-off
// "Vision Studios: Your sound. Your vision."
// "slow you down" is the one slow moment: the words drift apart and sink with trails
// for two bars. "from creating" snaps back on the clap with the work flickering around
// it, and the logo lands on the loudest downbeat of the track.
const START = SCENE_START[3];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const END = TOTAL - START;

/** "slow you down": tracking opens up, the line sinks and leaves trails. */
const SlowDown: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u } = useLayout();
  const size = fitSize("slow you down", width * (vertical ? 0.8 : 0.66), 220 * u);
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  const state = (f: number) => ({
    tracking: interpolate(f, [0, duration], [-0.01, vertical ? 0.06 : 0.16], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    y: interpolate(f, [0, duration], [0, height * 0.07], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    blur: interpolate(f, [duration * 0.5, duration], [0, 2.5 * u], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  });
  // Trails: the same line where it was a few frames ago, fainter the further back.
  const layers = [9, 6, 3, 0];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {layers.map((lag, i) => {
        const s = state(frame - lag);
        const last = lag === 0;
        return (
          <div
            key={lag}
            style={{
              position: "absolute",
              fontFamily: last ? fonts.display : fonts.outline,
              ...(last ? {} : ink("outline", colors.text)),
              fontSize: size,
              lineHeight: 1,
              letterSpacing: `${s.tracking}em`,
              ...(last ? { color: colors.text } : {}),
              whiteSpace: "pre",
              opacity: last ? 1 : 0.12 + i * 0.08,
              translate: `0px ${s.y - size * 0.08}px`,
              filter: `blur(${s.blur + (last ? 0 : 1.5 * u)}px)`,
            }}
          >
            slow you down
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Pieces of the work that flicker around "from creating", one per sixteenth.
const SCATTER: [string, number, number][] = [
  ["visual/snake-eyes.jpg", 0.17, 0.27],
  ["shop/vzn-logo-hoodie-charcoal-back.jpg", 0.83, 0.72],
  ["visual/staring-at-the-sun.jpg", 0.8, 0.26],
  ["visual/three-blind-mice.jpg", 0.2, 0.74],
  ["visual/bus-stop.jpg", 0.5, 0.17],
  ["visual/blurred-vzn.jpg", 0.12, 0.5],
  ["shop/vzn-logo-hoodie-grey-front.jpg", 0.88, 0.5],
  ["visual/snake-eyes.jpg", 0.5, 0.84],
];
// The same pieces kept clear of the app's buttons and caption in 9:16.
const SCATTER_VERTICAL: [string, number, number][] = [
  ["visual/snake-eyes.jpg", 0.24, 0.2],
  ["shop/vzn-logo-hoodie-charcoal-back.jpg", 0.74, 0.68],
  ["visual/staring-at-the-sun.jpg", 0.74, 0.22],
  ["visual/three-blind-mice.jpg", 0.26, 0.68],
  ["visual/bus-stop.jpg", 0.5, 0.15],
  ["visual/blurred-vzn.jpg", 0.2, 0.44],
  ["shop/vzn-logo-hoodie-grey-front.jpg", 0.8, 0.46],
  ["visual/snake-eyes.jpg", 0.5, 0.74],
];

/** "Your sound. Your vision." (with drawn full stops if the font has none). */
const Slogan: React.FC<{ size: number; secondAt: number }> = ({ size, secondAt }) => {
  const frame = useCurrentFrame();
  const stop = display.punctuation ? "." : <span style={{ display: "inline-block", width: size * 0.11, height: size * 0.11, background: colors.text, marginLeft: size * 0.05 }} />;
  return (
    <div style={{ fontFamily: fonts.display, fontSize: size, lineHeight: 1, color: colors.text, display: "flex", gap: size * 0.32, alignItems: "baseline" }}>
      <span>Your sound{stop}</span>
      <span style={{ opacity: flicker(frame, secondAt, Infinity, "slogan-2") }}>
        Your <em style={{ fontStyle: "italic" }}>vision</em>
        {stop}
      </span>
    </div>
  );
};

export const CreateScene: React.FC = () => {
  const { width, height, vertical, u, pad, cy, safeBottom } = useLayout();
  const maxWidth = width * (vertical ? 0.8 : 0.72);
  const lift = `0px ${cy - height / 2}px`;
  const maxSize = vertical ? width * 0.3 : height * 0.34;
  const frag = vertical ? width * 0.3 : height * 0.26;

  // End card layout.
  const logoSize = vertical ? width * 0.6 : height * 0.36;
  const logoY = height * (vertical ? 0.35 : 0.33);
  const markSize = fitSize("Vision Studios", width * (vertical ? 0.8 : 0.5), 150 * u);
  const markY = vertical ? height * 0.555 : height * 0.6;
  const sloganSize = (vertical ? 66 : 58) * u;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="Don't" at={at(13, 1)} until={at(13, 3)} seed="s4-dont" shake={16 * u} burn>
        <Word text="Don't" maxWidth={maxWidth} maxSize={maxSize} duration={at(13, 3) - at(13, 1)} style={{ translate: lift }} />
      </Cut>
      <Cut name="let it all" at={at(13, 3)} until={at(13, 9)} seed="s4-let" shake={16 * u}>
        <Word text="let it all" maxWidth={maxWidth} maxSize={maxSize} duration={at(13, 9) - at(13, 3)} style={{ translate: lift }} />
      </Cut>
      <Cut name="slow you down" at={at(13, 9)} until={at(14, 9)} seed="s4-slow" style={{ translate: lift }}>
        <SlowDown duration={at(14, 9) - at(13, 9)} />
      </Cut>

      {(vertical ? SCATTER_VERTICAL : SCATTER).map(([src, fx, fy], i) => {
        const from = at(14, 9 + i);
        const hold = 2 + Math.floor(random(`s4-hold-${i}`) * 3);
        return (
          <Cut key={i} name={`Work ${i + 1}`} at={from} until={from + hold} seed={`s4-sc${i}`} shake={10 * u}>
            <Frag src={src} width={frag} height={frag} x={width * fx} y={height * fy} duration={hold} card={src.startsWith("shop/")} marks={false} />
          </Cut>
        );
      })}
      <Cut name="from creating" at={at(14, 9)} until={at(15, 1)} seed="s4-create" shake={20 * u} burn>
        <Word text="from" maxWidth={maxWidth * 0.4} maxSize={maxSize * 0.42} duration={at(15, 1) - at(14, 9)} style={{ translate: `0px ${cy - height / 2 - maxSize * 0.62}px` }} />
        <Word text="creating" face="italic" maxWidth={maxWidth} maxSize={maxSize} duration={at(15, 1) - at(14, 9)} style={{ translate: `0px ${cy - height / 2 + maxSize * 0.2}px` }} />
      </Cut>

      <Cut name="Logo" at={at(15, 1)} until={END} seed="s4-logo" shake={26 * u} burn>
        <Logo size={logoSize} x={width / 2} y={logoY} duration={END - at(15, 1)} push={0.03} ghost={0.22} />
      </Cut>
      <Cut name="Vision Studios" at={at(15, 3)} until={END} seed="s4-mark" shake={12 * u}>
        <div style={{ position: "absolute", left: 0, right: 0, top: markY - markSize * 0.55, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: fonts.display, fontSize: markSize, lineHeight: 1, color: colors.text, letterSpacing: "-0.015em" }}>Vision Studios</div>
        </div>
      </Cut>
      <Cut name="Your sound. Your vision." at={at(15, 9)} until={END} seed="s4-slogan">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75, display: "flex", justifyContent: "center" }}>
          <Slogan size={sloganSize} secondAt={at(16, 1) - at(15, 9)} />
        </div>
      </Cut>
      <Cut name="Site" at={at(16, 9)} until={END} seed="s4-url">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75 + sloganSize * 1.9, display: "flex", justifyContent: "center" }}>
          <Mono text={SITE_URL} size={26 * u} color={colors.text} typeSpeed={2.5} cursor style={{ opacity: 0.8 }} />
        </div>
      </Cut>

      <Cut name="Script line" at={0} until={at(15, 1)} seed="s4-line">
        <ScriptLine
          words={[
            ["Don't", at(13, 1)],
            ["let it all", at(13, 3)],
            ["slow you down", at(13, 9)],
            ["from creating", at(14, 9)],
          ]}
          size={(vertical ? 26 : 22) * u}
          bottom={vertical ? height - safeBottom : pad + 16 * u}
          seed="s4-line"
        />
      </Cut>
    </AbsoluteFill>
  );
};
