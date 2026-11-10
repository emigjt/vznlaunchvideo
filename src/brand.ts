// VZN brand tokens, matching the website (vznstudiowebpage: assets/css/styles.css).
export const colors = {
  bg: "#000000",
  text: "#e8e7e3", // bone
  muted: "#7c7b78",
  paper: "#e8e7e3", // Visual side background
  ink: "#0a0a0a", // Visual side text
  accent: "#ff3b2f",
};

// The display face for the big words:
// "sactione" (Sactione, regular and a true italic),
// "hitchcut" (one weight; its slanted and outlined versions are drawn from it),
// "coldag" (Coldag Serif, as on the website).
export type DisplayFont = "sactione" | "hitchcut" | "coldag";
export const DISPLAY_FONT = "sactione" as DisplayFont;

const FAMILY: Record<DisplayFont, string> = {
  sactione: '"Sactione", "Arial", sans-serif',
  hitchcut: '"Hitchcut", "Arial Black", sans-serif',
  coldag: '"ColdagSerif", "Times New Roman", serif',
};
export const fonts = {
  display: FAMILY[DISPLAY_FONT],
  outline: DISPLAY_FONT === "coldag" ? '"ColdagSerif Outline", serif' : FAMILY[DISPLAY_FONT],
  terminal: '"Patchcode", ui-monospace, monospace',
};

export const display = {
  /** Outlines are drawn with a stroke unless the font has an outline face (Coldag). */
  strokeOutline: DISPLAY_FONT !== "coldag",
  /** Has , . : / - (Coldag doesn't, so those are drawn or left out). */
  punctuation: DISPLAY_FONT !== "coldag",
  /** Nudge that puts the letters on the optical centre of their line. */
  lift: { sactione: "0.04em", hitchcut: "-0.03em", coldag: "-0.08em" }[DISPLAY_FONT],
};

export const FPS = 30;
