import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Button, 
  TextField, 
  FormControl,
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  Avatar, 
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Paper
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { useInstructor, createInstructor, updateInstructor } from './api/useInstructors';
import type { InstructorFormData } from './types/types';
import { useLicenseClassValues } from '../../hooks/useLicenseClassOptions';

const AddEditInstructor: React.FC = () => {
  const { values: licenseOptions, loading: licenseOptionsLoading } = useLicenseClassValues();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { instructor, loading: instructorLoading } = useInstructor(id || '');
  const { showSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<InstructorFormData>({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    licenseTypes: [],
    specialization: '',
    experience: '',
    maxStudentsPerPeriod: '10', // Varsayılan değer
    status: 'ACTIVE',
    profileImage: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [initialFormData, setInitialFormData] = useState<InstructorFormData>(formData);
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  
  useUnsavedChangesWarning({ hasUnsavedChanges });
  
  // Düzenleme modunda veriyi yükle
  useEffect(() => {
    if (isEditMode && instructor) {
      const loadedData = {
        firstName: instructor.firstName || '',
        lastName: instructor.lastName || '',
        tcNo: instructor.tcNo || '',
        phone: instructor.phone || '',
        email: instructor.email || '',
        address: instructor.address || '',
        province: instructor.province || '',
        district: instructor.district || '',
        licenseTypes: instructor.licenseTypes || [],
        specialization: instructor.specialization || '',
        experience: instructor.experience?.toString() || '',
        maxStudentsPerPeriod: instructor.maxStudentsPerPeriod?.toString() || '10',
        status: instructor.status || 'ACTIVE',
        profileImage: instructor.profileImage || '',
        startDate: instructor.startDate || new Date().toISOString().split('T')[0],
        notes: instructor.notes || ''
      };
      setFormData(loadedData);
      setInitialFormData(loadedData);
    }
  }, [isEditMode, instructor]);
  
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
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit validasyon
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.tcNo.trim() || !formData.phone.trim()) {
      showSnackbar('Lütfen gerekli alanları doldurun', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode && id) {
        await updateInstructor(id, formData);
        showSnackbar('Eğitmen başarıyla güncellendi', 'success');
      } else {
        await createInstructor(formData);
        showSnackbar('Eğitmen başarıyla eklendi', 'success');
      }
      
      navigate('/instructors');
    } catch (error) {
      showSnackbar('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  if (isEditMode && instructorLoading) {
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
        <Typography sx={{ ml: 2 }}>Ehliyet sınıfları yükleniyor...</Typography>
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
            {isEditMode ? 'Eğitmen Düzenle' : 'Yeni Eğitmen Ekle'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {isEditMode ? 'Mevcut eğitmen bilgilerini güncelleyin' : 'Yeni eğitmen bilgilerini eksiksiz doldurun'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/instructors')}
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
          {/* Ana Form - Accordion Layout */}
          <Box sx={{ mb: 4 }}>
            {/* Kişisel Bilgiler Accordion */}
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#e3f2fd',
                  borderRadius: '8px 8px 0 0',
                  border: '1px solid #bbdefb',
                  '&.Mui-expanded': {
                    minHeight: 48,
                    borderRadius: '8px 8px 0 0'
                  },
                  '&:hover': {
                    bgcolor: '#e1f5fe'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 2, color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                    Kişisel Bilgiler
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Profil Fotoğrafı */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                  }}>
                    <Avatar
                      src={formData.profileImage}
                      sx={{ 
                        width: 60, 
                        height: 60,
                        border: '2px solid #e2e8f0'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Profil Fotoğrafı
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        size="small"
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        Fotoğraf Yükle
                      </Button>
                    </Box>
                  </Box>
                  
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
                  
                  {/* TC Kimlik ve İşe Giriş yan yana */}
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
                    <TextField
                      fullWidth
                      label="İşe Başlama Tarihi"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Mesleki Bilgiler Accordion */}
            <Accordion sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f3e8ff',
                  border: '1px solid #d8b4fe',
                  '&.Mui-expanded': {
                    minHeight: 48
                  },
                  '&:hover': {
                    bgcolor: '#f5f3ff'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                    Mesleki Bilgiler
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Uzmanlık ve Deneyim yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Uzmanlık Alanı"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Örn: Direksiyon Eğitimi, Teorik Eğitim"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Deneyim (Yıl)"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleChange}
                      inputProps={{ min: 0, max: 50 }}
                      onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Max Öğrenci/Dönem"
                      name="maxStudentsPerPeriod"
                      type="number"
                      value={formData.maxStudentsPerPeriod}
                      onChange={handleChange}
                      inputProps={{ min: 1, max: 100 }}
                      onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                      helperText="Bir dönemde alabileceği max öğrenci sayısı"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                  </Box>

                  {/* Durum ve Ehliyet Sınıfları yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <FormControl fullWidth>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleSelectChange}
                        label="Durum"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="ACTIVE">Aktif</MenuItem>
                        <MenuItem value="INACTIVE">Pasif</MenuItem>
                        <MenuItem value="PENDING">Onay Bekliyor</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Ehliyet Sınıfları Checkbox */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      backgroundColor: '#f8fafc',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Ehliyet Sınıfları (Birden fazla seçebilirsiniz)
                    </Typography>
                    {licenseOptionsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: 1,
                        mt: 1
                      }}>
                        {licenseOptions.map((option) => (
                          <FormControlLabel
                            key={option}
                            control={
                              <Checkbox
                                checked={formData.licenseTypes.includes(option)}
                                onChange={(e) => {
                                  const currentTypes = formData.licenseTypes;
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      licenseTypes: [...currentTypes, option]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      licenseTypes: currentTypes.filter(t => t !== option)
                                    }));
                                  }
                                }}
                                size="small"
                              />
                            }
                            label={option}
                            sx={{
                              m: 0,
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    {formData.licenseTypes.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
                          Seçilen sınıflar:
                        </Typography>
                        {formData.licenseTypes.map((type) => (
                          <Chip
                            key={type}
                            label={type}
                            size="small"
                            color="primary"
                            onDelete={() => {
                              setFormData(prev => ({
                                ...prev,
                                licenseTypes: prev.licenseTypes.filter(t => t !== type)
                              }));
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>

                  {/* Notlar */}
                  <TextField
                    fullWidth
                    label="Notlar"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Eğitmen hakkında ek bilgiler, özel notlar..."
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      } 
                    }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* İletişim Bilgileri Accordion */}
            <Accordion sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  '&.Mui-expanded': {
                    minHeight: 48
                  },
                  '&:hover': {
                    bgcolor: '#f0fdf4'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ContactIcon sx={{ mr: 2, color: '#10b981' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                    İletişim Bilgileri
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Telefon *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="5XX XXX XXXX"
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                          +90
                        </Box>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      } 
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="E-posta"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      } 
                    }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Adres Bilgileri Accordion */}
            <Accordion sx={{ mb: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  '&.Mui-expanded': {
                    minHeight: 48
                  },
                  '&:hover': {
                    bgcolor: '#fffbeb'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 2, color: '#f59e0b' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                    Adres Bilgileri
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* İl İlçe yan yana */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="İl"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                    <TextField
                      fullWidth
                      label="İlçe"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2 
                        } 
                      }}
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Adres"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Mahalle, sokak, kapı no bilgileri..."
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      } 
                    }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

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
                onClick={() => navigate('/instructors')}
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
      
      <LoadingBackdrop 
        open={loading}
        message={id ? 'Eğitmen güncelleniyor...' : 'Eğitmen kaydediliyor...'}
      />
    </Box>
  );
};

export default AddEditInstructor;