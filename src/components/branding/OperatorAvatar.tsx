import { cn } from '@/lib/cn';
import { colorFromSeed, initialsFromName } from '@/lib/initials';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-[12px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-12 w-12 text-[15px]',
  xl: 'h-16 w-16 text-[18px]',
} as const;

export function OperatorAvatar({
  name,
  imageUrl,
  seed,
  size = 'md',
  className,
}: {
  name: string;
  imageUrl?: string | null;
  seed?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const initials = initialsFromName(name);
  const bg = colorFromSeed(seed ?? name);
  const trimmed = imageUrl?.trim();

  if (trimmed) {
    return (
      <img
        src={trimmed}
        alt=""
        className={cn('rounded-full object-cover', SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
