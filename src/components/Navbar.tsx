import React, { useEffect } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LayersIcon from '@mui/icons-material/Layers';
import TrafficIcon from '@mui/icons-material/Traffic';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import GroupIcon from '@mui/icons-material/Group';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link, useLocation } from 'react-router-dom';
import { useNavbar } from '../contexts/NavbarContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

const drawerWidth = 280;

const adminMenuGroups = [
  {
    title: 'Yönetim',
    items: [
      { text: 'Ana Sayfa', icon: <HomeIcon />, path: '/' },
      { text: 'Canlı Aktiviteler', icon: <TimelineIcon />, path: '/live-activities' },
      { text: 'Soru Yönetimi', icon: <ListAltIcon />, path: '/questions' },
      { text: 'Ders Yönetimi', icon: <LibraryBooksIcon />, path: '/lessons-management' },
      { text: 'Ünite Yönetimi', icon: <MenuBookIcon />, path: '/lessons' },
      { text: 'Trafik İşaretleri', icon: <TrafficIcon />, path: '/traffic-signs' },
      { text: 'Ehliyet Sınıfları', icon: <DriveEtaIcon />, path: '/license-classes' },
      { text: 'Gider Kalemleri', icon: <ListAltIcon />, path: '/expense-categories' },
      { text: 'İşletme Tanımlama', icon: <LayersIcon />, path: '/company' },
      { text: 'Lisans Paketleri', icon: <ReceiptIcon />, path: '/license-packages' },
    ],
  },
];

const companyMenuGroups = [
  {
    title: 'İşletme',
    items: [
      { text: 'İşletme Paneli', icon: <HomeIcon />, path: '/company/dashboard' },
      { text: 'İşletme Bilgileri', icon: <LayersIcon />, path: '/company/info' },
      { text: 'Raporlar', icon: <ListAltIcon />, path: '/reports' },
      { text: 'Kursiyer Listesi', icon: <GroupIcon />, path: '/students' },
      { text: 'Eğitmenler', icon: <SchoolIcon />, path: '/instructors' },
      { text: 'Direksiyon Eğitimleri', icon: <EventNoteIcon />, path: '/driving-lessons' },
      { text: 'Araç Yönetimi', icon: <DirectionsCarIcon />, path: '/vehicles' },
      { text: 'Eşleştirme', icon: <AutoAwesome />, path: '/matching/saved' },
      { text: 'Ödemesi Gecikenler', icon: <MoneyOffIcon />, path: '/overdue-payments' },
      { text: 'Giderler', icon: <ReceiptIcon />, path: '/expenses' },
      { text: 'Bildirim Tarihçesi', icon: <NotificationsActiveIcon />, path: '/notifications' },
    ],
  },
  {
    title: 'Tanımlamalar',
    items: [
      { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
    ],
  },
];

const instructorMenuGroups = [
  {
    title: 'Eğitmen Paneli',
    items: [
      { text: 'Eğitmen Paneli', icon: <HomeIcon />, path: '/instructor/dashboard' },
      { text: 'Direksiyon Eğitimleri', icon: <EventNoteIcon />, path: '/driving-lessons' },
    ],
  },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { open, setOpen, isMobile } = useNavbar();
  const { user } = useAuth();
  const { permissions } = usePermissions();
  
  // Kullanıcı rolüne göre menü gruplarını belirle ve filtrele
  const getFilteredMenuGroups = () => {
    if (user?.role === 'ADMIN') {
      return adminMenuGroups;
    }
    
    if (user?.role === 'INSTRUCTOR') {
      return instructorMenuGroups;
    }
    
    if (user?.role === 'COMPANY_ADMIN') {
      return companyMenuGroups;
    }
    
    // COMPANY_USER için permission bazlı filtreleme
    if (user?.role === 'COMPANY_USER') {
      return companyMenuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Yetki bazlı filtreleme
          if (item.path === '/company/dashboard' && !permissions.canViewDashboard) return false;
          if (item.path === '/reports' && !permissions.canViewReports) return false;
          if (item.path === '/overdue-payments' && !permissions.canManageStudents) return false;
          if (item.path === '/expenses' && !permissions.canViewExpenses) return false;
          if (item.path === '/matching/saved' && !permissions.canManageMatching) return false;
          if (item.path === '/instructors' && !permissions.canViewInstructorDetails) return false;
          if (item.path === '/vehicles' && !permissions.canManageVehicles) return false;
          if (item.path === '/notifications' && !permissions.canViewNotifications) return false;
          if (item.path === '/students' && !permissions.canManageStudents) return false;
          if (item.path === '/driving-lessons' && !permissions.canViewDrivingLessons) return false;
          if (item.path === '/settings' && !permissions.canAccessSettings) return false;
          return true;
        })
      })).filter(group => group.items.length > 0); // Boş grupları kaldır
    }
    
    return companyMenuGroups;
  };
  
  const menuGroups = getFilteredMenuGroups();
  
  // Mobilde drawer kapatıldığında
  const handleDrawerClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        zIndex: (theme) => theme.zIndex.drawer,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #2c3e50 60%, #34495e 100%)',
          color: '#fff',
          height: '100%',
          border: 'none',
          zIndex: (theme) => theme.zIndex.drawer,
          transition: 'transform 0.3s ease'
        },
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48 }} />
          <Typography variant="h6" noWrap component="div">
            Ehliyet.pro
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      {menuGroups.map((group) => (
        <Box key={group.title}>
          <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1, color: 'rgba(255,255,255,0.7)' }}>
            {group.title}
          </Typography>
          <List>
            {group.items.map((item) => (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={handleDrawerClose}
                sx={{
                  color: '#fff',
                  '&.Mui-selected': {
                    background: 'rgba(255,255,255,0.12)',
                    fontWeight: 'bold',
                  },
                  '&.Mui-selected:hover': {
                    background: 'rgba(255,255,255,0.18)',
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.12)',
                    '& .MuiListItemText-primary': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
      <Box flex={1} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <Box p={2} textAlign="center" fontSize={12} color="rgba(255,255,255,0.7)">
        © 2025 Ehliyet.Pro
        <Typography>
          developed by handhsoft.com
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Navbar;