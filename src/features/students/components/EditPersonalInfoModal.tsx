import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, FormControl, InputLabel, Select,
  MenuItem, IconButton, Typography, Divider, Alert, CircularProgress,
  Avatar
} from '@mui/material';
import { Close as CloseIcon, PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Student } from '../types/types';
import { getInstructors } from '../../instructors/api/useInstructors';
import { useLocations } from '../../../api/useLocations';
import { useLicenseClassOptions } from '../../../hooks/useLicenseClassOptions';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  licenseTypes?: string[];
}

interface EditPersonalInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedInfo: Partial<Student>) => void;
  student: Student | null;
}

const EditPersonalInfoModal: React.FC<EditPersonalInfoModalProps> = ({
  open,
  onClose,
  onSuccess,
  student
}) => {
  const { options: licenseOptions } = useLicenseClassOptions();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    tcNo: '',
    phone: '',
    instructor: '',
    licenseType: '',
    province: '',
    district: '',
    address: ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [localDistricts, setLocalDistricts] = useState<any[]>([]);
  
  // Location hook
  const { cities, fetchCities, fetchDistricts } = useLocations();
  
  // İlleri yükle
  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open, fetchCities]);
  
  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    const loadDistrictsForProvince = async () => {
      if (formData.province && cities.length > 0) {
        // Case-insensitive karşılaştırma
        const city = cities.find(c => c.name.toUpperCase() === formData.province.toUpperCase());
        if (city) {
          try {
            const districts = await fetchDistricts(city.id);
            setLocalDistricts(districts);
          } catch (error) {
            console.error('İlçeler yüklenirken hata:', error);
          }
        }
      } else {
        setLocalDistricts([]);
      }
    };
    loadDistrictsForProvince();
  }, [formData.province, cities, fetchDistricts]);
  
  // Eğitmenleri yükle
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await getInstructors();
        setInstructors(data as Instructor[]);
      } catch (error) {
        console.error('Eğitmenler yüklenirken hata:', error);
      }
    };
    
    if (open) {
      loadInstructors();
    }
  }, [open]);
  
  // Öğrenci verisi değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (student) {
      // Aktif instructor assignment'tan instructorId'yi al
      const activeAssignment = student.instructorAssignments?.find(a => a.isActive);
      const currentInstructorId = activeAssignment?.instructorId || student.instructor || '';
      
      console.log('EditPersonalInfoModal - Student updated:', {
        studentId: student.id,
        activeAssignment,
        currentInstructorId,
        instructorAssignments: student.instructorAssignments
      });
      
      setFormData({
        name: student.name || '',
        surname: student.surname || '',
        tcNo: student.tcNo || '',
        phone: (student.phone || '').replace(/^\+?90/, ''), // +90'ı kaldırarak göster
        instructor: currentInstructorId,
        licenseType: student.licenseType || '',
        province: student.province || '',
        district: student.district || '',
        address: student.address || ''
      });
      
      // Mevcut fotoğrafı önizleme olarak ayarla
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      if (student.photoUrl) {
        setPhotoPreview(`${API_URL}${student.photoUrl}`);
      } else {
        setPhotoPreview('');
      }
      setPhotoFile(null);
    }
  }, [student]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Fotoğraf boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Sadece resim dosyaları yüklenebilir');
        return;
      }
      
      setPhotoFile(file);
      
      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Ad gereklidir';
    if (!formData.surname.trim()) newErrors.surname = 'Soyad gereklidir';
    
    // TC No doğrulama
    const tcNoRegex = /^[1-9][0-9]{10}$/;
    if (!formData.tcNo.trim()) {
      newErrors.tcNo = 'T.C. Kimlik No gereklidir';
    } else if (!tcNoRegex.test(formData.tcNo.trim())) {
      newErrors.tcNo = 'Geçerli bir T.C. Kimlik No girin (11 haneli)';
    }
    
    // Telefon doğrulama - 5XXXXXXXXX veya 05XXXXXXXXX formatı kabul edilir
    const phoneDigits = formData.phone.replace(/\s/g, '').replace(/^0/, ''); // Başındaki 0'ı kaldır
    const phoneRegex = /^5[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!phoneRegex.test(phoneDigits)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (5XX XXX XXXX)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !student) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      let photoUrl = student.photoUrl;
      
      // Önce fotoğrafı yükle (varsa)
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', photoFile);
        
        // folder'ı query parameter olarak gönder
        const uploadResponse = await fetch(`${API_URL}/api/upload?folder=students`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Fotoğraf yüklenirken hata oluştu');
        }
        
        const uploadResult = await uploadResponse.json();
        photoUrl = uploadResult.data?.url || uploadResult.url;
      }
      
      // Telefon numarasını normalize et (sadece boşlukları temizle, zaten 5 ile başlıyor)
      const normalizedPhone = formData.phone.replace(/\s/g, '');
      
      // Sadece değişen alanları gönder
      const updatePayload: any = {};
      
      if (formData.name !== student.name) {
        updatePayload.firstName = formData.name;
      }
      
      if (formData.surname !== student.surname) {
        updatePayload.lastName = formData.surname;
      }
      
      if (formData.tcNo !== student.tcNo) {
        updatePayload.tcNo = formData.tcNo;
      }
      
      // Telefonu karşılaştırırken DB'deki +90'ı kaldır
      const studentPhoneWithoutPrefix = (student.phone || '').replace(/^\+?90/, '');
      if (normalizedPhone !== studentPhoneWithoutPrefix) {
        updatePayload.phone = normalizedPhone; // Backend +90 ekleyecek
      }
      
      if (formData.licenseType !== student.licenseType) {
        updatePayload.licenseType = formData.licenseType;
      }
      
      if (formData.instructor !== student.instructor) {
        updatePayload.instructorId = formData.instructor; // Backend instructorId bekliyor
      }
      
      if (formData.province !== student.province) {
        updatePayload.province = formData.province;
      }
      
      if (formData.district !== student.district) {
        updatePayload.district = formData.district;
      }
      
      if (formData.address !== student.address) {
        updatePayload.address = formData.address;
      }
      
      if (photoFile) {
        updatePayload.photoUrl = photoUrl;
      }
      
      // Eğer hiçbir şey değişmediyse uyar
      if (Object.keys(updatePayload).length === 0) {
        setErrorMessage('Hiçbir değişiklik yapılmadı');
        setLoading(false);
        return;
      }
      
      // Sonra öğrenci bilgilerini güncelle
      const response = await fetch(`${API_URL}/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kişisel bilgiler güncellenirken hata oluştu');
      }

      const result = await response.json();
      
      // Başarılı olduğunda modal'ı kapat ve parent'a bildir
      onSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Kişisel bilgiler güncellenirken hata oluştu:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Kişisel bilgiler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle 
        component="div"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Kişisel Bilgileri Düzenle
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Fotoğraf Yükleme */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              src={photoPreview}
              sx={{ width: 120, height: 120, border: '3px solid', borderColor: 'primary.main' }}
            >
              {!photoPreview && <PhotoCameraIcon sx={{ fontSize: 50 }} />}
            </Avatar>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Fotoğraf Seç
              </Button>
              
              {photoPreview && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setPhotoPreview('');
                    setPhotoFile(null);
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Sil
                </Button>
              )}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Maksimum dosya boyutu: 5MB
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Ad"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="Soyad"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              error={!!errors.surname}
              helperText={errors.surname}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="T.C. Kimlik No"
              name="tcNo"
              value={formData.tcNo}
              onChange={handleChange}
              error={!!errors.tcNo}
              helperText={errors.tcNo}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="5XX XXX XXXX"
              InputProps={{
                startAdornment: (
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                    +90
                  </Box>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="instructor-label">Eğitmen</InputLabel>
              <Select
                labelId="instructor-label"
                name="instructor"
                value={formData.instructor}
                label="Eğitmen"
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {instructors
                  .filter(instructor => {
                    // Sadece öğrencinin licenseType'ına sahip eğitmenleri göster
                    if (!formData.licenseType || !instructor.licenseTypes) return true;
                    return instructor.licenseTypes.includes(formData.licenseType);
                  })
                  .map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName} ({instructor.licenseTypes?.join(', ') || 'Yetki yok'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="license-type-label">Alacağı Ehliyet Sınıfı</InputLabel>
              <Select
                labelId="license-type-label"
                name="licenseType"
                value={formData.licenseType}
                label="Alacağı Ehliyet Sınıfı"
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {licenseOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">Adres Bilgileri</Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="province-label">İl</InputLabel>
              <Select
                labelId="province-label"
                name="province"
                value={cities.find(c => c.name.toUpperCase() === formData.province.toUpperCase())?.name || ''}
                label="İl"
                onChange={handleChange}
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

            <FormControl fullWidth disabled={!formData.province}>
              <InputLabel id="district-label">İlçe</InputLabel>
              <Select
                labelId="district-label"
                name="district"
                value={localDistricts.find(d => d.name.toUpperCase() === formData.district.toUpperCase())?.name || ''}
                label="İlçe"
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {localDistricts.map((district) => (
                  <MenuItem key={district.id} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Açık adres giriniz"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPersonalInfoModal;
