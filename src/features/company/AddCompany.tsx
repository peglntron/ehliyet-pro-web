import React, { useState } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { createCompany } from './api/useCompanies';
import LoadingIndicator from '../../components/LoadingIndicator';

// Alt bileşenleri import ediyoruz
import CompanyInfoForm from './components/CompanyInfoForm';

const AddCompany: React.FC = () => {
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    province: string;
    district: string;
    address: string;
    email?: string;
    taxNumber?: string;
    registrationDate: string;
    licenseEndDate: string;
    owner: string;
    ownerPhone: string;
    authorizedPerson?: string;
    website?: string;
    description?: string;
    isActive: boolean;
  }>({
    name: '',
    province: '',
    district: '',
    address: '',
    email: '',
    taxNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    licenseEndDate: '',
    owner: '',
    ownerPhone: '',
    authorizedPerson: '',
    website: '',
    description: '',
    isActive: true
  });
  
  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    province?: string;
    district?: string;
    address?: string;
    email?: string;
    taxNumber?: string;
    licenseEndDate?: string;
    owner?: string;
    ownerPhone?: string;
  }>({});
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Tab değişimi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));
  };
  
  // Form değişikliklerini güncelle
  const handleFormChange = (updatedData: Partial<typeof formData>) => {
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));
  };
  
  // Hata durumlarını güncelle
  const handleErrorChange = (updatedErrors: Partial<typeof errors>) => {
    setErrors(prev => ({
      ...prev,
      ...updatedErrors
    }));
  };
  
  // Form gönderim işlemi
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Eğer zaten loading ise, tekrar submit etme
    if (loading) {
      return;
    }
    
    // Form doğrulama
    const newErrors: typeof errors = {};
    
    // İşletme bilgileri
    if (!formData.name) newErrors.name = 'Sürücü kursu adı gereklidir';
    if (!formData.province) newErrors.province = 'İl seçimi gereklidir';
    if (!formData.district) newErrors.district = 'İlçe seçimi gereklidir';
    if (!formData.address) newErrors.address = 'Adres gereklidir';
    if (!formData.owner) newErrors.owner = 'Şirket sahibi adı ve soyadı gereklidir';
    if (!formData.ownerPhone) newErrors.ownerPhone = 'Şirket sahibi telefon numarası gereklidir';
    
    // Email formatı kontrolü (opsiyonel)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Geçerli bir email adresi girin';
      }
    }
    
    // Telefon formatı kontrolü - 5 ile başlayan 10 hane
    if (formData.ownerPhone) {
      const phoneRegex = /^5[0-9]{9}$/;
      const cleanPhone = formData.ownerPhone.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.ownerPhone = 'Telefon numarası 5 ile başlamalı ve 10 hane olmalıdır';
      }
    }
    
    // İsim soyisim kontrolü - owner'dan ayır
    if (formData.owner) {
      const nameParts = formData.owner.trim().split(/\s+/);
      if (nameParts.length < 2) {
        newErrors.owner = 'Lütfen ad ve soyad girin';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarMessage('Lütfen zorunlu alanları doldurunuz!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Loading state'i hemen set et
    console.log('Setting loading to true');
    setLoading(true);
    
    // State update için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Owner'dan ad ve soyad çıkar
    const ownerParts = formData.owner.trim().split(/\s+/);
    const firstName = ownerParts.slice(0, -1).join(' ') || ownerParts[0];
    const lastName = ownerParts[ownerParts.length - 1];
    
    // Admin API ile işletme oluştur (user bilgisi manuel eklenmeli)
    const submitData = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      province: formData.province,
      district: formData.district,
      taxNumber: formData.taxNumber,
      owner: formData.owner,
      ownerPhone: formData.ownerPhone,
      registrationDate: formData.registrationDate,
      licenseEndDate: formData.licenseEndDate || undefined,
      authorizedPerson: formData.authorizedPerson,
      website: formData.website,
      description: formData.description
    };

    console.log('Submit Data:', submitData);

    try {
      const result = await createCompany(submitData);
      console.log('Success result:', result);
      
      setSnackbarMessage(`İşletme başarıyla oluşturuldu!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setLoading(false);
      
      // 2 saniye sonra Company listesine yönlendir
      setTimeout(() => {
        navigate('/company');
      }, 2000);
      
    } catch (error: any) {
      console.error('Create error:', error);
      setLoading(false);
      setSnackbarMessage(error.message || 'İşletme oluşturulurken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      {/* Başlık ve Geri Butonu */}
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
                color: (theme) => theme.palette.primary.main,
                mb: 1
              }}
            >
              Yeni İşletme Ekle
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Yeni bir sürücü kursu işletmesi oluşturun. Otomatik kullanıcı oluşturulacak ve SMS gönderilecek.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/company')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Listeye Dön
          </Button>
        </Box>
      </Box>
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <LoadingIndicator 
          text="İşletme oluşturuluyor..." 
          size="medium" 
          showBackground={true} 
        />
      ) : (
        <Box>
          {/* Form */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: 400 }}>
              <CompanyInfoForm 
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
                onErrorChange={handleErrorChange}
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            gap={2} 
            mb={4}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/company')}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {loading ? 'Oluşturuluyor...' : 'İşletmeyi Kaydet'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Snackbar Alert - Her zaman göster */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%', minWidth: 300 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCompany;