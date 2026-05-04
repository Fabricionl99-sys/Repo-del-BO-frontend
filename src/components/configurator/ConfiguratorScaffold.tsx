import { ReactNode } from 'react';

export function ConfiguratorScaffold({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

export function ConfigSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <header className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
        {icon && <span className="text-[18px]">{icon}</span>}
        <div>
          <h3 className="text-[14px] font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-[11px] text-text-tertiary">{description}</p>}
        </div>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
