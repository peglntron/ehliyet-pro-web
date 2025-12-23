import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Tooltip, TextField, Divider,
  InputAdornment, Snackbar, Alert, Link, Grid, Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  PeopleAlt as PeopleAltIcon,
  Map,
  Email as EmailIcon,
  Language as WebsiteIcon,
  AccountBalance as BankIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById } from './api/useCompanies';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';
import UserCreateModal from './components/UserCreateModal';
import type { Company } from './types/types';

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

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Local state for admin company detail view
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Örnek kullanıcılar
  const [users, setUsers] = useState([
    { 
      id: '1', 
      name: 'Ahmet', 
      surname: 'Yılmaz', 
      phone: '05321234567', 
      tcNo: '12345678901',
      role: 'company_admin',
      email:'asd@as.com',
      status: 'active'
    },
    { 
      id: '2', 
      name: 'Mehmet', 
      surname: 'Kaya', 
      phone: '05321234569', 
      tcNo: '12345678902',
      role: 'company_admin',
      email:'asd@as.com',
      status: 'pending'
    },
  ]);

  // Sekme değiştirme
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch company details for admin view
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
          setError('Şirket bilgileri yüklenirken hata oluştu');
          setLoading(false);
          setSnackbarMessage('Şirket bilgileri yüklenirken hata oluştu');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    }
  }, [id]);

  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
      status: 'pending'
    };
    
    setUsers([...users, newUser]);
    setSnackbarMessage('Kurum yöneticisi başarıyla oluşturuldu');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Snackbar kapatma
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Tarih formatını düzenleme
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

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
          
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/company/edit/${id}`)}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Düzenle
            </Button>
          </Box>
        </Box>
        
        {loading || !company ? (
          <LoadingIndicator 
            text="Şirket bilgileri yükleniyor..." 
            size="medium" 
            showBackground={true} 
          />
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Şirket bilgileri yüklenirken hata oluştu: {error}
          </Alert>
        ) : (
          <>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              {/* Temel Bilgileri Göster - Sekmelerden Önce */}
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  {/* Sol Taraf - İletişim Bilgileri */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                      İletişim Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <LocationOnIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Adres</Typography>
                          <Typography variant="body2">{company.address}</Typography>
                          <Typography variant="body2" color="text.secondary">{company.district}, {company.province}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <PhoneIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
                          <Typography variant="body2">{company.phone}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <PersonIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Yetkili</Typography>
                          <Typography variant="body2">{company.owner}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Sağ Taraf - Lisans Bilgileri */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                      Lisans Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <CalendarTodayIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Kayıt Tarihi</Typography>
                          <Typography variant="body2">{formatDate(company.registrationDate)}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <CalendarTodayIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Lisans Bitiş Tarihi</Typography>
                          <Typography variant="body2">{formatDate(company.licenseEndDate)}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <BusinessIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Durum</Typography>
                          <Chip 
                            label={company.isActive ? 'Aktif' : 'Pasif'} 
                            size="small" 
                            color={company.isActive ? 'success' : 'error'} 
                            sx={{ mt: 0.5, borderRadius: 1, fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Sekmeler */}
              <Box>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    px: 3,
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    },
                    bgcolor: 'grey.50'
                  }}
                >
                  <Tab 
                    label="Kullanıcılar" 
                    icon={<PeopleAltIcon />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} 
                  />
                  <Tab 
                    label="Telefon Numaraları" 
                    icon={<PhoneIcon />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} 
                  />
                  <Tab 
                    label="Banka Bilgileri" 
                    icon={<BankIcon />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} 
                  />
                  <Tab 
                    label="Konum" 
                    icon={<LocationOnIcon />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} 
                  />
                  <Tab 
                    label="Aktiviteler" 
                    icon={<BusinessIcon />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600, py: 2 }} 
                  />
                </Tabs>
              </Box>
              
              {/* Kullanıcılar Sekmesi */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
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
                              <TableCell>{user.tcNo || '-'}</TableCell>
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
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </TabPanel>
              
              {/* Konum Sekmesi */}
              {/* Telefon Numaraları Sekmesi */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Telefon Numaraları
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Telefon Ekle
                    </Button>
                  </Box>

                  {company?.phones && company.phones.length > 0 ? (
                    <Grid container spacing={2}>
                      {company.phones.map((phone, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper 
                            elevation={2} 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: theme => theme.shadows[4]
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <PhoneIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1" fontWeight={600}>
                                {phone.number}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {phone.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      Henüz telefon numarası eklenmemiş.
                    </Alert>
                  )}
                </Box>
              </TabPanel>

              {/* Banka Bilgileri Sekmesi */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Banka Bilgileri (IBAN)
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      IBAN Ekle
                    </Button>
                  </Box>

                  {company?.ibans && company.ibans.length > 0 ? (
                    <Grid container spacing={2}>
                      {company.ibans.map((iban, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper 
                            elevation={2} 
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: theme => theme.shadows[4]
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <BankIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1" fontWeight={600}>
                                {iban.bankName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                              {iban.iban}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Hesap Sahibi:</strong> {iban.accountHolder}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Açıklama:</strong> {iban.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      Henüz IBAN bilgisi eklenmemiş.
                    </Alert>
                  )}
                </Box>
              </TabPanel>

              {/* Konum Sekmesi */}
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Konum Bilgileri
                  </Typography>
                  
                  {company.location ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Google Maps linki varsa göster */}
                      {company.location.mapLink && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            Google Maps'te görüntülemek için{' '}
                            <Link 
                              href={company.location.mapLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ fontWeight: 600 }}
                            >
                              buraya tıklayın
                            </Link>
                          </Typography>
                        </Alert>
                      )}
                      
                      <Paper
                        variant="outlined"
                        sx={{
                          height: 400,
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {/* Harita Burada Gösterilecek */}
                        <Box 
                          sx={{ 
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=' + 
                              company.location.latitude + ',' + company.location.longitude + 
                              '&zoom=14&size=800x400&markers=color:red%7C' + 
                              company.location.latitude + ',' + company.location.longitude + 
                              '&key=YOUR_API_KEY")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        
                        <Button 
                          variant="contained"
                          startIcon={<Map />}
                          href={company.location.mapLink || `https://www.google.com/maps/search/?api=1&query=${company.location.latitude},${company.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Google Maps'te Aç
                        </Button>
                      </Paper>
                    </Box>
                  ) : (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 5, 
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Typography color="text.secondary">
                        Bu sürücü kursu için konum bilgisi bulunmamaktadır.
                      </Typography>
                      <Button
                        variant="outlined"
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => navigate(`/company/edit/${id}`)}
                      >
                        Konum Ekle
                      </Button>
                    </Paper>
                  )}
                </Box>
              </TabPanel>
              
              {/* Aktiviteler Sekmesi */}
              <TabPanel value={tabValue} index={4}>
                <Box sx={{ p: 3 }}>
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
      
      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDetail;