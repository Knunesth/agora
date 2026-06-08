import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MenuDrawer } from '@/components/navigation/MenuDrawer';

interface MenuContextProps {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <MenuContext.Provider value={{ isMenuOpen, openMenu, closeMenu }}>
      {children}
      <MenuDrawer visible={isMenuOpen} onClose={closeMenu} />
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
