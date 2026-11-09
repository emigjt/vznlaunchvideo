import React from "react";
import { createSmoothSvgPath, useWindowedAudioData, visualizeAudio, visualizeAudioWaveform } from "@remotion/media-utils";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, display, fonts } from "../brand";
import { hit, SCENE_START } from "../beat";
import { env } from "../audio-envelope";
import { textWidthEm } from "../metrics";
import { Cut } from "../fx/Cut";
import { flicker } from "../fx/flicker";
import { Frag } from "../fx/Frag";
import { useLayout } from "../fx/layout";
import { Mono } from "../fx/Type";

// Bars 7–10: "music production, mixing/mastering, cover art, merchandising."
// One service per bar, each cut in on the downbeat with its own piece of the portfolio:
// the beat catalogue and a live spectrum, a live waveform with level meters, a montage of
// the artwork cutting on the 808s, and the hoodie flipping on the hits.
const START = SCENE_START[2];
// One service per bar. Each one's portfolio pieces appear only from its own bar on.
const PRODUCTION = 7;
const MIXING = 8;
const COVER_ART = 9;
const MERCH = 10;
const SONG = staticFile("audio/wanderer.mp3");

/** Frame of a hit relative to a service that starts on the downbeat of `firstBar`. */
const rel = (firstBar: number) => (bar: number, step = 1) => hit(bar, step) - hit(firstBar);

const useRegions = () => {
  const { width, height, vertical, u, pad } = useLayout();
  return {
    width,
    height,
    vertical,
    u,
    pad,
    // Where the title block goes...
    title: vertical
      ? { left: pad * 1.4, top: height * 0.5, width: width - pad * 2.8 }
      : { left: pad * 2, top: 0, width: width * 0.44 },
    // ...and the portfolio piece.
    visual: vertical
      ? { x: width / 2, y: height * 0.3, w: width - pad * 3, h: height * 0.32 }
      : { x: width * 0.735, y: height * 0.47, w: width * 0.34, h: height * 0.6 },
  };
};

type TitleProps = { index: number; lines: { text: string; at: number; italic?: boolean }[]; seed: string; slash?: boolean };

/** "Services 0X/04" and the service name, a line per hit. */
const ServiceTitle: React.FC<TitleProps> = ({ index, lines, seed, slash = false }) => {
  const frame = useCurrentFrame();
  const { title, visual, u, vertical } = useRegions();
  // Size to the widest line, counting the slash in front of the second line.
  const widths = lines.map((l, i) => textWidthEm(slash && i === 1 ? `/ ${l.text}` : l.text));
  const size = Math.min((vertical ? 190 : 210) * u, title.width / Math.max(...widths));
  // In 16:9 the block is centred on the portfolio piece beside it.
  const label = (vertical ? 26 : 22) * u;
  const blockHeight = label * 1.2 + 18 * u + lines.length * size;
  const top = vertical ? title.top : visual.y - blockHeight / 2;
  return (
    <div style={{ position: "absolute", left: title.left, top, width: title.width }}>
      <Mono text={`Services ${String(index).padStart(2, "0")}/04`} size={label} color={colors.muted} style={{ marginBottom: 18 * u }} />
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: fonts.display,
            fontStyle: l.italic ? "italic" : "normal",
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "-0.015em",
            color: colors.text,
            opacity: flicker(frame, l.at, Infinity, `${seed}-${i}`),
            display: "flex",
            alignItems: "center",
            gap: size * 0.18,
          }}
        >
          {slash && i === 1 ? (
            display.punctuation ? (
              <span>/</span>
            ) : (
              <span style={{ display: "inline-block", width: size * 0.05, height: size * 0.62, background: colors.text, rotate: "22deg" }} />
            )
          ) : null}
          {l.text}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- 01 Music production

const BEATS = [
  ["Angel Feathers", "114", "0:34"],
  ["Wanderer", "122", "0:32"],
  ["Topspin", "130", "0:30"],
  ["Two Step", "128", "0:30"],
  ["Voxelize", "125", "0:31"],
  ["Feedback Interrupted", "133", "0:38"],
  ["Lambo Long", "141", "1:39"],
];

const Production: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visual, u, vertical } = useRegions();
  const r = rel(PRODUCTION);
  const song = frame + hit(PRODUCTION);
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: SONG, frame: song, fps, windowInSeconds: 8 });
  const raw = audioData
    ? visualizeAudio({ fps, frame: song, audioData, numberOfSamples: 256, optimizeFor: "speed", dataOffsetInSeconds })
    : [];
  // Spread 32 bars over the bins on a log scale (like a real analyser), tilting the highs up.
  const freqs = raw.length
    ? Array.from({ length: 32 }, (_, i) => {
        const bin = Math.min(raw.length - 1, Math.round(Math.exp((i / 31) * Math.log(160))));
        return Math.min(1, raw[bin] * (1 + i * 0.12));
      })
    : [];
  const rowSize = (vertical ? 27 : 24) * u;
  const listTop = visual.y - visual.h / 2;
  const specH = visual.h * 0.42;
  return (
    <AbsoluteFill>
      <ServiceTitle index={1} seed="svc1" lines={[{ text: "music", at: 0 }, { text: "production", at: r(PRODUCTION, 9) }]} />
      <div style={{ position: "absolute", left: visual.x - visual.w / 2, top: listTop, width: visual.w }}>
        <Mono text="VZN / Beats" size={rowSize} color={colors.muted} style={{ marginBottom: 12 * u }} />
        {BEATS.map(([name, bpm, len], i) => {
          const playing = name === "Wanderer";
          return (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid rgba(232,231,227,0.18)`,
                padding: `${6 * u}px 0`,
                opacity: flicker(frame, r(PRODUCTION, 2 + i), Infinity, `svc1-row${i}`),
              }}
            >
              <Mono text={`${playing ? ">" : " "} ${String(i + 1).padStart(2, "0")}  ${name}`} size={rowSize} color={playing ? colors.text : colors.muted} />
              <Mono text={`${bpm} BPM  ${len}`} size={rowSize} color={playing ? colors.text : colors.muted} />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: visual.x - visual.w / 2,
          top: visual.y + visual.h / 2 - specH,
          width: visual.w,
          height: specH,
          display: "flex",
          alignItems: "flex-end",
          gap: 4 * u,
          opacity: flicker(frame, r(PRODUCTION, 9), Infinity, "svc1-spec"),
        }}
      >
        {freqs.map((v, i) => (
          <div key={i} style={{ flex: 1, height: `${Math.max(2, Math.min(100, Math.pow(v, 0.6) * 130))}%`, background: colors.text }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 02 Mixing / Mastering

const Mixing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visual, u, vertical } = useRegions();
  const r = rel(MIXING);
  const song = frame + hit(MIXING);
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: SONG, frame: song, fps, windowInSeconds: 8 });
  const waveH = visual.h * 0.55;
  const wave = audioData
    ? visualizeAudioWaveform({ fps, frame: song, audioData, numberOfSamples: 96, windowInSeconds: 0.3, dataOffsetInSeconds })
    : [];
  const path = wave.length
    ? createSmoothSvgPath({ points: wave.map((y, i) => ({ x: (i / (wave.length - 1)) * visual.w, y: waveH / 2 + y * waveH * 0.9 })) })
    : "";
  const level = env("level", song);
  // Loudness on a meter-like curve, so the quiet bars still move.
  const meter = (v: number) => Math.min(1, Math.pow(v, 0.55) * 1.1);
  const meters: [string, number][] = [
    ["L", meter(level)],
    ["R", meter(level * (0.93 + 0.1 * env("clap", song)))],
  ];
  const top = visual.y - visual.h / 2;
  return (
    <AbsoluteFill>
      <ServiceTitle index={2} seed="svc2" slash lines={[{ text: "mixing", at: 0 }, { text: "mastering", at: r(MIXING, 9) }]} />
      <div style={{ position: "absolute", left: visual.x - visual.w / 2, top, width: visual.w }}>
        <Mono text="Wanderer / Master bus" size={(vertical ? 26 : 20) * u} color={colors.muted} />
        <svg width={visual.w} height={waveH} style={{ display: "block", marginTop: 14 * u, overflow: "visible" }}>
          <line x1={0} x2={visual.w} y1={waveH / 2} y2={waveH / 2} stroke={colors.muted} strokeWidth={1} strokeDasharray="4 6" />
          <path d={path} fill="none" stroke={colors.text} strokeWidth={2.5 * u} />
        </svg>
        <div style={{ marginTop: 26 * u, display: "flex", flexDirection: "column", gap: 12 * u, opacity: flicker(frame, r(MIXING, 3), Infinity, "svc2-m") }}>
          {meters.map(([ch, v]) => (
            <div key={ch} style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
              <Mono text={ch} size={20 * u} />
              <div style={{ flex: 1, height: 14 * u, border: `1px solid rgba(232,231,227,0.35)`, position: "relative" }}>
                {/* Segmented like a hardware meter. */}
                <div
                  style={{
                    position: "absolute",
                    inset: 2,
                    width: `calc(${(v * 100).toFixed(1)}% - 4px)`,
                    background: `repeating-linear-gradient(90deg, ${colors.text} 0 ${6 * u}px, transparent ${6 * u}px ${9 * u}px)`,
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 34 * u }}>
            {["-36", "-24", "-12", "-6", "-3", "0"].map((t) => (
              <Mono key={t} text={t} size={16 * u} color={colors.muted} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 03 Cover art

const COVERS: [string, string, number, number][] = [
  // file, caption, from and to (steps) within the cover art bar
  ["snake-eyes", "Snake Eyes / Poster", 1, 3],
  ["staring-at-the-sun", "Staring at the Sun / Poster", 3, 8],
  ["three-blind-mice", "Three Blind Mice / Poster", 8, 9],
  ["bus-stop", "Bus Stop / Album cover", 9, 13],
  ["blurred-vzn", "Blurred VZN / Artwork", 13, 15],
  ["snake-eyes", "Snake Eyes / Poster", 15, 17],
];

const CoverArt: React.FC = () => {
  const { visual, u, vertical } = useRegions();
  const r = rel(COVER_ART);
  const side = vertical ? Math.min(visual.w, visual.h) * 1.04 : Math.min(visual.w, visual.h) * 1.02;
  return (
    <AbsoluteFill>
      <ServiceTitle index={3} seed="svc3" lines={[{ text: "cover", at: 0 }, { text: "art", at: r(COVER_ART, 3), italic: true }]} />
      {COVERS.map(([file, caption, s0, s1], i) => (
        <Cut key={i} name={caption} at={r(COVER_ART, s0)} until={r(COVER_ART, s1)} seed={`svc3-${i}`} shake={12 * u}>
          <Frag
            src={`visual/${file}.jpg`}
            width={side}
            height={side}
            x={visual.x}
            y={visual.y}
            duration={r(COVER_ART, s1) - r(COVER_ART, s0)}
            zoom={1.05}
            caption={`${String(i + 1).padStart(2, "0")} / ${caption}`}
            captionSize={(vertical ? 24 : 18) * u}
          />
        </Cut>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 04 Merchandising

const HOODIES: [string, string, number, number][] = [
  ["charcoal-front", "VZN Logo Hoodie / Charcoal / Front", 1, 3],
  ["charcoal-back", "VZN Logo Hoodie / Charcoal / Back", 3, 9],
  ["grey-front", "VZN Logo Hoodie / Grey / Front", 9, 13],
  ["grey-back", "VZN Logo Hoodie / Grey / Back", 13, 17],
];

const Merch: React.FC = () => {
  const { visual, u, vertical } = useRegions();
  const r = rel(MERCH);
  const side = vertical ? Math.min(visual.w, visual.h) * 1.02 : Math.min(visual.w, visual.h) * 0.95;
  return (
    <AbsoluteFill>
      <ServiceTitle index={4} seed="svc4" lines={[{ text: "merchandising", at: 0 }]} />
      {HOODIES.map(([file, caption, s0, s1], i) => (
        <Cut key={file} name={caption} at={r(MERCH, s0)} until={r(MERCH, s1)} seed={`svc4-${i}`} shake={8 * u}>
          <Frag
            src={`shop/vzn-logo-hoodie-${file}.jpg`}
            width={side}
            height={side}
            x={visual.x}
            y={visual.y}
            duration={r(MERCH, s1) - r(MERCH, s0)}
            zoom={1.04}
            card
            caption={caption}
            captionSize={(vertical ? 24 : 18) * u}
          />
        </Cut>
      ))}
    </AbsoluteFill>
  );
};

// ----------------------------------------------------------------

export const ServicesScene: React.FC = () => {
  const s = (bar: number) => hit(bar) - START;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Cut name="01 music production" at={s(PRODUCTION)} until={s(MIXING)} seed="svc-1">
        <Production />
      </Cut>
      <Cut name="02 mixing / mastering" at={s(MIXING)} until={s(COVER_ART)} seed="svc-2">
        <Mixing />
      </Cut>
      <Cut name="03 cover art" at={s(COVER_ART)} until={s(MERCH)} seed="svc-3">
        <CoverArt />
      </Cut>
      <Cut name="04 merchandising" at={s(MERCH)} until={s(MERCH + 1)} seed="svc-4">
        <Merch />
      </Cut>
    </AbsoluteFill>
  );
};
