// VZN brand tokens, matching the website (vznstudiowebpage: assets/css/styles.css).
export const colors = {
  bg: "#000000",
  text: "#e8e7e3", // bone
  muted: "#7c7b78",
  paper: "#e8e7e3", // Visual side background
  ink: "#0a0a0a", // Visual side text
  accent: "#ff3b2f",
};

// The display face for the big words. "hitchcut" (one weight; its slanted and outlined
// versions are drawn from it) or "coldag" (Coldag Serif, as on the website).
export type DisplayFont = "hitchcut" | "coldag";
export const DISPLAY_FONT: DisplayFont = "hitchcut";

const HITCHCUT = '"Hitchcut", "Arial Black", sans-serif';
export const fonts = {
  display: DISPLAY_FONT === "hitchcut" ? HITCHCUT : '"ColdagSerif", "Times New Roman", serif',
  outline: DISPLAY_FONT === "hitchcut" ? HITCHCUT : '"ColdagSerif Outline", serif',
  terminal: '"Patchcode", ui-monospace, monospace',
};

export const display = {
  /** Outlines are drawn with a stroke (Hitchcut) rather than from an outline font (Coldag). */
  strokeOutline: DISPLAY_FONT === "hitchcut",
  /** Has , . : / - (Coldag doesn't, so those are drawn or left out). */
  punctuation: DISPLAY_FONT === "hitchcut",
  /** Nudge that puts the capitals on the optical centre of their line. */
  lift: DISPLAY_FONT === "hitchcut" ? "-0.03em" : "-0.08em",
};

export const FPS = 30;

// Shown on the end card. Swap in the studio's own domain once it has one.
export const SITE_URL = "emigjt.github.io/vznstudiowebpage";
