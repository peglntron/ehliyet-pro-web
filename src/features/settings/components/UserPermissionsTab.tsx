import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Switch,
  Alert, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Collapse, IconButton,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { UserPermissions } from '../../../types/permissions';
import { PERMISSION_DEFINITIONS } from '../../../types/permissions';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import axios from 'axios';

interface UserWithPermissions {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  permissions: UserPermissions;
}

const UserPermissionsTab: React.FC = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/companies/users/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Users with permissions:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      showSnackbar('Kullanıcı listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId: string, key: keyof UserPermissions) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedPermissions = {
      ...user.permissions,
      [key]: !user.permissions[key]
    };

    // Optimistic update
    setUsers(users.map(u => 
      u.id === userId ? { ...u, permissions: updatedPermissions } : u
    ));

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/companies/screen-permissions/${userId}`, updatedPermissions, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      showSnackbar('Yetki güncellendi', 'success');
    } catch (error: any) {
      console.error(error);
      showSnackbar(error.response?.data?.message || 'Güncelleme başarısız', 'error');
      // Revert on error
      await fetchUsers();
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const countActivePermissions = (permissions: UserPermissions) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Alert severity="info">
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon fontSize="small" />
          <Typography variant="body2">
            Henüz COMPANY_USER rolünde kullanıcı bulunmuyor.
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon fontSize="small" />
          <Typography variant="body2">
            Her kullanıcı için ayrı ayrı yetkilendirme yapabilirsiniz. 
            Değişiklikler anında kaydedilir.
          </Typography>
        </Box>
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', width: 50 }}></TableCell>
              <TableCell sx={{ color: 'white' }}>Kullanıcı</TableCell>
              <TableCell sx={{ color: 'white' }}>Telefon</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'center' }}>Aktif Yetkiler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow 
                  hover 
                  onClick={() => toggleExpand(user.id)}
                  sx={{ cursor: 'pointer', bgcolor: expandedUserId === user.id ? 'action.selected' : 'inherit' }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{
                        transform: expandedUserId === user.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography fontWeight={500}>
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${countActivePermissions(user.permissions)} / 10`}
                      color={countActivePermissions(user.permissions) > 5 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={expandedUserId === user.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Yetki</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '45%' }}>Açıklama</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '15%', textAlign: 'center' }}>Durum</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {PERMISSION_DEFINITIONS.map((permission) => (
                              <TableRow key={permission.key} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {permission.label}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Switch
                                    checked={user.permissions[permission.key]}
                                    onChange={() => handleToggle(user.id, permission.key)}
                                    color="primary"
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserPermissionsTab;
