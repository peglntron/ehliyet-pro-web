import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { getCompanyById, updateCompany } from './api/useCompanies';
import type { Company } from './types/types';
import LoadingIndicator from '../../components/LoadingIndicator';

// Alt bileşenleri import ediyoruz
import CompanyInfoForm from './components/CompanyInfoForm';

const AddEditCompany: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = Boolean(id);
  
  // State tanımlamaları
  const [loading, setLoading] = useState(isEditMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    province: string;
    district: string;
    address: string;
    ownerPhone: string;
    email?: string;
    taxNumber?: string;
    registrationDate: string;
    licenseEndDate: string;
    owner: string;
    logo?: string;
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
    ownerPhone: '',
    email: '',
    taxNumber: '',
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
    ownerPhone?: string;
    email?: string;
    taxNumber?: string;
    licenseEndDate?: string;
    owner?: string;
  }>({});
  
  const { showSnackbar } = useSnackbar();
  
  // Kaydedilmemiş değişiklik uyarısı
  useUnsavedChangesWarning({ 
    hasUnsavedChanges,
    message: 'Yaptığınız değişiklikler kaydedilmedi. Sayfadan ayrılırsanız tüm değişiklikler kaybolacak. Devam etmek istiyor musunuz?'
  });
    // Navigation handler
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };
  
  // Unsaved dialog onayı
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };
  
  // Unsaved dialog iptali
  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };
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
          // COMPANY_ADMIN kullanıcısının phone'unu bul
          const companyAdmin = company.users?.find(u => u.role === 'COMPANY_ADMIN');
          
          const loadedData = {
            name: company.name || '',
            province: company.province || '',
            district: company.district || '',
            address: company.address || '',
            ownerPhone: companyAdmin?.phone || '',
            email: company.email || '',
            taxNumber: company.taxNumber || '',
            registrationDate: company.registrationDate ? new Date(company.registrationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            licenseEndDate: company.licenseEndDate ? new Date(company.licenseEndDate).toISOString().split('T')[0] : '',
            owner: company.owner || '',
            logo: company.logo || undefined,
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
          };
          setFormData(loadedData);
          setInitialFormData(loadedData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading company:', error);
          showSnackbar('Sürücü kursu yüklenirken hata oluştu!', 'error');
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Form alanları değişikliklerini yönet
  const handleFormChange = (updatedData: Partial<typeof formData>) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        ...updatedData
      };
      // Değişiklik olup olmadığını kontrol et
      if (initialFormData) {
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(initialFormData);
        setHasUnsavedChanges(hasChanges);
      }
      return newData;
    });
  };
  
  // Hata durumlarını güncelle
  const handleErrorChange = (updatedErrors: Partial<typeof errors>) => {
    setErrors(prev => ({
      ...prev,
      ...updatedErrors
    }));
  };
  
  // Kullanıcı oluşturma işlemi
  const handleUserCreated = (userId: string) => {
    showSnackbar('Kullanıcı başarıyla oluşturuldu!', 'success');
  };
  
  // Form gönderim işlemi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama - Sadece temel bilgiler zorunlu
    const newErrors: typeof errors = {};
    
    if (!formData.name) newErrors.name = 'Sürücü kursu adı gereklidir';
    if (!formData.owner) newErrors.owner = 'Şirket sahibi adı gereklidir';
    
    // Telefon formatı kontrolü (varsa)
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.ownerPhone && !phoneRegex.test(formData.ownerPhone.replace(/\s/g, ''))) {
      newErrors.ownerPhone = 'Geçerli bir telefon numarası girin (10 hane)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSnackbar('Lütfen form hatalarını düzeltiniz!', 'error');
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
          setHasUnsavedChanges(false);
          showSnackbar('Sürücü kursu başarıyla güncellendi!', 'success');
          setTimeout(() => navigate('/company'), 1500);
        })
        .catch(error => {
          console.error('Update error:', error);
          showSnackbar('Güncelleme sırasında hata oluştu!', 'error');
        });
    } else {
      // Create işlemi - bu dosyada şimdilik konsola log, çünkü create başka yerde
      console.log('Create Data:', submitData);
      showSnackbar('Oluşturma işlemi henüz aktif değil', 'info');
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
            onClick={() => handleNavigation('/company')}
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
            {/* Form Content */}
            <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: 400 }}>
              <CompanyInfoForm 
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
                onErrorChange={handleErrorChange}
                companyId={id}
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={2} 
            mb={4}
          >
            <Button
              variant="outlined"
              onClick={() => handleNavigation('/company')}
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
              Kaydet
            </Button>
          </Box>
        </form>
      )}
      
      {/* Unsaved Changes Dialog */}
      <Dialog
        open={showUnsavedDialog}
        onClose={handleCancelNavigation}
      >
        <DialogTitle>Kaydedilmemiş Değişiklikler</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yaptığınız değişiklikler kaydedilmedi. Sayfadan ayrılırsanız tüm değişiklikler kaybolacak. Devam etmek istiyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation} color="primary">
            Kal
          </Button>
          <Button onClick={handleConfirmNavigation} color="error" variant="contained">
            Değişiklikleri İptal Et ve Çık
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddEditCompany;