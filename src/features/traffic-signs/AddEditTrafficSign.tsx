import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, FormControlLabel,
  Switch, Divider, Snackbar, Alert,
  Card, CardMedia, IconButton, Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useTrafficSignCategories, getTrafficSignById, addTrafficSign, updateTrafficSign } from './api/useTrafficSigns';
import { trafficSignApi } from '../../utils/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import type { TrafficSign, TrafficSignCategory } from './types/types';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';

const AddEditTrafficSign: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // API hooks
  const { categories } = useTrafficSignCategories();
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string; // UUID string kullanıyoruz
    imageUrl: string;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    categoryId: '',
    imageUrl: '',
    description: '',
    isActive: true
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  
  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  useUnsavedChangesWarning({ hasUnsavedChanges });
  
  // Form validation için local snackbar (sadece validation hataları için)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('error');
  
  // Düzenleme modunda trafik işaretini yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getTrafficSignById(id)
        .then(sign => {
          const loadedData = {
            name: sign.name,
            categoryId: sign.categoryId,
            imageUrl: sign.imageUrl || '',
            description: sign.description || '',
            isActive: sign.isActive
          };
          setFormData(loadedData);
          setInitialFormData(loadedData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading traffic sign:', error);
          setSnackbarMessage('Trafik işareti yüklenirken hata oluştu!');
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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  // Select bileşeni için değişiklik işleyicisi
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };
  
  // Resim yükleme işlemi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Dosya boyutu kontrolü (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbarMessage('Resim dosyası 5MB\'den küçük olmalı!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setSnackbarMessage('Sadece resim dosyaları yüklenebilir!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setImageUploading(true);
    setSelectedFile(file); // Dosyayı state'te sakla
    
    // Preview için base64 gösterimi
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event?.target?.result;
      if (typeof result === 'string') {
        setFormData(prev => ({
          ...prev,
          imageUrl: result // Geçici preview için base64
        }));
      }
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
    
    // Eğer edit modunda bir traffic sign ID'si varsa, resmi hemen upload et
    if (isEditMode && id) {
      try {
        const response = await trafficSignApi.uploadImage(id, file);
        if (response.success && response.data?.imageUrl) {
          // Başarılı upload sonrası gerçek URL ile değiştir
          setFormData(prev => ({
            ...prev,
            imageUrl: response.data.imageUrl
          }));
          setSnackbarMessage('Resim başarıyla yüklendi!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        setSnackbarMessage('Resim yükleme başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        // Hata durumunda preview'i temizle
        setFormData(prev => ({
          ...prev,
          imageUrl: ''
        }));
      }
    }
    // Yeni oluşturma modunda resim sadece form submit'te upload edilecek
    
    // Input'u temizle
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Resim silme işlemi
  const handleDeleteImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
    setSelectedFile(null); // Seçili dosyayı temizle
    
    // File input'u da temizle
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Form gönderim işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.name || !formData.categoryId) {
      setSnackbarMessage('Lütfen gerekli alanları doldurun!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        // Edit modu: normal update
        await updateTrafficSign(id, {
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          isActive: formData.isActive,
          imageUrl: formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl // Base64 değilse URL olarak gönder
        });
        setSnackbarMessage('Trafik işareti başarıyla güncellendi!');
      } else {
        // Yeni oluşturma modu: önce traffic sign'ı oluştur, sonra resim varsa upload et
        console.log('Selected file:', selectedFile); // Debug log
        
        // Önce traffic sign'ı resim olmadan oluştur
        const newTrafficSign = await addTrafficSign({
          name: formData.name,
          categoryId: formData.categoryId,
          description: formData.description,
          isActive: formData.isActive,
          imageUrl: '' // Başlangıçta boş, resim upload edildikten sonra güncellenecek
        });
        
        console.log('New traffic sign created:', newTrafficSign); // Debug log
        
        // Eğer resim seçilmişse ve traffic sign oluşturulduysa, resmi upload et
        if (selectedFile && newTrafficSign?.id) {
          try {
            const uploadResponse = await trafficSignApi.uploadImage(newTrafficSign.id, selectedFile);
          } catch (uploadError) {
            console.warn('Resim yükleme başarısız, ama traffic sign oluşturuldu:', uploadError);
            navigate('/traffic-signs?success=created&warning=image-failed');
            return;
          }
        }
        
        setSnackbarMessage('Trafik işareti başarıyla kaydedildi!');
      }
      
      // Navigate ile success mesajı gönder
      const successMessage = isEditMode ? 'updated' : 'created';
      navigate(`/traffic-signs?success=${successMessage}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      navigate(`/traffic-signs?error=${encodeURIComponent(errorMessage)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
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
              {isEditMode ? 'Trafik İşareti Düzenle' : 'Yeni Trafik İşareti Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut trafik işaretini düzenleyin ve güncelleyin' 
                : 'Yeni bir trafik işareti ekleyin'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/traffic-signs')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            İşaret Listesine Dön
          </Button>
        </Box>
      </Box>
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <LoadingIndicator 
          text="Trafik işareti bilgileri yükleniyor..." 
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
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              İşaret Bilgileri
            </Typography>
            
            {/* İşaret Adı */}
            <Box mb={3}>
              <Typography fontWeight={500} mb={1}>
                İşaret Adı
              </Typography>
              <TextField
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                placeholder="İşaret adını girin..."
                required
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Box>
            
            {/* Kategori */}
            <Box mb={3}>
              <Typography fontWeight={500} mb={1}>
                Kategori
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  label="Kategori"
                  onChange={handleSelectChange as any}
                  sx={{ 
                    borderRadius: 2,
                    height: 56
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300 }
                    }
                  }}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* İşaret Görseli */}
            <Box mb={3}>
              <Typography fontWeight={500} mb={1}>
                İşaret Görseli
              </Typography>
              
              {formData.imageUrl ? (
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
                      image={formData.imageUrl}
                      alt="Trafik İşareti"
                      sx={{ 
                        height: 200,
                        maxWidth: 300,
                        objectFit: 'contain',
                        bgcolor: 'grey.100',
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
                    p: 4,
                    mb: 2,
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary" variant="subtitle1">
                    İşaret görseli yüklemek için tıklayın
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    veya sürükleyip bırakın
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
              
              <Typography variant="caption" color="text.secondary">
                Yüklenecek görselin net ve anlaşılır olmasına dikkat edin. PNG veya JPEG formatında olmalıdır.
              </Typography>
            </Box>
            
            {/* Açıklama */}
            <Box mb={3}>
              <Typography fontWeight={500} mb={1}>
                İşaret Açıklaması
              </Typography>
              <TextField
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="İşaretin açıklamasını girin..."
                required
                InputProps={{
                  sx: {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* İşaret Özellikleri */}
            <Box mb={1}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                İşaret Özellikleri
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/traffic-signs')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
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
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isEditMode ? 'İşareti Güncelle' : 'İşareti Kaydet'}
            </Button>
          </Box>
        </form>
      )}

      {/* Loading göstergesi */}
      {(loading || imageUploading) && (
        <LoadingIndicator 
          text={imageUploading ? "Resim yükleniyor..." : "Kayıt işlemi devam ediyor..."} 
          size="medium" 
          fullScreen={true} 
          showBackground={true} 
        />
      )}
      
      {/* Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEditTrafficSign;
