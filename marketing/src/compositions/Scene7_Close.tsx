import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { SubtitleSequence } from "../components/NarrationSubtitle";

// The DevRel output: one project → multiple deliverables
const DELIVERABLES = [
  {
    label: "The Code",
    desc: "3 models, 10 resolvers, deployed on Chalk",
    icon: "{ }",
    color: "#3B82F6",
    delay: 20,
  },
  {
    label: "The Blog Post",
    desc: "Technical walkthrough on robkleiman.net",
    icon: "Aa",
    color: "#8B5CF6",
    delay: 50,
  },
  {
    label: "This Video",
    desc: "Built with Remotion + Groq TTS",
    icon: "\u25B6",
    color: "#10B981",
    delay: 80,
  },
  {
    label: "Distribution Plan",
    desc: "Blog, YouTube, Twitter thread, docs integration",
    icon: "\u2192",
    color: "#F59E0B",
    delay: 110,
  },
];

export const Scene7_Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "One project" header
  const headerSpring = spring({ frame: frame - 5, fps, config: { damping: 14 } });

  // Name card appears after deliverables
  const nameOp = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = interpolate(frame, [200, 230], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#1E1B4B", "#0F172A"]} particleCount={30} />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: `translateX(-50%) scale(${headerSpring})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 20, fontFamily: "Inter, system-ui, sans-serif", color: "#94A3B8", marginBottom: 8 }}>
          One project. Four deliverables.
        </div>
        <div
          style={{
            fontSize: 40,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #10B981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Build it. Write it. Ship it.
        </div>
      </div>

      {/* Deliverable cards */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 24,
        }}
      >
        {DELIVERABLES.map((d, i) => {
          const s = spring({ frame: frame - d.delay, fps, config: { damping: 12, stiffness: 120 } });
          return (
            <div
              key={i}
              style={{
                width: 280,
                transform: `scale(${s})`,
                opacity: s,
                background: `${d.color}08`,
                border: `1px solid ${d.color}35`,
                borderRadius: 14,
                padding: "24px 20px",
                backdropFilter: "blur(8px)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: d.color,
                  marginBottom: 12,
                  opacity: 0.8,
                }}
              >
                {d.icon}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  color: "#F8FAFC",
                  marginBottom: 8,
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: "#94A3B8",
                  lineHeight: 1.4,
                }}
              >
                {d.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gradient divider */}
      <div
        style={{
          position: "absolute",
          top: 460,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [160, 190], [0, 600], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 1,
          background: "linear-gradient(90deg, transparent, #334155, transparent)",
        }}
      />

      {/* Name + links */}
      <div
        style={{
          position: "absolute",
          top: 490,
          left: "50%",
          transform: `translateX(-50%) translateY(${nameY}px)`,
          opacity: nameOp,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 36, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, color: "#F8FAFC" }}>
          Rob Kleiman
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "GitHub", sub: "rkrevolution", color: "#3B82F6" },
            { label: "Blog", sub: "robkleiman.net", color: "#8B5CF6" },
          ].map((link, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontFamily: "Inter, system-ui, sans-serif", color: "#64748B", background: "#1E293B", padding: "3px 8px", borderRadius: 4 }}>
                {link.label}
              </span>
              <span style={{ fontSize: 18, fontFamily: "Inter, system-ui, sans-serif", color: link.color }}>
                {link.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SubtitleSequence
        phrases={[
          { text: "One take-home project. Blog post, video, repo, and a distribution plan.", start: 10, end: 170 },
          { text: "Build it. Write it. Ship it. That's how I'd do DevRel.", start: 200, end: 360 },
        ]}
      />
    </AbsoluteFill>
  );
};
