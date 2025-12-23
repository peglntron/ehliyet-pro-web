import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Tooltip, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import UserCreateModal from './UserCreateModal';
import { 
  getCompanyUsers, 
  deleteCompanyUser, 
  updateCompanyUser,
  resetUserPassword,
  type CompanyUser 
} from '../api/useCompanyUsers';
import { formatDate, formatDateTime } from '../../../utils/dateFormat';

interface UserManagementProps {
  companyId: string;
  onUserCreated?: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ companyId, onUserCreated }) => {
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CompanyUser | null>(null);

  // Kullanıcıları yükle
  useEffect(() => {
    if (companyId) {
      loadUsers();
    }
  }, [companyId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getCompanyUsers(companyId);
      setUsers(response.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // Kullanıcı oluşturulduğunda
  const handleUserCreated = () => {
    setUserCreateModalOpen(false);
    loadUsers(); // Listeyi yenile
    if (onUserCreated) {
      onUserCreated('success');
    }
  };

  // Kullanıcı silme
  const handleDeleteClick = (user: CompanyUser) => {
    if (user.role === 'INSTRUCTOR') {
      alert('Eğitmen kullanıcıları "Eğitmenler" sekmesinden yönetilmelidir.');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteCompanyUser(userToDelete.id);
      loadUsers(); // Listeyi yenile
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Kullanıcı silinirken hata oluştu');
    }
  };

  // Kullanıcı durumunu değiştir
  const handleToggleStatus = async (user: CompanyUser) => {
    if (user.role === 'INSTRUCTOR') {
      alert('Eğitmen durumu "Eğitmenler" sekmesinden değiştirilmelidir.');
      return;
    }
    try {
      await updateCompanyUser(user.id, { isActive: !user.isActive });
      loadUsers(); // Listeyi yenile
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Kullanıcı durumu değiştirilirken hata oluştu');
    }
  };

  // Şifre sıfırlama
  const handleResetPassword = async (user: CompanyUser) => {
    try {
      const result = await resetUserPassword(user.id);
      alert(`Yeni şifre: ${result.temporaryPassword}\n\nBu şifre kullanıcıya SMS ile gönderildi.`);
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Şifre sıfırlanırken hata oluştu');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'COMPANY_ADMIN': { label: 'Yönetici', color: 'primary' as const },
      'COMPANY_USER': { label: 'Kullanıcı', color: 'default' as const },
      'INSTRUCTOR': { label: 'Eğitmen', color: 'secondary' as const },
      'STUDENT': { label: 'Öğrenci', color: 'info' as const }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Chip label="Aktif" color="success" size="small" />;
    }
    return <Chip label="Pasif" color="default" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Başlık ve Arama */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setUserCreateModalOpen(true)}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      {/* Arama */}
      <TextField
        fullWidth
        placeholder="Ad, Soyad veya Telefon ile ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Kullanıcı Tablosu */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Ad Soyad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Oluşturulma</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Son Giriş</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'Arama kriterlerine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı eklenmemiş'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>+90 {user.phone}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                  <TableCell>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(user.lastLogin)}
                  </TableCell>
                  <TableCell align="center">
                    {user.role === 'INSTRUCTOR' ? (
                      <Tooltip title="Eğitmen kaydı 'Eğitmenler' sekmesinden yönetilir">
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Eğitmenler sekmesinden yönetilir
                        </Typography>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Şifre Sıfırla">
                          <IconButton 
                            size="small" 
                            onClick={() => handleResetPassword(user)}
                            sx={{ color: '#3b82f6' }}
                          >
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? "Pasif Yap" : "Aktif Yap"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleStatus(user)}
                            sx={{ color: user.isActive ? '#10b981' : '#6b7280' }}
                          >
                            {user.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(user)}
                            sx={{ color: '#ef4444' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Kullanıcı Oluşturma Modal */}
      <UserCreateModal
        open={userCreateModalOpen}
        onClose={() => setUserCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
        companyId={companyId}
      />

      {/* Silme Onay Dialogu */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userToDelete && (
              <>
                <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                <br />
                Bu işlem geri alınamaz.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
