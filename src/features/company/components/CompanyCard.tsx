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
  Delete as DeleteIcon,
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

interface CompanyCardProps {
  company: Company;
  getLicenseStatus: (endDate: string) => 'expired' | 'expiring' | 'valid';
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, getLicenseStatus }) => {
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Dialog açma/kapama işlevleri
  const handleOpenViewDialog = () => setViewDialogOpen(true);
  const handleCloseViewDialog = () => setViewDialogOpen(false);
  
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
  
  // Silme işlemi (şu an sadece konsola yazdırıyor)
  const handleDeleteCompany = () => {
    handleMenuClose();
    console.log('Delete company:', company.id);
    // Burada silme API çağrısı yapılacak
  };
  
  // Aktif/Pasif durumu değiştirme
  const handleToggleStatus = () => {
    handleMenuClose();
    console.log('Toggle status:', company.id, !company.isActive);
    // Burada durum değiştirme API çağrısı yapılacak
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
        sx={{ 
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'transform 0.2s, box-shadow 0.2s',
          overflow: 'visible',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                {company.name}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip 
                  label={company.isActive ? 'Aktif' : 'Pasif'} 
                  size="small"
                  color={company.isActive ? 'success' : 'default'}
                  sx={{ 
                    fontWeight: 500, 
                    borderRadius: 1
                  }}
                />
                <Chip 
                  label={licenseInfo.text} 
                  size="small"
                  color={licenseInfo.color as any}
                  sx={{ 
                    fontWeight: 500, 
                    borderRadius: 1
                  }}
                />
              </Box>
            </Box>
          }
          action={
            <IconButton
              aria-label="İşlemler"
              aria-haspopup="true"
              onClick={handleMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
          }
          sx={{ 
            pb: 1
          }}
        />
        
        <Divider />
        
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* Sol taraf (İletişim bilgileri) */}
            <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '66.67%' } }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <LocationOnIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {company.address}, {company.district}, {company.province}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <PhoneIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {company.phone}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <PersonIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  <strong>Yetkili:</strong> {company.owner}
                </Typography>
              </Box>
            </Box>
            
            {/* Sağ taraf (Tarih bilgileri) */}
            <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '33.33%' } }}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayIcon fontSize="small" color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Kayıt:</strong> {company.registrationDate ? formatDate(company.registrationDate) : '-'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayIcon 
                    fontSize="small" 
                    color={licenseStatus === 'expired' ? 'error' : 
                           licenseStatus === 'expiring' ? 'warning' : 'success'} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Lisans:</strong> {company.licenseEndDate ? formatDate(company.licenseEndDate) : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Güncellenme: {company.updatedAt ? formatDate(company.updatedAt) : '-'}
          </Typography>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={handleOpenViewDialog}
            sx={{ textTransform: 'none' }}
          >
            Detaylar
          </Button>
        </CardActions>
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
        <MenuItem onClick={handleDeleteCompany}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: (theme) => theme.palette.error.main }}>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Görüntüleme Dialog'u */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {company.name}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    İletişim Bilgileri
                  </Typography>
                  <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
                    <LocationOnIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {company.address}, {company.district}, {company.province}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <PhoneIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {company.phone}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Yetkili:</strong> {company.owner}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Lisans Bilgileri
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <CalendarTodayIcon fontSize="small" color="secondary" />
                    <Typography variant="body2">
                      <strong>Kayıt Tarihi:</strong> {company.registrationDate ? formatDate(company.registrationDate) : '-'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <CalendarTodayIcon 
                      fontSize="small" 
                      color={licenseStatus === 'expired' ? 'error' : 
                            licenseStatus === 'expiring' ? 'warning' : 'success'} 
                    />
                    <Typography variant="body2">
                      <strong>Lisans Bitiş Tarihi:</strong> {company.licenseEndDate ? formatDate(company.licenseEndDate) : '-'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon fontSize="small" color="secondary" />
                    <Typography variant="body2">
                      <strong>Durum:</strong> {company.isActive ? 'Aktif' : 'Pasif'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
          
          {company.location && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Konum
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.03)'
                }}
              >
                <Typography color="text.secondary">
                  Harita burada gösterilecek
                  <br />
                  Enlem: {company.location.latitude}
                  <br />
                  Boylam: {company.location.longitude}
                </Typography>
              </Paper>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              <strong>Oluşturulma Tarihi:</strong> {company.createdAt ? formatDate(company.createdAt) : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Güncellenme Tarihi:</strong> {company.updatedAt ? formatDate(company.updatedAt) : '-'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCloseViewDialog}
            sx={{ borderRadius: 2 }}
          >
            Kapat
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseViewDialog();
              navigate(`/company/edit/${company.id}`);
            }}
            sx={{ borderRadius: 2 }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyCard;
