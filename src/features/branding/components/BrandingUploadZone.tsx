import { ImagePlus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import type { UploadValidationResult } from '../brandingUploadValidation';

export function BrandingUploadZone({
  previewUrl,
  hint,
  accept,
  error,
  validate,
  onValidated,
  onClear,
  previewClassName,
}: {
  previewUrl: string | null;
  hint: string;
  accept: string;
  error?: string;
  validate: (file: File) => Promise<UploadValidationResult>;
  onValidated: (file: File, previewUrl: string) => void;
  onClear: () => void;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(undefined);
    const result = await validate(file);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    onValidated(file, result.previewUrl);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition',
          dragOver ? 'border-accent bg-accent/5' : 'border-border-default hover:border-accent/50',
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className={cn('mb-3 rounded-lg object-cover', previewClassName ?? 'h-24 w-24')}
          />
        ) : (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-text-tertiary">
            <ImagePlus size={22} />
          </div>
        )}
        <div className="flex items-center gap-2 text-[15px] text-text-secondary">
          <Upload size={14} />
          Arrastrá o hacé click para subir
        </div>
        <p className="mt-2 text-center text-[13px] text-text-tertiary">{hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {(error || localError) && <p className="mt-2 text-[14px] text-danger">{error || localError}</p>}
      {previewUrl && (
        <button type="button" className="mt-2 text-[14px] text-accent" onClick={onClear}>
          quitar imagen
        </button>
      )}
    </div>
  );
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
