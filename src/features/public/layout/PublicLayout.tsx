import { ReactNode } from 'react';

import { PublicFooter } from '../components/PublicFooter';
import { PublicNav } from '../components/PublicNav';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
