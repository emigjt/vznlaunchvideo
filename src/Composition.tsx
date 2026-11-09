import { AbsoluteFill, Composition, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, FPS } from "./brand";
import "./fonts";

// Placeholder title card so the project renders end to end. The real launch video
// replaces this once the brief (references, music, visuals, narrative) is in.
export const LaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const reveal = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, color: colors.text, alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("brand/logo-white.svg")}
        style={{ width: vertical ? "70%" : "34%", opacity: 0.2 + 0.8 * reveal, filter: `blur(${(1 - reveal) * 18}px)` }}
      />
      <div style={{ position: "absolute", bottom: vertical ? "18%" : "12%", textAlign: "center" }}>
        <div style={{ fontFamily: fonts.display, fontSize: vertical ? 120 : 110, lineHeight: 1 }}>Vision Studios</div>
        <div style={{ fontFamily: fonts.terminal, fontSize: vertical ? 40 : 34, color: colors.muted, marginTop: 24 }}>launch video — work in progress</div>
      </div>
    </AbsoluteFill>
  );
};

export const LaunchCompositions: React.FC = () => (
  <>
    <Composition id="LaunchWide" component={LaunchVideo} durationInFrames={5 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="LaunchVertical" component={LaunchVideo} durationInFrames={5 * FPS} fps={FPS} width={1080} height={1920} />
  </>
);
