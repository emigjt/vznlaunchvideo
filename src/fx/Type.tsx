import React from "react";
import { Interactive, useCurrentFrame } from "remotion";
import { colors, display, fonts } from "../brand";
import { fitSize, type Face } from "../metrics";
import { flicker } from "./flicker";
import { enterPose, Kinetic, type Enter } from "./Motion";

const family: Record<Face, React.CSSProperties> = {
  bold: { fontFamily: fonts.display, fontStyle: "normal" },
  italic: { fontFamily: fonts.display, fontStyle: "italic" },
  outline: { fontFamily: fonts.outline, fontStyle: "normal" },
};

/** Colour of a word, drawn as an outline when the face is "outline" and the font has none. */
export const ink = (face: Face, color: string): React.CSSProperties =>
  face === "outline" && display.strokeOutline
    ? { color: "transparent", WebkitTextStroke: `0.02em ${color}` }
    : { color };

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
  /** How it arrives, and how far it travels to get there (px). */
  enter?: Enter;
  dist?: number;
  seed?: string;
  /** How much it slowly grows while it holds (0.04 = 4%), over `duration` frames. */
  push?: number;
  duration?: number;
  /** Slow slide (px) and turn (deg) while it holds. */
  drift?: [number, number];
  spin?: number;
  /** Turned on its side, reading bottom to top (size it to the frame's height). */
  turn?: boolean;
  /** Where it sits; defaults to the centre of its parent. */
  style?: React.CSSProperties;
};

/** One big word (or a few) in the display font: sized to fit, arriving on its hit, then drifting. */
export const Word: React.FC<WordProps> = ({
  text,
  face = "bold",
  maxWidth,
  maxSize,
  color = colors.text,
  tracking = -0.01,
  enter = "punch",
  dist = 600,
  seed,
  push = 0.05,
  duration = 60,
  drift,
  spin,
  turn = false,
  style,
}) => {
  const size = fitSize(text, maxWidth, maxSize, face, tracking);
  return (
    <Interactive.Div name={text} style={{ position: "absolute", inset: 0, ...style }}>
      <Kinetic enter={enter} dist={dist} seed={seed ?? text} duration={duration} push={push} drift={drift} spin={spin}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              ...family[face],
              fontSize: size,
              lineHeight: 1,
              letterSpacing: `${tracking}em`,
              ...ink(face, color),
              whiteSpace: "pre",
              // Capitals sit low in the line box; lift them to the optical centre.
              position: "relative",
              top: display.lift,
              rotate: turn ? "-90deg" : undefined,
            }}
          >
            {text}
          </div>
        </div>
      </Kinetic>
    </Interactive.Div>
  );
};

type InlineWordProps = {
  text: string;
  /** Frame it lands (relative to the parent sequence). */
  at: number;
  size: number;
  enter?: Enter;
  face?: Face;
  color?: string;
  seed: string;
  style?: React.CSSProperties;
};

/**
 * A word inside a line of text: it flickers in on its hit, travelling a short way with a
 * smear (drawn as trailing text shadows, so the line's layout never moves).
 */
export const InlineWord: React.FC<InlineWordProps> = ({ text, at, size, enter = "rise", face = "bold", color = colors.text, seed, style }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const now = enterPose(t, enter, size * 0.9, seed, 5);
  const prev = enterPose(t - 1.5, enter, size * 0.9, seed, 5);
  const vx = prev.x - now.x;
  const vy = prev.y - now.y;
  const moving = t >= 0 && t < 5 && (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5);
  return (
    <span
      style={{
        display: "inline-block",
        ...family[face],
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        ...ink(face, color),
        whiteSpace: "pre",
        opacity: flicker(frame, at, Infinity, seed),
        translate: `${now.x}px ${now.y}px`,
        scale: `${now.scale * now.sx} ${now.scale}`,
        rotate: `${now.rot}deg`,
        textShadow: moving
          ? [0.35, 0.7, 1.05, 1.4].map((k, i) => `${vx * k}px ${vy * k}px 0 rgba(232,231,227,${0.4 - i * 0.09})`).join(", ")
          : undefined,
        ...style,
      }}
    >
      {text}
    </span>
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
  /** Set in capitals (the HUD); the script itself stays lowercase. */
  upper?: boolean;
  style?: React.CSSProperties;
};

/** Small terminal-style label in Patchcode, optionally typed on. */
export const Mono: React.FC<MonoProps> = ({ text, size, color = colors.text, typeSpeed = 0, delay = 0, cursor = false, upper = true, style }) => {
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
        textTransform: upper ? "uppercase" : "none",
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
          <Mono text={w} size={size} color={color} upper={false} />
        </span>
      ))}
    </div>
  );
};
