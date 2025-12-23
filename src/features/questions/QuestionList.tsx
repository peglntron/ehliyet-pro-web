import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  Fab,
  Stack,
  Pagination,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QuestionCard from './components/QuestionCard';
import { useQuestions, useLessons, useUnits } from './api/useQuestions';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';

const QuestionList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);
  const [filterCikmis, setFilterCikmis] = useState<boolean | undefined>(undefined);
  const [filterAnimasyonlu, setFilterAnimasyonlu] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  
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
          message = 'Soru başarıyla oluşturuldu!';
          break;
        case 'updated':
          message = 'Soru başarıyla güncellendi!';
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

  // API Hooks
  const { lessons } = useLessons();
  const { units } = useUnits(selectedLessonId);
  const { 
    questions, 
    loading, 
    error, 
    pagination, 
    refreshQuestions 
  } = useQuestions({
    lessonId: selectedLessonId || undefined,
    unitId: selectedUnitId || undefined,
    isActive: filterStatus,
    cikmis: filterCikmis,
    animasyonlu: filterAnimasyonlu,
    page: currentPage,
    limit: 12
  });
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Yeni soru ekleme sayfasına yönlendirme işlevi
  const handleAddQuestion = () => {
    navigate('/questions/add');
  };

  // Ders değiştiğinde üniteyi sıfırla
  const handleLessonChange = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedUnitId('');
    setCurrentPage(1);
  };

  // Ünite değiştiğinde sayfayı sıfırla
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    setCurrentPage(1);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLessonId('');
    setSelectedUnitId('');
    setFilterStatus(undefined);
    setFilterCikmis(undefined);
    setFilterAnimasyonlu(undefined);
    setCurrentPage(1);
  };

  // Sayfa değişimi
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Arama terimi değiştiğinde sayfa sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Eğer arama terimi varsa, istemci tarafında da filtrele
  const filteredQuestions = searchTerm.trim() 
    ? questions.filter(question => 
        question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.unitName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : questions;
  
  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto', // Tüm sayfa kaydırılabilir
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }} 
          gap={{ xs: 2, md: 0 }}
          width="100%"
        >
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Soru Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sürücü kursu sorularını yönetin ve düzenleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddQuestion}
            sx={{ 
              minWidth: 180,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' }
            }}
          >
            Yeni Soru Ekle
          </Button>
        </Box>
      </Box>

      {/* Arama ve Filtreleme */}
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Stack 
          direction={{ xs: 'column', lg: 'row' }} 
          spacing={2}
          width="100%"
        >
          <TextField
            placeholder="Soruları ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            variant="outlined"
            size="medium"
            fullWidth
          />
          
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>Ders Seçin</InputLabel>
            <Select
              value={selectedLessonId}
              label="Ders Seçin"
              onChange={(e) => handleLessonChange(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Tüm Dersler</MenuItem>
              {lessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ünite Seçimi - sadece ders seçiliyse göster */}
          {selectedLessonId && (
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel>Ünite Seçin</InputLabel>
              <Select
                value={selectedUnitId}
                label="Ünite Seçin"
                onChange={(e) => handleUnitChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tüm Üniteler</MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus === undefined ? 'all' : filterStatus ? 'active' : 'inactive'}
              label="Durum"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') setFilterStatus(undefined);
                else if (value === 'active') setFilterStatus(true);
                else setFilterStatus(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </Select>
          </FormControl>

          {/* Filtreleri Temizle Butonu */}
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            Temizle
          </Button>

          {/* Yenile Butonu */}
          <Button
            variant="outlined"
            onClick={refreshQuestions}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            Yenile
          </Button>
        </Stack>
      </Paper>

      {/* Error Handling */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>Hata: {error}</Typography>
        </Paper>
      )}

      {/* Sorular */}
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <LoadingIndicator 
            text="Sorular yükleniyor..." 
            size="medium" 
            showBackground={true}
          />
        ) : filteredQuestions.length > 0 ? (
          <>
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 3 
          }}>
            <QuizIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Soru bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir soru ekleyin
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Floating Action Button - Mobile için */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddQuestion}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          width: 64,
          height: 64,
          display: { xs: 'flex', md: 'none' },
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default QuestionList;