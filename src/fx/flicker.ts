import { random } from "remotion";

// The grit of the edit: things don't fade, they cut in and out on the beat, and their
// edges stutter for a frame or two like a bad signal. All of it is seeded, so every
// render is identical.

// Visible (1) or hidden (0) for the first frames after something appears.
const ENTRY_PATTERNS = [
  [1, 0, 1],
  [1, 1, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1],
];
// ...and for the last frames before it goes (read backwards from the cut).
const EXIT_PATTERNS = [[1], [1, 0], [1, 0, 1], [0, 1, 1, 0, 1]];

/**
 * Whether a layer that shows from frame `on` until frame `off` (exclusive) is visible
 * at `frame`, with a ragged entry and exit picked by `seed`. `dropout` is the chance of
 * a stray one-frame blink while it holds.
 */
export const flicker = (frame: number, on: number, off: number, seed: number | string = 0, dropout = 0): number => {
  if (frame < on || frame >= off) return 0;
  const entry = ENTRY_PATTERNS[Math.floor(random(`entry-${seed}`) * ENTRY_PATTERNS.length)];
  const exit = EXIT_PATTERNS[Math.floor(random(`exit-${seed}`) * EXIT_PATTERNS.length)];
  const sinceOn = frame - on;
  const beforeOff = off - 1 - frame;
  if (sinceOn < entry.length) return entry[sinceOn];
  if (beforeOff < exit.length) return exit[beforeOff];
  if (dropout > 0 && random(`drop-${seed}-${frame}`) < dropout) return 0;
  return 1;
};

/** A small seeded jolt (in px) for the first frame or two of a cut, 0 afterwards. */
export const jolt = (sinceOn: number, seed: number | string, amount: number): [number, number] =>
  sinceOn < 2
    ? [(random(`jx-${seed}-${sinceOn}`) - 0.5) * 2 * amount, (random(`jy-${seed}-${sinceOn}`) - 0.5) * amount]
    : [0, 0];
