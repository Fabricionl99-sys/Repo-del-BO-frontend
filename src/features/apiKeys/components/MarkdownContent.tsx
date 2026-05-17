/** Renderizado liviano de markdown para quick start (sin dependencia extra). */
export function MarkdownContent({ source }: { source: string }) {
  const blocks = source.split(/\n\n+/);

  return (
    <div className="space-y-4 text-[13px] text-text-secondary">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('```')) {
          const code = trimmed.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[12px] text-text-primary"
            >
              <code>{code}</code>
            </pre>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={i} className="text-[18px] font-semibold text-text-primary">
              {trimmed.slice(2)}
            </h2>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="text-[15px] font-semibold text-text-primary">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('- ')) {
          return (
            <ul key={i} className="list-inside list-disc space-y-1">
              {trimmed.split('\n').map((line) => (
                <li key={line}>{line.replace(/^- /, '')}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {trimmed.split(/(`[^`]+`)/).map((part, j) =>
              part.startsWith('`') && part.endsWith('`') ? (
                <code key={j} className="rounded bg-bg-tertiary px-1 py-0.5 font-mono text-[12px] text-accent">
                  {part.slice(1, -1)}
                </code>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}
