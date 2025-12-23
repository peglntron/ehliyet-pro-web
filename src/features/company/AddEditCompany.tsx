import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, Paper, Divider, Tabs, Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { getCompanyById, updateCompany, renewLicense } from './api/useCompanies';
import type { Company } from './types/types';
import LoadingIndicator from '../../components/LoadingIndicator';

// Alt bileşenleri import ediyoruz
import CompanyInfoForm from './components/CompanyInfoForm';
import LicenseInfoForm from './components/LicenseInfoForm';
import LocationInfoForm from './components/LocationInfoForm';
import AddLicenseModal from './components/AddLicenseModal';
import UserCreateModal from './components/UserCreateModal';
import UserManagement from './components/UserManagement';

const AddEditCompany: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // State tanımlamaları
  const [loading, setLoading] = useState(isEditMode);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    province: string;
    district: string;
    address: string;
    phone: string;
    registrationDate: string;
    licenseEndDate: string;
    owner: string;
    location: {
      latitude: string;
      longitude: string;
      mapLink?: string; // mapLink alanını ekledik
    };
    isActive: boolean;
  }>({
    name: '',
    province: '',
    district: '',
    address: '',
    phone: '',
    registrationDate: new Date().toISOString().split('T')[0],
    licenseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    owner: '',
    location: {
      latitude: '',
      longitude: '',
      mapLink: ''
    },
    isActive: true
  });
  
  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    province?: string;
    district?: string;
    address?: string;
    phone?: string;
    licenseEndDate?: string;
    owner?: string;
  }>({});
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Düzenleme modunda şirketi yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getCompanyById(id)
        .then(company => {
          setFormData({
            name: company.name || '',
            province: company.province || '',
            district: company.district || '',
            address: company.address || '',
            phone: company.phone || '',
            registrationDate: company.registrationDate ? new Date(company.registrationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            licenseEndDate: company.licenseEndDate ? new Date(company.licenseEndDate).toISOString().split('T')[0] : '',
            owner: company.owner || '',
            location: company.location ? {
              latitude: company.location.latitude?.toString() || '',
              longitude: company.location.longitude?.toString() || '',
              mapLink: company.location.mapLink || ''
            } : {
              latitude: '',
              longitude: '',
              mapLink: ''
            },
            isActive: company.isActive
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading company:', error);
          setSnackbarMessage('Sürücü kursu yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Form alanları değişikliklerini yönet
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
  
  // Lisans ekleme modalını aç/kapat
  const handleOpenLicenseModal = () => setLicenseModalOpen(true);
  const handleCloseLicenseModal = () => setLicenseModalOpen(false);
  
  // Yeni lisans ekle
  const handleAddLicense = async (data: { 
    packageId?: string; 
    customDays?: number; 
    amount?: number; 
    description?: string;
  }) => {
    if (!id) {
      setSnackbarMessage('Önce işletmeyi kaydedin');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      const result = await renewLicense(id, data);
      
      // Lisans bitiş tarihini güncelle
      setFormData(prev => ({
        ...prev,
        licenseEndDate: result.payment.endDate || result.company.licenseEndDate
      }));
      
      handleCloseLicenseModal();
      
      // Başarı mesajı göster
      const isRenewal = Boolean(formData.licenseEndDate);
      setSnackbarMessage(
        isRenewal 
          ? 'Lisans yenileme işlemi oluşturuldu. Ödeme onayını bekleniyor.' 
          : 'Lisans ekleme işlemi oluşturuldu. Ödeme onayını bekleniyor.'
      );
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding license:', error);
      setSnackbarMessage('Lisans eklenirken bir hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Kullanıcı oluşturma işlemi
  const handleUserCreated = (userId: string) => {
    setSnackbarMessage('Kullanıcı başarıyla oluşturuldu!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Form gönderim işlemi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    const newErrors: typeof errors = {};
    
    if (!formData.name) newErrors.name = 'Sürücü kursu adı gereklidir';
    if (!formData.province) newErrors.province = 'İl seçimi gereklidir';
    if (!formData.district) newErrors.district = 'İlçe seçimi gereklidir';
    if (!formData.address) newErrors.address = 'Adres gereklidir';
    if (!formData.phone) newErrors.phone = 'Telefon numarası gereklidir';
    if (!formData.licenseEndDate) newErrors.licenseEndDate = 'Lisans bitiş tarihi gereklidir';
    if (!formData.owner) newErrors.owner = 'Yetkili kişi adı gereklidir';
    
    // Telefon formatı kontrolü
    const phoneRegex = /^0[2-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (örn: 0212 123 45 67)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbarMessage('Lütfen form hatalarını düzeltiniz!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // API ile veri kaydı
    const submitData = {
      ...formData,
      location: formData.location.latitude && formData.location.longitude
        ? {
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
            mapLink: formData.location.mapLink
          }
        : undefined
    };

    if (isEditMode && id) {
      // Update işlemi
      updateCompany(id, submitData)
        .then(() => {
          setSnackbarMessage('Sürücü kursu başarıyla güncellendi!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setTimeout(() => navigate('/company'), 1500);
        })
        .catch(error => {
          console.error('Update error:', error);
          setSnackbarMessage('Güncelleme sırasında hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      // Create işlemi - bu dosyada şimdilik konsola log, çünkü create başka yerde
      console.log('Create Data:', submitData);
      setSnackbarMessage('Oluşturma işlemi henüz aktif değil');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
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
              {isEditMode ? 'Sürücü Kursu Düzenle' : 'Yeni Sürücü Kursu Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut sürücü kursunu düzenleyin ve güncelleyin' 
                : 'Yeni bir sürücü kursu oluşturun'}
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
          text="Sürücü kursu bilgileri yükleniyor..." 
          size="medium" 
          showBackground={true} 
        />
      ) : (
        /* Form */
        <form onSubmit={handleSubmit}>
          {/* Tab yapısı */}
          <Paper 
            elevation={1}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }
              }}
            >
              <Tab 
                icon={<BusinessIcon />} 
                label="Kurs Bilgileri" 
                iconPosition="start"
              />
              <Tab 
                icon={<BadgeIcon />} 
                label="Lisans Bilgileri" 
                iconPosition="start"
              />
              <Tab 
                icon={<LocationOnIcon />} 
                label="Konum Bilgileri" 
                iconPosition="start"
              />
              <Tab 
                icon={<PeopleIcon />} 
                label="Kullanıcı Yönetimi" 
                iconPosition="start"
                disabled={!isEditMode}
              />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: 400 }}>
              {activeTab === 0 && (
                <CompanyInfoForm 
                  formData={formData}
                  errors={errors}
                  onChange={handleFormChange}
                  onErrorChange={handleErrorChange}
                  companyId={id}
                />
              )}
              
              {activeTab === 1 && (
                <LicenseInfoForm 
                  formData={formData}
                  onChange={handleFormChange}
                  onAddLicense={handleOpenLicenseModal}
                  companyId={id}
                  isEditMode={isEditMode}
                />
              )}
              
              {activeTab === 2 && (
                <LocationInfoForm 
                  formData={formData}
                  onChange={handleFormChange}
                />
              )}
              
              {isEditMode && activeTab === 3 && (
                <UserManagement 
                  companyId={id || ''} 
                  onUserCreated={handleUserCreated}
                />
              )}
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
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </Box>
        </form>
      )}
      
      {/* Lisans Ekleme Modal */}
      <AddLicenseModal 
        open={licenseModalOpen}
        onClose={handleCloseLicenseModal}
        onSubmit={handleAddLicense}
        registrationDate={formData.registrationDate}
        currentLicenseEndDate={formData.licenseEndDate || undefined}
      />
      
      {/* Kullanıcı Oluşturma Modalı */}
      <UserCreateModal 
        open={userCreateModalOpen}
        onClose={() => setUserCreateModalOpen(false)}
        onSuccess={handleUserCreated}
        companyId={id || ''}
      />
      
      {/* Snackbar Alert */}
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

export default AddEditCompany;