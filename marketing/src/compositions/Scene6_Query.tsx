import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TerminalTyping } from "../components/TerminalTyping";
import { SubtitleSequence } from "../components/NarrationSubtitle";

export const Scene6_Query: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "One query" text punch
  const punchSpring = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const punchOp = interpolate(frame, [0, 15, 60, 80], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Terminal appears
  const termOp = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const termScale = interpolate(frame, [70, 100], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Result glow pulse
  const resultGlow = frame > 220 ? Math.sin((frame - 220) * 0.08) * 0.3 + 0.7 : 0;

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#0F172A", "#0F172A"]} particleCount={15} />

      {/* "One query" text flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: punchOp,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            background: "linear-gradient(135deg, #3B82F6, #10B981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: `scale(${punchSpring})`,
            display: "inline-block",
          }}
        >
          One query.
        </span>
      </div>

      {/* Terminal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: termOp,
          transform: `scale(${termScale})`,
        }}
      >
        <div style={{ position: "relative" }}>
          {/* Glow behind terminal */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: 24,
              background: `rgba(16, 185, 129, ${resultGlow * 0.05})`,
              boxShadow: `0 0 ${resultGlow * 80}px rgba(16, 185, 129, ${resultGlow * 0.15})`,
              zIndex: -1,
            }}
          />
          <TerminalTyping
            startFrame={100}
            charsPerFrame={1.5}
            lines={[
              { text: "$ chalk query \\", delay: 0, color: "#E6EDF3" },
              { text: "    --in park.id=yose \\", delay: 5, color: "#E6EDF3" },
              { text: "    --out park.name \\", delay: 5, color: "#E6EDF3" },
              { text: "    --out park.road_trip_hours_from_here", delay: 5, color: "#E6EDF3" },
              { text: "", delay: 30 },
              { text: '  park.name                        "Yosemite"', delay: 20, color: "#94A3B8" },
              { text: "  park.road_trip_hours_from_here    36.0", delay: 8, color: "#10B981" },
            ]}
          />
        </div>
      </div>

      <SubtitleSequence
        phrases={[
          { text: "All of this \u2014 one Chalk query.", start: 10, end: 80 },
          { text: "36 hours from Yosemite.", start: 200, end: 270 },
        ]}
      />
    </AbsoluteFill>
  );
};
