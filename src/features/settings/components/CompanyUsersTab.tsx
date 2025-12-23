import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, CircularProgress, Alert, Button
} from '@mui/material';
import { Person as PersonIcon, Add as AddIcon } from '@mui/icons-material';
import { apiClient } from '../../../utils/api';

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
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
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
    </Box>
  );
};

export default CompanyUsersTab;
