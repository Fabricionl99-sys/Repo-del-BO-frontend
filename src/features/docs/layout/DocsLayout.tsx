import { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Book, Download, ExternalLink } from 'lucide-react';

import { PublicLayout } from '@/features/public/layout/PublicLayout';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/docs', label: 'Introducción', end: true },
  { to: '/docs/quickstart', label: 'Quickstart' },
  { to: '/docs/authentication', label: 'Authentication' },
  { to: '/docs/operator-bonuses', label: 'Operator bonuses' },
  { to: '/docs/events-webhook', label: 'Events webhook' },
  { to: '/docs/bonus-delivery', label: 'Bonus delivery callback' },
  { to: '/docs/players', label: 'Players API' },
  { to: '/docs/api-reference', label: 'API reference' },
] as const;

export function DocsLayout({ children }: { children?: ReactNode }) {
  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-7xl flex-col gap-0 lg:flex-row">
        <aside className="border-b border-border-subtle bg-bg-secondary px-4 py-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <Book size={18} />
            <span className="text-[15px] font-bold">API Docs</span>
          </div>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item && item.end}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2 text-[14px] font-medium transition',
                    isActive
                      ? 'bg-accent-subtle text-accent'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 space-y-2 border-t border-border-subtle pt-4">
            <a
              href="/postman/social2game-api.postman_collection.json"
              download
              className="flex items-center gap-2 text-[13px] font-semibold text-accent hover:underline"
            >
              <Download size={14} />
              Postman collection
            </a>
            <a
              href="https://github.com/social2game/api-examples"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-primary"
            >
              <ExternalLink size={14} />
              GitHub examples
            </a>
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
          <div className="prose-docs max-w-3xl">{children ?? <Outlet />}</div>
        </div>
      </div>
    </PublicLayout>
  );
}
