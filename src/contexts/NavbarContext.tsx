import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface NavbarContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavbarContext = createContext<NavbarContextType>({
  open: true,
  setOpen: () => {},
  isMobile: false,
  setIsMobile: () => {}
});

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [open, setOpen] = useState(!isMobile);

  return (
    <NavbarContext.Provider value={{ open, setOpen, isMobile, setIsMobile }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = (): NavbarContextType => {
  return useContext(NavbarContext);
};