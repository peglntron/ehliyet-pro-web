import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Paper, FormControl,
  InputLabel, Select, MenuItem, FormHelperText,
  InputAdornment, Button, Avatar, CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Domain as DomainIcon,
  Email as EmailIcon,
  Numbers as NumbersIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useLocations, type District } from '../../../api/useLocations';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { getImageUrl } from '../../../utils/api';

interface CompanyInfoFormProps {
  formData: {
    name: string;
    province: string;
    district: string;
    address: string;
    email?: string;
    taxNumber?: string;
    owner: string;
    logo?: string;
  };
  errors: {
    name?: string;
    province?: string;
    district?: string;
    address?: string;
    email?: string;
    taxNumber?: string;
    owner?: string;
  };
  onChange: (data: Partial<CompanyInfoFormProps['formData']>) => void;
  onErrorChange: (errors: Partial<CompanyInfoFormProps['errors']>) => void;
  companyId?: string; // Düzenleme modunda şirket ID'si
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange, 
  onErrorChange,
  companyId
}) => {
  const { cities, loading: citiesLoading, fetchCities, fetchDistricts } = useLocations();
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const { showSnackbar } = useSnackbar();
  
  // İlleri yükle (component mount olduğunda)
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  
  // İl değiştiğinde ilçeleri getir
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.province) {
        const selectedCity = cities.find(c => c.name === formData.province);
        if (selectedCity) {
          setDistrictLoading(true);
          try {
            const districtData = await fetchDistricts(selectedCity.id);
            setDistricts(districtData);
          } catch (err) {
            console.error('İlçeler yüklenirken hata:', err);
            setDistricts([]);
          } finally {
            setDistrictLoading(false);
          }
        }
      } else {
        setDistricts([]);
      }
    };
    
    loadDistricts();
  }, [formData.province, cities, fetchDistricts]);
  
  // Form field değişikliklerini handle et
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    
    // Hata varsa temizle
    if (errors[name as keyof typeof errors]) {
      onErrorChange({ [name as string]: undefined });
    }
  };
  
  // Select bileşeni için değişiklik işleyicisi
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'province') {
      // İl değiştiğinde ilçeyi sıfırla
      onChange({ 
        province: value as string,
        district: '' 
      });
    } else {
      onChange({ [name as string]: value });
    }
    
    // Hata varsa temizle
    if (errors[name as keyof typeof errors]) {
      onErrorChange({ [name as string]: undefined });
    }
  };
  
  // Logo upload işleyicisi
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !companyId) return;
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Logo dosyası 5MB\'dan küçük olmalıdır', 'error');
      return;
    }
    
    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Sadece JPG, PNG veya WebP formatları desteklenmektedir', 'error');
      return;
    }
    
    try {
      setLogoUploading(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('logo', file);
      formDataUpload.append('companyId', companyId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${API_URL}/api/companies/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: formDataUpload
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Logo yükleme başarısız'}`);
      }
      
      const result = await response.json();
      if (result.success && result.data?.logoUrl) {
        onChange({ logo: result.data.logoUrl });
        // Header'daki logo'yu güncelle
        window.dispatchEvent(new CustomEvent('logoUpdated'));
        showSnackbar('Logo başarıyla yüklendi', 'success');
      } else {
        throw new Error(result.message || 'Logo yükleme başarısız');
      }
    } catch (error) {
      console.error('Logo upload hatası:', error);
      showSnackbar(error instanceof Error ? error.message : 'Logo yükleme sırasında hata oluştu', 'error');
    } finally {
      setLogoUploading(false);
    }
  };
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 3,
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 4 
        }}
      >
        <DomainIcon color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>
          Kurs Bilgileri
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Logo Yükleme - Sadece düzenleme modunda */}
        {companyId && (
          <Box>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessIcon fontSize="small" color="primary" />
              Şirket Logosu
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {formData.logo && (
                <Avatar
                  sx={{ width: 80, height: 80 }}
                  src={getImageUrl(formData.logo)}
                  alt="Şirket Logosu"
                >
                  <BusinessIcon />
                </Avatar>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={logoUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                disabled={logoUploading}
                sx={{ borderRadius: 2 }}
              >
                {logoUploading ? 'Yükleniyor...' : (formData.logo ? 'Logo Değiştir' : 'Logo Yükle')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleLogoUpload}
                />
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPG, PNG, WebP
            </Typography>
          </Box>
        )}
        
        {/* Sürücü Kursu Adı */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="text.primary" 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BusinessIcon fontSize="small" color="primary" />
            Sürücü Kursu Adı *
          </Typography>
          <TextField
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            placeholder="Sürücü kursu adını girin..."
            required
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              sx: {
                borderRadius: 2,
                height: 56,
                fontSize: '1rem'
              }
            }}
          />
        </Box>
        
        {/* İl ve İlçe */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LocationOnIcon fontSize="small" color="primary" />
              İl *
            </Typography>
            <FormControl fullWidth required error={!!errors.province}>
              <InputLabel>İl Seçin</InputLabel>
              <Select
                name="province"
                value={cities.some(c => c.name === formData.province) ? formData.province : ''}
                label="İl Seçin"
                onChange={handleSelectChange as any}
                disabled={citiesLoading}
                sx={{ 
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }}
              >
                {cities.map(city => (
                  <MenuItem key={city.id} value={city.name}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.province && (
                <FormHelperText error>
                  {errors.province}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LocationOnIcon fontSize="small" color="primary" />
              İlçe *
            </Typography>
            <FormControl fullWidth required error={!!errors.district}>
              <InputLabel>İlçe Seçin</InputLabel>
              <Select
                name="district"
                value={districts.some(d => d.name === formData.district) ? formData.district : ''}
                label="İlçe Seçin"
                onChange={handleSelectChange as any}
                disabled={!formData.province || districtLoading}
                sx={{ 
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 300 }
                  }
                }}
              >
                {districts.map(district => (
                  <MenuItem key={district.id} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.district && (
                <FormHelperText error>
                  {errors.district}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        </Box>
        
        {/* Adres */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="text.primary" 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <LocationOnIcon fontSize="small" color="primary" />
            Adres *
          </Typography>
          <TextField
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Sürücü kursu adresini girin..."
            required
            error={!!errors.address}
            helperText={errors.address}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontSize: '1rem',
                '& .MuiInputBase-inputMultiline': {
                  lineHeight: 1.5
                }
              }
            }}
          />
        </Box>
        
        {/* Yetkili, Email ve Vergi No */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon fontSize="small" color="primary" />
              Yetkili Kişi *
            </Typography>
            <TextField
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              fullWidth
              placeholder="Yetkili kişi adını girin..."
              required
              error={!!errors.owner}
              helperText={errors.owner}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
        
        {/* Email ve Vergi Numarası */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <EmailIcon fontSize="small" color="primary" />
              Email (Opsiyonel)
            </Typography>
            <TextField
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
              placeholder="ornek@email.com"
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <NumbersIcon fontSize="small" color="primary" />
              Vergi Numarası (Opsiyonel)
            </Typography>
            <TextField
              name="taxNumber"
              value={formData.taxNumber || ''}
              onChange={handleChange}
              fullWidth
              placeholder="10 veya 11 haneli vergi numarası"
              error={!!errors.taxNumber}
              helperText={errors.taxNumber || "10-11 haneli olmalıdır"}
              inputProps={{
                maxLength: 11
              }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CompanyInfoForm;
