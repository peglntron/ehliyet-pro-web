import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField,
  IconButton, Typography, Divider, Alert, CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Student } from '../types/types';

interface EditExamInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedInfo: Partial<Student>) => void;
  student: Student | null;
}

const EditExamInfoModal: React.FC<EditExamInfoModalProps> = ({
  open,
  onClose,
  onSuccess,
  student
}) => {
  const [formData, setFormData] = useState({
    writtenExamDate: '',
    writtenExamTime: '',
    drivingExamDate: '',
    drivingExamTime: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Öğrenci verisi değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (student) {
      setFormData({
        writtenExamDate: student.writtenExamDate ? new Date(student.writtenExamDate).toISOString().split('T')[0] : '',
        writtenExamTime: student.writtenExamTime || '',
        drivingExamDate: student.drivingExamDate ? new Date(student.drivingExamDate).toISOString().split('T')[0] : '',
        drivingExamTime: student.drivingExamTime || ''
      });
    }
  }, [student]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
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
    // Sınav bilgileri opsiyonel olabilir, bu yüzden boş kontrolü yapmıyoruz
    const newErrors: Record<string, string> = {};
    
    // Tarihler geçerli olmalı (eğer girilmişse)
    if (formData.writtenExamDate) {
      const selectedDate = new Date(formData.writtenExamDate);
      if (isNaN(selectedDate.getTime())) {
        newErrors.writtenExamDate = 'Geçerli bir tarih girin';
      }
    }
    
    if (formData.drivingExamDate) {
      const selectedDate = new Date(formData.drivingExamDate);
      if (isNaN(selectedDate.getTime())) {
        newErrors.drivingExamDate = 'Geçerli bir tarih girin';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !student) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      const response = await fetch(`${API_URL}/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          writtenExamDate: formData.writtenExamDate || null,
          writtenExamTime: formData.writtenExamTime || null,
          drivingExamDate: formData.drivingExamDate || null,
          drivingExamTime: formData.drivingExamTime || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sınav bilgileri güncellenirken hata oluştu');
      }

      const result = await response.json();
      
      // Başarılı olduğunda modal'ı kapat ve parent'a bildir
      onSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Sınav bilgileri güncellenirken hata oluştu:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Sınav bilgileri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
          Sınav Bilgilerini Düzenle
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
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Yazılı Sınav Bilgileri
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Yazılı Sınav Tarihi"
              name="writtenExamDate"
              type="date"
              value={formData.writtenExamDate}
              onChange={handleChange}
              error={!!errors.writtenExamDate}
              helperText={errors.writtenExamDate}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="Yazılı Sınav Saati"
              name="writtenExamTime"
              type="time"
              value={formData.writtenExamTime}
              onChange={handleChange}
              error={!!errors.writtenExamTime}
              helperText={errors.writtenExamTime}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Direksiyon Sınavı Bilgileri
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Direksiyon Sınavı Tarihi"
              name="drivingExamDate"
              type="date"
              value={formData.drivingExamDate}
              onChange={handleChange}
              error={!!errors.drivingExamDate}
              helperText={errors.drivingExamDate}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="Direksiyon Sınavı Saati"
              name="drivingExamTime"
              type="time"
              value={formData.drivingExamTime}
              onChange={handleChange}
              error={!!errors.drivingExamTime}
              helperText={errors.drivingExamTime}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
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

export default EditExamInfoModal;
