import { ImagePlus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import {
  AVATAR_MAX_DIMENSION,
  AVATAR_MAX_FILE_BYTES,
  AVATAR_MIN_DIMENSION,
  validateAvatarUpload,
} from '../avatarUploadValidation';

export function AvatarImageUploadZone({
  previewUrl,
  error,
  onValidated,
  onClear,
}: {
  previewUrl: string | null;
  error?: string;
  onValidated: (file: File, previewUrl: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(undefined);
    const result = await validateAvatarUpload(file);
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
          'flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition',
          dragOver ? 'border-accent bg-accent/5' : 'border-border-default hover:border-accent/50',
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview avatar" className="mb-3 h-28 w-28 rounded-lg object-cover" />
        ) : (
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-bg-tertiary text-text-tertiary">
            <ImagePlus size={24} />
          </div>
        )}
        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
          <Upload size={14} />
          Arrastrá una imagen o hacé click para subir
        </div>
        <p className="mt-2 text-center text-[11px] text-text-tertiary">
          500 KB max · {AVATAR_MIN_DIMENSION}-{AVATAR_MAX_DIMENSION} px · PNG/JPG/WebP · cuadrado
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {(error || localError) && <p className="mt-2 text-[12px] text-danger">{error || localError}</p>}
      {previewUrl && (
        <button type="button" className="mt-2 text-[12px] text-accent" onClick={onClear}>
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

export function formatMaxSizeHint() {
  return `${Math.round(AVATAR_MAX_FILE_BYTES / 1024)} KB`;
}
