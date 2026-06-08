import { createContext, useContext } from 'react';

export const MobileShellContext = createContext({
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  toggleMenu: () => {}
});

export const useMobileShell = () => useContext(MobileShellContext);
