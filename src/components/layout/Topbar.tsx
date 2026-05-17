import { Bell, HelpCircle, LogOut, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ROUTE_TITLES } from '@/lib/routeTitles';
import { useAuth } from '@/auth/AuthProvider';
import { useOperatorStore } from '@/stores/operatorStore';

export function Topbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const op = useOperatorStore((s) => s.current);
  const title = ROUTE_TITLES['/' + location.pathname.split('/')[1]] ?? 'Próximamente';

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-7">
      <nav className="flex items-center gap-2 text-[14px] text-text-secondary">
        <span>{op?.name ?? 'Casino Astral'}</span>
        <span className="text-text-tertiary">/</span>
        <span className="font-medium text-text-primary">{title}</span>
      </nav>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <IconButton icon={Search} title="Buscar (⌘K)" />
        <IconButton icon={Bell} title="Notificaciones" hasDot />
        <IconButton icon={HelpCircle} title="Ayuda" />
        <button className="flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary py-1 pl-1.5 pr-3 hover:bg-bg-hover">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-info to-purple text-[14px] font-semibold text-text-onAccent">
            {user?.initials}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[15px] font-medium">{user?.name}</div>
            <div className="text-[14px] text-text-secondary">{user?.role}</div>
          </div>
        </button>
        <IconButton icon={LogOut} title="Salir" onClick={logout} />
      </div>
    </div>
  );
}
