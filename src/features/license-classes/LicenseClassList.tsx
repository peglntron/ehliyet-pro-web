import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, InputAdornment,
  Fab, Stack, Snackbar, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  DriveEta as DriveEtaIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LicenseClassCard from './components/LicenseClassCard';
import { useLicenseClasses } from './api/useLicenseClasses';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';

const LicenseClassList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allLicenseClasses, loading } = useLicenseClasses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
          message = 'Ehliyet sınıfı başarıyla oluşturuldu!';
          break;
        case 'updated':
          message = 'Ehliyet sınıfı başarıyla güncellendi!';
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

  // Yeni ehliyet sınıfı ekleme sayfasına yönlendirme işlevi
  const handleAddLicenseClass = () => {
    navigate('/license-classes/add');
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Filtreleme işlemi
  const filteredLicenseClasses = allLicenseClasses.filter((licenseClass) => {
    const matchesSearch = 
      licenseClass.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
      licenseClass.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licenseClass.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && licenseClass.isActive) ||
      (filterStatus === 'inactive' && !licenseClass.isActive);
    
    return matchesSearch && matchesStatus;
  });

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
              Ehliyet Sınıfları Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ehliyet sınıflarını yönetin ve düzenleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddLicenseClass}
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
            Yeni Sınıf Ekle
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
            placeholder="Ehliyet sınıflarını ara..."
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

          <FormControl sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus}
              label="Durum"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Ehliyet Sınıfları */}
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <LoadingIndicator 
            text="Ehliyet sınıfları yükleniyor..." 
            size="medium" 
            showBackground={true}
          />
        ) : filteredLicenseClasses.length > 0 ? (
          filteredLicenseClasses.map((licenseClass) => (
            <LicenseClassCard key={licenseClass.id} licenseClass={licenseClass} />
          ))
        ) : (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 3 
          }}>
            <DriveEtaIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ehliyet sınıfı bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir ehliyet sınıfı ekleyin
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Floating Action Button - Mobile için */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddLicenseClass}
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

export default LicenseClassList;
