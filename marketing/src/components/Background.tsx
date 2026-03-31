import { interpolate, useCurrentFrame } from "remotion";

// Animated gradient background with floating particles
export const Background: React.FC<{
  gradient?: [string, string, string];
  particleCount?: number;
}> = ({
  gradient = ["#0F172A", "#1E1B4B", "#0F172A"],
  particleCount = 40,
}) => {
  const frame = useCurrentFrame();

  // Slow gradient shift
  const gradAngle = interpolate(frame, [0, 900], [135, 180]);

  // Generate deterministic particles
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const seed = i * 137.508; // golden angle
    const baseX = (seed * 7.3) % 1920;
    const baseY = (seed * 13.7) % 1080;
    const size = 1 + (i % 3);
    const speed = 0.3 + (i % 5) * 0.15;
    const drift = Math.sin((frame * speed * 0.02) + seed) * 30;
    const floatY = Math.cos((frame * speed * 0.015) + seed * 0.5) * 20;
    const opacity = 0.03 + (i % 4) * 0.02;

    return { x: baseX + drift, y: baseY + floatY, size, opacity };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${gradAngle}deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          top: "20%",
          left: "30%",
          transform: `translate(${Math.sin(frame * 0.01) * 40}px, ${Math.cos(frame * 0.008) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          bottom: "10%",
          right: "20%",
          transform: `translate(${Math.cos(frame * 0.012) * 30}px, ${Math.sin(frame * 0.01) * 25}px)`,
        }}
      />

      {/* Floating particles */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.size} fill="#F8FAFC" opacity={p.opacity} />
        ))}
      </svg>

      {/* Grid lines for subtle tech feel */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.03 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 54} x2={1920} y2={i * 54} stroke="#F8FAFC" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={`v${i}`} x1={i * 64} y1={0} x2={i * 64} y2={1080} stroke="#F8FAFC" strokeWidth={0.5} />
        ))}
      </svg>
    </div>
  );
};

// Scene transition -- wipe from left
export const SceneTransition: React.FC<{
  direction?: "in" | "out";
  duration?: number;
}> = ({ direction = "in", duration = 20 }) => {
  const frame = useCurrentFrame();

  if (direction === "in") {
    const progress = interpolate(frame, [0, duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0F172A",
          clipPath: `inset(0 0 0 ${progress * 100}%)`,
          zIndex: 100,
        }}
      />
    );
  }

  return null;
};

// Glowing accent line
export const GlowLine: React.FC<{
  color?: string;
  y?: number;
  startFrame?: number;
}> = ({ color = "#3B82F6", y = 540, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [startFrame, startFrame + 30], [0, 1920], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 20px ${color}40, 0 0 60px ${color}20`,
      }}
    />
  );
};
