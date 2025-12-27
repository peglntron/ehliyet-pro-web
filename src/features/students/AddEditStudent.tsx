import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { getStudentById } from './api/useStudents';
import { studentAPI } from '../../api/students';
import type { CreateStudentData } from '../../api/students';
import AddPaymentModal from './components/AddPaymentModal';
import type { Student } from './types/types';
import { useLocations } from '../../api/useLocations';
import { useLicenseClassOptions } from '../../hooks/useLicenseClassOptions';

const AddEditStudent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { showSnackbar } = useSnackbar();
  const { options: licenseClassOptions, loading: licenseOptionsLoading } = useLicenseClassOptions();
  
  const [loading, setLoading] = useState(false);
  
  // İl/İlçe verileri
  const { cities, fetchCities, fetchDistricts } = useLocations();
  const [districts, setDistricts] = useState<any[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  // Ödeme Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    gender: 'MALE' as const,
    birthDate: '',
    licenseType: '',
    licenseClassId: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [initialFormData, setInitialFormData] = useState(formData);
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  
  useUnsavedChangesWarning({ hasUnsavedChanges });
    firstName: '',
    lastName: '',
    tcNo: '',
    gender: 'male',
    phone: '',
    licenseType: '',
    licenseClassId: '',          // UUID relation (opsiyonel - backend lookup yapar)
    province: '',
    district: '',
    address: '',
    notes: '',
    status: 'active'
  });
  
  // Düzenleme modunda veriyi yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getStudentById(id)
        .then(student => {
          const loadedData = {
            firstName: student.name || '',
            lastName: student.surname || '',
            tcNo: student.tcNo || '',
            gender: student.gender || 'male',
            phone: student.phone ? student.phone.replace('+90', '') : '',
            licenseType: student.licenseType || '',
            licenseClassId: student.licenseClassId || '',
            province: student.province || '',
            district: student.district || '',
            address: student.address || '',
            notes: student.notes || '',
            status: student.status || 'active'
          };
          setFormData(loadedData);
          setInitialFormData(loadedData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Öğrenci yüklenirken hata:', error);
          showSnackbar('Öğrenci bilgileri yüklenirken hata oluştu!', 'error');
          setLoading(false);
        });
    }
  }, [id, isEditMode, showSnackbar]);

  // İlleri yükle
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (formData.province) {
      const selectedCity = cities.find(c => c.name === formData.province);
      if (selectedCity) {
        setLoadingDistricts(true);
        fetchDistricts(selectedCity.id)
          .then(districtData => {
            setDistricts(districtData);
            setLoadingDistricts(false);
          })
          .catch(() => {
            setDistricts([]);
            setLoadingDistricts(false);
          });
      }
    } else {
      setDistricts([]);
      // İl temizlendiğinde ilçeyi de temizle
      if (formData.district) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    }
  }, [formData.province, cities, fetchDistricts]);
  
  // Input değişiklikleri
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Select değişiklikleri
  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  // License Class seçimi değiştiğinde UUID'yi de kaydet
  const handleLicenseClassChange = (e: SelectChangeEvent<string>) => {
    const selectedValue = e.target.value; // "B" gibi string
    const selectedOption = licenseClassOptions.find(opt => opt.value === selectedValue);
    
    setFormData(prev => ({
      ...prev,
      licenseType: selectedValue,
      licenseClassId: selectedOption?.id || '' // UUID
    }));
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔴 handleSubmit çağrıldı!');
    console.log('Form data:', formData);
    
    // Basit validasyon
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.tcNo.trim() || 
        !formData.phone.trim() || !formData.licenseType.trim()) {
      console.log('❌ Validasyon hatası - eksik alanlar');
      showSnackbar('Lütfen gerekli alanları doldurun', 'error');
      return;
    }

    // Telefon numarası validasyonu (5XXXXXXXXX formatında)
    const phoneRegex = /^5\d{9}$/; // 5XXXXXXXXX (10 hane)
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      console.log('❌ Telefon validasyon hatası:', cleanPhone);
      showSnackbar('Lütfen geçerli bir telefon numarası girin (5XXXXXXXXX - 10 hane)', 'error');
      return;
    }

    // TC Kimlik No validasyonu
    if (formData.tcNo.length !== 11) {
      showSnackbar('TC Kimlik No 11 haneli olmalıdır', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Öğrenci verisi hazırla
      const studentData: CreateStudentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        tcNo: formData.tcNo.trim(),
        phone: formData.phone.replace(/\s/g, ''), // Sadece boşlukları temizle, 0 ekleme
        gender: formData.gender === 'male' ? 'MALE' : 'FEMALE',
        birthDate: new Date('2000-01-01').toISOString(), // Varsayılan doğum tarihi
        licenseType: formData.licenseType,        // String "B" (backward compat)
        licenseClassId: formData.licenseClassId,  // UUID (yeni)
        province: formData.province || undefined,
        district: formData.district || undefined,
        address: formData.address || undefined,
        notes: formData.notes
      };

      console.log('✅ Backend\'e gönderilen veri:', studentData);

      if (isEditMode && id) {
        // Güncelleme
        await studentAPI.update(id, studentData);
        showSnackbar('Öğrenci başarıyla güncellendi', 'success');
        navigate('/students');
      } else {
        // Yeni kayıt
        const createdData = await studentAPI.create(studentData);
        
        // Ödeme modalı için student objesi hazırla
        setCreatedStudent({
          id: createdData.id,
          companyId: createdData.companyId || '',
          name: createdData.firstName,
          surname: createdData.lastName,
          tcNo: createdData.tcNo,
          phone: createdData.phone,
          gender: (createdData.gender === 'MALE' ? 'male' : 'female') as 'male' | 'female',
          licenseType: createdData.licenseType as any,
          status: createdData.status.toLowerCase() as 'active' | 'inactive' | 'completed' | 'failed',
          notes: createdData.notes || '',
          totalPayment: 0,
          paidAmount: 0,
          remainingDebt: 0,
          writtenExam: {
            status: 'not-taken',
            attempts: 0,
            maxAttempts: 4
          },
          drivingExam: {
            status: 'not-taken',
            attempts: 0,
            maxAttempts: 4
          },
          createdAt: new Date().toISOString()
        });
        
        // Ödeme modalını aç
        setPaymentModalOpen(true);
      }
    } catch (error: any) {
      console.error('Hata:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bir hata oluştu';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Ödeme modal kapandığında
  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    // Öğrenci listesine yönlendir
    setTimeout(() => navigate('/students'), 500);
  };
  
  // Ödeme başarılı eklendiğinde
  const handlePaymentSuccess = () => {
    showSnackbar('Ödeme başarıyla eklendi!', 'success');
    setTimeout(() => navigate('/students'), 1000);
  };
  
  if (isEditMode && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (licenseOptionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      py: 4,
      px: { xs: 2, md: 4 }
    }}>
      <PageBreadcrumb />
      
      {/* Başlık Bölümü */}
      <Box sx={{ 
        mb: 4, 
        mt: 2,
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        bgcolor: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a202c',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            {isEditMode ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {isEditMode ? 'Mevcut öğrenci bilgilerini güncelleyin' : 'Yeni öğrenci bilgilerini eksiksiz doldurun'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600
          }}
        >
          Geri Dön
        </Button>
      </Box>
      
      {/* Form Container */}
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Ana Form */}
          <Box sx={{ mb: 4 }}>
            {/* Kişisel Bilgiler */}
            <Box sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: '#3b82f6' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                  Kişisel Bilgiler
                </Typography>
              </Box>
              <Stack spacing={3}>
                  {/* Ad Soyad yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Ad *"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Soyad *"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                  </Box>
                  
                  {/* TC Kimlik ve Cinsiyet yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="T.C. Kimlik No *"
                      name="tcNo"
                      value={formData.tcNo}
                      onChange={handleChange}
                      required
                      inputProps={{ maxLength: 11 }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    <FormControl 
                      fullWidth 
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    >
                      <InputLabel>Cinsiyet *</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleSelectChange}
                        label="Cinsiyet *"
                        required
                      >
                        <MenuItem value="male">Erkek</MenuItem>
                        <MenuItem value="female">Kadın</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Telefon ve Ehliyet Sınıfı yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Telefon *"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setFormData(prev => ({ ...prev, phone: value }));
                        }
                      }}
                      required
                      placeholder="5XXXXXXXXX"
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                            +90
                          </Box>
                        ),
                      }}
                      helperText="5 ile başlamalı, 10 haneli telefon numarası"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Alacağı Ehliyet Sınıfı *</InputLabel>
                      <Select
                        name="licenseType"
                        value={formData.licenseType}
                        onChange={handleLicenseClassChange}
                        label="Alacağı Ehliyet Sınıfı *"
                        required
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Seçiniz</MenuItem>
                        {licenseClassOptions.map((option) => (
                          <MenuItem key={option.id} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Box>

              {/* Adres Bilgileri */}
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c', mb: 3 }}>
                  Adres Bilgileri
                </Typography>
                <Stack spacing={3}>
                  {/* İl ve İlçe yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <FormControl fullWidth>
                      <InputLabel>İl</InputLabel>
                      <Select
                        name="province"
                        value={formData.province}
                        onChange={handleSelectChange}
                        label="İl"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Seçiniz</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city.id} value={city.name}>
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth disabled={!formData.province || loadingDistricts}>
                      <InputLabel>İlçe</InputLabel>
                      <Select
                        name="district"
                        value={formData.district}
                        onChange={handleSelectChange}
                        label="İlçe"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Seçiniz</MenuItem>
                        {districts.map((district) => (
                          <MenuItem key={district.id} value={district.name}>
                            {district.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Açık Adres */}
                  <TextField
                    fullWidth
                    label="Açık Adres"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Mahalle, sokak, bina no, daire no vb..."
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      } 
                    }}
                  />
                </Stack>
              </Box>

              {/* Notlar */}
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <TextField
                  fullWidth
                  label="Notlar"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Öğrenci hakkında ek bilgiler..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2 
                    } 
                  }}
                />
              </Box>

              {/* Kullanıcı Hesabı Bilgisi (sadece yeni kayıt için) */}
              {!isEditMode && (
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Öğrenci için kullanıcı hesabı oluşturulacak
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Öğrenci telefon numarası (+90{formData.phone || 'XXXXXXXXXX'}) ve otomatik oluşturulan şifre ile sisteme giriş yapabilir. SMS ile bilgilendirilecektir.
                  </Typography>
                </Box>
              )}

            {/* Butonlar */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              pt: 2,
              pb: 4
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/students')}
                sx={{ 
                  textTransform: 'none', 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ 
                  textTransform: 'none', 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  minWidth: 120,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                {loading ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      {/* Loading Backdrop */}
      <LoadingBackdrop 
        open={loading}
        message={id ? 'Öğrenci güncelleniyor...' : 'Öğrenci kaydediliyor...'}
      />

      {/* Ödeme Modalı */}
      {createdStudent && (
        <AddPaymentModal
          open={paymentModalOpen}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
          student={createdStudent}
          remainingAmount={createdStudent.remainingDebt || 0}
          mode="debt"
        />
      )}
    </Box>
  );
};

export default AddEditStudent;
