import { interpolate, useCurrentFrame } from "remotion";

// Single subtitle block (legacy)
export const NarrationSubtitle: React.FC<{
  text: string;
  startFrame: number;
  endFrame: number;
}> = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 12, endFrame - 12, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (opacity < 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: "10%",
        right: "10%",
        textAlign: "center",
        opacity,
      }}
    >
      <SubtitleBox text={text} />
    </div>
  );
};

// Timed subtitle sequence -- shows short phrases one at a time
export const SubtitleSequence: React.FC<{
  phrases: { text: string; start: number; end: number }[];
}> = ({ phrases }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: "8%",
        right: "8%",
        textAlign: "center",
      }}
    >
      {phrases.map((phrase, i) => {
        const opacity = interpolate(
          frame,
          [phrase.start, phrase.start + 10, phrase.end - 10, phrase.end],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (opacity < 0.01) return null;

        return (
          <div key={i} style={{ opacity, position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <SubtitleBox text={phrase.text} />
          </div>
        );
      })}
    </div>
  );
};

function SubtitleBox({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.88)",
        borderRadius: 10,
        padding: "14px 28px",
        display: "inline-block",
        maxWidth: "85%",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(248, 250, 252, 0.06)",
      }}
    >
      <span
        style={{
          color: "#F8FAFC",
          fontSize: 22,
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
}
