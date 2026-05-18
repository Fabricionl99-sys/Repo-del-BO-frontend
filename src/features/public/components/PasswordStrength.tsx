import { cn } from '@/lib/cn';

export function passwordStrengthScore(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

const LABELS = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'] as const;

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrengthScore(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < score ? 'bg-accent' : 'bg-bg-tertiary',
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-text-tertiary">{LABELS[score]}</p>
    </div>
  );
}
