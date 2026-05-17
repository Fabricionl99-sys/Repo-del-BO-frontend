import { X } from 'lucide-react';
import { useState } from 'react';

import { validateEmail } from '../operatorConfigValidation';

export function EmailTagsInput({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | undefined>();

  const add = () => {
    const value = input.trim().toLowerCase();
    if (!value) return;
    const err = validateEmail(value);
    if (err) {
      setError(err);
      return;
    }
    if (emails.includes(value)) {
      setError('Email ya agregado');
      return;
    }
    onChange([...emails, value]);
    setInput('');
    setError(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-tertiary px-2 py-1 text-[13px]"
          >
            {email}
            <button type="button" aria-label={`quitar ${email}`} onClick={() => onChange(emails.filter((e) => e !== email))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="field flex-1"
          placeholder="agregar email..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="rounded-lg border border-border-subtle px-3 py-2 text-[14px]" onClick={add}>
          Agregar
        </button>
      </div>
      {error && <p className="text-[14px] text-danger">{error}</p>}
    </div>
  );
}
