import { Link } from 'react-router-dom';

import { OperatorAvatar } from '@/components/branding/OperatorAvatar';
import { useBrandingConfig } from '@/features/branding/brandingApi';
import { useOperatorConfig } from '@/features/settings/operatorConfigApi';

export function SidebarBrand() {
  const configQ = useOperatorConfig();
  const brandingQ = useBrandingConfig();
  const company = configQ.data?.company_info;
  const name = company?.commercial_name || company?.legal_name || 'Operador';
  const logoUrl = company?.company_logo_url;
  const accent = brandingQ.data?.color_palette.primary_color;

  return (
    <Link
      to="/dashboard"
      className="mb-4 flex items-center gap-2.5 border-b border-border-subtle px-5 pb-5 transition hover:opacity-90"
      style={accent ? { borderBottomColor: `${accent}33` } : undefined}
    >
      <OperatorAvatar name={name} imageUrl={logoUrl} seed={name} size="md" />
      <span className="truncate text-[16px] font-bold" style={accent ? { color: accent } : undefined}>
        {name}
      </span>
    </Link>
  );
}
