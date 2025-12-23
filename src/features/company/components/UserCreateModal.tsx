import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  MenuItem
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { createCompanyUser } from '../api/useCompanyUsers';

interface UserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  companyId: string;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({ 
  open, 
  onClose, 
  onUserCreated,
  companyId
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'COMPANY_ADMIN' as 'COMPANY_ADMIN' | 'COMPANY_USER'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      role: 'COMPANY_ADMIN'
    });
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
    setLoading(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Telefon alanı için özel işlem
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, ''); // Sadece rakamlar
      processedValue = processedValue.slice(0, 10); // Max 10 karakter (5XXXXXXXXX)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    
    const phoneRegex = /^5[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (5XXXXXXXXX)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setGeneralError(null);
      
      await createCompanyUser(companyId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: formData.role
      });
      
      setSuccessMessage('Kullanıcı başarıyla oluşturuldu!');
      
      setTimeout(() => {
        onUserCreated();
        handleClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('Kullanıcı eklenirken hata:', err);
      setGeneralError(err.response?.data?.message || 'Kullanıcı eklenirken hata oluştu');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Yeni Kullanıcı Ekle</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider />
      
      <DialogContent>
        {generalError && <Alert severity="error" sx={{ mb: 3 }}>{generalError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Ad"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={loading || !!successMessage}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>
            }}
          />
          
          <TextField
            fullWidth
            label="Soyad"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={loading || !!successMessage}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>
            }}
          />
          
          <TextField
            fullWidth
            label="Telefon"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone || 'Örnek: 5321234567'}
            disabled={loading || !!successMessage}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">+90</Typography>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            select
            fullWidth
            label="Rol"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading || !!successMessage}
          >
            <MenuItem value="COMPANY_ADMIN">Yönetici</MenuItem>
            <MenuItem value="COMPANY_USER">Kullanıcı</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !!successMessage}>
          {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserCreateModal;
