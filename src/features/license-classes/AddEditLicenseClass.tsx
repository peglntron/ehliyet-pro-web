import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, FormControlLabel,
  Switch, Divider, Snackbar, Alert, IconButton,
  InputAdornment, Grid, Card, CardMedia, Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { getLicenseClassById } from './api/useLicenseClasses';
import LoadingIndicator from '../../components/LoadingIndicator';
import type { LicenseClass } from './types/types';

const AddEditLicenseClass: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    type: string;
    vehicle: string;
    minAge: number | '';
    scope: string;
    renewalPeriod: number | '';
    experienceRequired: string;
    description: string;
    color: string;
    iconUrl: string;
    isActive: boolean;
  }>({
    type: '',
    vehicle: '',
    minAge: '',
    scope: '-',
    renewalPeriod: '',
    experienceRequired: '-',
    description: '',
    color: '#1976d2', // Varsayılan mavi renk
    iconUrl: '',
    isActive: true
  });
  
  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Düzenleme modunda ehliyet sınıfını yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getLicenseClassById(id)
        .then(licenseClass => {
          setFormData({
            type: licenseClass.type,
            vehicle: licenseClass.vehicle,
            minAge: licenseClass.minAge,
            scope: licenseClass.scope,
            renewalPeriod: licenseClass.renewalPeriod,
            experienceRequired: licenseClass.experienceRequired,
            description: licenseClass.description,
            color: licenseClass.color,
            iconUrl: licenseClass.iconUrl,
            isActive: licenseClass.isActive
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading license class:', error);
          setSnackbarMessage('Ehliyet sınıfı yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Form field değişikliklerini handle et
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };
  
  
  // Renk seçimi için önceden tanımlanmış renkler
  const predefinedColors = [
    '#1976d2', // Mavi
    '#2e7d32', // Yeşil
    '#9c27b0', // Mor
    '#f44336', // Kırmızı
    '#ff9800', // Turuncu
    '#ffeb3b', // Sarı
    '#795548', // Kahverengi
    '#607d8b', // Gri
    '#000000', // Siyah
    '#ffffff'  // Beyaz
  ];
  
  // Resim yükleme işlemi
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageUploading(true);
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const target = event.target as FileReader | null;
      if (target && target.result) {
        setFormData(prev => ({
          ...prev,
          iconUrl: target.result ? target.result.toString() : ''
        }));
      }
      setImageUploading(false);
    };
    
    reader.readAsDataURL(file);
    
    // Input'u temizle
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Resim silme işlemi
  const handleDeleteImage = () => {
    setFormData(prev => ({
      ...prev,
      iconUrl: ''
    }));
  };
  
  // Form gönderim işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.type || !formData.vehicle || formData.minAge === '' || formData.renewalPeriod === '') {
      setSnackbarMessage('Lütfen tüm zorunlu alanları doldurun!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Form Data:', formData);
      
      // API verisi hazırla
      const apiData = {
        tip: formData.type,
        arac: formData.vehicle,
        yas: Number(formData.minAge),
        kapsam: formData.scope,
        degisim_suresi: Number(formData.renewalPeriod),
        tecrube_sarti: formData.experienceRequired,
        icerik: formData.description,
        renk: formData.color,
        ikon_url: formData.iconUrl,
        isActive: formData.isActive
      };
      
      let response;
      if (isEditMode && id) {
        // Güncelleme
        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/license-classes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(apiData)
        });
      } else {
        // Yeni ekleme
        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/license-classes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(apiData)
        });
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Navigate ile success mesajı gönder
        const successMessage = isEditMode ? 'updated' : 'created';
        navigate(`/license-classes?success=${successMessage}`);
      } else {
        // Hata durumu
        const errorMessage = result.message || 'Bir hata oluştu!';
        navigate(`/license-classes?error=${encodeURIComponent(errorMessage)}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      navigate(`/license-classes?error=${encodeURIComponent(errorMessage)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              {isEditMode ? 'Ehliyet Sınıfını Düzenle' : 'Yeni Ehliyet Sınıfı Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut ehliyet sınıfını düzenleyin ve güncelleyin' 
                : 'Yeni bir ehliyet sınıfı ekleyin'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/license-classes')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Sınıf Listesine Dön
          </Button>
        </Box>
      </Box>
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <LoadingIndicator 
          text="Ehliyet sınıfı bilgileri yükleniyor..." 
          size="medium" 
          showBackground={true} 
        />
      ) : (
        /* Form */
        <form onSubmit={handleSubmit}>
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              p: { xs: 2, md: 4 }, // Daha fazla iç dolgu (padding)
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={4}> {/* mb artırıldı */}
              Ehliyet Sınıfı Bilgileri
            </Typography>
            
            <Grid container spacing={4}> {/* Öğeler arası boşluk artırıldı */}
              {/* Ehliyet Tipi ve Araç Tipi */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Ehliyet Tipi *
                </Typography>
                <TextField
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Örn: B, A1, M, C1..."
                  required
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Araç Tipi *
                </Typography>
                <TextField
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Örn: Otomobil, Motosiklet..."
                  required
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              {/* Minimum Yaş ve Yenileme Süresi */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Minimum Yaş *
                </Typography>
                <TextField
                  name="minAge"
                  type="number"
                  value={formData.minAge}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: 16 },
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Yenileme Süresi (Yıl) *
                </Typography>
                <TextField
                  name="renewalPeriod"
                  type="number"
                  value={formData.renewalPeriod}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: 1 },
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              {/* Kapsam ve Tecrübe Şartı */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Kapsam
                </Typography>
                <TextField
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Örn: A1, B1..."
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Tecrübe Şartı
                </Typography>
                <TextField
                  name="experienceRequired"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Örn: B > 2 Yıl..."
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
              </Grid>
              
              {/* Renk Seçimi */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Renk
                </Typography>
                <TextField
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ColorLensIcon sx={{ color: formData.color, fontSize: '1.5rem' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem' // Font boyutu artırıldı
                    }
                  }}
                />
                <Box mt={2} display="flex" flexWrap="wrap" gap={1.5}>
                  {predefinedColors.map((color) => (
                    <Tooltip key={color} title={color}>
                      <Box
                        sx={{
                          width: 36, // Daha büyük renk kutuları
                          height: 36, // Daha büyük renk kutuları
                          bgcolor: color,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: formData.color === color ? 'primary.main' : 'transparent',
                          '&:hover': {
                            boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.5)'
                          }
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
              
              {/* İkon Yükleme */}
              <Grid item xs={12} md={6}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  İkon
                </Typography>
                {formData.iconUrl ? (
                  <Box 
                    sx={{ 
                      position: 'relative',
                      width: 'fit-content',
                      maxWidth: '100%',
                      mb: 2
                    }}
                  >
                    <Card sx={{ 
                      width: 'fit-content',
                      maxWidth: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: 2
                    }}>
                      <CardMedia
                        component="img"
                        image={formData.iconUrl}
                        alt="Ehliyet Sınıfı İkonu"
                        sx={{ 
                          height: 150, // Daha büyük ikon gösterimi
                          width: 150, // Daha büyük ikon gösterimi
                          objectFit: 'contain',
                          bgcolor: formData.color,
                          p: 2
                        }}
                      />
                    </Card>
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 0, 0, 0.7)',
                        }
                      }}
                      onClick={handleDeleteImage}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 3,
                      mb: 2,
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      transition: 'all 0.2s',
                      height: 150, // Daha büyük alan
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary" variant="body1"> {/* Font boyutu artırıldı */}
                      İkon yüklemek için tıklayın
                    </Typography>
                  </Box>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Typography variant="body2" color="text.secondary">
                  PNG veya JPEG formatında şeffaf arka planlı bir ikon yükleyin.
                </Typography>
              </Grid>
              
              {/* Açıklama - Tam genişlikte ve daha büyük */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={1.5}> {/* mb artırıldı */}
                  Açıklama *
                </Typography>
                <TextField
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6} // Satır sayısı artırıldı
                  fullWidth
                  placeholder="Ehliyet sınıfı ile ilgili detaylı açıklama yazın..."
                  required
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      fontSize: '1rem', // Font boyutu artırıldı
                      '& .MuiInputBase-inputMultiline': {
                        lineHeight: 1.5 // Satır aralığı artırıldı
                      }
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  * Özel karakterler ve formatlar kullanabilirsiniz. Örneğin: Max 50 m3 / Güç; Max 4 kw / Hız; Max 45 km/h
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            {/* Ehliyet Sınıfı Özellikleri */}
            <Box mb={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Ehliyet Sınıfı Durumu
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    color="primary"
                    size="medium" // Daha büyük switch
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={500}>
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </Typography>
                }
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/license-classes')}
              sx={{
                py: 1.5,
                px: 4, // Daha geniş butonlar
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem' // Daha büyük font
              }}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                px: 4, // Daha geniş butonlar
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem' // Daha büyük font
              }}
            >
              {isEditMode ? 'Sınıfı Güncelle' : 'Sınıfı Kaydet'}
            </Button>
          </Box>
        </form>
      )}

      {/* Resim yükleme göstergesi */}
      {imageUploading && (
        <LoadingIndicator 
          text="İkon yükleniyor..." 
          size="small" 
          fullScreen={true} 
          showBackground={false} 
        />
      )}
      
      {/* Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEditLicenseClass;
