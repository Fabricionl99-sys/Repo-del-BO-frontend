import { Link } from 'react-router-dom';

import { cn } from '@/lib/cn';

export function BrandLogo({
  className,
  linkTo = '/',
  size = 'md',
}: {
  className?: string;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const box =
    size === 'sm' ? 'h-7 w-7 text-[13px]' : size === 'lg' ? 'h-11 w-11 text-[18px]' : 'h-9 w-9 text-[15px]';
  const text = size === 'sm' ? 'text-[16px]' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to={linkTo} className={cn('inline-flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan font-semibold text-text-onAccent',
          box,
        )}
      >
        S
      </div>
      <span className={cn('font-semibold', text)}>Social2Game</span>
    </Link>
  );
}
