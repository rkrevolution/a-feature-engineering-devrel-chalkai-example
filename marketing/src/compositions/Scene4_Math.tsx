import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, GlowLine } from "../components/Background";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { SubtitleSequence } from "../components/NarrationSubtitle";
import { CA_PARKS, latLonToXY } from "../data/parks";

export const Scene4_Math: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mapW = 700;
  const mapH = 800;

  // Count of visible pair lines
  const pairCount = Math.min(378, Math.max(0, Math.floor((frame - 280) * 3)));

  // Generate pair lines deterministically
  const pairLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < CA_PARKS.length && pairLines.length < pairCount; i++) {
    for (let j = i + 1; j < CA_PARKS.length && pairLines.length < pairCount; j++) {
      const from = latLonToXY(CA_PARKS[i].lat, CA_PARKS[i].lon, mapW, mapH, 40);
      const to = latLonToXY(CA_PARKS[j].lat, CA_PARKS[j].lon, mapW, mapH, 40);
      pairLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
    }
  }

  // Single highlighted pair (Yosemite <-> Alcatraz)
  const yose = latLonToXY(37.8651, -119.5383, mapW, mapH, 40);
  const alca = latLonToXY(37.8267, -122.4233, mapW, mapH, 40);
  const lineProgress = interpolate(frame, [40, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const distLabelSpring = spring({ frame: frame - 130, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#1E1B4B", "#0C0A1D"]} />

      {/* Section label */}
      <div style={{ position: "absolute", top: 40, left: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #8B5CF6, #3B82F6)", borderRadius: 2 }} />
          <span style={{ color: "#8B5CF6", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>
            Step 3
          </span>
        </div>
        <div style={{ fontSize: 32, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, color: "#F8FAFC" }}>
          How far apart are they?
        </div>
      </div>

      {/* Map area */}
      <div style={{ position: "absolute", left: 40, top: 80 }}>
        <svg width={mapW} height={mapH}>
          {/* All pair lines (phase 2) */}
          {pairLines.map((line, i) => (
            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#3B82F6" strokeWidth={0.4} opacity={0.1} />
          ))}

          {/* Highlighted pair line */}
          {frame < 280 && (
            <>
              <line
                x1={yose.x} y1={yose.y}
                x2={yose.x + (alca.x - yose.x) * lineProgress}
                y2={yose.y + (alca.y - yose.y) * lineProgress}
                stroke="#10B981" strokeWidth={3} strokeDasharray="8,5"
                filter="url(#glow)"
              />
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </>
          )}

          {/* Distance label */}
          {lineProgress > 0.9 && frame < 280 && (
            <g opacity={distLabelSpring}>
              <rect
                x={(yose.x + alca.x) / 2 - 55}
                y={(yose.y + alca.y) / 2 - 28}
                width={110} height={32} rx={6}
                fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth={1}
              />
              <text
                x={(yose.x + alca.x) / 2}
                y={(yose.y + alca.y) / 2 - 8}
                fill="#10B981" fontSize={16} fontFamily="Inter, system-ui, sans-serif" fontWeight={600} textAnchor="middle"
              >
                127.3 mi
              </text>
            </g>
          )}

          {/* Park dots */}
          {CA_PARKS.map((park) => {
            const { x, y } = latLonToXY(park.lat, park.lon, mapW, mapH, 40);
            const dotOp = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <circle key={park.id} cx={x} cy={y} r={4} fill="#3B82F6" opacity={dotOp} />;
          })}
        </svg>
      </div>

      {/* Right info panel */}
      <div style={{ position: "absolute", right: 80, top: 120, width: 580, display: "flex", flexDirection: "column", gap: 36 }}>
        {/* Haversine formula */}
        <div style={{ opacity: interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ color: "#64748B", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Haversine Formula
          </div>
          <div style={{ background: "rgba(30, 41, 59, 0.6)", borderRadius: 10, padding: "20px 24px", border: "1px solid #334155", backdropFilter: "blur(8px)" }}>
            <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#94A3B8", lineHeight: 1.7 }}>
              <span style={{ color: "#C084FC" }}>d</span> = 2<span style={{ color: "#3B82F6" }}>R</span> * arcsin(sqrt(
              {"\n"}  sin<sup>2</sup>(<span style={{ color: "#FBBF24" }}>dlat</span>/2) +
              {"\n"}  cos(<span style={{ color: "#FBBF24" }}>lat1</span>) * cos(<span style={{ color: "#FBBF24" }}>lat2</span>) *
              {"\n"}  sin<sup>2</sup>(<span style={{ color: "#FBBF24" }}>dlon</span>/2)
              {"\n"}))
            </pre>
          </div>
          <div style={{ color: "#64748B", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", marginTop: 8 }}>
            R = 3,959 miles (Earth's radius)
          </div>
        </div>

        {/* Pair counter */}
        <div style={{ opacity: interpolate(frame, [280, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ background: "rgba(30, 41, 59, 0.6)", borderRadius: 12, padding: "24px 32px", border: "1px solid rgba(59,130,246,0.2)", backdropFilter: "blur(8px)" }}>
            <AnimatedNumber target={378} startFrame={280} duration={200} fontSize={56} color="#3B82F6" />
            <div style={{ color: "#94A3B8", fontSize: 18, fontFamily: "Inter, system-ui, sans-serif", marginTop: 4 }}>
              unique pairs calculated
            </div>
          </div>
        </div>

        {/* Drive time card */}
        <div style={{ opacity: interpolate(frame, [400, 430], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ background: "rgba(16, 185, 129, 0.08)", borderRadius: 10, padding: "18px 28px", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 0 30px rgba(16,185,129,0.08)" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "#94A3B8" }}>
              127.3 mi <span style={{ color: "#64748B" }}>/</span> 50 mph <span style={{ color: "#64748B" }}>=</span>{" "}
              <span style={{ color: "#10B981", fontWeight: 700, fontSize: 26 }}>2.5 hrs</span>
            </span>
          </div>
        </div>
      </div>

      <GlowLine color="#8B5CF6" y={900} startFrame={280} />
      <SubtitleSequence
        phrases={[
          { text: "GPS coordinates in, straight-line distance out.", start: 40, end: 170 },
          { text: "Every pair of parks in the state. All 378 combinations.", start: 220, end: 380 },
          { text: "Divide by 50 mph and you've got estimated drive time.", start: 410, end: 520 },
        ]}
      />
    </AbsoluteFill>
  );
};
