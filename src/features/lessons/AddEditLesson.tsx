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
import { getLessonById, lessonApi, type LessonFormData } from './api/useLessons';

const AddEditLesson: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<LessonFormData>({
    name: '',
    displayOrder: 1,
    isActive: true
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Düzenleme modunda dersi yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getLessonById(id)
        .then(lesson => {
          setFormData({
            name: lesson.name,
            displayOrder: lesson.displayOrder,
            isActive: lesson.isActive
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading lesson:', error);
          setSnackbarMessage('Ders yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setSnackbarMessage('Ders adı zorunludur!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (formData.name.trim().length < 2 || formData.name.trim().length > 200) {
      setSnackbarMessage('Ders adı 2-200 karakter arasında olmalıdır!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode && id) {
        await lessonApi.update(id, formData);
        navigate('/lessons-management?success=updated');
      } else {
        await lessonApi.create(formData);
        navigate('/lessons-management?success=created');
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
              {isEditMode ? 'Ders Düzenle' : 'Yeni Ders Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut dersi düzenleyin ve güncelleyin' 
                : 'Sistemde kullanılacak yeni ders oluşturun'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/lessons-management')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Ders Listesine Dön
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
              Ders Bilgileri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Ders Adı"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Örn: Trafik Adabı, Motor Bilgisi, İlk Yardım..."
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  helperText="Ders adı 2-200 karakter arasında olmalıdır"
                />
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
                  helperText="Dersin görüntülenme sırası"
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
                    Aktif dersler öğrenciler tarafından görüntülenebilir
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/lessons-management')}
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
              {saving ? 'Kaydediliyor...' : (isEditMode ? 'Dersi Güncelle' : 'Dersi Kaydet')}
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

export default AddEditLesson;
