import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, GlowLine } from "../components/Background";
import { CodeBlock } from "../components/CodeBlock";
import { SubtitleSequence } from "../components/NarrationSubtitle";

const FEATURES_CODE = `@features
class Park:
    id: str
    name: str
    activities: list[str]
    has_fishing: bool
    lat_long: str`;

const RESOLVER_CODE = `@online
def get_has_fishing(
    activities: Park.activities
) -> Park.has_fishing:
    return any(
        "fish" in a.lower()
        for a in activities
    )`;

export const Scene2_Tool: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: "What is Chalk?" title (0-120)
  // Phase 2: Two-panel code (120-500)
  // Phase 3: "Auto-wired" callout (500-600)

  const titleOp = interpolate(frame, [0, 20, 100, 130], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrowSpring = spring({ frame: frame - 380, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#172554", "#0F172A"]} />

      {/* Phase 1: Chalk intro */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: titleOp,
          zIndex: titleOp > 0.1 ? 5 : 0,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            color: "#F8FAFC",
            letterSpacing: -2,
          }}
        >
          chalk
        </div>
        <div
          style={{
            fontSize: 24,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#64748B",
            marginTop: 12,
          }}
        >
          Feature Engineering for ML and Real-Time Data
        </div>
      </div>

      {/* Phase 2: Code panels */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 80,
          alignItems: "flex-start",
          padding: "0 80px",
          opacity: interpolate(frame, [120, 150], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {/* Left: Define */}
        <div style={{ flex: 1, maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#3B82F6",
                boxShadow: "0 0 12px #3B82F640",
              }}
            />
            <span
              style={{
                color: "#3B82F6",
                fontSize: 14,
                fontFamily: "Inter, system-ui, sans-serif",
                textTransform: "uppercase",
                letterSpacing: 3,
                fontWeight: 600,
              }}
            >
              Step 1 &mdash; Define Features
            </span>
          </div>
          <CodeBlock code={FEATURES_CODE} startFrame={150} width={660} />
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 200,
            opacity: arrowSpring,
          }}
        >
          <svg width={100} height={60}>
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <line x1={0} y1={30} x2={70} y2={30} stroke="url(#arrowGrad)" strokeWidth={3} />
            <polygon points="70,18 95,30 70,42" fill="#10B981" />
          </svg>
        </div>

        {/* Right: Resolve */}
        <div style={{ flex: 1, maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 12px #10B98140",
              }}
            />
            <span
              style={{
                color: "#10B981",
                fontSize: 14,
                fontFamily: "Inter, system-ui, sans-serif",
                textTransform: "uppercase",
                letterSpacing: 3,
                fontWeight: 600,
              }}
            >
              Step 2 &mdash; Write Resolvers
            </span>
          </div>
          <CodeBlock code={RESOLVER_CODE} startFrame={260} width={660} />
        </div>
      </div>

      {/* "Auto-wired" callout */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: `translateX(-50%) scale(${interpolate(arrowSpring, [0, 1], [0.9, 1])})`,
          opacity: interpolate(frame, [420, 450], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 12,
            padding: "16px 40px",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 600,
              background: "linear-gradient(135deg, #3B82F6, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Chalk auto-wires features to resolvers. No glue code.
          </span>
        </div>
      </div>

      <GlowLine color="#8B5CF6" y={500} startFrame={380} />

      <SubtitleSequence
        phrases={[
          { text: "To answer that question, I need a way to turn raw API data into queryable features.", start: 10, end: 120 },
          { text: "That's what Chalk does. Define the feature. Write a resolver. Chalk handles the rest.", start: 160, end: 350 },
          { text: "One resolver's output feeds the next \u2014 no glue code, no orchestration.", start: 400, end: 520 },
        ]}
      />
    </AbsoluteFill>
  );
};
