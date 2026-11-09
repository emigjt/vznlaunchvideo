import React from "react";
import { CanvasImage, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors } from "../brand";
import { Mono } from "./Type";

type FragProps = {
  /** File in public/, e.g. "visual/snake-eyes.jpg". */
  src: string;
  /** Size and centre of the frame, in px. */
  width: number;
  height: number;
  x: number;
  y: number;
  /** Frames it holds, for the slow drift. */
  duration: number;
  /** Slow push in (1.08 = grows 8%) and slide (px) over `duration`. */
  zoom?: number;
  drift?: [number, number];
  /** Which part of the image to show when cropped (CSS object-position style, 0–1). */
  focus?: [number, number];
  /** Extra crop zoom on the image inside its frame. */
  crop?: number;
  caption?: string;
  captionSize?: number;
  /** Small crop marks at the corners. */
  marks?: boolean;
  /** Multiply over a bone card (for product photos on white). */
  card?: boolean;
};

/**
 * A piece of the portfolio as a greyscale fragment: it lands as a blown-out photocopy
 * for a frame, then settles and drifts slowly while it holds.
 */
export const Frag: React.FC<FragProps> = ({
  src,
  width,
  height,
  x,
  y,
  duration,
  zoom = 1.06,
  drift = [0, 0],
  focus = [0.5, 0.5],
  crop = 1,
  caption,
  captionSize = 18,
  marks = true,
  card = false,
}) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.33, 0, 0.2, 1);
  // Draw the image larger than its frame (crop > 1) to show only part of it.
  const iw = Math.round(width * crop);
  const ih = Math.round(height * crop);
  const mark = Math.max(10, Math.min(width, height) * 0.06);
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        translate: interpolate(frame, [0, duration], ["0px 0px", `${drift[0]}px ${drift[1]}px`], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: card ? colors.paper : "transparent",
        }}
      >
        <CanvasImage
          src={staticFile(src)}
          width={iw}
          height={ih}
          fit="cover"
          style={{
            position: "absolute",
            left: (width - iw) * focus[0],
            top: (height - ih) * focus[1],
            mixBlendMode: card ? "multiply" : "normal",
            transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`,
            scale: interpolate(frame, [0, duration], [1, zoom], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
            filter:
              frame < 1
                ? "grayscale(1) contrast(4) brightness(1.3)"
                : frame < 2
                  ? "grayscale(1) contrast(1.8) brightness(0.8)"
                  : "grayscale(1) contrast(1.2) brightness(0.95)",
          }}
        />
      </div>
      {marks ? <CropMarks size={mark} /> : null}
      {caption ? (
        <div style={{ position: "absolute", left: 0, top: height + captionSize * 0.8 }}>
          <Mono text={caption} size={captionSize} color={colors.muted} />
        </div>
      ) : null}
    </div>
  );
};

/** Little L-shaped marks just outside each corner of the parent box. */
export const CropMarks: React.FC<{ size: number; gap?: number; color?: string; weight?: number }> = ({
  size,
  gap,
  color = colors.text,
  weight = 1.5,
}) => {
  const g = gap ?? size * 0.5;
  const line = (style: React.CSSProperties) => (
    <div style={{ position: "absolute", background: color, opacity: 0.7, ...style }} />
  );
  return (
    <>
      {line({ left: -g, top: -g, width: size, height: weight })}
      {line({ left: -g, top: -g, width: weight, height: size })}
      {line({ right: -g, top: -g, width: size, height: weight })}
      {line({ right: -g, top: -g, width: weight, height: size })}
      {line({ left: -g, bottom: -g, width: size, height: weight })}
      {line({ left: -g, bottom: -g, width: weight, height: size })}
      {line({ right: -g, bottom: -g, width: size, height: weight })}
      {line({ right: -g, bottom: -g, width: weight, height: size })}
    </>
  );
};
