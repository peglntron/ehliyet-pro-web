import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, IconButton, Typography,
  Divider, CircularProgress, Alert, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Instructor } from '../../../types/instructor';
import axios from 'axios';
import { updateInstructor } from '../api/useInstructors';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface EditAddressInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedInfo: any) => void;
  instructor: Instructor;
}

const EditAddressInfoModal: React.FC<EditAddressInfoModalProps> = ({
  open,
  onClose,
  onSuccess,
  instructor
}) => {
  const { user } = useAuth();
  
  // Tüm illeri getir
  const fetchCities = useCallback(async (): Promise<Array<{ id: number; name: string }>> => {
    try {
      const response = await axios.get(`${API_URL}/api/locations/cities`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err: any) {
      console.error('İller yüklenirken hata:', err);
      throw new Error(err.response?.data?.message || 'İller yüklenirken hata oluştu');
    }
  }, []);

  // İlçeleri getir (cityId'ye göre)
  const fetchDistricts = useCallback(async (cityId: number): Promise<Array<{ id: number; name: string }>> => {
    try {
      const response = await axios.get(`${API_URL}/api/locations/cities/${cityId}/districts`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err: any) {
      console.error('İlçeler yüklenirken hata:', err);
      throw new Error(err.response?.data?.message || 'İlçeler yüklenirken hata oluştu');
    }
  }, []);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: number; name: string }>>([]);
  
  const [formData, setFormData] = useState({
    province: instructor.province || '',
    district: instructor.district || '',
    address: instructor.address || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // İlleri yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await fetchCities();
        setCities(citiesData);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    
    if (open) {
      loadCities();
    }
  }, [open, fetchCities]);
  
  // İl seçildiğinde ilçeleri yükle
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.province) {
        const selectedCity = cities.find(c => c.name === formData.province);
        if (selectedCity) {
          try {
            const districtsData = await fetchDistricts(selectedCity.id);
            setDistricts(districtsData);
          } catch (err) {
            console.error('Error loading districts:', err);
          }
        }
      } else {
        setDistricts([]);
        setFormData(prev => ({ ...prev, district: '' }));
      }
    };
    
    loadDistricts();
  }, [formData.province, cities, fetchDistricts]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Tüm alanları doldurmak opsiyonel, sadece adres dolu ama il/ilçe boşsa uyarı ver
    if (formData.address && (!formData.province || !formData.district)) {
      if (!formData.province) newErrors.province = 'Adres girildiğinde il de girilmelidir';
      if (!formData.district) newErrors.district = 'Adres girildiğinde ilçe de girilmelidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const companyId = user?.role !== 'ADMIN' ? user?.companyId : undefined;
      await updateInstructor(instructor.id, {
        province: formData.province,
        district: formData.district,
        address: formData.address
      }, companyId || undefined);
      
      // Başarılı olduğunda
      onSuccess(formData);
    } catch (err: any) {
      console.error('Error updating address info:', err);
      setError(err.response?.data?.message || 'Adres bilgileri güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
          Adres Bilgilerini Düzenle
        </Typography>
        <IconButton 
          onClick={onClose} 
          disabled={loading}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.province} disabled={loading}>
              <InputLabel>İl</InputLabel>
              <Select
                value={formData.province}
                label="İl"
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, province: e.target.value, district: '' }));
                  if (errors.province) {
                    setErrors(prev => ({ ...prev, province: '' }));
                  }
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>İl Seçiniz</em>
                </MenuItem>
                {cities.map(city => (
                  <MenuItem key={city.id} value={city.name}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.province && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.province}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.district} disabled={loading || !formData.province}>
              <InputLabel>İlçe</InputLabel>
              <Select
                value={formData.district}
                label="İlçe"
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, district: e.target.value }));
                  if (errors.district) {
                    setErrors(prev => ({ ...prev, district: '' }));
                  }
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>İlçe Seçiniz</em>
                </MenuItem>
                {districts.map(district => (
                  <MenuItem key={district.id} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.district && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.district}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adres"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              disabled={loading}
              multiline
              rows={3}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAddressInfoModal;
