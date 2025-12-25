import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../types/types';
import { apiClient } from '../../../utils/api';
import { useSnackbar } from '../../../contexts/SnackbarContext';

interface CompanyCardProps {
  company: Company;
  getLicenseStatus: (endDate: string) => 'expired' | 'expiring' | 'valid';
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, getLicenseStatus }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Menu açma/kapama işlevleri
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Düzenleme sayfasına yönlendirme
  const handleEditCompany = () => {
    handleMenuClose();
    navigate(`/company/edit/${company.id}`);
  };
  
  // Aktif/Pasif durumu değiştirme
  const handleToggleStatus = async () => {
    handleMenuClose();
    try {
      const response = await apiClient.patch(`/companies/${company.id}/toggle-status`);
      if (response.success) {
        showSnackbar(`İşletme ${!company.isActive ? 'aktif' : 'pasif'} edildi`, 'success');
        // Sayfayı yenile
        window.location.reload();
      } else {
        throw new Error(response.message || 'İşlem başarısız');
      }
    } catch (error: any) {
      showSnackbar(error.message || 'İşletme durumu değiştirilirken hata oluştu', 'error');
    }
  };
  
  // Tarih formatını düzenleme yardımcı fonksiyonu
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // Geçersiz tarih kontrolü
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  // Lisans durumu rengini ve metnini belirle
  const licenseStatus = getLicenseStatus(company.licenseEndDate);
  const licenseInfo = {
    expired: { color: 'error', text: 'Süresi Dolmuş' },
    expiring: { color: 'warning', text: 'Yakında Bitecek' },
    valid: { color: 'success', text: 'Geçerli' }
  }[licenseStatus];
  
  return (
    <>
      <Card 
        elevation={1}
        onClick={() => navigate(`/company/${company.id}`)}
        sx={{ 
          mb: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s',
          overflow: 'visible',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Başlık Satırı */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1.5} flex={1}>
              <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                {company.name}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(e);
              }}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Bilgi Satırları */}
          <Box display="flex" flexDirection="column" gap={1}>
            {/* Satır 1: Yetkili Kişi, Telefon, Konum */}
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={0.5} minWidth={200}>
                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {company.owner}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} minWidth={150}>
                <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {company.phone}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {company.district} / {company.province}
                </Typography>
              </Box>
            </Box>

            {/* Satır 2: Lisans Başlangıç-Bitiş, Durum Chip'leri */}
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Lisans: {company.registrationDate ? formatDate(company.registrationDate) : '-'} - {company.licenseEndDate ? formatDate(company.licenseEndDate) : '-'}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Chip 
                  label={company.isActive ? 'Aktif' : 'Pasif'} 
                  size="small"
                  color={company.isActive ? 'success' : 'default'}
                  sx={{ fontWeight: 500, height: 24 }}
                />
                <Chip 
                  label={licenseInfo.text} 
                  size="small"
                  color={licenseInfo.color as any}
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* İşlemler Menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditCompany}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {company.isActive ? 
              <ToggleOffIcon fontSize="small" color="error" /> : 
              <ToggleOnIcon fontSize="small" color="success" />
            }
          </ListItemIcon>
          <ListItemText>
            {company.isActive ? 'Pasif Yap' : 'Aktif Yap'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CompanyCard;
