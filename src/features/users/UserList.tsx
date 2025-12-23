import React, { useState } from 'react';
import {
  Box, Typography, Container, Button, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Tooltip, TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './api/useUsers';
import PageBreadcrumb from '../../components/PageBreadcrumb';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Rol adını Türkçe olarak göster
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Sistem Yöneticisi';
      case 'company_admin':
        return 'Kurum Yöneticisi';
      case 'instructor':
        return 'Eğitmen';
      case 'student':
        return 'Öğrenci';
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

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Başlık ve breadcrumb */}
        <PageBreadcrumb />
        
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          mt={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              Kullanıcı Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistem kullanıcılarını görüntüleyin, düzenleyin veya yeni kullanıcı ekleyin.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/users/create')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Yeni Kullanıcı Oluştur
          </Button>
        </Box>
        
        {/* Arama ve Filtreleme */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <TextField
            placeholder="Kullanıcı Ara..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ maxWidth: { md: 300 } }}
          />
        </Paper>
        
        {/* Kullanıcı Tablosu */}
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            mb: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>E-posta</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kurum</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Kullanıcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.name} {user.surname}
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.companyName || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleName(user.role)} 
                        size="small"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusName(user.status)} 
                        size="small"
                        color={getStatusColor(user.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default UserList;
