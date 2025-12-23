import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Tooltip, TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById } from './api/useCompanies';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';
import UserCreateModal from './components/UserCreateModal';

// Sekme panel component'i
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);

  // Örnek kullanıcılar
  const [users, setUsers] = useState([
    { 
      id: '1', 
      name: 'Ahmet', 
      surname: 'Yılmaz', 
      phone: '05321234567', 
      email: 'ahmet@example.com',
      role: 'company_admin',
      status: 'active'
    },
    { 
      id: '2', 
      name: 'Ayşe', 
      surname: 'Demir', 
      phone: '05321234568', 
      email: 'ayse@example.com',
      role: 'student',
      status: 'active'
    },
    { 
      id: '3', 
      name: 'Mehmet', 
      surname: 'Kaya', 
      phone: '05321234569', 
      email: 'mehmet@example.com',
      role: 'instructor',
      status: 'pending'
    },
  ]);

  // Sekme değiştirme
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Şirket detaylarını yükle
  useEffect(() => {
    if (id) {
      setLoading(true);
      getCompanyById(id)
        .then(data => {
          setCompany(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching company details:', error);
          setLoading(false);
        });
    }
  }, [id]);

  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kullanıcı oluşturulduğunda
  const handleUserCreated = (userId: string) => {
    console.log('Yeni kullanıcı oluşturuldu, ID:', userId);
    // Gerçek bir uygulamada burada kullanıcı listesini yenileyebiliriz
    // Örnek olarak statik bir kullanıcı ekleyelim
    const newUser = { 
      id: userId, 
      name: 'Yeni', 
      surname: 'Kullanıcı', 
      phone: '05321234570', 
      email: 'yeni@example.com',
      role: 'student',
      status: 'pending'
    };
    setUsers([...users, newUser]);
  };

  // Rol adını Türkçe olarak göster
  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Sistem Yöneticisi';
      case 'COMPANY':
        return 'Kurum Yöneticisi';
      case 'INSTRUCTOR':
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
              {loading ? 'Yükleniyor...' : company?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {loading ? '' : `${company?.address}, ${company?.district}, ${company?.province}`}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/company')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Listeye Dön
          </Button>
        </Box>
        
        {loading ? (
          <LoadingIndicator 
            text="Şirket bilgileri yükleniyor..." 
            size="medium" 
            showBackground={true} 
          />
        ) : (
          <>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              {/* Sekmeler */}
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab label="Şirket Bilgileri" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Kullanıcılar" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Aktiviteler" sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>
              
              {/* Şirket Bilgileri Sekmesi */}
              <TabPanel value={tabValue} index={0}>
                <Box p={3}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    İletişim Bilgileri
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2} mb={4}>
                    <Box display="flex" gap={1} alignItems="center">
                      <LocationOnIcon color="primary" fontSize="small" />
                      <Typography>
                        <strong>Adres:</strong> {company?.address}, {company?.district}, {company?.province}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <PhoneIcon color="primary" fontSize="small" />
                      <Typography>
                        <strong>Telefon:</strong> {company?.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <PersonIcon color="primary" fontSize="small" />
                      <Typography>
                        <strong>Yetkili:</strong> {company?.owner}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Lisans Bilgileri
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" gap={1} alignItems="center">
                      <CalendarTodayIcon color="primary" fontSize="small" />
                      <Typography>
                        <strong>Kayıt Tarihi:</strong> {new Date(company?.registrationDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography>
                        <strong>Lisans Bitiş Tarihi:</strong> {new Date(company?.licenseEndDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip 
                        label={company?.isActive ? 'Aktif' : 'Pasif'} 
                        color={company?.isActive ? 'success' : 'error'} 
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Kullanıcılar Sekmesi */}
              <TabPanel value={tabValue} index={1}>
                <Box p={3}>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Kullanıcı Listesi
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setUserCreateModalOpen(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Yeni Kullanıcı Ekle
                    </Button>
                  </Box>
                  
                  <TextField
                    fullWidth
                    placeholder="Kullanıcı Ara..."
                    variant="outlined"
                    size="small"
                    sx={{ 
                      mb: 2,
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
                  
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>E-posta</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={getRoleName(user.role)} 
                                  size="small"
                                  color={user.role === 'COMPANY' ? 'primary' : 'default'}
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
                </Box>
              </TabPanel>
              
              {/* Aktiviteler Sekmesi */}
              <TabPanel value={tabValue} index={2}>
                <Box p={3}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Kurum Aktiviteleri
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bu kuruma ait aktivite kayıtları burada görüntülenecektir.
                  </Typography>
                </Box>
              </TabPanel>
            </Paper>
          </>
        )}
      </Container>
      
      {/* Kullanıcı Oluşturma Modalı */}
      <UserCreateModal 
        open={userCreateModalOpen}
        onClose={() => setUserCreateModalOpen(false)}
        onSuccess={handleUserCreated}
        companyId={id || ''}
      />
    </Box>
  );
};

export default CompanyDetails;
