import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { SubtitleSequence } from "../components/NarrationSubtitle";
import { CA_PARKS, latLonToXY, type ParkData } from "../data/parks";

// Pre-computed nearest-neighbor routes
const YOSEMITE_IDS = [
  "yose", "depo", "seki", "manz", "deva", "jotr", "cabr", "cabrillo",
  "samo", "chis", "cech", "pinn", "alca", "sfba", "fopo", "goga",
  "muwo", "euon", "jomu", "rori", "paci", "pore", "redw", "labe",
  "tuin", "lavo", "whis", "cali",
];

const ALCATRAZ_IDS = [
  "alca", "sfba", "fopo", "goga", "muwo", "pore", "euon", "jomu",
  "rori", "paci", "redw", "labe", "tuin", "lavo", "whis", "cali",
  "yose", "depo", "seki", "manz", "deva", "jotr", "cabr", "cabrillo",
  "samo", "chis", "cech", "pinn",
];

function getParks(ids: string[]): ParkData[] {
  return ids.map((id) => CA_PARKS.find((p) => p.id === id)).filter((p): p is ParkData => !!p);
}

function MiniRoute({
  parks,
  label,
  hours,
  hoursColor,
  accentColor,
  startFrame,
  width,
  height,
}: {
  parks: ParkData[];
  label: string;
  hours: number;
  hoursColor: string;
  accentColor: string;
  startFrame: number;
  width: number;
  height: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fPerSeg = 10;

  // How many segments are visible
  const visibleSegs = Math.max(0, Math.floor((frame - startFrame) / fPerSeg));

  // Hours counter
  const hoursProgress = interpolate(
    frame,
    [startFrame, startFrame + parks.length * fPerSeg],
    [0, hours],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Label */}
      <div style={{ color: accentColor, fontSize: 16, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600, marginBottom: 16 }}>
        Starting: {label}
      </div>

      <div style={{ background: "rgba(30, 41, 59, 0.4)", borderRadius: 16, padding: 16, border: `1px solid ${accentColor}20`, backdropFilter: "blur(4px)" }}>
        <svg width={width} height={height}>
          {/* Faint park dots */}
          {parks.map((p) => {
            const { x, y } = latLonToXY(p.lat, p.lon, width, height, 20);
            return <circle key={p.id} cx={x} cy={y} r={2.5} fill="#334155" />;
          })}

          {/* Route segments */}
          {parks.slice(0, -1).map((park, i) => {
            if (i >= visibleSegs) return null;
            const next = parks[i + 1];
            const from = latLonToXY(park.lat, park.lon, width, height, 20);
            const to = latLonToXY(next.lat, next.lon, width, height, 20);
            return (
              <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={accentColor} strokeWidth={2} opacity={0.7} />
            );
          })}

          {/* Visited dots (glow) */}
          {parks.slice(0, visibleSegs + 1).map((p, i) => {
            const { x, y } = latLonToXY(p.lat, p.lon, width, height, 20);
            return (
              <g key={`v-${p.id}`}>
                <circle cx={x} cy={y} r={8} fill={accentColor} opacity={0.15} />
                <circle cx={x} cy={y} r={4} fill={accentColor} />
              </g>
            );
          })}

          {/* Starting dot (pulse) */}
          {(() => {
            const start = parks[0];
            const { x, y } = latLonToXY(start.lat, start.lon, width, height, 20);
            return (
              <g>
                <circle cx={x} cy={y} r={10} fill={accentColor} opacity={0.2} />
                <circle cx={x} cy={y} r={6} fill={accentColor} />
                <circle cx={x} cy={y} r={3} fill="#F8FAFC" />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Hours display */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span style={{ fontSize: 52, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, color: hoursColor }}>
          {hoursProgress.toFixed(1)}
        </span>
        <span style={{ fontSize: 28, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 400, color: "#94A3B8", marginLeft: 8 }}>
          hours
        </span>
      </div>
    </div>
  );
}

export const Scene5_Route: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame: frame - 530, fps, config: { damping: 10, stiffness: 120 } });

  const yoseParks = getParks(YOSEMITE_IDS);
  const alcaParks = getParks(ALCATRAZ_IDS);

  return (
    <AbsoluteFill>
      <Background gradient={["#0F172A", "#0C1A0F", "#0F172A"]} particleCount={25} />

      {/* Section label */}
      <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #10B981, #3B82F6)", borderRadius: 2 }} />
          <span style={{ color: "#10B981", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>
            Step 4
          </span>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #3B82F6, #10B981)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 30, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, color: "#F8FAFC" }}>
          What's the fastest route?
        </div>
      </div>

      {/* Two routes side by side */}
      <div style={{ display: "flex", justifyContent: "center", gap: 60, paddingTop: 70 }}>
        <MiniRoute parks={yoseParks} label="Yosemite" hours={36.0} hoursColor="#10B981" accentColor="#10B981" startFrame={40} width={620} height={580} />
        <MiniRoute parks={alcaParks} label="Alcatraz" hours={39.3} hoursColor="#F59E0B" accentColor="#F59E0B" startFrame={40} width={620} height={580} />
      </div>

      {/* Savings badge -- the payoff */}
      <div
        style={{
          position: "absolute",
          bottom: 75,
          left: "50%",
          transform: `translateX(-50%) scale(${badgeSpring})`,
          opacity: badgeSpring,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
            border: "2px solid rgba(16, 185, 129, 0.6)",
            borderRadius: 16,
            padding: "20px 50px",
            boxShadow: "0 0 60px rgba(16, 185, 129, 0.2), 0 0 120px rgba(16, 185, 129, 0.08)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#10B981", fontSize: 42, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, lineHeight: 1 }}>
            3.3 hours saved
          </div>
          <div style={{ color: "#94A3B8", fontSize: 20, fontFamily: "Inter, system-ui, sans-serif", marginTop: 8 }}>
            That's mileage, billable time, and expenses a manager can plan around.
          </div>
        </div>
      </div>

      <SubtitleSequence
        phrases={[
          { text: "Start at one park. Always drive to the nearest unvisited one. Repeat.", start: 20, end: 200 },
          { text: "Where you start changes the total. Yosemite is more central.", start: 340, end: 510 },
          { text: "That 3-hour gap is real budget when you're planning annual comp.", start: 540, end: 700 },
        ]}
      />
    </AbsoluteFill>
  );
};
