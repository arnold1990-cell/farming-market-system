import { Menu } from 'lucide-react';
import { useMobileShell } from './mobileShellContext';

export default function MobileMenuButton({ className = '', iconSize = 20, label = 'Open menu' }) {
  const { openMenu } = useMobileShell();

  return (
    <button
      type="button"
      onClick={openMenu}
      aria-label={label}
      className={className || 'flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur'}
    >
      <Menu size={iconSize} />
    </button>
  );
}
