import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, CircularProgress, Alert, Button,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { apiClient } from '../../../utils/api';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { useAuth } from '../../../contexts/AuthContext';

interface CompanyUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  instructor?: {
    id: string;
    specialization?: string;
  };
}

interface CompanyUsersTabProps {
  onAddUser?: () => void;
}

const CompanyUsersTab: React.FC<CompanyUsersTabProps> = ({ onAddUser }) => {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();
  
  // Password reset dialog
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string;
    newPassword: string;
  }>({
    open: false,
    userId: null,
    userName: '',
    newPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/company');
      if (response.success && response.data) {
        setUsers(response.data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Kullanıcılar yüklenirken hata oluştu');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'COMPANY_ADMIN': 'İşletme Yöneticisi',
      'COMPANY_USER': 'İşletme Kullanıcısı',
      'INSTRUCTOR': 'Eğitmen'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'info' => {
    if (role === 'COMPANY_ADMIN') return 'primary';
    if (role === 'INSTRUCTOR') return 'info';
    return 'secondary';
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      const response = await apiClient.patch(`/users/${userId}/toggle-status`);
      
      if (response.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        ));
        showSnackbar(response.message || `Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} edildi`, 'success');
      } else {
        throw new Error(response.message || 'İşlem başarısız');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Kullanıcı durumu değiştirilirken hata oluştu', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      setActionLoading(userId);
      const response = await apiClient.post(`/users/${userId}/reset-password`);
      
      if (response.success && response.data?.newPassword) {
        setResetPasswordDialog({
          open: true,
          userId,
          userName,
          newPassword: response.data.newPassword
        });
        showSnackbar('Şifre başarıyla sıfırlandı', 'success');
      } else {
        throw new Error(response.message || 'İşlem başarısız');
      }
    } catch (err: any) {
      showSnackbar(err.message || 'Şifre sıfırlanırken hata oluştu', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(resetPasswordDialog.newPassword);
    showSnackbar('Şifre panoya kopyalandı', 'success');
  };

  const handleClosePasswordDialog = () => {
    setResetPasswordDialog({
      open: false,
      userId: null,
      userName: '',
      newPassword: ''
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h6" gutterBottom>
            İşletme Kullanıcıları
          </Typography>
          <Typography variant="body2" color="text.secondary">
            İşletmenize kayıtlı tüm kullanıcıları (yöneticiler, kullanıcılar ve eğitmenler) buradan görüntüleyebilirsiniz.
          </Typography>
        </Box>
        {onAddUser && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddUser}
            sx={{ borderRadius: 2 }}
          >
            Kullanıcı Ekle
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Kullanıcı</strong></TableCell>
                <TableCell><strong>Telefon</strong></TableCell>
                <TableCell><strong>Rol</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                <TableCell><strong>Son Giriş</strong></TableCell>
                <TableCell align="center"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      Kullanıcı bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          {user.instructor?.specialization && (
                            <Typography variant="caption" color="text.secondary">
                              {user.instructor.specialization}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Aktif' : 'Pasif'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Hiç giriş yapmadı'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title={user.isActive ? 'Pasife Al' : 'Aktif Et'}>
                          <span>
                            <IconButton
                              size="small"
                              color={user.isActive ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              disabled={actionLoading === user.id || (currentUser?.role !== 'ADMIN' && currentUser?.id === user.id)}
                            >
                              {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Şifre Yenile">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResetPassword(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={actionLoading === user.id || (currentUser?.role !== 'ADMIN' && currentUser?.id === user.id)}
                            >
                              <VpnKeyIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box mt={2}>
        <Alert severity="info">
          Toplam {users.length} kullanıcı bulundu.
          {users.filter(u => !u.isActive).length > 0 && ` (${users.filter(u => !u.isActive).length} pasif)`}
        </Alert>
      </Box>

      {/* Password Reset Dialog */}
      <Dialog open={resetPasswordDialog.open} onClose={handleClosePasswordDialog}>
        <DialogTitle>Şifre Yenilendi</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>{resetPasswordDialog.userName}</strong> kullanıcısı için yeni şifre oluşturuldu.
            Lütfen bu şifreyi kullanıcıya ileterek güvenli bir şekilde saklamasını sağlayın.
          </DialogContentText>
          <TextField
            fullWidth
            label="Yeni Şifre"
            value={resetPasswordDialog.newPassword}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopyPassword} edge="end">
                  <ContentCopyIcon />
                </IconButton>
              )
            }}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            Bu şifre sadece bir kez gösterilmektedir. Lütfen kopyalayın veya not edin.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyPassword} startIcon={<ContentCopyIcon />}>
            Kopyala
          </Button>
          <Button onClick={handleClosePasswordDialog} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyUsersTab;
