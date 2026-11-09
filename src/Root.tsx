import React from "react";
import { Composition, Folder } from "remotion";
import { SCENE_START, TOTAL } from "./beat";
import { FPS } from "./brand";
import "./fonts";
import { LaunchVideo } from "./LaunchVideo";
import { CreateScene } from "./scenes/CreateScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { StudioScene } from "./scenes/StudioScene";
import { VisionScene } from "./scenes/VisionScene";

const WIDE = { width: 1920, height: 1080 };
const VERTICAL = { width: 1080, height: 1920 };

// Each scene again on its own (9:16, no music or overlays) for editing in the Studio.
const SCENES = [
  { id: "Scene1-Vision", component: VisionScene, duration: SCENE_START[1] - SCENE_START[0] },
  { id: "Scene2-Studio", component: StudioScene, duration: SCENE_START[2] - SCENE_START[1] },
  { id: "Scene3-Services", component: ServicesScene, duration: SCENE_START[3] - SCENE_START[2] },
  { id: "Scene4-Create", component: CreateScene, duration: TOTAL - SCENE_START[3] },
];

export const RemotionRoot: React.FC = () => (
  <>
    {/* The social cut (TikTok, Reels, Shorts). */}
    <Composition id="LaunchVertical" component={LaunchVideo} durationInFrames={TOTAL} fps={FPS} {...VERTICAL} />
    {/* 16:9 version, parked for now: same scenes, not tuned since the move to vertical. */}
    <Composition id="LaunchWide" component={LaunchVideo} durationInFrames={TOTAL} fps={FPS} {...WIDE} />
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={s.component} durationInFrames={s.duration} fps={FPS} {...VERTICAL} />
      ))}
    </Folder>
  </>
);
