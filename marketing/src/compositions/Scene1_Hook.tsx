import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, GlowLine } from "../components/Background";
import { SubtitleSequence } from "../components/NarrationSubtitle";

export const Scene1_Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleSpring = spring({ frame: frame - 15, fps, config: { damping: 15 } });
  const titleX = interpolate(titleSpring, [0, 1], [-400, 0]);
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);

  // Context line
  const ctxSpring = spring({ frame: frame - 50, fps, config: { damping: 15 } });
  const ctxOp = interpolate(ctxSpring, [0, 1], [0, 1]);
  const ctxY = interpolate(ctxSpring, [0, 1], [20, 0]);

  // "Before" vs "After" labels
  const beforeOp = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const afterOp = interpolate(frame, [240, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Question mark
  const qSpring = spring({ frame: frame - 350, fps, config: { damping: 8, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#1E1B4B", "#0F172A"]} />
      <GlowLine color="#3B82F6" y={440} startFrame={100} />

      {/* Framing label */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 100,
          transform: `translateX(${titleX}px)`,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            color: "#3B82F6",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 20,
          }}
        >
          Feature Engineering with Chalk
        </div>
        <div
          style={{
            fontSize: 58,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            color: "#F8FAFC",
            lineHeight: 1.15,
            maxWidth: 850,
          }}
        >
          Your sales rep visits 28 parks.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How many hours on the road?
          </span>
        </div>
      </div>

      {/* Context */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 310,
          opacity: ctxOp,
          transform: `translateY(${ctxY}px)`,
          maxWidth: 600,
        }}
      >
        <div style={{ fontSize: 20, fontFamily: "Inter, system-ui, sans-serif", color: "#94A3B8", lineHeight: 1.6 }}>
          A company sells fishing gear to national parks. Management needs to forecast
          travel time per state to budget mileage and expenses.
        </div>
      </div>

      {/* Before / After cards */}
      <div style={{ position: "absolute", bottom: 150, left: 120, display: "flex", gap: 40 }}>
        {/* Before */}
        <div
          style={{
            opacity: beforeOp,
            background: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 14,
            padding: "24px 36px",
            backdropFilter: "blur(8px)",
            width: 380,
          }}
        >
          <div style={{ fontSize: 13, fontFamily: "Inter, system-ui, sans-serif", color: "#EF4444", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600, marginBottom: 10 }}>
            I was given
          </div>
          <div style={{ fontSize: 18, fontFamily: "Inter, system-ui, sans-serif", color: "#94A3B8", lineHeight: 1.6 }}>
            1 model, 1 resolver
            <br />
            Fetches park names from an API
          </div>
        </div>

        {/* After */}
        <div
          style={{
            opacity: afterOp,
            background: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 14,
            padding: "24px 36px",
            backdropFilter: "blur(8px)",
            width: 380,
          }}
        >
          <div style={{ fontSize: 13, fontFamily: "Inter, system-ui, sans-serif", color: "#10B981", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600, marginBottom: 10 }}>
            I built
          </div>
          <div style={{ fontSize: 18, fontFamily: "Inter, system-ui, sans-serif", color: "#F8FAFC", lineHeight: 1.6 }}>
            3 models, 10 resolvers
            <br />
            Activity filters, distance calc, route optimization
          </div>
        </div>

        {/* Question card */}
        <div
          style={{
            opacity: interpolate(qSpring, [0, 1], [0, 1]),
            transform: `scale(${qSpring})`,
            background: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: 14,
            padding: "24px 36px",
            backdropFilter: "blur(8px)",
            width: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 48, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, color: "#3B82F6" }}>
            ?
          </div>
          <div style={{ fontSize: 16, fontFamily: "Inter, system-ui, sans-serif", color: "#94A3B8", marginTop: 4 }}>
            hours on the road
          </div>
        </div>
      </div>

      <SubtitleSequence
        phrases={[
          { text: "Given a starter Chalk project -- 1 model, 1 resolver.", start: 30, end: 160 },
          { text: "I extended it into a full travel forecasting pipeline.", start: 180, end: 330 },
          { text: "The question: how many hours will the rep be driving?", start: 350, end: 420 },
        ]}
      />
    </AbsoluteFill>
  );
};
