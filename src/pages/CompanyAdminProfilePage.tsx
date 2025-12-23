import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { useSnackbar } from '../contexts/SnackbarContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  companyName?: string;
}

const CompanyAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyName: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/profile');
      if (response.success && response.data) {
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          companyName: response.data.company?.name || ''
        });
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      showSnackbar('Profil bilgileri yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handlePasswordChange = (field: keyof typeof passwordData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      if (response.success) {
        showSnackbar('Profil bilgileriniz güncellendi', 'success');
        fetchProfile();
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      showSnackbar('Profil güncellenemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('Yeni şifreler eşleşmiyor', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showSnackbar('Şifre en az 6 karakter olmalıdır', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        showSnackbar('Şifreniz başarıyla değiştirildi', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Şifre değiştirilirken hata:', error);
      showSnackbar(error.message || 'Şifre değiştirilemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Profil Ayarları
      </Typography>

      {/* Profil Özet Kartı */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {formData.firstName?.[0]}{formData.lastName?.[0]}
            </Avatar>
            <Box sx={{ color: 'white' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" />
                {formData.companyName || 'Sürücü Kursu'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Kişisel Bilgiler */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Kişisel Bilgiler
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ad"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Soyad"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefon"
              value={formData.phone}
              disabled
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              helperText="Telefon numarası değiştirilemez"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={fetchProfile}
            disabled={saving}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Paper>

      {/* Şifre Değiştirme */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Şifre Değiştir
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Alert severity="info" sx={{ mb: 3 }}>
          Güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showPassword.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      edge="end"
                    >
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Yeni Şifre"
              type={showPassword.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText="En az 6 karakter"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Yeni Şifre (Tekrar)"
              type={showPassword.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      edge="end"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<LockIcon />}
            onClick={handleChangePassword}
            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Şifreyi Değiştir
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompanyAdminProfilePage;
