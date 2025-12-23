import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Divider, Chip, Grid, Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Numbers as NumbersIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  BusinessCenter as BusinessCenterIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

interface User {
  id: string;
  name: string;
  surname: string;
  phone: string;
  tcNo: string;
  role: string;
  status: string;
  createdAt?: string;
  lastLogin?: string;
}

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  open, 
  onClose, 
  user,
  onEdit,
  onToggleStatus
}) => {
  if (!user) return null;

  // Rol adını Türkçe olarak göster
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Sistem Yöneticisi';
      case 'company_admin':
        return 'Kurum Yöneticisi';
      default:
        return role;
    }
  };
  
  // Durum adını Türkçe olarak göster
  const getStatusName = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'pending':
        return 'Beklemede';
      default:
        return status;
    }
  };
  
  // Durum göstergesinin rengini belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Tarih formatı
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          Kullanıcı Detayları
        </Typography>
        <Button 
          variant="text" 
          color="inherit" 
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ minWidth: 'auto' }}
        >
          Kapat
        </Button>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {/* İki bölümlü kart yapısı */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Sol Taraf - Ana Kullanıcı Bilgileri */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  {user.name} {user.surname}
                </Typography>
                <Chip 
                  label={getStatusName(user.status)} 
                  color={getStatusColor(user.status) as any}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                />
              </Box>
              <Chip 
                label={getRoleName(user.role)} 
                variant="outlined"
                color={user.role === 'company_admin' ? 'primary' : 'default'}
                size="small"
                sx={{ borderRadius: 1 }}
              />
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} color={(theme) => theme.palette.primary.main} gutterBottom>
                Kişisel Bilgiler
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <PersonIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Ad Soyad</Typography>
                    <Typography variant="body2">{user.name} {user.surname}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <NumbersIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>T.C. Kimlik No</Typography>
                    <Typography variant="body2">{user.tcNo}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Sağ Taraf - Hesap Bilgileri */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} color={(theme) => theme.palette.primary.main} gutterBottom>
                Hesap Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <BusinessCenterIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Rol</Typography>
                    <Typography variant="body2">{getRoleName(user.role)}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Kayıt Tarihi</Typography>
                    <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <AccessTimeIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Son Giriş</Typography>
                    <Typography variant="body2">{formatDate(user.lastLogin)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
            
            {/* İstatistikler veya ek bilgiler */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} color={(theme) => theme.palette.primary.main} gutterBottom>
                Kullanıcı İstatistikleri
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>0</Typography>
                  <Typography variant="body2" color="text.secondary">Toplam Giriş</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>0</Typography>
                  <Typography variant="body2" color="text.secondary">Toplam İşlem</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onEdit(user)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Düzenle
        </Button>
        
        <Button
          variant="outlined"
          color={user.status === 'active' ? 'error' : 'success'}
          onClick={() => onToggleStatus(user)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {user.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailModal;
