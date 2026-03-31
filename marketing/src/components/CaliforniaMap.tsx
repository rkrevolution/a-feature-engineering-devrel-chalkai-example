import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CA_PARKS, latLonToXY, type ParkData } from "../data/parks";

// Simplified California outline as SVG path (approximate)
const CA_OUTLINE =
  "M 180 80 L 160 120 L 150 180 L 140 250 L 135 320 L 120 380 L 100 440 L 80 500 L 70 560 L 65 620 L 70 680 L 90 740 L 120 790 L 160 830 L 210 860 L 260 870 L 310 860 L 350 830 L 370 790 L 380 750 L 370 700 L 340 650 L 310 580 L 290 500 L 280 420 L 290 340 L 310 270 L 330 200 L 340 140 L 320 100 L 280 80 L 230 70 Z";

interface MapProps {
  width?: number;
  height?: number;
  showPins?: boolean;
  pinStaggerDelay?: number;
  startFrame?: number;
  routes?: { from: ParkData; to: ParkData }[];
  routeStartFrame?: number;
  routeFramesPerSegment?: number;
  highlightFishing?: boolean;
}

export const CaliforniaMap: React.FC<MapProps> = ({
  width = 600,
  height = 900,
  showPins = true,
  pinStaggerDelay = 6,
  startFrame = 0,
  routes = [],
  routeStartFrame = 0,
  routeFramesPerSegment = 14,
  highlightFishing = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scale the outline to fit
  const scaleX = width / 460;
  const scaleY = height / 940;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* State outline */}
      <g transform={`scale(${scaleX}, ${scaleY})`}>
        <path
          d={CA_OUTLINE}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      </g>

      {/* Route lines */}
      {routes.map((route, i) => {
        const from = latLonToXY(route.from.lat, route.from.lon, width, height, 40);
        const to = latLonToXY(route.to.lat, route.to.lon, width, height, 40);
        const segStart = routeStartFrame + i * routeFramesPerSegment;
        const progress = interpolate(
          frame,
          [segStart, segStart + routeFramesPerSegment],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const currentX = from.x + (to.x - from.x) * progress;
        const currentY = from.y + (to.y - from.y) * progress;

        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={currentX}
            y2={currentY}
            stroke="#10B981"
            strokeWidth={2}
            opacity={progress > 0 ? 0.7 : 0}
          />
        );
      })}

      {/* Park pins */}
      {showPins &&
        CA_PARKS.map((park, i) => {
          const { x, y } = latLonToXY(park.lat, park.lon, width, height, 40);
          const pinDelay = startFrame + 30 + i * pinStaggerDelay;
          const drop = spring({
            frame: frame - pinDelay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          const scale = interpolate(drop, [0, 1], [0, 1]);
          const pinColor =
            highlightFishing && park.hasFishing ? "#10B981" : "#3B82F6";

          return (
            <g key={park.id} transform={`translate(${x}, ${y}) scale(${scale})`}>
              <circle r={5} fill={pinColor} />
              <circle r={5} fill="none" stroke={pinColor} strokeWidth={1} opacity={0.4}>
                {scale >= 0.9 && (
                  <animate
                    attributeName="r"
                    from="5"
                    to="15"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </g>
          );
        })}
    </svg>
  );
};
