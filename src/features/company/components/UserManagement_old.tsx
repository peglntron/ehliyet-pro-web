import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Divider, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Tooltip, InputAdornment,
  CircularProgress, Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import UserCreateModal from './UserCreateModal';
import UserDetailModal from './UserDetailModal';
import UserEditModal from './UserEditModal';
import { 
  getCompanyUsers, 
  deleteCompanyUser, 
  updateCompanyUser,
  resetUserPassword,
  type CompanyUser 
} from '../api/useCompanyUsers';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface UserManagementProps {
  companyId: string;
  onUserCreated?: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ companyId, onUserCreated }) => {
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcıları yükle
  useEffect(() => {
    if (companyId) {
      loadUsers();
    }
  }, [companyId]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyUsers(companyId, { search: searchTerm });
      setUsers(data.users);
    } catch (err) {
      setError('Kullanıcılar yüklenirken bir hata oluştu');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.tcNo.includes(searchTerm)
  );

  // Kullanıcı oluşturulduğunda
  const handleUserCreated = (userId: string) => {
    // Gerçek bir uygulamada burada kullanıcı listesini yenileyebiliriz
    // Örnek olarak statik bir kullanıcı ekleyelim
    const newUser = { 
      id: userId, 
      name: 'Yeni', 
      surname: 'Yönetici', 
      phone: '05321234570', 
      tcNo: '12345678903',
      role: 'company_admin',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setUsers([...users, newUser]);
    
    // Dışarıdan gelen callback varsa çağır
    if (onUserCreated) {
      onUserCreated(userId);
    }
  };

  // Kullanıcıyı görüntüleme
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDetailModalOpen(true);
  };

  // Kullanıcıyı düzenleme
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserEditModalOpen(true);
  };

  // Kullanıcı durumunu değiştir (Aktif/Pasif)
  const handleToggleUserStatus = (user: User) => {
    // API çağrısı yapılacak
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    // Geçici olarak yerel state'i güncelle
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
  };

  // Kullanıcı düzenleme başarılı olduğunda
  const handleUserEdited = (userId: string) => {
    // Gerçek uygulamada burada API'den güncel veriyi çekebiliriz
    // Basitlik için burada sadece UI güncellendiğini varsayıyoruz

    // Dışarıdan gelen callback varsa çağır
    if (onUserCreated) {
      onUserCreated(userId);
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

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
        bgcolor: 'white'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Kurum Yöneticisi Listesi
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setUserCreateModalOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.2,
            px: 2.5,
          }}
        >
          Yeni Kurum Yöneticisi Ekle
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Kullanıcı Ara..."
          variant="outlined"
          size="small"
          sx={{ 
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {filteredUsers.length === 0 ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'grey.50'
          }}
        >
          <Typography color="text.secondary">
            Kullanıcı bulunamadı
          </Typography>
        </Paper>
      ) : (
        <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>T.C. Kimlik No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    {user.name} {user.surname}
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.tcNo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusName(user.status)} 
                      size="small"
                      color={getStatusColor(user.status) as any}
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Görüntüle">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewUser(user)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}>
                        <IconButton 
                          size="small" 
                          color={user.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.status === 'active' ? 
                            <ToggleOffIcon fontSize="small" /> : 
                            <ToggleOnIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Kullanıcı Oluşturma Modalı */}
      <UserCreateModal 
        open={userCreateModalOpen}
        onClose={() => setUserCreateModalOpen(false)}
        onSuccess={handleUserCreated}
        companyId={companyId}
      />
      
      {/* Kullanıcı Detay Modalı */}
      <UserDetailModal
        open={userDetailModalOpen}
        onClose={() => setUserDetailModalOpen(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
      />
      
      {/* Kullanıcı Düzenleme Modalı */}
      <UserEditModal
        open={userEditModalOpen}
        onClose={() => setUserEditModalOpen(false)}
        onSuccess={handleUserEdited}
        user={selectedUser}
      />
    </Paper>
  );
};

export default UserManagement;
