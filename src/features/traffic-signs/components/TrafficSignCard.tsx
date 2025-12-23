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
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { trafficSignApi } from '../../../utils/api';
import type { TrafficSign } from '../types/types';

// Trafik işareti kategorilerine göre renk ataması
const getCategoryColor = (categoryName: string): string => {
  const categoryColors: { [key: string]: string } = {
    "Tehlike Uyarı İşaretleri": "error.main",
    "Trafik Tanzim İşaretleri": "primary.main",
    "Bilgi İşaretleri": "info.main",
    "Duraklama ve Park Etme İşaretleri": "secondary.main",
    "Otoyol İşaretleri": "success.main",
    "Yapım Bakım ve Onarım İşaretleri": "warning.main",
    "Trafik Görevlisinin İşaretleri": "secondary.dark",
    "Araç Gösterge İşaretleri": "info.dark"
  };
  
  return categoryColors[categoryName] || 'grey.500';
};

interface TrafficSignCardProps {
  trafficSign: TrafficSign;
  onUpdate?: () => void; // Güncelleme callback'i
}

const TrafficSignCard: React.FC<TrafficSignCardProps> = ({ trafficSign, onUpdate }) => {
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
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
  const handleEditSign = () => {
    handleMenuClose();
    navigate(`/traffic-signs/edit/${trafficSign.id}`);
  };
  
  // Silme dialog'unu açma
  const handleDeleteSign = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  // Silme işlemini onaylama
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await trafficSignApi.delete(trafficSign.id);
      setSnackbar({
        open: true,
        message: 'Trafik işareti başarıyla silindi.',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      onUpdate?.(); // Listeyi güncelle
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Silme işlemi başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Aktif/Pasif durumu değiştirme
  const handleToggleStatus = async () => {
    try {
      handleMenuClose();
      setIsLoading(true);
      await trafficSignApi.toggleStatus(trafficSign.id);
      setSnackbar({
        open: true,
        message: `Trafik işareti ${trafficSign.isActive ? 'pasif' : 'aktif'} yapıldı.`,
        severity: 'success'
      });
      onUpdate?.(); // Listeyi güncelle
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Durum değiştirme işlemi başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Snackbar'ı kapatma
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          title={trafficSign.name}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={trafficSign.isActive ? 'Aktif' : 'Pasif'} 
                size="small"
                color={trafficSign.isActive ? 'success' : 'default'}
                sx={{ 
                  fontWeight: 500, 
                  borderRadius: 1
                }}
              />
              <IconButton
                aria-label="İşlemler"
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
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
                width: 100,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'grey.100',
                flexShrink: 0
              }}
            >
              {trafficSign.imageUrl ? (
                <img 
                  src={trafficSign.imageUrl}
                  alt={trafficSign.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Resim Yok
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Chip 
                label={trafficSign.categoryName}
                sx={{ 
                  bgcolor: getCategoryColor(trafficSign.categoryName),
                  color: 'white',
                  fontWeight: 600,
                  mb: 1
                }}
                size="small"
              />
              
              <Typography 
                variant="body2"
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3
                }}
              >
                {trafficSign.description || 'Açıklama bulunmuyor'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Eklenme: {formatDate(trafficSign.createdAt)}
          </Typography>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={handleOpenViewDialog}
            sx={{ textTransform: 'none' }}
          >
            Görüntüle
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
        <MenuItem onClick={handleEditSign}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {trafficSign.isActive ? 
              <ToggleOffIcon fontSize="small" color="error" /> : 
              <ToggleOnIcon fontSize="small" color="success" />
            }
          </ListItemIcon>
          <ListItemText>
            {trafficSign.isActive ? 'Pasif Yap' : 'Aktif Yap'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteSign}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Görüntüleme Dialog'u */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          {trafficSign.name}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={trafficSign.categoryName}
              sx={{ 
                bgcolor: getCategoryColor(trafficSign.categoryName),
                color: 'white',
                fontWeight: 600,
                mb: 1
              }}
            />
            <Box
              sx={{
                width: '100%',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'grey.100',
                borderRadius: 2,
                mt: 2,
                mb: 3
              }}
            >
              {trafficSign.imageUrl ? (
                <img 
                  src={trafficSign.imageUrl} 
                  alt={trafficSign.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Resim Yok
                </Typography>
              )}
            </Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Açıklama
            </Typography>
            <Typography paragraph>
              {trafficSign.description || 'Açıklama bulunmuyor'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                <strong>Durum:</strong> {trafficSign.isActive ? 'Aktif' : 'Pasif'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Eklenme Tarihi:</strong> {formatDate(trafficSign.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Güncelleme Tarihi:</strong> {formatDate(trafficSign.updatedAt)}
              </Typography>
            </Box>
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
              navigate(`/traffic-signs/edit/${trafficSign.id}`);
            }}
            sx={{ borderRadius: 2 }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Trafik İşaretini Sil
        </DialogTitle>
        <DialogContent>
          <Typography>
            "{trafficSign.name}" isimli trafik işaretini silmek istediğinizden emin misiniz? 
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            {isLoading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TrafficSignCard;
