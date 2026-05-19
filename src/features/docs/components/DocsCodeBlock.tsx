import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function DocsCodeBlock({
  title,
  code,
  language = 'bash',
}: {
  title?: string;
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border-subtle bg-bg-tertiary">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <span className="text-[12px] font-medium text-text-tertiary">
          {title ?? language}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-primary"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-text-secondary">
        <code>{code}</code>
      </pre>
    </div>
  );
}
