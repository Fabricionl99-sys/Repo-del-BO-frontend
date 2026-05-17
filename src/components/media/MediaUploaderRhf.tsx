import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import type { MediaContext } from '@/types/media';

import { MediaUploader, type MediaUploaderProps } from './MediaUploader';
import { mediaValueFromUrl } from './mediaUrl';

export function MediaUploaderRhf<T extends FieldValues>({
  control,
  name,
  context,
  error,
  ...rest
}: Omit<MediaUploaderProps, 'value' | 'onChange' | 'context'> & {
  control: Control<T>;
  name: FieldPath<T>;
  context: MediaContext;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MediaUploader
          context={context}
          value={mediaValueFromUrl(typeof field.value === 'string' ? field.value : '')}
          onChange={(v) => field.onChange(v?.url ?? '')}
          error={error}
          {...rest}
        />
      )}
    />
  );
}
