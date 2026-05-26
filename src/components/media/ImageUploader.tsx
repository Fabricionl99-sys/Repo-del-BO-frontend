/**
 * API simplificada sobre MediaUploader (upload compartido vía /admin/storage/upload).
 * Usar en formularios que solo necesitan URL + validación por módulo.
 */
import type { MediaContext, MediaValue } from '@/types/media';

import { MediaUploader, type MediaUploaderProps } from './MediaUploader';
import { mediaValueFromUrl } from './mediaUrl';

export interface ImageUploaderProps {
  label?: string;
  helpText?: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  context: MediaContext;
  required?: boolean;
  error?: string;
  compact?: boolean;
  showExternalUrlOption?: boolean;
}

export function ImageUploader({
  label,
  helpText,
  value,
  onChange,
  context,
  required,
  error,
  compact,
  showExternalUrlOption = true,
}: ImageUploaderProps) {
  const mediaProps: Omit<MediaUploaderProps, 'value' | 'onChange'> = {
    context,
    required,
    error,
    compact,
    showExternalUrlOption,
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[14px] text-text-secondary">
          {label}
        </label>
      )}
      {helpText && <p className="text-[12px] text-text-tertiary">{helpText}</p>}
      <MediaUploader
        {...mediaProps}
        value={mediaValueFromUrl(value ?? undefined) as MediaValue | null}
        onChange={(v) => onChange(v?.url ?? '')}
      />
    </div>
  );
}
