import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, InputAdornment,
  Fab, Stack, Alert, Pagination, Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TrafficSignCard from './components/TrafficSignCard';
import { useTrafficSigns, useTrafficSignCategories } from './api/useTrafficSigns';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';

const TrafficSignList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Sayfa başına 12 öğe
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // API hook'larını kullan
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useTrafficSignCategories();
  const { trafficSigns, isLoading: signsLoading, error: signsError, refetch } = useTrafficSigns();
  
  // URL parametrelerini kontrol et ve mesajları göster
  useEffect(() => {
    const successParam = searchParams.get('success');
    const warningParam = searchParams.get('warning');
    const errorParam = searchParams.get('error');
    
    if (successParam) {
      let message = '';
      switch (successParam) {
        case 'created':
          message = warningParam === 'image-failed' 
            ? 'Trafik işareti oluşturuldu ancak resim yüklenemedi!'
            : 'Trafik işareti başarıyla oluşturuldu!';
          break;
        case 'updated':
          message = 'Trafik işareti başarıyla güncellendi!';
          break;
        default:
          message = 'İşlem başarıyla tamamlandı!';
      }
      
      setSnackbarMessage(message);
      setSnackbarSeverity(warningParam === 'image-failed' ? 'warning' : 'success');
      setSnackbarOpen(true);
      
      // URL'den parametreleri temizle
      setSearchParams({});
    } else if (errorParam) {
      setSnackbarMessage(`İşlem başarısız: ${decodeURIComponent(errorParam)}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      // URL'den parametreyi temizle
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Yeni trafik işareti ekleme sayfasına yönlendirme işlevi
  const handleAddTrafficSign = () => {
    navigate('/traffic-signs/add');
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Filtreleme işlemi
  const filteredTrafficSigns = trafficSigns.filter((sign) => {
    const matchesSearch = 
      sign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (sign.description && sign.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || sign.categoryId === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && sign.isActive) ||
      (filterStatus === 'inactive' && !sign.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination hesaplamaları
  const totalItems = filteredTrafficSigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrafficSigns = filteredTrafficSigns.slice(startIndex, endIndex);

  // Sayfa değişimi
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtre değişikliklerinde sayfa 1'e dön
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: any) => {
    setFilterCategory(e.target.value as string);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: any) => {
    setFilterStatus(e.target.value as string);
    setCurrentPage(1);
  };

  const isLoading = categoriesLoading || signsLoading;

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
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
              Trafik İşaretleri Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Trafik işaretlerini yönetin ve düzenleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddTrafficSign}
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
            Yeni İşaret Ekle
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
            placeholder="İşaretleri ara..."
            value={searchTerm}
            onChange={handleSearchChange}
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
            <InputLabel>Kategori Seçin</InputLabel>
            <Select
              value={filterCategory}
              label="Kategori Seçin"
              onChange={handleCategoryChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Tüm Kategoriler</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus}
              label="Durum"
              onChange={handleStatusChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Error State */}
      {(categoriesError || signsError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {categoriesError || signsError}
        </Alert>
      )}

      {/* Trafik İşaretleri */}
      <Box sx={{ mt: 3 }}>
        {isLoading ? (
          <LoadingIndicator 
            text="Trafik işaretleri yükleniyor..." 
            size="medium" 
            showBackground={true}
          />
        ) : filteredTrafficSigns.length > 0 ? (
          <>
            {/* Sayfa bilgisi */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Toplam {totalItems} sonuçtan {startIndex + 1}-{Math.min(endIndex, totalItems)} arası gösteriliyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sayfa {currentPage} / {totalPages}
              </Typography>
            </Box>

            {/* Traffic Signs Cards */}
            {paginatedTrafficSigns.map((sign) => (
              <TrafficSignCard key={sign.id} trafficSign={sign} onUpdate={refetch} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4, 
                mb: 2,
                '& .MuiPagination-root': {
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      fontWeight: 600
                    }
                  }
                }
              }}>
                <Pagination
                  count={totalPages}
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
            <WarningIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Trafik işareti bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir trafik işareti ekleyin
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Floating Action Button - Mobile için */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddTrafficSign}
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

export default TrafficSignList;
