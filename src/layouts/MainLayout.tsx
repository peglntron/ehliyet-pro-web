import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useNavbar } from '../contexts/NavbarContext';

const drawerWidth = 280;
const headerHeight = 64;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open, setOpen, isMobile, setIsMobile } = useNavbar();

  // Ekran boyutu değişimini izle
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      
      // Mobil -> Desktop geçişte navbar'ı aç
      if (!mobile && isMobile) {
        setOpen(true);
      }
    };
    
    // Başlangıçta ve ekran boyutu değiştiğinde kontrol et
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile, setOpen, isMobile]);

  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <Header />
      <Navbar />
      <Box
        component="main"
        sx={{
          position: 'fixed',
          top: headerHeight,
          right: 0,
          bottom: 0,
          left: { 
            xs: 0, 
            md: open && !isMobile ? drawerWidth : 0
          },
          width: { 
            xs: '100%', 
            md: open && !isMobile ? `calc(100% - ${drawerWidth}px)` : '100%'
          },
          maxWidth: '100%',
          transition: 'left 0.3s ease, width 0.3s ease',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'grey.50',
          boxSizing: 'border-box',
          zIndex: 1
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
