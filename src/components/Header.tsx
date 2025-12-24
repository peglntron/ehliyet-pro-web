import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  Autocomplete,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  ExitToApp,
  Settings,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavbar } from '../contexts/NavbarContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../utils/api';

const drawerWidth = 280;

const Header: React.FC = () => {
  const { open, setOpen } = useNavbar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Company logo ve kullanıcı avatarı için fonksiyon
  const fetchCompanyLogo = async () => {
    if ((user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPANY_USER' || user?.role === 'INSTRUCTOR') && user?.companyId) {
      try {
        const response = await apiClient.get('/auth/profile');
        if (response.data?.company?.logo) {
          setCompanyLogo(getImageUrl(response.data.company.logo));
        }
        // Kullanıcının fotoğrafı varsa ayarla
        if (response.data?.avatar || response.data?.photo) {
          setUserAvatar(getImageUrl(response.data.avatar || response.data.photo));
        }
      } catch (error) {
        console.error('Logo fetch hatası:', error);
      }
    } else if (user?.role === 'ADMIN' || user?.role === 'STUDENT' || user?.role === 'COMPANY_STUDENT') {
      // Admin ve öğrenciler için sadece kendi fotoğraflarını çek
      try {
        const response = await apiClient.get('/auth/profile');
        if (response.data?.avatar || response.data?.photo) {
          setUserAvatar(response.data.avatar || response.data.photo);
        }
      } catch (error) {
        console.error('Avatar fetch hatası:', error);
      }
    }
  };

  // Öğrenci arama - debounced
  const searchStudents = async (query: string) => {
    if (!query || query.length < 2) {
      setStudents([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await apiClient.get('/students');
      if (response.success && response.data) {
        // Client-side filtering
        const filtered = response.data.filter((student: any) => {
          const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
          const phone = student.phone || '';
          const searchLower = query.toLowerCase();
          return fullName.includes(searchLower) || phone.includes(searchLower);
        });
        setStudents(filtered.slice(0, 10)); // Sadece ilk 10 sonuç
      }
    } catch (error) {
      console.error('Öğrenci arama hatası:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Company logo fetch için useEffect
  useEffect(() => {
    fetchCompanyLogo();
  }, [user?.role, user?.companyId]);

  // Global logo refresh fonksiyonu
  useEffect(() => {
    const handleLogoUpdate = () => {
      fetchCompanyLogo();
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, [user?.role, user?.companyId]);

  // Arama debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue) {
        searchStudents(searchValue);
      } else {
        setStudents([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Sayfa değişince aramayı sıfırla
  useEffect(() => {
    setSearchValue('');
    setStudents([]);
  }, [location.pathname]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    // Role göre profil sayfasına yönlendir
    if (user?.role === 'COMPANY_ADMIN') {
      navigate('/settings/company'); // İşletme ayarları
    } else if (user?.role === 'INSTRUCTOR') {
      navigate('/profile/instructor'); // Eğitmen profili
    } else if (user?.role === 'ADMIN') {
      navigate('/profile/admin'); // Admin profili
    }
    // STUDENT, COMPANY_STUDENT, COMPANY_USER rolleri için henüz profil sayfası yok
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const getDisplayName = () => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.role === 'ADMIN') {
      return 'Sistem Yöneticisi';
    }
    if (user?.role === 'COMPANY_ADMIN') {
      return 'İşletme Yöneticisi';
    }
    if (user?.role === 'INSTRUCTOR') {
      return 'Eğitmen';
    }
    return 'Kullanıcı';
  };

  const getCompanyName = () => {
    if (user?.company) {
      return user.company.name;
    }
    if (user?.role === 'ADMIN') {
      return 'EhliyetPro - Sistem Yönetimi';
    }
    return 'EhliyetPro';
  };

  const getAvatarSrc = () => {
    // Önce kullanıcının kendi fotoğrafı
    if (userAvatar) return userAvatar;
    // İşletme kullanıcıları için şirket logosu
    if ((user?.role === 'COMPANY_ADMIN' || user?.role === 'COMPANY_USER') && companyLogo) {
      return companyLogo;
    }
    return null;
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { xs: 0, md: open ? drawerWidth : 0 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', height: 64, px: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          <Tooltip title="Menü">
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => setOpen(!open)}
              sx={{
                bgcolor: 'rgba(0,0,0,0.04)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.08)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            {user?.role !== 'ADMIN' && (
              <>
                  <BusinessIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
              </>
            )}
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {getCompanyName()}
              </Typography>
            </Box>
          </Box>
          
          {/* Öğrenci Arama */}
          {user?.role !== 'ADMIN' && (
            <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 300, maxWidth: 400 }}>
              <Autocomplete
                freeSolo
                options={students}
                loading={searchLoading}
                value={null}
                getOptionLabel={(option: any) => 
                  typeof option === 'string' ? option : `${option.firstName} ${option.lastName} (${option.phone})`
                }
                inputValue={searchValue}
                onInputChange={(_, newValue) => {
                  setSearchValue(newValue);
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    navigate(`/students/${newValue.id}`);
                    setSearchValue('');
                    setStudents([]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Öğrenci ara..."
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: 'rgba(0,0,0,0.04)',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.06)'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        }
                      }
                    }}
                  />
                )}
                renderOption={(props, option: any) => (
                  <li {...props}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {option.firstName?.[0]}{option.lastName?.[0]}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
              />
            </Box>
          )}
          
          <Box display="flex" alignItems="center" gap={1.5}>
            {/* <Tooltip title="Bildirimler">
              <IconButton 
                color="inherit"
                sx={{
                  bgcolor: 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip> */}
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                {getDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                {user?.role === 'ADMIN' ? 'Sistem Yöneticisi' : 
                 user?.role === 'COMPANY_ADMIN' ? 'İşletme Yöneticisi' :
                 user?.role === 'INSTRUCTOR' ? 'Eğitmen' : 
                 user?.role === 'COMPANY_USER' ? 'İşletme Kullanıcısı' :
                 user?.role === 'COMPANY_STUDENT' ? 'Öğrenci' : 'Kullanıcı'}
              </Typography>
            </Box>
            
            <Tooltip title="Hesap">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar 
                  alt={getDisplayName()} 
                  src={getAvatarSrc() || undefined}
                  sx={{ 
                    width: 44, 
                    height: 44,
                    bgcolor: user?.role === 'ADMIN' ? 'error.main' : 'primary.main',
                    border: '2px solid',
                    borderColor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {!getAvatarSrc() && (
                    user && user.firstName && user.lastName 
                      ? `${user.firstName[0]}${user.lastName[0]}` 
                      : (user?.role === 'ADMIN' ? 'SY' : 'K')
                  )}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profil</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ayarlar</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText>Çıkış Yap</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;