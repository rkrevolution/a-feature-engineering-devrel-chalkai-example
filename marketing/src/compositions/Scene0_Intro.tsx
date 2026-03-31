import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";

export const Scene0_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Avatar + name
  const avatarSpring = spring({ frame: frame - 5, fps, config: { damping: 14 } });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0.8, 1]);
  const avatarOp = interpolate(avatarSpring, [0, 1], [0, 1]);

  // "DevRel Case Study" label
  const labelOp = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Three pillars
  const pillars = [
    { text: "Build it", color: "#3B82F6", delay: 80 },
    { text: "Write it", color: "#8B5CF6", delay: 110 },
    { text: "Ship it", color: "#10B981", delay: 140 },
  ];

  // "Here's how" line
  const howOp = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const howY = interpolate(frame, [200, 230], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#1E1B4B", "#0F172A"]} particleCount={20} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        {/* Avatar + Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: avatarOp,
            transform: `scale(${avatarScale})`,
          }}
        >
          <Img
            src={staticFile("avatar.jpg")}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 28,
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                color: "#F8FAFC",
              }}
            >
              Rob Kleiman
            </div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "Inter, system-ui, sans-serif",
                color: "#64748B",
              }}
            >
              DevRel Case Study
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: interpolate(frame, [50, 80], [0, 200], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 1,
            background: "linear-gradient(90deg, transparent, #334155, transparent)",
          }}
        />

        {/* Three pillars */}
        <div style={{ display: "flex", gap: 30 }}>
          {pillars.map((pillar, i) => {
            const s = spring({
              frame: frame - pillar.delay,
              fps,
              config: { damping: 10, stiffness: 120 },
            });
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${s})`,
                  opacity: s,
                  background: `${pillar.color}15`,
                  border: `2px solid ${pillar.color}50`,
                  borderRadius: 14,
                  padding: "18px 40px",
                  backdropFilter: "blur(8px)",
                  boxShadow: `0 0 30px ${pillar.color}15`,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontWeight: 700,
                    color: pillar.color,
                  }}
                >
                  {pillar.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gradient connector */}
        <div
          style={{
            width: interpolate(frame, [170, 200], [0, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: 2,
            background: "linear-gradient(90deg, #3B82F6, #8B5CF6, #10B981)",
            borderRadius: 1,
          }}
        />

        {/* "Here's how I did all three." */}
        <div
          style={{
            opacity: howOp,
            transform: `translateY(${howY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Here's how I did all three.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
