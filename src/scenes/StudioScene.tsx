import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, fonts } from "../brand";
import { hit, SCENE_START } from "../beat";
import { fitSize } from "../metrics";
import { Cut } from "../fx/Cut";
import { flicker } from "../fx/flicker";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";

// Bars 5–8: "At Vision Studios, we help bring that vision to life."
// The line builds up word by word as an editorial block, the newest line bright and the
// earlier ones dimmed, while the posters cut in beside it one per bar. On "life" the
// work strobes through on every sixteenth.
const START = SCENE_START[1];
const at = (bar: number, step = 1) => hit(bar, step) - START;

type W = { text: string; at: number; italic?: boolean };
const LINES: W[][] = [
  [{ text: "At", at: at(5, 1) }, { text: "Vision", at: at(5, 3) }, { text: "Studios", at: at(5, 9) }],
  [{ text: "we", at: at(6, 1) }, { text: "help", at: at(6, 3) }, { text: "bring", at: at(6, 9) }],
  [{ text: "that", at: at(7, 3) }, { text: "vision", at: at(7, 9), italic: true }],
  [{ text: "to", at: at(8, 3) }, { text: "life", at: at(8, 9) }],
];

const POSTERS: { src: string; caption: string; from: number; to: number }[] = [
  { src: "visual/snake-eyes.jpg", caption: "01 / Snake Eyes / Poster", from: at(5, 3), to: at(6, 3) },
  { src: "visual/staring-at-the-sun.jpg", caption: "02 / Staring at the Sun / Poster", from: at(6, 3), to: at(7, 3) },
  { src: "visual/three-blind-mice.jpg", caption: "03 / Three Blind Mice / Poster", from: at(7, 3), to: at(8, 3) },
  { src: "visual/bus-stop.jpg", caption: "04 / Bus Stop / Album cover", from: at(8, 3), to: at(8, 9) },
];

// "to life": every sixteenth from the clap to the end of the bar is a new piece.
const STROBE = ["blurred-vzn", "snake-eyes", "staring-at-the-sun", "three-blind-mice", "bus-stop", "blurred-vzn", "snake-eyes"];

export const StudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u, pad } = useLayout();

  // Text block: left half in 16:9, lower half in 9:16.
  const textLeft = vertical ? pad * 1.4 : pad * 2;
  const textWidth = vertical ? width - pad * 2.8 : width * 0.46;
  const size = fitSize("At Vision Studios", textWidth, 150 * u);
  const lineHeight = size * 1.02;
  const textTop = vertical ? height * 0.5 : height / 2 - (lineHeight * LINES.length) / 2 - 10 * u;

  // Poster frame: right side in 16:9, upper half in 9:16.
  const side = vertical ? width * 0.6 : Math.min(height * 0.56, width * 0.32);
  const px = vertical ? width / 2 : width * 0.74;
  const py = vertical ? height * 0.28 : height * 0.47;

  // The newest line is bright; the ones before it step back.
  const current = LINES.reduce((c, line, i) => (frame >= line[0].at ? i : c), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {POSTERS.map((p, i) => (
        <Cut key={p.src} name={p.caption} at={p.from} until={p.to} seed={`s2-p${i}`} shake={10 * u}>
          <Frag
            src={p.src}
            width={side}
            height={side}
            x={px}
            y={py}
            duration={p.to - p.from}
            zoom={1.08}
            drift={[0, -14 * u]}
            caption={p.caption}
            captionSize={(vertical ? 24 : 18) * u}
          />
        </Cut>
      ))}

      {STROBE.map((name, i) => {
        const from = at(8, 9 + i);
        return (
          <Cut key={i} name={`Strobe ${name}`} at={from} until={at(8, 10 + i)} seed={`s2-s${i}`}>
            <Frag src={`visual/${name}.jpg`} width={side} height={side} x={px} y={py} duration={4} zoom={1.02} />
          </Cut>
        );
      })}

      <div style={{ position: "absolute", left: textLeft, top: textTop, width: textWidth }}>
        {LINES.map((line, li) => (
          <div
            key={li}
            style={{
              height: lineHeight,
              display: "flex",
              gap: `0 ${size * 0.24}px`,
              opacity: li === current ? 1 : 0.32,
            }}
          >
            {line.map((w, wi) => (
              <span
                key={wi}
                style={{
                  fontFamily: fonts.display,
                  fontStyle: w.italic ? "italic" : "normal",
                  fontSize: size,
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  color: colors.text,
                  opacity: flicker(frame, w.at, Infinity, `s2-w${li}-${wi}`),
                }}
              >
                {w.text}
              </span>
            ))}
          </div>
        ))}
      </div>

    </AbsoluteFill>
  );
};
