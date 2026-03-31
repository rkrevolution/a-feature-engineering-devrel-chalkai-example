import { interpolate, useCurrentFrame } from "remotion";

export const AnimatedNumber: React.FC<{
  target: number;
  startFrame: number;
  duration: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  fontSize?: number;
  decimals?: number;
}> = ({
  target,
  startFrame,
  duration,
  suffix = "",
  prefix = "",
  color = "#F8FAFC",
  fontSize = 48,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, target],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <span
      style={{
        color,
        fontSize,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};
