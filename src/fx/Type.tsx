import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../brand";
import { fitSize, type Face } from "../metrics";
import { flicker } from "./flicker";

const family: Record<Face, React.CSSProperties> = {
  bold: { fontFamily: fonts.display, fontStyle: "normal" },
  italic: { fontFamily: fonts.display, fontStyle: "italic" },
  outline: { fontFamily: fonts.outline, fontStyle: "normal" },
};

type WordProps = {
  text: string;
  face?: Face;
  /** The word is sized to fit this width... */
  maxWidth: number;
  /** ...but never larger than this (px). */
  maxSize: number;
  color?: string;
  /** Letter spacing in em. */
  tracking?: number;
  /** How much it slowly grows while it holds (0.04 = 4%), over `duration` frames. */
  push?: number;
  duration?: number;
  /** Where it sits; defaults to the centre of its parent. */
  style?: React.CSSProperties;
};

/** One big word (or a few) in Coldag Serif, sized to fit and drifting slowly toward the viewer. */
export const Word: React.FC<WordProps> = ({
  text,
  face = "bold",
  maxWidth,
  maxSize,
  color = colors.text,
  tracking = -0.01,
  push = 0.04,
  duration = 60,
  style,
}) => {
  const frame = useCurrentFrame();
  const size = fitSize(text, maxWidth, maxSize, face, tracking);
  return (
    <Interactive.Div
      name={text}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          ...family[face],
          fontSize: size,
          lineHeight: 1,
          letterSpacing: `${tracking}em`,
          color,
          whiteSpace: "pre",
          // Coldag's capitals sit low in the line box; lift them to the optical centre.
          position: "relative",
          top: "-0.08em",
          scale: interpolate(frame, [0, duration], [1, 1 + push], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        }}
      >
        {text}
      </div>
    </Interactive.Div>
  );
};

type MonoProps = {
  text: string;
  size: number;
  color?: string;
  /** Characters typed per frame; 0 shows it all at once. */
  typeSpeed?: number;
  /** Delay (frames) before typing starts. */
  delay?: number;
  /** Shows a block cursor while typing. */
  cursor?: boolean;
  style?: React.CSSProperties;
};

/** Small terminal-style label in Patchcode, optionally typed on. */
export const Mono: React.FC<MonoProps> = ({ text, size, color = colors.text, typeSpeed = 0, delay = 0, cursor = false, style }) => {
  const frame = useCurrentFrame();
  const shown = typeSpeed > 0 ? Math.max(0, Math.min(text.length, Math.floor((frame - delay) * typeSpeed))) : text.length;
  const typing = typeSpeed > 0 && shown < text.length && frame >= delay;
  return (
    <div
      style={{
        fontFamily: fonts.terminal,
        fontSize: size,
        lineHeight: 1.2,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {text.slice(0, shown)}
      {cursor && (typing || Math.floor(frame / 8) % 2 === 0) ? (
        <span style={{ display: "inline-block", width: "0.62em", height: "1em", background: color, verticalAlign: "-0.15em", marginLeft: "0.1em" }} />
      ) : null}
    </div>
  );
};

type ScriptLineProps = {
  /** Each word and the frame it appears. */
  words: [string, number][];
  size: number;
  /** Distance from the bottom of the frame, px. */
  bottom: number;
  color?: string;
  seed?: string;
};

/** The script line as a small running caption: each word lands with its big counterpart. */
export const ScriptLine: React.FC<ScriptLineProps> = ({ words, size, bottom, color = colors.muted, seed = "line" }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", gap: `0 ${size * 0.6}px`, flexWrap: "wrap" }}>
      {words.map(([w, at], i) => (
        <span key={i} style={{ opacity: flicker(frame, at, Infinity, `${seed}-${i}`) }}>
          <Mono text={w} size={size} color={color} />
        </span>
      ))}
    </div>
  );
};
