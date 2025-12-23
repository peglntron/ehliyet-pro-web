import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Divider, Alert, IconButton,
  InputAdornment, FormHelperText
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Numbers as NumbersIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  tcNo: string;
  role: string;
  status: string;
}

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
  user: User | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  user
}) => {
  // Form verileri
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    tcNo: '',
    role: 'company_admin',
    status: 'active'
  });
  
  // Kullanıcı verileri değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        tcNo: user.tcNo,
        role: user.role,
        status: user.status
      });
    }
  }, [user]);
  
  // Hata yönetimi
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modalı kapatırken temizle
  const handleClose = () => {
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
    setLoading(false);
    onClose();
  };

  // Form alanı değişikliği işleme
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

  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad gereklidir';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyad gereklidir';
    }
    
    // Telefon numarası doğrulama
    const phoneRegex = /^05[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (05XX XXX XXXX)';
    }
    
    // TC No doğrulama
    const tcNoRegex = /^[1-9][0-9]{10}$/;
    if (!formData.tcNo.trim()) {
      newErrors.tcNo = 'T.C. Kimlik Numarası gereklidir';
    } else if (!tcNoRegex.test(formData.tcNo.trim())) {
      newErrors.tcNo = 'Geçerli bir T.C. Kimlik Numarası girin (11 haneli)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formu gönderme
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    
    try {
      setLoading(true);
      
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Kullanıcı bilgileri başarıyla güncellendi');
      setGeneralError(null);
      
      // Başarılı işlemden sonra temizlik ve kapanış
      setTimeout(() => {
        onSuccess(user.id);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Kullanıcı güncellenirken hata:', err);
      setGeneralError('Kullanıcı güncellenirken hata oluştu');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Typography variant="h6" fontWeight={600}>
          Kullanıcı Düzenle
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {/* Hata ve başarı mesajları */}
        {generalError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {generalError}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Kişisel Bilgiler */}
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
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
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
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
          
          {/* İletişim Bilgileri */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="05XX XXX XXXX"
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            
            <TextField
              fullWidth
              label="T.C. Kimlik No"
              name="tcNo"
              value={formData.tcNo}
              onChange={handleChange}
              error={!!errors.tcNo}
              helperText={errors.tcNo}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
          
          {/* Durum Seçimi */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel id="status-label">Kullanıcı Durumu</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                label="Kullanıcı Durumu"
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
                <MenuItem value="pending">Beklemede</MenuItem>
              </Select>
              {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
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
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !!successMessage}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditModal;
