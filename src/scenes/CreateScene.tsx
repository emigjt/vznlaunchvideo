import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { colors, fonts } from "../brand";
import { hit, SCENE_START, TOTAL } from "../beat";
import { fitSize } from "../metrics";
import { Spectrum, Waveform } from "../fx/AudioViz";
import { Cut } from "../fx/Cut";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Logo } from "../fx/Logo";
import { Mono, TextBlock } from "../fx/Type";

// Bars 12–16 and the end card, every line landing whole on its beat:
// "we handle it all." with all four services around it at once; "completely streamlined so
// you focus on creating." with the work flickering around it; "let us help build your
// vision." across the loudest downbeat; then the logo on the last bar and "Vision Studios:
// your sound. your vision." Every piece of work shown here was introduced by its service.
const START = SCENE_START[3];
const at = (bar: number, step = 1) => hit(bar, step) - START;
const END = TOTAL - START;
const HANDLE_BAR = 12;

// "we handle it all.": the cover art cycles on the hits of its bar [file, from step, to step].
const COVERS: [string, number, number][] = [
  ["snake-eyes", 1, 3],
  ["staring-at-the-sun", 3, 8],
  ["three-blind-mice", 8, 9],
  ["bus-stop", 9, 13],
  ["blurred-vzn", 13, 15],
  ["snake-eyes", 15, 17],
];
const HOODIES: [string, number, number][] = [
  ["charcoal-front", 1, 9],
  ["grey-back", 9, 17],
];

/** The four services together around "we handle it all.", each labelled. */
const AllServices: React.FC<{ tile: number; dx: number; dy: number }> = ({ tile, dx, dy }) => {
  const frame = useCurrentFrame();
  const { width, cy, u } = useLayout();
  const song = frame + hit(HANDLE_BAR);
  const cx = width / 2;
  const label = 22 * u;
  const caption = (text: string, x: number, y: number) => (
    <div style={{ position: "absolute", left: x - tile / 2, top: y + tile / 2 + label * 0.6 }}>
      <Mono text={text} size={label} color={colors.muted} upper={false} />
    </div>
  );
  const box = (x: number, y: number, child: React.ReactNode) => (
    <div style={{ position: "absolute", left: x - tile / 2, top: y - tile / 2, width: tile, height: tile, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {child}
    </div>
  );
  const step = (s: number) => hit(HANDLE_BAR, s) - hit(HANDLE_BAR);
  return (
    <AbsoluteFill>
      {COVERS.map(([file, s0, s1], i) => (
        <Cut key={i} name={`cover ${file}`} at={step(s0)} until={step(s1)} seed={`all-c${i}`}>
          <Frag src={`visual/${file}.jpg`} width={tile} height={tile} x={cx - dx} y={cy - dy} duration={step(s1) - step(s0)} zoom={1.04} />
        </Cut>
      ))}
      {HOODIES.map(([file, s0, s1], i) => (
        <Cut key={file} name={`hoodie ${file}`} at={step(s0)} until={step(s1)} seed={`all-h${i}`}>
          <Frag src={`shop/vzn-logo-hoodie-${file}.jpg`} width={tile} height={tile} x={cx + dx} y={cy - dy} duration={step(s1) - step(s0)} zoom={1.03} card />
        </Cut>
      ))}
      {box(cx - dx, cy + dy, <Spectrum song={song} width={tile} height={tile * 0.6} gap={3 * u} />)}
      {box(cx + dx, cy + dy, <Waveform song={song} width={tile} height={tile * 0.6} stroke={2.5 * u} />)}
      {caption("cover art", cx - dx, cy - dy)}
      {caption("merchandising", cx + dx, cy - dy)}
      {caption("music production", cx - dx, cy + dy)}
      {caption("mixing / mastering", cx + dx, cy + dy)}
    </AbsoluteFill>
  );
};

// Pieces of the work that flicker around "completely streamlined so you focus on creating.",
// above and below the line, one every three sixteenths: [image, x, y] as fractions of the frame.
const SCATTER: [string, number, number][] = [
  ["visual/snake-eyes.jpg", 0.24, 0.16],
  ["shop/vzn-logo-hoodie-charcoal-back.jpg", 0.74, 0.72],
  ["visual/staring-at-the-sun.jpg", 0.76, 0.17],
  ["visual/three-blind-mice.jpg", 0.26, 0.72],
  ["visual/bus-stop.jpg", 0.5, 0.13],
  ["shop/vzn-logo-hoodie-grey-front.jpg", 0.5, 0.74],
  ["visual/blurred-vzn.jpg", 0.22, 0.17],
  ["visual/snake-eyes.jpg", 0.78, 0.72],
];

export const CreateScene: React.FC = () => {
  const { width, height, vertical, u, cy } = useLayout();
  const lift = { translate: `0px ${cy - height / 2}px` };
  const lineWidth = width * (vertical ? 0.82 : 0.6);
  const lineSize = vertical ? width * 0.2 : height * 0.2;
  const frag = vertical ? width * 0.26 : height * 0.24;
  const tile = vertical ? width * 0.34 : height * 0.3;

  // End card layout.
  const logoSize = vertical ? width * 0.62 : height * 0.38;
  const logoY = height * (vertical ? 0.37 : 0.34);
  const markSize = fitSize("Vision Studios:", width * (vertical ? 0.8 : 0.5), 150 * u);
  const markY = vertical ? height * 0.585 : height * 0.64;
  const sloganSize = Math.min((vertical ? 70 : 60) * u, fitSize("your sound. your vision.", width * 0.8, 200));

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="we handle it all." at={at(12, 1)} until={at(13, 1)} seed="s4-all" shake={18 * u} burn>
        <AllServices tile={tile} dx={vertical ? width * 0.23 : width * 0.3} dy={vertical ? height * 0.215 : height * 0.22} />
        <TextBlock lines={["we handle", "it all."]} maxWidth={lineWidth * (vertical ? 1 : 0.6)} maxSize={lineSize} duration={at(13, 1) - at(12, 1)} style={lift} />
      </Cut>

      {SCATTER.map(([src, fx, fy], i) => {
        const from = at(13, 3 + i * 3);
        const hold = 2 + Math.floor(random(`s4-hold-${i}`) * 3);
        return (
          <Cut key={i} name={`Work ${i + 1}`} at={from} until={from + hold} seed={`s4-sc${i}`} shake={10 * u}>
            <Frag src={src} width={frag} height={frag} x={width * fx} y={height * fy} duration={hold} card={src.startsWith("shop/")} marks={false} />
          </Cut>
        );
      })}
      <Cut name="completely streamlined so you focus on creating." at={at(13, 1)} until={at(14, 9)} seed="s4-focus" shake={18 * u} burn>
        <TextBlock
          lines={["completely", "streamlined", "so you focus", "on creating."]}
          maxWidth={lineWidth}
          maxSize={lineSize}
          duration={at(14, 9) - at(13, 1)}
          style={lift}
        />
      </Cut>

      <Cut name="let us help build your vision." at={at(14, 9)} until={at(16, 1)} seed="s4-build" shake={18 * u} burn>
        <TextBlock
          lines={["let us help", "build your", [{ text: "vision.", slant: true }]]}
          maxWidth={lineWidth}
          maxSize={lineSize}
          duration={at(16, 1) - at(14, 9)}
          push={0.08}
          style={lift}
        />
      </Cut>

      <Cut name="Logo" at={at(16, 1)} until={END} seed="s4-logo" shake={26 * u} burn cleanExit>
        <Logo size={logoSize} x={width / 2} y={logoY} duration={END - at(16, 1)} push={0.03} ghost={0.22} />
      </Cut>
      <Cut name="Vision Studios: your sound. your vision." at={at(16, 3)} until={END} seed="s4-signoff" shake={12 * u} cleanExit>
        <div style={{ position: "absolute", left: 0, right: 0, top: markY - markSize * 0.55, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: fonts.display, fontSize: markSize, lineHeight: 1, color: colors.text, letterSpacing: "-0.015em" }}>Vision Studios:</div>
          <div style={{ fontFamily: fonts.display, fontSize: sloganSize, lineHeight: 1, color: colors.text, marginTop: markSize * 0.3 }}>
            your sound. your <span style={{ fontStyle: "italic" }}>vision</span>.
          </div>
        </div>
      </Cut>
    </AbsoluteFill>
  );
};
