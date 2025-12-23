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
  Paper,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  DateRange as DateRangeIcon,
  EmojiPeople as EmojiPeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { LicenseClass } from '../types/types';

interface LicenseClassCardProps {
  licenseClass: LicenseClass;
}

const LicenseClassCard: React.FC<LicenseClassCardProps> = ({ licenseClass }) => {
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
  const handleEditClass = () => {
    handleMenuClose();
    navigate(`/license-classes/edit/${licenseClass.id}`);
  };
  
  // Aktif/Pasif durumu değiştirme
  const handleToggleStatus = () => {
    handleMenuClose();
    console.log('Toggle status:', licenseClass.id, !licenseClass.isActive);
    // Burada durum değiştirme API çağrısı yapılacak
  };
  
  // Tarih formatını düzenleme yardımcı fonksiyonu
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
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
                Ehliyet Sınıfı: {licenseClass.type}
              </Typography>
              <Chip 
                label={licenseClass.isActive ? 'Aktif' : 'Pasif'} 
                size="small"
                color={licenseClass.isActive ? 'success' : 'default'}
                sx={{ 
                  fontWeight: 500, 
                  borderRadius: 1
                }}
              />
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
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: licenseClass.color || 'grey.100',
                flexShrink: 0
              }}
            >
              {licenseClass.iconUrl ? (
                <img 
                  src={licenseClass.iconUrl} 
                  alt={licenseClass.type}
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="h5" fontWeight={700}>
                  {licenseClass.type}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {licenseClass.vehicle}
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmojiPeopleIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Yaş: {licenseClass.minAge}+
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <DateRangeIcon fontSize="small" color="secondary" />
                    <Typography variant="body2" color="text.secondary">
                      Değişim: {licenseClass.renewalPeriod} yıl
                    </Typography>
                  </Box>
                </Grid>
                
                {licenseClass.scope !== '-' && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Kapsam:</strong> {licenseClass.scope}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Güncellenme: {formatDate(licenseClass.updatedAt)}
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
        <MenuItem onClick={handleEditClass}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {licenseClass.isActive ? 
              <ToggleOffIcon fontSize="small" color="error" /> : 
              <ToggleOnIcon fontSize="small" color="success" />
            }
          </ListItemIcon>
          <ListItemText>
            {licenseClass.isActive ? 'Pasif Yap' : 'Aktif Yap'}
          </ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Görüntüleme Dialog'u */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Ehliyet Sınıfı: {licenseClass.type}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 3,
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: licenseClass.color || 'grey.100',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {licenseClass.iconUrl ? (
                <img 
                  src={licenseClass.iconUrl} 
                  alt={licenseClass.type}
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="h3" fontWeight={700}>
                  {licenseClass.type}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {licenseClass.vehicle}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Minimum Yaş:</strong> {licenseClass.minAge}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Yenileme Süresi:</strong> {licenseClass.renewalPeriod} yıl
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Kapsam:</strong> {licenseClass.scope !== '-' ? licenseClass.scope : 'Yok'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Tecrübe Şartı:</strong> {licenseClass.experienceRequired !== '-' ? licenseClass.experienceRequired : 'Yok'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Durum:</strong> {licenseClass.isActive ? 'Aktif' : 'Pasif'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Detaylı Açıklama
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              mb: 2
            }}
          >
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {licenseClass.description}
            </Typography>
          </Paper>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              <strong>Oluşturulma Tarihi:</strong> {formatDate(licenseClass.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Güncellenme Tarihi:</strong> {formatDate(licenseClass.updatedAt)}
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
              navigate(`/license-classes/edit/${licenseClass.id}`);
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

export default LicenseClassCard;
