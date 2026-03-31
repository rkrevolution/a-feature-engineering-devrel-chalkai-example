import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Token-based syntax coloring for Python code
interface Token {
  text: string;
  color: string;
}

const KEYWORDS = new Set([
  "class", "def", "return", "import", "from", "if", "for", "in",
  "any", "True", "False", "None",
]);

const TYPES = new Set(["str", "bool", "int", "float"]);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comments
    if (line[i] === "#") {
      tokens.push({ text: line.slice(i), color: "#64748B" });
      break;
    }

    // Decorators
    if (line[i] === "@") {
      let end = i + 1;
      while (end < line.length && /\w/.test(line[end])) end++;
      tokens.push({ text: line.slice(i, end), color: "#C084FC" });
      i = end;
      continue;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let end = i + 1;
      while (end < line.length && line[end] !== quote) end++;
      end++; // include closing quote
      tokens.push({ text: line.slice(i, end), color: "#FBBF24" });
      i = end;
      continue;
    }

    // Words (keywords, types, identifiers)
    if (/[a-zA-Z_]/.test(line[i])) {
      let end = i;
      while (end < line.length && /[\w\[\]]/.test(line[end])) end++;
      const word = line.slice(i, end);

      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, color: "#3B82F6" });
      } else if (TYPES.has(word) || word === "list[str]") {
        tokens.push({ text: word, color: "#10B981" });
      } else {
        tokens.push({ text: word, color: "#E2E8F0" });
      }
      i = end;
      continue;
    }

    // Operators and punctuation
    tokens.push({ text: line[i], color: "#94A3B8" });
    i++;
  }

  return tokens;
}

function colorize(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx}>&nbsp;</div>;
    }

    const tokens = tokenizeLine(line);
    return (
      <div key={lineIdx}>
        {tokens.map((token, tokenIdx) => (
          <span key={tokenIdx} style={{ color: token.color }}>
            {token.text}
          </span>
        ))}
      </div>
    );
  });
}

export const CodeBlock: React.FC<{
  code: string;
  startFrame: number;
  width?: number;
}> = ({ code, startFrame, width = 800 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const translateX = interpolate(slideIn, [0, 1], [200, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 12,
        padding: 24,
        width,
        transform: `translateX(${translateX}px)`,
        opacity,
        border: "1px solid #334155",
      }}
    >
      <pre
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 18,
          lineHeight: 1.6,
          color: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        {colorize(code)}
      </pre>
    </div>
  );
};
