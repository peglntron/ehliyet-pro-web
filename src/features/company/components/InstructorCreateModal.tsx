import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  InputAdornment,
  CircularProgress,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { createInstructor, updateInstructor } from '../../instructors/api/useInstructors';
import { useLocations, type District } from '../../../api/useLocations';
import { useLicenseClassOptions } from '../../../hooks/useLicenseClassOptions';
import { useSnackbar } from '../../../contexts/SnackbarContext';

interface InstructorCreateModalProps {
  open: boolean;
  onClose: () => void;
  onInstructorCreated: () => void;
  companyId?: string;
  editingInstructor?: any;
}

const InstructorCreateModal: React.FC<InstructorCreateModalProps> = ({
  open,
  onClose,
  onInstructorCreated,
  companyId,
  editingInstructor
}) => {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    gender: 'MALE',
    licenseTypes: [],
    experience: 0,
    specialization: '',
    maxStudentsPerPeriod: 10,
    status: 'ACTIVE',
    startDate: '',
    notes: '',
    profilePhoto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fotoğraf state'leri
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lokasyon hook'u
  const { cities, fetchCities, fetchDistricts } = useLocations();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Ehliyet sınıfları hook'u
  const { options: licenseOptions, loading: licenseLoading } = useLicenseClassOptions();

  // İlleri yükle
  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open, fetchCities]);

  // Editing instructor değiştiğinde formu doldur
  useEffect(() => {
    if (editingInstructor) {
      setFormData({
        firstName: editingInstructor.firstName,
        lastName: editingInstructor.lastName,
        tcNo: editingInstructor.tcNo,
        phone: editingInstructor.phone,
        email: editingInstructor.email || '',
        gender: editingInstructor.gender || 'MALE',
        province: editingInstructor.province || '',
        district: editingInstructor.district || '',
        address: editingInstructor.address || '',
        specialization: editingInstructor.specialization || '',
        experience: editingInstructor.experience || 0,
        maxStudentsPerPeriod: editingInstructor.maxStudentsPerPeriod || 10,
        licenseTypes: editingInstructor.licenseTypes || [],
        status: editingInstructor.status || 'ACTIVE',
        startDate: editingInstructor.startDate || '',
        notes: editingInstructor.notes || '',
        profilePhoto: editingInstructor.profilePhoto || ''
      });
      
      // Mevcut fotoğrafı önizleme olarak ayarla
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      if (editingInstructor.profilePhoto) {
        setPhotoPreview(`${API_URL}${editingInstructor.profilePhoto}`);
      } else {
        setPhotoPreview('');
      }
      setPhotoFile(null);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        tcNo: '',
        phone: '',
        email: '',
        address: '',
        province: '',
        district: '',
        gender: 'MALE',
        licenseTypes: [],
        experience: 0,
        specialization: '',
        maxStudentsPerPeriod: 10,
        status: 'ACTIVE',
        startDate: '',
        notes: '',
        profilePhoto: ''
      });
      setPhotoPreview('');
      setPhotoFile(null);
    }
    setErrors({});
    setSuccessMessage('');
  }, [editingInstructor, open]);
  
  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!open) {
      setSelectedCityId(null);
      setDistricts([]);
      setPhotoFile(null);
      setPhotoPreview('');
    }
  }, [open]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Fotoğraf boyutu 5MB\'dan küçük olmalıdır' });
        return;
      }
      
      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Sadece resim dosyaları yüklenebilir' });
        return;
      }
      
      setPhotoFile(file);
      
      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Hata varsa temizle
      if (errors.photo) {
        const newErrors = { ...errors };
        delete newErrors.photo;
        setErrors(newErrors);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Ad zorunludur';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Soyad zorunludur';
    }

    if (!formData.tcNo?.trim()) {
      newErrors.tcNo = 'TC No zorunludur';
    } else if (!/^\d{11}$/.test(formData.tcNo)) {
      newErrors.tcNo = 'TC No 11 haneli olmalıdır';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefon zorunludur';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Telefon 10 haneli olmalıdır';
    } else if (!/^5[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon 5 ile başlamalı ve 10 haneli olmalıdır';
    }

    if (!formData.gender) {
      newErrors.gender = 'Cinsiyet zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let profilePhotoUrl = formData.profilePhoto;
      
      // Önce fotoğrafı yükle (varsa)
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', photoFile);
        
        // folder'ı query parameter olarak gönder
        const uploadResponse = await fetch(`${API_URL}/api/upload?folder=instructors`, {
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
        profilePhotoUrl = uploadResult.data?.url || uploadResult.url;
      }
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tcNo: formData.tcNo,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        province: formData.province,
        district: formData.district,
        address: formData.address,
        specialization: formData.specialization,
        experience: formData.experience || 0,
        maxStudentsPerPeriod: formData.maxStudentsPerPeriod || 10,
        licenseTypes: formData.licenseTypes || [],
        status: formData.status || 'ACTIVE',
        startDate: formData.startDate,
        notes: formData.notes,
        profileImage: profilePhotoUrl  // Backend 'profileImage' bekliyor
      };
      
      if (editingInstructor) {
        await updateInstructor(editingInstructor.id, payload, companyId);
        showSnackbar('Eğitmen başarıyla güncellendi', 'success');
      } else {
        await createInstructor(payload, companyId);
        showSnackbar('Eğitmen başarıyla eklendi', 'success');
      }

      onInstructorCreated();
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Bir hata oluştu';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Hata mesajını temizle
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">{editingInstructor ? 'Eğitmen Düzenle' : 'Yeni Eğitmen Ekle'}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}
        
        {errors.photo && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.photo}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Profil Fotoğrafı */}
          <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Avatar
              src={photoPreview}
              sx={{ width: 120, height: 120, border: '3px solid', borderColor: 'primary.main', mb: 2 }}
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
            
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Fotoğraf Seç
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Maksimum dosya boyutu: 5MB
            </Typography>
          </Grid>
          
          {/* Kişisel Bilgiler */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Kişisel Bilgiler
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ad"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Soyad"
              required
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="TC Kimlik No"
              required
              value={formData.tcNo}
              onChange={(e) => handleChange('tcNo', e.target.value.replace(/\D/g, '').slice(0, 11))}
              error={!!errors.tcNo}
              helperText={errors.tcNo}
              disabled={loading}
              inputProps={{ maxLength: 11 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.gender}>
              <InputLabel>Cinsiyet</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                disabled={loading}
                label="Cinsiyet"
              >
                <MenuItem value="MALE">Erkek</MenuItem>
                <MenuItem value="FEMALE">Kadın</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* İletişim Bilgileri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
              İletişim Bilgileri
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefon"
              required
              value={formData.phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  handleChange('phone', value);
                }
              }}
              error={!!errors.phone}
              helperText={errors.phone || '5XXXXXXXXX formatında (10 hane)'}
              disabled={loading}
              inputProps={{ 
                maxLength: 10,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">+90</Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adres"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>İl</InputLabel>
              <Select
                value={selectedCityId || ''}
                onChange={async (e) => {
                  const cityId = e.target.value as number;
                  setSelectedCityId(cityId);
                  
                  // Seçilen ilin adını bul
                  const selectedCity = cities.find(c => c.id === cityId);
                  if (selectedCity) {
                    handleChange('province', selectedCity.name);
                  }
                  
                  // İlçeleri yükle
                  if (cityId) {
                    try {
                      const fetchedDistricts = await fetchDistricts(cityId);
                      setDistricts(fetchedDistricts);
                      handleChange('district', ''); // İlçeyi sıfırla
                    } catch (error) {
                      console.error('İlçeler yüklenirken hata:', error);
                    }
                  } else {
                    setDistricts([]);
                    handleChange('district', '');
                  }
                }}
                disabled={loading}
                label="İl"
              >
                <MenuItem value="">
                  <em>İl Seçiniz</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!selectedCityId || districts.length === 0}>
              <InputLabel>İlçe</InputLabel>
              <Select
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                disabled={loading || !selectedCityId}
                label="İlçe"
              >
                <MenuItem value="">
                  <em>İlçe Seçiniz</em>
                </MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Mesleki Bilgiler */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
              Mesleki Bilgiler
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2,
                backgroundColor: 'background.default'
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ehliyet Sınıfları (Birden fazla seçebilirsiniz)
              </Typography>
              {licenseLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 1,
                  mt: 1
                }}>
                  {licenseOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={formData.licenseTypes?.includes(option.value) || false}
                          onChange={(e) => {
                            const currentTypes = formData.licenseTypes || [];
                            if (e.target.checked) {
                              handleChange('licenseTypes', [...currentTypes, option.value]);
                            } else {
                              handleChange('licenseTypes', currentTypes.filter((t: string) => t !== option.value));
                            }
                          }}
                          disabled={loading}
                          size="small"
                        />
                      }
                      label={option.value}
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
              {formData.licenseTypes && formData.licenseTypes.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
                    Seçilen sınıflar:
                  </Typography>
                  {formData.licenseTypes.map((type: string) => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      color="primary"
                      onDelete={() => {
                        handleChange('licenseTypes', formData.licenseTypes?.filter((t: string) => t !== type));
                      }}
                      disabled={loading}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tecrübe (Yıl)"
              type="number"
              value={formData.experience || ''}
              onChange={(e) => handleChange('experience', parseInt(e.target.value) || 0)}
              disabled={loading}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="İşe Başlama Tarihi"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notlar"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={loading}
              placeholder="Eğitmen hakkında ek notlar..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
        >
          {loading ? 'Oluşturuluyor...' : 'Eğitmen Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructorCreateModal;
