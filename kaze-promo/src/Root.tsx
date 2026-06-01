import "./index.css";
import { Composition } from "remotion";
import { KazePromo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composición Horizontal (1920x1080) - Ideal para Web y YouTube */}
      <Composition
        id="KazePromoHorizontal"
        component={KazePromo}
        durationInFrames={900} // 30 segundos a 30 FPS
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          layout: "horizontal" as const,
        }}
      />
      {/* Composición Vertical (1080x1920) - Ideal para Shorts, Reels y TikTok */}
      <Composition
        id="KazePromoVertical"
        component={KazePromo}
        durationInFrames={900} // 30 segundos a 30 FPS
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          layout: "vertical" as const,
        }}
      />
    </>
  );
};
