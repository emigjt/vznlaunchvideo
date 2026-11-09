import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-hosted brand fonts (copied from the website). Remotion waits for these
// before rendering any frame.
export const fontsLoaded = Promise.all([
  loadFont({ family: "ColdagSerif", url: staticFile("fonts/ColdagSerif-Bold.woff2"), weight: "100 900", style: "normal" }),
  loadFont({ family: "ColdagSerif", url: staticFile("fonts/ColdagSerif-Italic.woff2"), weight: "100 900", style: "italic" }),
  loadFont({ family: "ColdagSerif Outline", url: staticFile("fonts/ColdagSerif-Outline.woff2") }),
  loadFont({ family: "Hitchcut", url: staticFile("fonts/Hitchcut-Regular.woff2") }),
  loadFont({ family: "Patchcode", url: staticFile("fonts/Patchcode.woff2") }),
]);
