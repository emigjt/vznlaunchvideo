import { useVideoConfig } from "remotion";

/** Shared measurements so every scene works in both 16:9 and 9:16. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  // One unit is 1 px at 1080 on the short side.
  const u = Math.min(width, height) / 1080;
  // Safe margin for the HUD and edge-aligned type.
  const pad = (vertical ? 64 : 72) * u;
  // Optical centre for the main subject. On phones the app's caption and buttons cover
  // the bottom of a 9:16 video, so the subject sits a little above the middle there.
  const cy = vertical ? height * 0.46 : height / 2;
  // Bottom edge of the area apps leave uncovered (TikTok, Reels, Shorts).
  const safeBottom = vertical ? height * 0.78 : height - pad;
  return { width, height, vertical, u, pad, cy, safeBottom };
};
