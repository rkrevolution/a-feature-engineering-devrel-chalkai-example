import { Composition } from "remotion";
import { NationalParksVideo } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NationalParksVideo"
        component={NationalParksVideo}
        durationInFrames={3931} // ~2:11 at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
