import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, Button, Divider,
  Paper, IconButton, Card, CardContent, CardActionArea,
  Chip, CircularProgress
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { getLicensePackages } from '../api/useCompanies';

interface LicensePackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  isTrial: boolean;
  description?: string;
  displayOrder?: number;
}

interface AddLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { packageId?: string; customDays?: number; amount?: number; description?: string }) => void;
  registrationDate: string;
  currentLicenseEndDate?: string;
}

const AddLicenseModal: React.FC<AddLicenseModalProps> = ({ 
  open, 
  onClose, 
  onSubmit,
  registrationDate,
  currentLicenseEndDate
}) => {
  const [selectedPackage, setSelectedPackage] = useState<LicensePackage | null>(null);
  const [packages, setPackages] = useState<LicensePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  const isRenewal = Boolean(currentLicenseEndDate);
  
  // Paketleri yükle
  useEffect(() => {
    if (open) {
      loadPackages();
      setSelectedPackage(null);
    }
  }, [open]);
  
  const loadPackages = async () => {
    setLoadingPackages(true);
    try {
      const data = await getLicensePackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };
  
  // Bitiş tarihini hesapla (duration ay cinsinden gelir, güne çeviriyoruz)
  const calculateEndDate = (durationInMonths: number): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentEndDate = currentLicenseEndDate ? new Date(currentLicenseEndDate) : null;
    const startDate = (currentEndDate && currentEndDate > today) ? currentEndDate : today;
    
    const newEndDate = new Date(startDate);
    // Ay cinsinden gelen değeri güne çeviriyoruz (1 ay = 30 gün)
    const days = Math.round(durationInMonths * 30);
    newEndDate.setDate(newEndDate.getDate() + days);
    
    return newEndDate;
  };
  
  // Tarih formatlayıcı
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Bilinmiyor';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Geçersiz tarih';
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Formu gönder
  const handleSubmit = () => {
    if (selectedPackage) {
      // Paket seçildi
      onSubmit({
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        description: `${selectedPackage.name} lisans paketi`
      });
    }
  };
  
  const isValid = !!selectedPackage;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        pb: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          {isRenewal ? 'Lisans Yenileme' : 'Lisans Ekleme'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {isRenewal 
              ? 'Mevcut lisansı yenilemek için bir paket seçin.'
              : 'Sürücü kursu için lisans paketi seçin. İşletme kaydedildikten sonra ödeme onayı beklenmektedir.'}
          </Typography>
          
          {/* Mevcut tarih bilgileri - sadece yenileme için */}
          {isRenewal && (
            <Paper 
              variant="outlined"
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                mb: 3,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box>
                <Typography fontWeight={600} gutterBottom color={(theme) => theme.palette.primary.main}>
                  Kayıt Tarihi
                </Typography>
                <Typography color="text.secondary">
                  {formatDate(registrationDate)}
                </Typography>
              </Box>
              
              {currentLicenseEndDate && (
                <Box>
                  <Typography fontWeight={600} gutterBottom color={(theme) => theme.palette.primary.main}>
                    Mevcut Lisans Bitiş
                  </Typography>
                  <Typography color="text.secondary">
                    {formatDate(currentLicenseEndDate)}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Lisans Paketleri */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Lisans Paketleri
          </Typography>
          
          {loadingPackages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 3
              }}
            >
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  variant="outlined"
                  sx={{
                    border: selectedPackage?.id === pkg.id ? 2 : 1,
                    borderColor: selectedPackage?.id === pkg.id ? 'primary.main' : 'divider',
                    bgcolor: selectedPackage?.id === pkg.id ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                    transition: 'all 0.2s'
                  }}
                >
                  <CardActionArea onClick={() => setSelectedPackage(pkg)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600} color={selectedPackage?.id === pkg.id ? 'primary.main' : 'text.primary'}>
                          {pkg.name}
                        </Typography>
                        {pkg.isTrial && (
                          <Chip label="Ücretsiz" size="small" color="success" />
                        )}
                        {selectedPackage?.id === pkg.id && (
                          <CheckCircleIcon color="primary" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {pkg.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {/* Ay cinsinden gelen değeri gün/ay olarak göster */}
                          {pkg.duration < 1 
                            ? `${Math.round(pkg.duration * 30)} Gün`
                            : `${pkg.duration} Ay`
                          }
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight={600}>
                          {pkg.price === 0 ? 'Ücretsiz' : `₺${pkg.price.toLocaleString('tr-TR')}`}
                        </Typography>
                      </Box>
                      
                      {selectedPackage?.id === pkg.id && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" color="primary.main" fontWeight={600}>
                            Bitiş Tarihi: {formatDate(calculateEndDate(pkg.duration))}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
          
          {/* Ödeme Özeti */}
          {selectedPackage && (
            <Paper
              variant="outlined"
              sx={{ 
                p: 2, 
                mt: 3,
                borderRadius: 2,
                bgcolor: 'rgba(46, 125, 50, 0.08)',
                borderColor: 'success.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MoneyIcon fontSize="small" color="success" />
                <Typography variant="subtitle2" color="success.dark" fontWeight={600}>
                  Ödeme Özeti
                </Typography>
              </Box>
              
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2" color="text.primary">
                  <strong>Paket:</strong> {selectedPackage.name}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Toplam Tutar:</strong> ₺{selectedPackage.price.toLocaleString('tr-TR')}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                  ⚠️ Lisans aktif olması için ödeme onayı beklenmektedir
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={isRenewal ? <RefreshIcon /> : <AddIcon />}
          disabled={!isValid}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {isRenewal ? 'Lisansı Yenile' : 'Lisansı Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLicenseModal;
