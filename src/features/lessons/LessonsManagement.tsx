import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Fab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useLessons, lessonApi } from './api/useLessons';

const LessonsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLessonName, setSelectedLessonName] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // URL parametrelerini kontrol et ve mesajları göster
  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    
    if (successParam) {
      let message = '';
      switch (successParam) {
        case 'created':
          message = 'Ders başarıyla oluşturuldu!';
          break;
        case 'updated':
          message = 'Ders başarıyla güncellendi!';
          break;
        default:
          message = 'İşlem başarıyla tamamlandı!';
      }
      
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSearchParams({});
    } else if (errorParam) {
      setSnackbarMessage(`İşlem başarısız: ${decodeURIComponent(errorParam)}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // API Hook
  const { lessons, loading, error, refetch } = useLessons();

  // Snackbar kapatma
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Yeni ders ekleme
  const handleAddLesson = () => {
    navigate('/lessons-management/add');
  };

  // Ders düzenleme
  const handleEditLesson = (lessonId: string) => {
    navigate(`/lessons-management/edit/${lessonId}`);
  };

  // Silme dialog'unu aç
  const handleOpenDeleteDialog = (lessonId: string, lessonName: string) => {
    setSelectedLessonId(lessonId);
    setSelectedLessonName(lessonName);
    setDeleteDialogOpen(true);
  };

  // Silme dialog'unu kapat
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedLessonId(null);
    setSelectedLessonName('');
  };

  // Ders silme
  const handleDeleteLesson = async () => {
    if (!selectedLessonId) return;

    try {
      setActionLoading(true);
      await lessonApi.delete(selectedLessonId);
      setSnackbarMessage('Ders başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetch();
    } catch (err) {
      setSnackbarMessage(err instanceof Error ? err.message : 'Ders silinirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
      handleCloseDeleteDialog();
    }
  };

  // Ders durumunu değiştirme
  const handleToggleStatus = async (lessonId: string) => {
    try {
      setActionLoading(true);
      await lessonApi.toggleStatus(lessonId);
      setSnackbarMessage('Ders durumu güncellendi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetch();
    } catch (err) {
      setSnackbarMessage(err instanceof Error ? err.message : 'Durum değiştirilirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Hata durumu
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <MenuBookIcon sx={{ fontSize: 36 }} />
              Ders Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Derslerinizi görüntüleyin, düzenleyin ve yönetin
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLesson}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Yeni Ders Ekle
          </Button>
        </Box>
      </Box>

      {/* Ders Listesi Tablosu */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            p: 3 
          }}>
            <CircularProgress />
          </Box>
        ) : lessons.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz ders bulunmuyor
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Yeni bir ders ekleyerek başlayın
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLesson}
            >
              İlk Dersi Ekle
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Sıra</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ders Adı</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Ünite Sayısı</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow 
                    key={lesson.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{lesson.displayOrder}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{lesson.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={lesson._count?.units || 0}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={lesson.isActive ? 'Aktif' : 'Pasif'}
                        color={lesson.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleToggleStatus(lesson.id)}
                        disabled={actionLoading}
                        title={lesson.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {lesson.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditLesson(lesson.id)}
                        title="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(lesson.id, lesson.name)}
                        disabled={actionLoading}
                        title="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* FAB - Mobil için */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={handleAddLesson}
      >
        <AddIcon />
      </Fab>

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Dersi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{selectedLessonName}</strong> dersini silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz ve derse ait tüm üniteler de silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={actionLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleDeleteLesson} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default LessonsManagement;
