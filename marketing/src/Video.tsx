import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Scene0_Intro } from "./compositions/Scene0_Intro";
import { Scene1_Hook } from "./compositions/Scene1_Hook";
import { Scene2_Tool } from "./compositions/Scene2_Tool";
import { Scene3_Data } from "./compositions/Scene3_Data";
import { Scene4_Math } from "./compositions/Scene4_Math";
import { Scene5_Route } from "./compositions/Scene5_Route";
import { Scene6_Query } from "./compositions/Scene6_Query";
import { Scene7_Close } from "./compositions/Scene7_Close";

/*
 * Scene breakdown (30fps):
 *
 * Audio durations (seconds): S0=10.7, S1=18.4, S2=16.4, S3=14.7, S4=16.7, S5=23.9, S6=11.3, S7=14.9
 * Each scene = ceil(audio * 30) + 15 frames (~0.5s buffer)
 *
 * Scene 0 - DevRel Intro: 0:00 - 0:11  (frames 0-335)
 * Scene 1 - The Problem:  0:11 - 0:30  (frames 336-901)
 * Scene 2 - The Tool:     0:30 - 0:47  (frames 902-1409)
 * Scene 3 - The Data:     0:47 - 1:02  (frames 1410-1866)
 * Scene 4 - The Math:     1:02 - 1:19  (frames 1867-2382)
 * Scene 5 - The Route:    1:19 - 1:43  (frames 2383-3114)
 * Scene 6 - The Query:    1:43 - 1:55  (frames 3115-3468)
 * Scene 7 - DevRel Close: 1:55 - 2:10  (frames 3469-3930)
 *
 * Total: 3930 frames = 2:11
 */

export const NationalParksVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0F172A" }}>
      {/* Scenes -- ~0.5s buffer after each narration ends */}
      <Sequence from={0} durationInFrames={336}>
        <Scene0_Intro />
      </Sequence>

      <Sequence from={336} durationInFrames={566}>
        <Scene1_Hook />
      </Sequence>

      <Sequence from={902} durationInFrames={508}>
        <Scene2_Tool />
      </Sequence>

      <Sequence from={1410} durationInFrames={457}>
        <Scene3_Data />
      </Sequence>

      <Sequence from={1867} durationInFrames={516}>
        <Scene4_Math />
      </Sequence>

      <Sequence from={2383} durationInFrames={732}>
        <Scene5_Route />
      </Sequence>

      <Sequence from={3115} durationInFrames={354}>
        <Scene6_Query />
      </Sequence>

      <Sequence from={3469} durationInFrames={462}>
        <Scene7_Close />
      </Sequence>

      {/* Narration audio -- same boundaries as scenes */}
      <Sequence from={0} durationInFrames={336}>
        <Audio src={staticFile("narration/scene0_intro.wav")} />
      </Sequence>
      <Sequence from={336} durationInFrames={566}>
        <Audio src={staticFile("narration/scene1_hook.wav")} />
      </Sequence>
      <Sequence from={902} durationInFrames={508}>
        <Audio src={staticFile("narration/scene2_tool.wav")} />
      </Sequence>
      <Sequence from={1410} durationInFrames={457}>
        <Audio src={staticFile("narration/scene3_data.wav")} />
      </Sequence>
      <Sequence from={1867} durationInFrames={516}>
        <Audio src={staticFile("narration/scene4_math.wav")} />
      </Sequence>
      <Sequence from={2383} durationInFrames={732}>
        <Audio src={staticFile("narration/scene5_route.wav")} />
      </Sequence>
      <Sequence from={3115} durationInFrames={354}>
        <Audio src={staticFile("narration/scene6_query.wav")} />
      </Sequence>
      <Sequence from={3469} durationInFrames={462}>
        <Audio src={staticFile("narration/scene7_close.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
