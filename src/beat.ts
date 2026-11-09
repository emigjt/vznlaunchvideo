import { FPS } from "./brand";

// Beat grid of "Wanderer" (public/audio/wanderer.mp3), measured from the audio:
// 122 BPM, 16 bars of 16 sixteenth-steps, the first step at 0.028 s.
// Per bar: an 808 on step 3, the clap on step 9 (the main hit), extra 808s on steps 1 and 8
// in bars 11 and 15 (the loudest), and an 808 fill on steps 13 and 15 in bars 4, 8, 12 and 16
// that leads into each 4-bar phrase.
export const BPM = 122;
export const BARS = 16;
const FIRST_STEP_S = 0.028;
const STEP_S = 60 / BPM / 4;

/** Frame of a sixteenth-step on the grid; bar 1–16 and step 1–16, like counting the music. */
export const hit = (bar: number, step = 1): number =>
  Math.round((FIRST_STEP_S + ((bar - 1) * 16 + (step - 1)) * STEP_S) * FPS);

/** Frames in one beat (a quarter note) and in one bar. */
export const BEAT = (60 / BPM) * FPS;
export const BAR = BEAT * 4;

/**
 * First frame of each scene: the opening line (bars 1–4), "at Vision Studios…" (bars 5–6),
 * the services (bars 7–10, one each), and the close (bars 11–16 and the tail).
 */
export const SCENE_START = [0, hit(5), hit(7), hit(11)] as const;
export const MUSIC_END = Math.round(31.475 * FPS);
/** The end card holds a little past the music. */
export const TOTAL = MUSIC_END + Math.round(1.5 * FPS);

/** Which bar (1–16) an absolute frame falls in. */
export const barAt = (frame: number): number =>
  Math.max(1, Math.min(BARS, Math.floor((frame / FPS - FIRST_STEP_S) / (STEP_S * 16)) + 1));

/** Position inside the current beat, 0 at the beat and rising to 1 just before the next. */
export const beatPhase = (frame: number): number => {
  const beats = (frame / FPS - FIRST_STEP_S) / (STEP_S * 4);
  return beats - Math.floor(beats);
};
