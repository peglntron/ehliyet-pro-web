import React from 'react';
import {
  Box, Typography, TextField, Paper, FormControl,
  InputLabel, Select, MenuItem, FormHelperText,
  InputAdornment, Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

interface UserInfoFormProps {
  formData: {
    userPhone: string;
    userFirstName: string;
    userLastName: string;
    userRole: 'COMPANY_ADMIN' | 'COMPANY_USER';
  };
  errors: {
    userPhone?: string;
    userFirstName?: string;
    userLastName?: string;
    userRole?: string;
  };
  onChange: (data: Partial<UserInfoFormProps['formData']>) => void;
  onErrorChange: (errors: Partial<UserInfoFormProps['errors']>) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange, 
  onErrorChange 
}) => {
  // Form field değişikliklerini handle et
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    
    // Hata varsa temizle
    if (errors[name as keyof typeof errors]) {
      onErrorChange({ [name as string]: undefined });
    }
  };
  
  // Select bileşeni için değişiklik işleyicisi
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    onChange({ [name as string]: value });
    
    // Hata varsa temizle
    if (errors[name as keyof typeof errors]) {
      onErrorChange({ [name as string]: undefined });
    }
  };
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 3,
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 3
        }}
      >
        <PersonIcon color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>
          Kullanıcı Bilgileri
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        İşletme için otomatik bir kullanıcı oluşturulacaktır. SMS ile giriş bilgileri gönderilecektir.
      </Alert>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Ad ve Soyad */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon fontSize="small" color="primary" />
              Ad *
            </Typography>
            <TextField
              name="userFirstName"
              value={formData.userFirstName}
              onChange={handleChange}
              fullWidth
              placeholder="Kullanıcı adını girin..."
              required
              error={!!errors.userFirstName}
              helperText={errors.userFirstName}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                }
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon fontSize="small" color="primary" />
              Soyad *
            </Typography>
            <TextField
              name="userLastName"
              value={formData.userLastName}
              onChange={handleChange}
              fullWidth
              placeholder="Kullanıcı soyadını girin..."
              required
              error={!!errors.userLastName}
              helperText={errors.userLastName}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                }
              }}
            />
          </Box>
        </Box>
        
        {/* Telefon ve Rol */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PhoneIcon fontSize="small" color="primary" />
              Telefon Numarası *
            </Typography>
            <TextField
              name="userPhone"
              value={formData.userPhone}
              onChange={handleChange}
              fullWidth
              placeholder="5XXXXXXXXX"
              required
              error={!!errors.userPhone}
              helperText={errors.userPhone || "Örnek: 5551234567"}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BadgeIcon fontSize="small" color="primary" />
              Kullanıcı Rolü *
            </Typography>
            <FormControl fullWidth required error={!!errors.userRole}>
              <InputLabel>Rol Seçin</InputLabel>
              <Select
                name="userRole"
                value={formData.userRole}
                label="Rol Seçin"
                onChange={handleSelectChange}
                sx={{ 
                  borderRadius: 2,
                  height: 56,
                  fontSize: '1rem'
                }}
              >
                <MenuItem value="COMPANY_ADMIN">
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Şirket Yöneticisi</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tüm yetkilere sahip kullanıcı
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="COMPANY_USER">
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Şirket Kullanıcısı</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sınırlı yetkiye sahip kullanıcı
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
              {errors.userRole && (
                <FormHelperText error>
                  {errors.userRole}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Otomatik Oluşturulacak Giriş Bilgileri:
          </Typography>
          <Typography variant="body2">
            • Kullanıcı Adı: {formData.userPhone || '(Telefon numarası)'}
          </Typography>
          <Typography variant="body2">
            • Şifre: 123456 (varsayılan)
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Bu bilgiler SMS ile kullanıcıya gönderilecektir.
          </Typography>
        </Alert>
      </Box>
    </Paper>
  );
};

export default UserInfoForm;
