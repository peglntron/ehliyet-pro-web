import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useLessons, getUnitById, unitApi, type UnitFormData } from './api/useLessons';
import { useUnitContents, unitContentApi } from './api/useUnitContents';

const AddEditUnitNew: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<UnitFormData>({
    lessonId: '',
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
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // API Hooks
  const { lessons, loading: lessonsLoading } = useLessons();
  const { contents, loading: contentsLoading, refetch: refetchContents } = useUnitContents(id);
  
  // Düzenleme modunda üniteyi yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getUnitById(id)
        .then(unit => {
          setFormData({
            lessonId: unit.lessonId,
            name: unit.name,
            displayOrder: unit.displayOrder,
            isActive: unit.isActive
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading unit:', error);
          setSnackbarMessage('Ünite yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name as string]: (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') ? checked :
                        (e.target instanceof HTMLInputElement && e.target.type === 'number') ? (value === '' ? 1 : parseInt(value as string)) :
                        value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.lessonId) {
      setSnackbarMessage('Lütfen bir ders seçin!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!formData.name.trim()) {
      setSnackbarMessage('Ünite adı zorunludur!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (formData.name.trim().length < 2 || formData.name.trim().length > 200) {
      setSnackbarMessage('Ünite adı 2-200 karakter arasında olmalıdır!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode && id) {
        await unitApi.update(id, formData);
        navigate('/lessons?success=updated');
      } else {
        await unitApi.create(formData);
        navigate('/lessons?success=created');
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

  // İçerik ekleme sayfasına git
  const handleAddContent = () => {
    if (id) {
      navigate(`/units/${id}/contents/add`);
    }
  };

  // İçerik silme dialog açma
  const handleDeleteClick = (contentId: string) => {
    setContentToDelete(contentId);
    setDeleteDialogOpen(true);
  };

  // İçerik silme dialog kapatma
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContentToDelete(null);
  };

  // İçerik silme
  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return;

    try {
      setDeleting(true);
      await unitContentApi.delete(contentToDelete);
      
      setSnackbarMessage('İçerik başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // İçerikleri yeniden yükle
      refetchContents();
      
      // Dialog'u kapat
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbarMessage('İçerik silinirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
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
              {isEditMode ? 'Ünite Düzenle' : 'Yeni Ünite Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut üniteyi düzenleyin ve güncelleyin' 
                : 'Sistemde kullanılacak yeni ünite oluşturun'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/lessons')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Ünite Listesine Dön
          </Button>
        </Box>
      </Box>
      
      {loading || lessonsLoading ? (
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
              Ünite Bilgileri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Ders</InputLabel>
                  <Select
                    name="lessonId"
                    value={formData.lessonId}
                    label="Ders"
                    onChange={handleChange as any}
                    disabled={isEditMode}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {lessons.map(lesson => (
                      <MenuItem key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Ünite Adı"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Örn: Trafik Kuralları, Araç Bakımı..."
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  helperText="Ünite adı 2-200 karakter arasında olmalıdır"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="displayOrder"
                  label="Ünite Numarası"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 1 }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                  helperText="Ünitenin görüntülenme sırası"
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
                    Aktif üniteler öğrenciler tarafından görüntülenebilir
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* İçerikler (Sadece düzenleme modunda) */}
          {isEditMode && (
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Ünite İçerikleri ({contents.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddContent}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  İçerik Ekle
                </Button>
              </Box>

              {contentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : contents.length === 0 ? (
                <Alert severity="info">
                  Bu üniteye henüz içerik eklenmemiş. "İçerik Ekle" butonuna tıklayarak yeni içerik ekleyebilirsiniz.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {contents.map((content, index) => (
                    <Paper 
                      key={content.id}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2 }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Chip 
                              label={`Sıra: ${content.displayOrder || index + 1}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {content.isActive ? (
                              <Chip label="Aktif" size="small" color="success" />
                            ) : (
                              <Chip label="Pasif" size="small" color="default" />
                            )}
                          </Box>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {content.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {content.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1} ml={2}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/units/contents/view/${content.id}`)}
                          >
                            Görüntüle
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate(`/units/${id}/contents/edit/${content.id}`)}
                          >
                            Düzenle
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(content.id)}
                            title="Sil"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          )}
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/lessons')}
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
              {saving ? 'Kaydediliyor...' : (isEditMode ? 'Üniteyi Güncelle' : 'Üniteyi Kaydet')}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          İçeriği Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bu içeriği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddEditUnitNew;
