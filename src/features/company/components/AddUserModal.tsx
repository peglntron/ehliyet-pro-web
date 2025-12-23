import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { apiClient } from '../../../utils/api';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'COMPANY_USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    // Telefon doğrulama
    const phonePattern = /^5\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      setError('Geçerli bir telefon numarası girin (5XXXXXXXXX)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/users/company', {
        ...formData,
        phone: formData.phone // DB sadece 5XXXXXXXXX formatında bekliyor
      });

      if (response.success) {
        onSuccess();
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Kullanıcı eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      role: 'COMPANY_USER'
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField
            label="Ad"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            fullWidth
            required
          />
          
          <TextField
            label="Soyad"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            fullWidth
            required
          />
          
          <TextField
            label="Telefon"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
              if (value.length <= 10) {
                setFormData({ ...formData, phone: value });
              }
            }}
            placeholder="5XXXXXXXXX"
            fullWidth
            required
            inputProps={{ maxLength: 10 }}
            InputProps={{
              startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>+90</Box>
            }}
            helperText="Giriş için kullanılacak telefon numarası (5 ile başlamalı)"
          />
          
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label="Rol"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="COMPANY_ADMIN">İşletme Yöneticisi</MenuItem>
              <MenuItem value="COMPANY_USER">İşletme Kullanıcısı</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mt: 1 }}>
            Kullanıcıya SMS ile giriş bilgileri ve şifresi gönderilecektir.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
