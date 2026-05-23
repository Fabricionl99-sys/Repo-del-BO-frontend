import { Image, Link2, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useStorageFiles, useUploadMedia } from '@/features/media/storageApi';
import { cn } from '@/lib/cn';
import type { MediaAspectRatio, MediaContext, MediaValue } from '@/types/media';

import {
  acceptFromFormats,
  buildValidationHint,
  formatFileSize,
  validateExternalImageUrl,
  validateMediaFile,
} from './mediaUploadValidation';
import { inferMediaSource, mediaValueFromUrl } from './mediaUrl';
import { purposeLabel, resolveMediaUploaderConfig } from './mediaUploaderPresets';

type UploadMode = 'upload' | 'external';

export interface MediaUploaderProps {
  value: MediaValue | null;
  onChange: (value: MediaValue | null) => void;
  context: MediaContext;
  maxSizeKB?: number;
  allowedFormats?: string[];
  minDimensions?: { width: number; height: number } | null;
  maxDimensions?: { width: number; height: number } | null;
  aspectRatio?: MediaAspectRatio;
  showExternalUrlOption?: boolean;
  required?: boolean;
  error?: string;
  compact?: boolean;
}

function previewClass(aspectRatio: MediaAspectRatio, compact?: boolean): string {
  if (aspectRatio === 'banner') return compact ? 'h-16 w-full' : 'h-24 w-full max-w-md';
  if (aspectRatio === 'square') return compact ? 'h-16 w-16' : 'h-28 w-28';
  if (aspectRatio === 'circle')
    return compact
      ? 'h-16 w-16 rounded-full ring-2 ring-border-default'
      : 'h-28 w-28 rounded-full ring-2 ring-border-default';
  return compact ? 'h-16 w-full' : 'h-24 w-full';
}

export function MediaUploader({
  value,
  onChange,
  context,
  maxSizeKB,
  allowedFormats,
  minDimensions,
  maxDimensions,
  aspectRatio,
  showExternalUrlOption = true,
  required = false,
  error,
  compact = false,
}: MediaUploaderProps) {
  const config = resolveMediaUploaderConfig(context, {
    ...(maxSizeKB !== undefined ? { maxSizeKB } : {}),
    ...(allowedFormats ? { allowedFormats } : {}),
    ...(minDimensions !== undefined ? { minDimensions } : {}),
    ...(maxDimensions !== undefined ? { maxDimensions } : {}),
    ...(aspectRatio ? { aspectRatio } : {}),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const libraryQ = useStorageFiles(context.module);

  const [mode, setMode] = useState<UploadMode>(() =>
    value?.source === 'external' ? 'external' : 'upload',
  );
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const [externalUrl, setExternalUrl] = useState(value?.source === 'external' ? value.url : '');
  const [validatingExternal, setValidatingExternal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; size: number } | null>(null);

  const previewUrl = value?.url ?? null;
  const hint = useMemo(() => buildValidationHint(config), [config]);
  const accept = acceptFromFormats(config.allowedFormats);
  const previewCls = previewClass(config.aspectRatio, compact);

  useEffect(() => {
    if (!value) return;
    setMode(value.source === 'external' ? 'external' : 'upload');
    if (value.source === 'external') setExternalUrl(value.url);
  }, [value?.url, value?.source]);

  const validationOpts = {
    maxSizeKB: config.maxSizeKB,
    allowedFormats: config.allowedFormats,
    minDimensions: config.minDimensions,
    maxDimensions: config.maxDimensions,
    aspectRatio: config.aspectRatio,
    label: purposeLabel(context.purpose),
  };

  const handleValidatedFile = async (file: File) => {
    setLocalError(undefined);
    setPendingFile({ name: file.name, size: file.size });
    try {
      const res = await upload.mutateAsync({ file, context });
      onChange({ url: res.url, source: 'upload' });
      setMode('upload');
    } catch {
      setLocalError('Error al subir el archivo.');
    } finally {
      setPendingFile(null);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(undefined);
    const result = await validateMediaFile(file, validationOpts);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    await handleValidatedFile(file);
  };

  const handleExternalBlur = async () => {
    const trimmed = externalUrl.trim();
    if (!trimmed) {
      if (!required) onChange(null);
      return;
    }
    setValidatingExternal(true);
    setLocalError(undefined);
    const result = await validateExternalImageUrl(trimmed, {
      minDimensions: config.minDimensions,
      maxDimensions: config.maxDimensions,
      aspectRatio: config.aspectRatio,
    });
    setValidatingExternal(false);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    onChange({ url: trimmed, source: 'external' });
  };

  const handleLibraryPick = (url: string) => {
    onChange({ url, source: inferMediaSource(url) });
    setMode('upload');
    setLocalError(undefined);
  };

  const handleClear = () => {
    onChange(null);
    setExternalUrl('');
    setLocalError(undefined);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || localError;
  const isBusy = upload.isPending || validatingExternal;

  return (
    <div className="space-y-3">
      {showExternalUrlOption && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === 'upload' ? 'primary' : 'secondary'}
            icon={<Upload size={14} />}
            onClick={() => setMode('upload')}
          >
            Cargar archivo
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'external' ? 'primary' : 'secondary'}
            icon={<Link2 size={14} />}
            onClick={() => setMode('external')}
          >
            Usar URL externa
          </Button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          className={cn(
            'overflow-hidden rounded-xl border-2 transition',
            previewUrl ? 'border-border-subtle bg-bg-secondary' : 'border-dashed border-border-default bg-bg-tertiary/30',
          )}
        >
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
            onClick={() => !isBusy && inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center p-4 transition',
              compact ? 'min-h-28' : 'min-h-36',
              dragOver ? 'border-accent bg-accent/5' : 'hover:bg-bg-tertiary/40',
              isBusy && 'pointer-events-none opacity-70',
            )}
          >
            {isBusy ? (
              <Loader2 size={28} className="mb-3 animate-spin text-accent" />
            ) : previewUrl ? (
              <img src={previewUrl} alt="Preview" className={cn('mb-3 rounded-lg object-cover', previewCls)} />
            ) : (
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-text-tertiary">
                <Image size={22} />
              </div>
            )}
            <div className="flex items-center gap-2 text-[15px] text-text-secondary">
              <Upload size={14} />
              {previewUrl ? 'Cambiar imagen' : 'Arrastrá o hacé click para subir'}
            </div>
            <p className="mt-2 text-center text-[13px] text-text-tertiary">{hint}</p>
            {pendingFile && (
              <p className="mt-1 text-[13px] text-text-secondary">
                {pendingFile.name} · {formatFileSize(pendingFile.size)}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-border-subtle bg-bg-secondary p-4">
          <label className="block text-[14px] text-text-secondary">URL de imagen externa</label>
          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="https://..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              onBlur={() => void handleExternalBlur()}
            />
            {validatingExternal && <Loader2 size={18} className="mt-2 animate-spin text-text-tertiary" />}
          </div>
          {previewUrl && mode === 'external' && (
            <img src={previewUrl} alt="Preview externa" className={cn('rounded-lg object-cover', previewCls)} />
          )}
        </div>
      )}

      {libraryQ.data && libraryQ.data.length > 0 && mode === 'upload' && (
        <div>
          <label className="mb-1.5 block text-[13px] text-text-tertiary">Biblioteca del módulo</label>
          <select
            className="field py-1.5 text-[14px]"
            value=""
            onChange={(e) => {
              const item = libraryQ.data?.find((f) => f.id === e.target.value);
              if (item) handleLibraryPick(item.url);
            }}
          >
            <option value="">Elegir archivo subido…</option>
            {libraryQ.data.map((f) => (
              <option key={f.id} value={f.id}>
                {f.filename} ({f.size_kb} KB)
              </option>
            ))}
          </select>
        </div>
      )}

      {displayError && <p className="text-[14px] text-danger">{displayError}</p>}

      {previewUrl && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={() => inputRef.current?.click()}>
            Cambiar imagen
          </Button>
          <Button type="button" size="sm" variant="ghost" icon={<X size={14} />} onClick={handleClear}>
            Eliminar
          </Button>
        </div>
      )}

      {!previewUrl && required && (
        <p className="text-[13px] text-text-tertiary">Imagen requerida</p>
      )}
    </div>
  );
}

/** Helper for string URL form fields. */
export function MediaUploaderFromUrl({
  url,
  onUrlChange,
  ...props
}: Omit<MediaUploaderProps, 'value' | 'onChange'> & {
  url: string | null | undefined;
  onUrlChange: (url: string) => void;
}) {
  return (
    <MediaUploader
      {...props}
      value={mediaValueFromUrl(url)}
      onChange={(v) => onUrlChange(v?.url ?? '')}
    />
  );
}
