import React, { useState, useEffect } from 'react';
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
  OutlinedInput,
  Chip,
  InputAdornment,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { createInstructor, type CreateInstructorData } from '../api/useInstructors';
import { useLocations, type District } from '../../../api/useLocations';

interface InstructorCreateModalProps {
  open: boolean;
  onClose: () => void;
  onInstructorCreated: () => void;
  companyId: string;
}

// Ehliyet sınıfları
const LICENSE_TYPES = [
  'M', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 
  'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 
  'F', 'G'
];

const InstructorCreateModal: React.FC<InstructorCreateModalProps> = ({
  open,
  onClose,
  onInstructorCreated,
  companyId
}) => {
  const [formData, setFormData] = useState<CreateInstructorData>({
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
    vehicleId: undefined,
    startDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Lokasyon hook'u
  const { cities, fetchCities, fetchDistricts } = useLocations();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // İlleri yükle
  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open, fetchCities]);

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!open) {
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
        vehicleId: undefined,
        startDate: '',
        notes: ''
      });
      setErrors({});
      setSuccessMessage('');
      setSelectedCityId(null);
      setDistricts([]);
    }
  }, [open]);

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
    } else if (!/^5[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon formatı: 5XXXXXXXXX';
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
      const result = await createInstructor(companyId, {
        ...formData,
        experience: formData.experience || 0,
        licenseTypes: formData.licenseTypes || []
      });

      setSuccessMessage(
        `Eğitmen başarıyla oluşturuldu! Geçici şifre: ${result.temporaryPassword}`
      );

      // 2 saniye sonra modalı kapat ve listeyi yenile
      setTimeout(() => {
        onInstructorCreated();
        handleClose();
      }, 2000);
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Eğitmen oluşturulurken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleChange = (field: keyof CreateInstructorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6">Yeni Eğitmen Ekle</Typography>
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

        <Grid container spacing={2}>
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
                handleChange('phone', value.slice(0, 10));
              }}
              error={!!errors.phone}
              helperText={errors.phone || '5XXXXXXXXX formatında'}
              disabled={loading}
              inputProps={{ maxLength: 10 }}
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
            <FormControl fullWidth>
              <InputLabel>Ehliyet Sınıfları</InputLabel>
              <Select
                multiple
                value={formData.licenseTypes || []}
                onChange={(e) => handleChange('licenseTypes', e.target.value)}
                input={<OutlinedInput label="Ehliyet Sınıfları" />}
                disabled={loading}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {LICENSE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
