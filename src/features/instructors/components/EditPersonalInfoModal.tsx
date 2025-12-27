import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, IconButton, Typography,
  Divider, CircularProgress, Alert, Avatar, Box
} from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraAltIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Instructor } from '../../../types/instructor';
import { updateInstructor } from '../api/useInstructors';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface EditPersonalInfoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedInfo: any) => void;
  instructor: Instructor;
}

const EditPersonalInfoModal: React.FC<EditPersonalInfoModalProps> = ({
  open,
  onClose,
  onSuccess,
  instructor
}) => {
  const { user } = useAuth();
  
  // Tarihi yyyy-MM-dd formatına çevir
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Profil fotoğrafı URL'sini oluştur
  const getPhotoUrl = (photoPath: string | null | undefined) => {
    if (!photoPath) return '';
    // Eğer zaten tam URL ise olduğu gibi döndür
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('data:')) {
      return photoPath;
    }
    // Değilse backend URL'sine ekle
    return `${API_URL}${photoPath.startsWith('/') ? photoPath : '/' + photoPath}`;
  };
  
  const [formData, setFormData] = useState({
    firstName: instructor.firstName,
    lastName: instructor.lastName,
    tcNo: instructor.tcNo,
    phone: instructor.phone,
    email: instructor.email || '',
    startDate: formatDateForInput(instructor.startDate),
    profilePhoto: getPhotoUrl(instructor.profileImage || instructor.profilePhoto)
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Ad gereklidir';
    if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gereklidir';
    
    // TC No doğrulama
    const tcNoRegex = /^[1-9][0-9]{10}$/;
    if (!formData.tcNo.trim()) {
      newErrors.tcNo = 'T.C. Kimlik No gereklidir';
    } else if (!tcNoRegex.test(formData.tcNo.trim())) {
      newErrors.tcNo = 'Geçerli bir T.C. Kimlik No girin (11 haneli)';
    }
    
    // Telefon doğrulama - 5 ile başlamalı (prefix +90 olduğu için)
    const phoneRegex = /^5[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (5XX XXX XXXX)';
    }
    
    // E-posta doğrulama (opsiyonel)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let photoUrl = formData.profilePhoto;
      
      // Eğer yeni bir dosya seçildiyse, önce upload et
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        const uploadFormData = new FormData();
        uploadFormData.append('photo', selectedFile);
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('Upload URL:', `${API_URL}/api/instructors/upload-photo`);
        const uploadResponse = await axios.post(`${API_URL}/api/instructors/upload-photo`, uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Upload response:', uploadResponse.data);
        if (uploadResponse.data.success) {
          photoUrl = uploadResponse.data.data.url;
          console.log('Photo URL to save:', photoUrl);
        }
      }
      
      console.log('Updating instructor with data:', {
        ...formData,
        profilePhoto: photoUrl
      });
      
      const companyId = user?.role !== 'ADMIN' ? user?.companyId : undefined;
      const updateResult = await updateInstructor(instructor.id, {
        ...formData,
        profilePhoto: photoUrl
      }, companyId || undefined);
      
      console.log('Update result:', updateResult);
      
      // Başarılı olduğunda
      onSuccess({ ...formData, profilePhoto: photoUrl });
    } catch (err: any) {
      console.error('Error updating personal info:', err);
      setError(err.response?.data?.message || 'Kişisel bilgiler güncellenirken bir hata oluştu');
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
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2
      }}>
        <Box component="span" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Kişisel Bilgileri Düzenle
        </Box>
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
        
        {/* Profil Fotoğrafı */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              src={formData.profilePhoto}
              alt={`${formData.firstName} ${formData.lastName}`}
              sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CameraAltIcon />}
                component="label"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Fotoğraf Değiştir
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      // Önizleme için base64'e çevir
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
              {formData.profilePhoto && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  size="small"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, profilePhoto: '' }));
                    setSelectedFile(null);
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Sil
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ad"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Soyad"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="T.C. Kimlik No"
              name="tcNo"
              value={formData.tcNo}
              onChange={handleChange}
              error={!!errors.tcNo}
              helperText={errors.tcNo}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              disabled={loading}
              placeholder="5XX XXX XXXX"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                    +90
                  </Typography>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="İşe Başlama Tarihi"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
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

export default EditPersonalInfoModal;
