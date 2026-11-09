import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { colors, display, fonts, SITE_URL } from "../brand";
import { hit, SCENE_START, TOTAL } from "../beat";
import { fitSize, type Face } from "../metrics";
import { Cut } from "../fx/Cut";
import { flicker } from "../fx/flicker";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { Mono, ScriptLine, Word } from "../fx/Type";

// Bars 11–16 and the tail:
// "don't let it get in the way of creation." from the loudest downbeat, one word or phrase
// per hit, with the work (all of it already shown in the services) flickering around
// "creation."; then "let us help build your vision."; then the logo lands on the loudest
// downbeat of the second half and the sign-off "Vision Studios: your sound. your vision."
const START = SCENE_START[3];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const END = TOTAL - START;

/** One word or phrase per hit: [text, face, from (bar, step), to (bar, step)]. */
const WORDS: [string, Face, [number, number], [number, number]][] = [
  ["don't", "bold", [11, 1], [11, 3]],
  ["let it", "bold", [11, 3], [11, 9]],
  ["get in", "bold", [11, 9], [11, 13]],
  ["the way", "bold", [11, 13], [12, 3]],
  ["of", "bold", [12, 3], [12, 9]],
  ["let us", "bold", [13, 1], [13, 3]],
  ["help", "bold", [13, 3], [13, 9]],
  ["build", "bold", [13, 9], [14, 1]],
  ["your", "bold", [14, 1], [14, 9]],
  ["vision.", "italic", [14, 9], [15, 1]],
];

// Pieces of the work that flicker around "creation.", one per sixteenth.
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

/** "your sound. your vision." (with drawn full stops if the font has none). */
const Slogan: React.FC<{ size: number; secondAt: number }> = ({ size, secondAt }) => {
  const frame = useCurrentFrame();
  const stop = display.punctuation ? "." : <span style={{ display: "inline-block", width: size * 0.11, height: size * 0.11, background: colors.text, marginLeft: size * 0.05 }} />;
  return (
    <div style={{ fontFamily: fonts.display, fontSize: size, lineHeight: 1, color: colors.text, display: "flex", gap: size * 0.32, alignItems: "baseline" }}>
      <span>your sound{stop}</span>
      <span style={{ opacity: flicker(frame, secondAt, Infinity, "slogan-2") }}>
        your <em style={{ fontStyle: "italic" }}>vision</em>
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
  const markSize = fitSize("Vision Studios:", width * (vertical ? 0.8 : 0.5), 150 * u);
  const markY = vertical ? height * 0.555 : height * 0.6;
  const sloganSize = (vertical ? 66 : 58) * u;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {WORDS.map(([text, face, from, to], i) => (
        <Cut key={text} name={text} at={at(...from)} until={at(...to)} seed={`s4-w${i}`} shake={16 * u} burn={i === 0 || i === 5}>
          <Word text={text} face={face} maxWidth={maxWidth} maxSize={maxSize} duration={at(...to) - at(...from)} style={{ translate: lift }} />
        </Cut>
      ))}

      {(vertical ? SCATTER_VERTICAL : SCATTER).map(([src, fx, fy], i) => {
        const from = at(12, 9 + i);
        const hold = 2 + Math.floor(random(`s4-hold-${i}`) * 3);
        return (
          <Cut key={i} name={`Work ${i + 1}`} at={from} until={from + hold} seed={`s4-sc${i}`} shake={10 * u}>
            <Frag src={src} width={frag} height={frag} x={width * fx} y={height * fy} duration={hold} card={src.startsWith("shop/")} marks={false} />
          </Cut>
        );
      })}
      <Cut name="creation." at={at(12, 9)} until={at(13, 1)} seed="s4-create" shake={20 * u} burn>
        <Word text="creation." maxWidth={maxWidth} maxSize={maxSize} duration={at(13, 1) - at(12, 9)} push={0.08} style={{ translate: lift }} />
      </Cut>

      <Cut name="Logo" at={at(15, 1)} until={END} seed="s4-logo" shake={26 * u} burn>
        <Logo size={logoSize} x={width / 2} y={logoY} duration={END - at(15, 1)} push={0.03} ghost={0.22} />
      </Cut>
      <Cut name="Vision Studios:" at={at(15, 3)} until={END} seed="s4-mark" shake={12 * u}>
        <div style={{ position: "absolute", left: 0, right: 0, top: markY - markSize * 0.55, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: fonts.display, fontSize: markSize, lineHeight: 1, color: colors.text, letterSpacing: "-0.015em" }}>Vision Studios:</div>
        </div>
      </Cut>
      <Cut name="your sound. your vision." at={at(15, 9)} until={END} seed="s4-slogan">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75, display: "flex", justifyContent: "center" }}>
          <Slogan size={sloganSize} secondAt={at(16, 1) - at(15, 9)} />
        </div>
      </Cut>
      <Cut name="Site" at={at(16, 9)} until={END} seed="s4-url">
        <div style={{ position: "absolute", left: 0, right: 0, top: markY + markSize * 0.75 + sloganSize * 1.9, display: "flex", justifyContent: "center" }}>
          <Mono text={SITE_URL} size={26 * u} color={colors.text} typeSpeed={2.5} cursor upper={false} style={{ opacity: 0.8 }} />
        </div>
      </Cut>

      <Cut name="Script line" at={0} until={at(13, 1)} seed="s4-line">
        <ScriptLine
          words={[
            ["don't", at(11, 1)],
            ["let it", at(11, 3)],
            ["get in", at(11, 9)],
            ["the way", at(11, 13)],
            ["of", at(12, 3)],
            ["creation.", at(12, 9)],
          ]}
          size={(vertical ? 26 : 22) * u}
          bottom={vertical ? height - safeBottom : pad + 16 * u}
          seed="s4-line"
        />
      </Cut>
      <Cut name="Script line 2" at={at(13, 1)} until={at(15, 1)} seed="s4-line2">
        <ScriptLine
          words={WORDS.slice(5).map(([text, , from]) => [text, at(...from) - at(13, 1)])}
          size={(vertical ? 26 : 22) * u}
          bottom={vertical ? height - safeBottom : pad + 16 * u}
          seed="s4-line2"
        />
      </Cut>
    </AbsoluteFill>
  );
};
