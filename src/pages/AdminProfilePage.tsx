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
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { useSnackbar } from '../contexts/SnackbarContext';

interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: string;
}

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/profile');
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phone: response.data.phone || '',
          email: response.data.email || ''
        });
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      showSnackbar('Profil bilgileri yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/auth/profile', formData);
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
        Sistem Yöneticisi Profili
      </Typography>

      {/* Profil Özet Kartı */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'white',
                color: 'error.main',
                fontSize: '2rem'
              }}
            >
              <AdminIcon fontSize="large" />
            </Avatar>
            <Box sx={{ color: 'white' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Sistem Yöneticisi - EhliyetPro
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Bilgi Uyarısı */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Sistem yöneticisi olarak profil bilgilerinizi güncelleyebilirsiniz. Telefon numaranız değiştirilemez.
      </Alert>

      {/* Profil Formu */}
      <Paper sx={{ p: 3 }}>
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
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminProfilePage;
