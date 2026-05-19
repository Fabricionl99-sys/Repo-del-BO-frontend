export function DocsDiagram({ title, chart }: { title: string; chart: string }) {
  return (
    <figure className="my-6">
      <figcaption className="mb-2 text-[14px] font-semibold text-text-primary">{title}</figcaption>
      <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-4 text-[12px] leading-relaxed text-text-secondary">
        {chart}
      </pre>
    </figure>
  );
}
