import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { colors, fonts, SITE_URL } from "../brand";
import { hit, SCENE_START, TOTAL } from "../beat";
import { fitSize, textWidthEm } from "../metrics";
import { Bent } from "../fx/Bent";
import { Cut } from "../fx/Cut";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { Kinetic } from "../fx/Motion";
import { InlineWord, Mono, ScriptLine, Word } from "../fx/Type";

// Bars 13–16 and the tail:
// "don't let it get in the way of creation." Interference bars slam across the words more
// and more until "creation." breaks through clean, with the work flickering around it.
// "let us help build your vision." on the loudest bar: "build" drops in letter by letter.
// Then the logo slams in and the sign-off "Vision Studios: your sound. your vision."
const START = SCENE_START[3];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const END = TOTAL - START;

// Interference bars between "get in" and "creation.": one slams in on each sixteenth,
// from alternating sides, and holds a few steps.
const BLOCKS = Array.from({ length: 15 }, (_, i) => {
  const from = at(13, 9) + Math.round(((at(14, 9) - at(13, 9)) / 15) * i);
  return {
    from,
    until: Math.min(at(14, 9), from + 6 + Math.floor(random(`blk-hold-${i}`) * 14)),
    left: random(`blk-side-${i}`) < 0.5,
    y: (random(`blk-y-${i}`) - 0.5) * 0.34,
    h: 0.025 + random(`blk-h-${i}`) * 0.07,
    w: 0.45 + random(`blk-w-${i}`) * 0.5,
    solid: random(`blk-s-${i}`) < 0.3,
  };
});

const Block: React.FC<{ y: number; h: number; w: number; left: boolean; solid: boolean; seed: string }> = ({ y, h, w, left, solid, seed }) => {
  const frame = useCurrentFrame();
  const { width, height, cy } = useLayout();
  // Slams in from its side in two frames, then shudders.
  const x = frame < 2 ? (1 - frame / 2) * width * w * (left ? -1 : 1) : (random(`bj-${seed}-${frame}`) - 0.5) * 16;
  const stripe = 2 + Math.floor(random(`bs-${seed}-${Math.floor(frame / 2)}`) * 5);
  return (
    <div
      style={{
        position: "absolute",
        top: cy + y * height - (h * height) / 2,
        height: h * height,
        width: width * w,
        left: left ? 0 : undefined,
        right: left ? undefined : 0,
        translate: `${x}px 0px`,
        background: solid
          ? colors.text
          : `repeating-linear-gradient(0deg, ${colors.text} 0px, ${colors.text} ${stripe}px, #000 ${stripe}px, #000 ${stripe * 2}px)`,
      }}
    />
  );
};

// Pieces of the work that flicker around "creation.", one per sixteenth.
const SCATTER: [string, number, number][] = [
  ["visual/snake-eyes.jpg", 0.24, 0.2],
  ["shop/vzn-logo-hoodie-charcoal-back.jpg", 0.74, 0.68],
  ["visual/staring-at-the-sun.jpg", 0.74, 0.22],
  ["visual/three-blind-mice.jpg", 0.26, 0.68],
  ["visual/bus-stop.jpg", 0.5, 0.15],
  ["visual/blurred-vzn.jpg", 0.2, 0.44],
  ["shop/vzn-logo-hoodie-grey-front.jpg", 0.8, 0.46],
  ["visual/snake-eyes.jpg", 0.5, 0.74],
];

export const CreateScene: React.FC = () => {
  const { width, height, vertical, u, pad, cy, safeBottom } = useLayout();
  const maxWidth = width * (vertical ? 0.8 : 0.72);
  const maxSize = vertical ? width * 0.3 : height * 0.34;
  const lift = { translate: `0px ${cy - height / 2}px` };
  const frag = vertical ? width * 0.3 : height * 0.26;

  // "build", letter by letter, landing on the clap.
  const buildSize = fitSize("build", maxWidth, maxSize * 1.2);
  // End card.
  const logoSize = vertical ? width * 0.6 : height * 0.36;
  const logoY = height * (vertical ? 0.35 : 0.33);
  const markSize = fitSize("Vision Studios:", width * (vertical ? 0.8 : 0.5), 150 * u);
  const markY = vertical ? height * 0.555 : height * 0.6;
  const sloganSize = Math.min((vertical ? 70 : 60) * u, (width * 0.8) / textWidthEm("your sound. your vision."));

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {/* don't let it get in the way of creation. */}
      <Cut name="don't" at={at(13, 1)} until={at(13, 3)} seed="s4-dont" burn>
        <Word text="don't" maxWidth={maxWidth} maxSize={maxSize} enter="punch" duration={at(13, 3) - at(13, 1)} style={lift} />
      </Cut>
      <Cut name="let it" at={at(13, 3)} until={at(13, 9)} seed="s4-let">
        <Word text="let it" maxWidth={maxWidth} maxSize={maxSize} enter="whip-right" dist={width} duration={at(13, 9) - at(13, 3)} style={lift} />
      </Cut>
      <Cut name="get in" at={at(13, 9)} until={at(13, 13)} seed="s4-get">
        <Word text="get in" maxWidth={maxWidth} maxSize={maxSize} enter="drop" dist={height * 0.4} duration={at(13, 13) - at(13, 9)} style={lift} />
      </Cut>
      <Cut name="the way" at={at(13, 13)} until={at(14, 3)} seed="s4-way" dropout={0.12}>
        <Word text="the way" maxWidth={maxWidth} maxSize={maxSize} enter="slam" duration={at(14, 3) - at(13, 13)} spin={4} style={lift} />
      </Cut>
      <Cut name="of" at={at(14, 3)} until={at(14, 9)} seed="s4-of" dropout={0.15}>
        <Word text="of" maxWidth={maxWidth} maxSize={maxSize * 0.8} enter="rise" dist={height * 0.3} duration={at(14, 9) - at(14, 3)} style={lift} />
      </Cut>
      {BLOCKS.map((b, i) => (
        <Cut key={i} name={`Interference ${i + 1}`} at={b.from} until={b.until} seed={`s4-blk${i}`}>
          <Block y={b.y} h={b.h} w={b.w} left={b.left} solid={b.solid} seed={`blk${i}`} />
        </Cut>
      ))}

      {SCATTER.map(([src, fx, fy], i) => {
        const from = at(14, 9 + i);
        const hold = 2 + Math.floor(random(`s4-hold-${i}`) * 3);
        return (
          <Cut key={i} name={`Work ${i + 1}`} at={from} until={from + hold} seed={`s4-sc${i}`}>
            <Kinetic enter="slam" len={3} seed={`s4-sck${i}`} duration={hold} push={0} origin={`${width * fx}px ${height * fy}px`}>
              <Frag src={src} width={frag} height={frag} x={width * fx} y={height * fy} duration={hold} card={src.startsWith("shop/")} marks={false} />
            </Kinetic>
          </Cut>
        );
      })}
      <Cut name="creation." at={at(14, 9)} until={at(15, 1)} seed="s4-creation" burn>
        <Word text="creation." maxWidth={maxWidth} maxSize={maxSize} enter="slam" duration={at(15, 1) - at(14, 9)} push={0.1} style={lift} />
      </Cut>

      {/* let us help build your vision. */}
      <Cut name="let us" at={at(15, 1)} until={at(15, 3)} seed="s4-letus" burn>
        <Word text="let us" maxWidth={maxWidth} maxSize={maxSize} enter="slam" duration={at(15, 3) - at(15, 1)} style={lift} />
      </Cut>
      <Cut name="help" at={at(15, 3)} until={at(15, 8)} seed="s4-help">
        <Word text="help" maxWidth={maxWidth} maxSize={maxSize} enter="whip-left" dist={width} duration={at(15, 8) - at(15, 3)} drift={[-40 * u, 0]} style={lift} />
      </Cut>
      <Cut name="build" at={at(15, 8)} until={at(15, 13)} seed="s4-build">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...lift }}>
          <div style={{ display: "flex" }}>
            {[..."build"].map((c, i) => (
              <InlineWord key={i} text={c} at={i} size={buildSize} enter="drop" seed={`s4-b${i}`} />
            ))}
          </div>
        </AbsoluteFill>
      </Cut>
      <Cut name="your vision." at={at(15, 13)} until={at(16, 1)} seed="s4-yourvision">
        <Kinetic enter="punch" seed="s4-yv-k" duration={at(16, 1) - at(15, 13)} push={0.1}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...lift }}>
            <div style={{ fontFamily: fonts.display, fontSize: maxSize * 0.42, lineHeight: 1, color: colors.text, marginBottom: -maxSize * 0.1 }}>your</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...lift, translate: `0px ${cy - height / 2 + maxSize * 0.55}px` }}>
            <Bent text="vision." size={(width * 0.85) / (textWidthEm("vision.") * 1.3)} seed="s4-bent" />
          </AbsoluteFill>
        </Kinetic>
      </Cut>

      {/* Vision Studios: your sound. your vision. */}
      <Cut name="Logo" at={at(16, 1)} until={END} seed="s4-logo" shake={26 * u} burn>
        <Kinetic enter="slam" len={5} seed="s4-logo-k" duration={END - at(16, 1)} push={0.03} origin={`${width / 2}px ${logoY}px`}>
          <Logo size={logoSize} x={width / 2} y={logoY} duration={END - at(16, 1)} push={0} ghost={0.22} />
        </Kinetic>
      </Cut>
      <Cut name="Vision Studios:" at={at(16, 3)} until={END} seed="s4-mark" shake={12 * u}>
        <div style={{ position: "absolute", left: 0, right: 0, top: markY - markSize * 0.55, display: "flex", justifyContent: "center" }}>
          <InlineWord text="Vision Studios:" at={0} size={markSize} enter="whip-left" seed="s4-mark-w" />
        </div>
      </Cut>
      <Cut name="your sound. your vision." at={at(16, 9)} until={END} seed="s4-slogan">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75, display: "flex", justifyContent: "center", gap: sloganSize * 0.3 }}>
          <InlineWord text="your sound." at={0} size={sloganSize} enter="drop" seed="s4-sl1" />
          <InlineWord text="your vision." at={at(16, 13) - at(16, 9)} size={sloganSize} enter="rise" seed="s4-sl2" />
        </div>
      </Cut>
      <Cut name="Site" at={at(16, 15)} until={END} seed="s4-url">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75 + sloganSize * 1.9, display: "flex", justifyContent: "center" }}>
          <Mono text={SITE_URL} size={26 * u} color={colors.text} typeSpeed={2.5} cursor upper={false} style={{ opacity: 0.8 }} />
        </div>
      </Cut>

      <Cut name="Script line" at={0} until={at(15, 1)} seed="s4-line">
        <ScriptLine
          words={[
            ["don't", at(13, 1)],
            ["let it", at(13, 3)],
            ["get in", at(13, 9)],
            ["the way", at(13, 13)],
            ["of", at(14, 3)],
            ["creation.", at(14, 9)],
          ]}
          size={(vertical ? 26 : 22) * u}
          bottom={vertical ? height - safeBottom : pad + 16 * u}
          seed="s4-line"
        />
      </Cut>
      <Cut name="Script line 2" at={at(15, 1)} until={at(16, 1)} seed="s4-line2">
        <ScriptLine
          words={[
            ["let us", 0],
            ["help", at(15, 3) - at(15, 1)],
            ["build", at(15, 8) - at(15, 1)],
            ["your vision.", at(15, 13) - at(15, 1)],
          ]}
          size={(vertical ? 26 : 22) * u}
          bottom={vertical ? height - safeBottom : pad + 16 * u}
          seed="s4-line2"
        />
      </Cut>
    </AbsoluteFill>
  );
};

