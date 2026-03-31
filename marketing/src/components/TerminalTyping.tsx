import { useCurrentFrame } from "remotion";

export const TerminalTyping: React.FC<{
  lines: { text: string; delay: number; color?: string }[];
  startFrame: number;
  charsPerFrame?: number;
}> = ({ lines, startFrame, charsPerFrame = 1 }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  let currentCharBudget = elapsed * charsPerFrame;

  return (
    <div
      style={{
        background: "#0D1117",
        borderRadius: 12,
        padding: 0,
        width: 1200,
        border: "1px solid #30363D",
        overflow: "hidden",
      }}
    >
      {/* macOS title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#161B22",
          borderBottom: "1px solid #30363D",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
      </div>

      <div style={{ padding: 32 }}>
        {lines.map((line, i) => {
          // Subtract delay frames
          const lineStart = line.delay;
          if (currentCharBudget < lineStart) return null;

          const available = currentCharBudget - lineStart;
          const visibleChars = Math.min(Math.floor(available), line.text.length);
          const displayText = line.text.slice(0, visibleChars);
          const isTyping = visibleChars < line.text.length && visibleChars > 0;
          const showCursor = isTyping && Math.floor(frame / 8) % 2 === 0;

          // Reduce budget for next line
          currentCharBudget -= line.text.length + line.delay;

          return (
            <div
              key={i}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 22,
                color: line.color || "#E6EDF3",
                lineHeight: 1.8,
                minHeight: 39,
              }}
            >
              {displayText}
              {showCursor && (
                <span style={{ color: "#58A6FF" }}>|</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
