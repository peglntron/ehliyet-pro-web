import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, InputAdornment,
  Fab, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CompanyCard from './components/CompanyCard';
import { useCompanies } from './api/useCompanies';
import { useLocations } from '../../api/useLocations';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const { companies: allCompanies, loading, error, refetch } = useCompanies();
  const { cities, fetchCities } = useLocations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLicense, setFilterLicense] = useState('all');

  // İlleri yükle
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Yeni şirket ekleme sayfasına yönlendirme işlevi
  const handleAddCompany = () => {
    navigate('/company/add');
  };

  // Artık loading durumu hook'tan geliyor, useEffect'e gerek yok

  // Lisans durumunu kontrol eden yardımcı fonksiyon
  const getLicenseStatus = (endDate: string): 'expired' | 'expiring' | 'valid' => {
    if (!endDate) return 'expired';
    
    const licenseEnd = new Date(endDate);
    
    // Geçersiz tarih kontrolü
    if (isNaN(licenseEnd.getTime())) {
      return 'expired';
    }
    
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    if (licenseEnd < today) {
      return 'expired';
    } else if (licenseEnd < oneMonthLater) {
      return 'expiring';
    } else {
      return 'valid';
    }
  };

  // Filtreleme işlemi
  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = !filterProvince || company.province === filterProvince;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && company.isActive) ||
      (filterStatus === 'inactive' && !company.isActive);
    
    const licenseStatus = getLicenseStatus(company.licenseEndDate);
    const matchesLicense = filterLicense === 'all' || 
      (filterLicense === 'valid' && licenseStatus === 'valid') ||
      (filterLicense === 'expiring' && licenseStatus === 'expiring') ||
      (filterLicense === 'expired' && licenseStatus === 'expired');
    
    return matchesSearch && matchesProvince && matchesStatus && matchesLicense;
  });

  // İl listesini veritabanından al (şirket verileri yerine)
  // Eğer veritabanından gelmiyorsa, fallback olarak mevcut şirketlerden al
  const provinceOptions = cities.length > 0 
    ? cities.map(city => city.name).sort()
    : [...new Set(allCompanies.map(company => company.province))].sort();

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
              Sürücü Kursları Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sürücü kurslarını yönetin ve düzenleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddCompany}
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
            Yeni Kurs Ekle
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
            placeholder="Sürücü kursu ara..."
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
            <InputLabel>İl</InputLabel>
            <Select
              value={filterProvince}
              label="İl"
              onChange={(e) => setFilterProvince(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Tüm İller</MenuItem>
              {provinceOptions.map((province) => (
                <MenuItem key={province} value={province}>
                  {province}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <FormControl sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Lisans</InputLabel>
            <Select
              value={filterLicense}
              label="Lisans"
              onChange={(e) => setFilterLicense(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="valid">Geçerli</MenuItem>
              <MenuItem value="expiring">Yakında Bitecek</MenuItem>
              <MenuItem value="expired">Süresi Dolmuş</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Sürücü Kursları Listesi */}
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <LoadingIndicator 
            text="Sürücü kursları yükleniyor..." 
            size="medium" 
            showBackground={true}
          />
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              getLicenseStatus={getLicenseStatus}
              onStatusChanged={refetch}
            />
          ))
        ) : (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 3 
          }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Sürücü kursu bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir sürücü kursu ekleyin
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Floating Action Button - Mobile için */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddCompany}
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
    </Box>
  );
};

export default CompanyList;
