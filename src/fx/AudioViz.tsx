import React from "react";
import { createSmoothSvgPath, useWindowedAudioData, visualizeAudio, visualizeAudioWaveform } from "@remotion/media-utils";
import { staticFile, useVideoConfig } from "remotion";
import { colors } from "../brand";

const SONG = staticFile("audio/wanderer.mp3");

type VizProps = {
  /** Frame of the song to show (the frame of the whole video). */
  song: number;
  width: number;
  height: number;
};

/** Live spectrum of the track: 32 bars spread over the frequencies on a log scale. */
export const Spectrum: React.FC<VizProps & { gap?: number }> = ({ song, width, height, gap = 4 }) => {
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: SONG, frame: song, fps, windowInSeconds: 8 });
  const raw = audioData
    ? visualizeAudio({ fps, frame: song, audioData, numberOfSamples: 256, optimizeFor: "speed", dataOffsetInSeconds })
    : [];
  // Log-spaced bins, like a real analyser, with the highs tilted up.
  const freqs = raw.length
    ? Array.from({ length: 32 }, (_, i) => {
        const bin = Math.min(raw.length - 1, Math.round(Math.exp((i / 31) * Math.log(160))));
        return Math.min(1, raw[bin] * (1 + i * 0.12));
      })
    : [];
  return (
    <div style={{ width, height, display: "flex", alignItems: "flex-end", gap }}>
      {freqs.map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${Math.max(2, Math.min(100, Math.pow(v, 0.6) * 130))}%`, background: colors.text }} />
      ))}
    </div>
  );
};

/** Live waveform of the track, like an oscilloscope. */
export const Waveform: React.FC<VizProps & { stroke?: number }> = ({ song, width, height, stroke = 2.5 }) => {
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: SONG, frame: song, fps, windowInSeconds: 8 });
  const wave = audioData
    ? visualizeAudioWaveform({ fps, frame: song, audioData, numberOfSamples: 96, windowInSeconds: 0.3, dataOffsetInSeconds })
    : [];
  const path = wave.length
    ? createSmoothSvgPath({ points: wave.map((y, i) => ({ x: (i / (wave.length - 1)) * width, y: height / 2 + y * height * 0.9 })) })
    : "";
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <line x1={0} x2={width} y1={height / 2} y2={height / 2} stroke={colors.muted} strokeWidth={1} strokeDasharray="4 6" />
      <path d={path} fill="none" stroke={colors.text} strokeWidth={stroke} />
    </svg>
  );
};
