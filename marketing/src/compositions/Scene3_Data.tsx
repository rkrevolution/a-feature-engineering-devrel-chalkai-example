import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { SubtitleSequence } from "../components/NarrationSubtitle";

const ACTIVITIES = [
  { name: "Astronomy", match: false },
  { name: "Camping", match: false },
  { name: "Fishing", match: true },
  { name: "Hiking", match: false },
  { name: "Kayaking", match: true },
  { name: "Rock Climbing", match: false },
  { name: "Stargazing", match: false },
  { name: "Swimming", match: true },
  { name: "Wildlife Watching", match: false },
];

export const Scene3_Data: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: "What did I add?" (0-200) -- enrich step
  // Phase 2: "Which parks have fishing?" (200-550) -- filter step

  const phase1Op = interpolate(frame, [0, 20, 180, 220], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Op = interpolate(frame, [230, 270], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightProgress = interpolate(frame, [400, 460], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const resultSpring = spring({ frame: frame - 490, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#1A1A2E", "#0F172A"]} />

      {/* ====== PHASE 1: Enrich ====== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase1Op,
          zIndex: phase1Op > 0.1 ? 5 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #3B82F6, #8B5CF6)", borderRadius: 2 }} />
          <span style={{ color: "#3B82F6", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>
            Step 1
          </span>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #8B5CF6, #3B82F6)", borderRadius: 2 }} />
        </div>

        <div style={{ fontSize: 48, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, color: "#F8FAFC", textAlign: "center", marginBottom: 40 }}>
          What data do I need?
        </div>

        {/* Three new fields added */}
        <div style={{ display: "flex", gap: 30 }}>
          {[
            { field: "activities: list[str]", desc: "What can you do at this park?", color: "#3B82F6", delay: 50 },
            { field: "lat_long: str", desc: "Where is this park?", color: "#8B5CF6", delay: 90 },
            { field: "has_fishing: bool", desc: "Can you fish here?", color: "#10B981", delay: 130 },
          ].map((item, i) => {
            const s = spring({ frame: frame - item.delay, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  background: "rgba(30, 41, 59, 0.7)",
                  border: `1px solid ${item.color}30`,
                  borderRadius: 14,
                  padding: "24px 32px",
                  width: 320,
                  transform: `scale(${s})`,
                  opacity: s,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: item.color, marginBottom: 8 }}>
                  {item.field}
                </div>
                <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 18, color: "#94A3B8" }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== PHASE 2: Filter ====== */}
      <div style={{ position: "absolute", inset: 0, opacity: phase2Op }}>
        {/* Section question */}
        <div style={{ position: "absolute", top: 50, left: 120 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #10B981, #3B82F6)", borderRadius: 2 }} />
            <span style={{ color: "#10B981", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>
              Step 2
            </span>
          </div>
          <div style={{ fontSize: 36, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, color: "#F8FAFC", marginTop: 12 }}>
            Which parks have fishing?
          </div>
        </div>

        {/* JSON panel */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 160,
            opacity: interpolate(frame, [220, 250], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateX(${interpolate(frame, [220, 250], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}
        >
          <div style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid #334155", borderRadius: 12, padding: 24, backdropFilter: "blur(8px)" }}>
            <div style={{ color: "#64748B", fontSize: 11, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
              API Response
            </div>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
              {`{
  `}<span style={{ color: "#FBBF24" }}>"parkCode"</span>{`: "yose",
  `}<span style={{ color: "#FBBF24" }}>"name"</span>{`: "Yosemite",
  `}<span style={{ color: "#FBBF24" }}>"activities"</span>{`: [
    "Astronomy",
    `}<span style={{ color: "#10B981", fontWeight: 600 }}>"Fishing"</span>{`,
    "Hiking", ...
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ position: "absolute", left: 570, top: 370, opacity: interpolate(frame, [260, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <svg width={100} height={40}>
            <defs>
              <linearGradient id="tfArr3" x1="0%" y1="0%" x2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <line x1={0} y1={20} x2={70} y2={20} stroke="url(#tfArr3)" strokeWidth={2} />
            <polygon points="70,12 90,20 70,28" fill="#10B981" />
          </svg>
        </div>

        {/* Activity pills */}
        <div style={{ position: "absolute", right: 80, top: 160, width: 650 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {ACTIVITIES.map((act, i) => {
              const pillStart = 290 + i * 10;
              const pillSpring = spring({ frame: frame - pillStart, fps, config: { damping: 14, stiffness: 150 } });
              const scale = interpolate(pillSpring, [0, 1], [0.7, 1]);
              const opacity = interpolate(pillSpring, [0, 1], [0, 1]);

              const isMatch = act.match;
              const bgColor = isMatch
                ? `rgba(16, 185, 129, ${0.08 + highlightProgress * 0.25})`
                : `rgba(51, 65, 85, ${0.5 - highlightProgress * 0.3})`;
              const borderColor = isMatch
                ? `rgba(16, 185, 129, ${0.2 + highlightProgress * 0.5})`
                : `rgba(51, 65, 85, ${0.3 - highlightProgress * 0.2})`;
              const textColor = isMatch
                ? `rgba(16, 185, 129, ${0.6 + highlightProgress * 0.4})`
                : `rgba(148, 163, 184, ${1 - highlightProgress * 0.5})`;
              const glowShadow = isMatch && highlightProgress > 0.5
                ? `0 0 20px rgba(16, 185, 129, ${highlightProgress * 0.3})` : "none";

              return (
                <div
                  key={act.name}
                  style={{
                    background: bgColor, border: `1px solid ${borderColor}`, color: textColor,
                    padding: "10px 22px", borderRadius: 10, fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 18, fontWeight: isMatch ? 600 : 400, opacity,
                    transform: `scale(${scale * (isMatch ? 1 + highlightProgress * 0.08 : 1)})`,
                    boxShadow: glowShadow, backdropFilter: "blur(4px)",
                  }}
                >
                  {act.name}
                </div>
              );
            })}
          </div>

          {/* Result */}
          <div style={{ display: "flex", gap: 16, marginTop: 40, transform: `scale(${resultSpring})`, opacity: resultSpring }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 10, padding: "12px 24px", boxShadow: "0 0 30px rgba(16, 185, 129, 0.1)" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#10B981" }}>
                has_fishing: <strong>true</strong>
              </span>
            </div>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 10, padding: "12px 24px", boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#3B82F6" }}>
                has_water: <strong>true</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <SubtitleSequence
        phrases={[
          { text: "The starter only had names and descriptions. I added activities and GPS.", start: 20, end: 180 },
          { text: "Which parks offer fishing? Boolean filters on the activity list.", start: 250, end: 420 },
          { text: "Fishing, Kayaking, Swimming light up. The rest drop out.", start: 420, end: 490 },
        ]}
      />
    </AbsoluteFill>
  );
};
