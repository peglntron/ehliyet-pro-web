import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, IconButton, Typography,
  Divider, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem, Box, Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Instructor } from '../../../types/instructor';
import { INSTRUCTOR_SPECIALIZATIONS } from '../../../types/instructor';
import { updateInstructor } from '../api/useInstructors';
import { useAuth } from '../../../contexts/AuthContext';
import { useLicenseClassOptions } from '../../../hooks/useLicenseClassOptions';

interface EditEducationInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedInfo: any) => void;
  instructor: Instructor;
}

const EditEducationInfoModal: React.FC<EditEducationInfoModalProps> = ({
  open,
  onClose,
  onSuccess,
  instructor
}) => {
  const { user } = useAuth();
  const { options: licenseOptions } = useLicenseClassOptions();
  const [formData, setFormData] = useState({
    specialization: instructor.specialization || '',
    experience: instructor.experience?.toString() || '',
    maxStudentsPerPeriod: instructor.maxStudentsPerPeriod?.toString() || '10',
    licenseTypes: instructor.licenseTypes || [],
    status: instructor.status || 'ACTIVE',
    notes: instructor.notes || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  };
  
  const handleLicenseChange = (event: SelectChangeEvent<string[]>) => {
    setFormData(prev => ({
      ...prev,
      licenseTypes: event.target.value as string[]
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Deneyim sayısal değer olmalı
    if (formData.experience && isNaN(Number(formData.experience))) {
      newErrors.experience = 'Deneyim yıl olarak sayısal bir değer olmalıdır';
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
        specialization: formData.specialization,
        experience: formData.experience ? Number(formData.experience) : null,
        maxStudentsPerPeriod: formData.maxStudentsPerPeriod ? Number(formData.maxStudentsPerPeriod) : 10,
        licenseTypes: formData.licenseTypes,
        status: formData.status,
        notes: formData.notes
      }, companyId || undefined);
      
      // Başarılı olduğunda
      onSuccess(formData);
    } catch (err: any) {
      console.error('Error updating education info:', err);
      setError(err.response?.data?.message || 'Eğitim bilgileri güncellenirken bir hata oluştu');
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
          Eğitim ve Yeterlilik Bilgilerini Düzenle
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
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="specialization-label">Uzmanlık Alanı</InputLabel>
              <Select
                labelId="specialization-label"
                name="specialization"
                value={formData.specialization}
                label="Uzmanlık Alanı"
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, specialization: e.target.value }));
                }}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {INSTRUCTOR_SPECIALIZATIONS.map((spec) => (
                  <MenuItem key={spec.value} value={spec.value}>
                    {spec.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Deneyim (Yıl)"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              error={!!errors.experience}
              helperText={errors.experience}
              disabled={loading}
              type="number"
              onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Öğrenci/Dönem"
              name="maxStudentsPerPeriod"
              value={formData.maxStudentsPerPeriod}
              onChange={handleChange}
              disabled={loading}
              type="number"
              inputProps={{ min: 1, max: 100 }}
              onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              helperText="Bir dönemde alabileceği max öğrenci sayısı"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Durum</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                label="Durum"
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING' }));
                }}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="INACTIVE">Pasif</MenuItem>
                <MenuItem value="PENDING">Onay Bekliyor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="license-types-label">Ehliyet Sınıfları</InputLabel>
              <Select
                labelId="license-types-label"
                multiple
                name="licenseTypes"
                value={formData.licenseTypes}
                onChange={handleLicenseChange}
                disabled={loading}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                )}
                sx={{ borderRadius: 2 }}
              >
                {licenseOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notlar"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
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

export default EditEducationInfoModal;
