import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import WysiwygEditor from '../../components/WysiwygEditor';
import { getContentById, unitContentApi, type UnitContentFormData } from './api/useUnitContents';
import { getUnitById } from './api/useLessons';

const AddEditUnitContent: React.FC = () => {
  const navigate = useNavigate();
  const { unitId, contentId } = useParams<{ unitId: string; contentId: string }>();
  const isEditMode = Boolean(contentId);
  
  // Form state
  const [formData, setFormData] = useState<UnitContentFormData>({
    unitId: unitId || '',
    title: '',
    content: '',
    displayOrder: 1,
    isActive: true
  });
  
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Ünite adını yükle
  useEffect(() => {
    if (unitId) {
      getUnitById(unitId)
        .then(unit => setUnitName(unit.name))
        .catch(err => console.error('Error loading unit:', err));
    }
  }, [unitId]);
  
  // Düzenleme modunda içeriği yükle
  useEffect(() => {
    if (isEditMode && contentId) {
      setLoading(true);
      getContentById(contentId)
        .then(content => {
          setFormData({
            unitId: content.unitId,
            title: content.title,
            content: content.content,
            displayOrder: content.displayOrder || 1,
            isActive: content.isActive
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading content:', error);
          setSnackbarMessage('İçerik yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [contentId, isEditMode]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked :
              e.target.type === 'number' ? (value === '' ? 1 : parseInt(value)) :
              value
    }));
  };

  // Handle content change from RichTextEditor
  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setSnackbarMessage('İçerik başlığı zorunludur!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!formData.content.trim()) {
      setSnackbarMessage('İçerik metni zorunludur!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode && contentId) {
        await unitContentApi.update(contentId, formData);
        navigate(`/lessons/edit/${unitId}?success=content-updated`);
      } else {
        await unitContentApi.create(formData);
        navigate(`/lessons/edit/${unitId}?success=content-created`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = (_?: React.SyntheticEvent | Event, reason?: string) => {
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
              {isEditMode ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {unitName && `${unitName} ünitesi için `}
              {isEditMode 
                ? 'mevcut içeriği düzenleyin' 
                : 'yeni içerik oluşturun'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/lessons/edit/${unitId}`)}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Üniteye Dön
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <CircularProgress />
        </Box>
      ) : (
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
              İçerik Bilgileri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="İçerik Başlığı"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Örn: Trafik İşaretlerinin Anlamı, İlk Yardım Adımları..."
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  helperText="İçeriğin konusunu açıklayan başlık"
                />
              </Grid>
              
              <Grid item xs={12}>
                <WysiwygEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  label="İçerik Metni *"
                  required
                  rows={15}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Yazdığınız içerik direkt olarak formatlanmış şekilde görünür. Arka planda HTML olarak kaydedilir.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="displayOrder"
                  label="Sıra Numarası"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 1 }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  helperText="İçeriğin görüntülenme sırası"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 1 }}>
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
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                    Aktif içerikler öğrenciler tarafından görüntülenebilir
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/lessons/edit/${unitId}`)}
              disabled={saving}
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
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {saving ? 'Kaydediliyor...' : (isEditMode ? 'İçeriği Güncelle' : 'İçeriği Kaydet')}
            </Button>
          </Box>
        </form>
      )}

      {/* Snackbar */}
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

export default AddEditUnitContent;
