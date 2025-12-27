import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button,
  Chip, IconButton, TextField,
  Grid, Dialog, DialogTitle, 
  DialogContent, DialogActions
} from '@mui/material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  PeopleAlt as PeopleAltIcon,
  Map,
  AccountBalance as BankIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById, addCompanyPhone, addCompanyIban, deleteCompanyPhone, deleteCompanyIban, updateCompany } from './api/useCompanies';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';
import UserManagement from './components/UserManagement';
import type { Company } from './types/types';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  
  // Sadece ADMIN ve COMPANY_ADMIN değiştirebilir
  const canEdit = user?.role === 'ADMIN' || user?.role === 'COMPANY_ADMIN';
  
  // Local state for admin company detail view
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [ibanModalOpen, setIbanModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [phoneForm, setPhoneForm] = useState({ number: '', description: '' });
  const [ibanForm, setIbanForm] = useState({ iban: '', bankName: '', accountHolder: '', description: '' });
  const [locationForm, setLocationForm] = useState({ latitude: '', longitude: '', mapLink: '' });
  const [saving, setSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  // IBAN formatlaması - TR00 0000 0000 0000 0000 0000 0000 00
  const formatIban = (iban: string) => {
    // Boşlukları ve TR'yi kaldır
    const cleaned = iban.replace(/\s/g, '').replace(/^TR/i, '');
    // TR + 2 hane + her 4 hanede bir boşluk
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return `TR${formatted}`;
  };

  // Sekme değiştirme
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Telefon kaydetme
  const handleSavePhone = async () => {
    if (!id) return;
    
    if (!phoneForm.number || !phoneForm.description) {
      showSnackbar('Telefon numarası ve açıklama zorunludur', 'error');
      return;
    }

    setSaving(true);
    try {
      await addCompanyPhone(id, phoneForm);
      showSnackbar('Telefon numarası başarıyla eklendi', 'success');
      setPhoneModalOpen(false);
      setPhoneForm({ number: '', description: '' });
      
      // Şirket bilgilerini yenile
      const updatedCompany = await getCompanyById(id);
      setCompany(updatedCompany);
    } catch (error) {
      console.error('Error adding phone:', error);
      showSnackbar('Telefon eklenirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  // IBAN kaydetme
  const handleSaveIban = async () => {
    if (!id) return;
    
    if (!ibanForm.iban || !ibanForm.bankName || !ibanForm.accountHolder || !ibanForm.description) {
      showSnackbar('Tüm alanlar zorunludur', 'error');
      return;
    }

    setSaving(true);
    try {
      // IBAN'ı boşluksuz halde gönder
      const cleanedIban = ibanForm.iban.replace(/\s/g, '');
      await addCompanyIban(id, { ...ibanForm, iban: cleanedIban });
      showSnackbar('IBAN bilgisi başarıyla eklendi', 'success');
      setIbanModalOpen(false);
      setIbanForm({ iban: '', bankName: '', accountHolder: '', description: '' });
      
      // Şirket bilgilerini yenile
      const updatedCompany = await getCompanyById(id);
      setCompany(updatedCompany);
    } catch (error) {
      console.error('Error adding IBAN:', error);
      showSnackbar('IBAN eklenirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Telefon silme
  const handleDeletePhone = async (phoneId: string) => {
    if (!id) return;
    
    if (!confirm('Bu telefon numarasını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteCompanyPhone(phoneId);
      showSnackbar('Telefon numarası başarıyla silindi', 'success');
      
      // Şirket bilgilerini yenile
      const updatedCompany = await getCompanyById(id);
      setCompany(updatedCompany);
    } catch (error) {
      console.error('Error deleting phone:', error);
      showSnackbar('Telefon silinirken hata oluştu', 'error');
    }
  };

  // IBAN silme
  const handleDeleteIban = async (ibanId: string) => {
    if (!id) return;
    
    if (!confirm('Bu IBAN bilgisini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteCompanyIban(ibanId);
      showSnackbar('IBAN bilgisi başarıyla silindi', 'success');
      
      // Şirket bilgilerini yenile
      const updatedCompany = await getCompanyById(id);
      setCompany(updatedCompany);
    } catch (error) {
      console.error('Error deleting IBAN:', error);
      showSnackbar('IBAN silinirken hata oluştu', 'error');
    }
  };

  // Konum kaydetme
  const handleSaveLocation = async () => {
    if (!id) return;
    
    if (!locationForm.mapLink && (!locationForm.latitude || !locationForm.longitude)) {
      showSnackbar('Google Maps linki veya enlem/boylam bilgisi gereklidir', 'error');
      return;
    }

    setSaving(true);
    try {
      const locationData: any = {
        mapLink: locationForm.mapLink
      };
      
      // Enlem/boylam varsa ekle
      if (locationForm.latitude && locationForm.longitude) {
        locationData.latitude = parseFloat(locationForm.latitude);
        locationData.longitude = parseFloat(locationForm.longitude);
      }
      
      await updateCompany(id, { location: locationData });
      showSnackbar('Konum bilgisi başarıyla eklendi', 'success');
      setLocationModalOpen(false);
      setLocationForm({ latitude: '', longitude: '', mapLink: '' });
      
      // Şirket bilgilerini yenile
      const updatedCompany = await getCompanyById(id);
      setCompany(updatedCompany);
    } catch (error) {
      console.error('Error adding location:', error);
      showSnackbar('Konum eklenirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Fetch company details for admin view
  useEffect(() => {
    if (id) {
      setLoading(true);
      getCompanyById(id)
        .then(data => {
          console.log('=== COMPANY DATA FROM API ===', data);
          console.log('Phones:', data.phones);
          console.log('Ibans:', data.ibans);
          setCompany(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching company details:', error);
          setError('Şirket bilgileri yüklenirken hata oluştu');
          setLoading(false);
          showSnackbar('Şirket bilgileri yüklenirken hata oluştu', 'error');
        });
    }
  }, [id]);

  // Tarih formatını düzenleme
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return '-';
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
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', color: 'error.dark', borderRadius: 1 }}>
            Şirket bilgileri yüklenirken hata oluştu: {error}
          </Box>
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
                          <Typography variant="body2">
                            {company.users?.find(u => u.role === 'COMPANY_ADMIN')?.phone 
                              ? `+90 ${company.users.find(u => u.role === 'COMPANY_ADMIN')?.phone}` 
                              : '-'}
                          </Typography>
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
                <UserManagement companyId={id || ''} />
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
                      onClick={() => setPhoneModalOpen(true)}
                      disabled={!canEdit}
                      sx={{ borderRadius: 2 }}
                    >
                      Telefon Ekle
                    </Button>
                  </Box>

                  {company?.phones && company.phones.length > 0 ? (
                    <Grid container spacing={2}>
                      {company.phones.map((phone) => (
                        <Grid item xs={12} sm={6} md={4} key={phone.id}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {phone.number}
                                </Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeletePhone(phone.id)}
                                disabled={!canEdit}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {phone.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      Henüz telefon numarası eklenmemiş.
                    </Typography>
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
                      onClick={() => setIbanModalOpen(true)}
                      disabled={!canEdit}
                      sx={{ borderRadius: 2 }}
                    >
                      IBAN Ekle
                    </Button>
                  </Box>

                  {company?.ibans && company.ibans.length > 0 ? (
                    <Grid container spacing={2}>
                      {company.ibans.map((iban) => (
                        <Grid item xs={12} md={6} key={iban.id}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BankIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {iban.bankName}
                                </Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteIban(iban.id)}
                                disabled={!canEdit}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                              {formatIban(iban.iban)}
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
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      Henüz IBAN bilgisi eklenmemiş.
                    </Typography>
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
                      <Button 
                        variant="contained"
                        startIcon={<Map />}
                        href={company.location.mapLink || `https://www.google.com/maps/search/?api=1&query=${company.location.latitude},${company.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5
                        }}
                      >
                        Google Maps'te Aç
                      </Button>
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
                        onClick={() => setLocationModalOpen(true)}
                        disabled={!canEdit}
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

      {/* Telefon Ekle Modal */}
      <Dialog open={phoneModalOpen} onClose={() => setPhoneModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Telefon Numarası Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Telefon Numarası"
              placeholder="0212 123 45 67"
              fullWidth
              value={phoneForm.number}
              onChange={(e) => setPhoneForm({ ...phoneForm, number: e.target.value })}
            />
            <TextField
              label="Açıklama"
              placeholder="Örn: Santral, Mobil, Faks"
              fullWidth
              value={phoneForm.description}
              onChange={(e) => setPhoneForm({ ...phoneForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneModalOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePhone}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IBAN Ekle Modal */}
      <Dialog open={ibanModalOpen} onClose={() => setIbanModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>IBAN Bilgisi Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Banka Adı"
              placeholder="Örn: Ziraat Bankası"
              fullWidth
              value={ibanForm.bankName}
              onChange={(e) => setIbanForm({ ...ibanForm, bankName: e.target.value })}
            />
            <TextField
              label="IBAN"
              placeholder="TR00 0000 0000 0000 0000 0000 0000 00"
              fullWidth
              value={ibanForm.iban}
              onChange={(e) => {
                let value = e.target.value.replace(/\s/g, '').toUpperCase();
                // TR ekle eğer yoksa
                if (!value.startsWith('TR')) {
                  value = 'TR' + value.replace(/^TR/i, '');
                }
                // Formatla: TR + her 4 karakterde bir boşluk
                const cleaned = value.replace(/^TR/i, '');
                const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
                setIbanForm({ ...ibanForm, iban: `TR${formatted}` });
              }}
            />
            <TextField
              label="Hesap Sahibi"
              placeholder="Ad Soyad / Şirket Adı"
              fullWidth
              value={ibanForm.accountHolder}
              onChange={(e) => setIbanForm({ ...ibanForm, accountHolder: e.target.value })}
            />
            <TextField
              label="Açıklama"
              placeholder="Örn: Ana Hesap, Taksit Hesabı"
              fullWidth
              value={ibanForm.description}
              onChange={(e) => setIbanForm({ ...ibanForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIbanModalOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveIban}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konum Ekle Modal */}
      <Dialog open={locationModalOpen} onClose={() => setLocationModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Konum Bilgisi Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Google Maps Linki"
              placeholder="https://maps.google.com/..."
              fullWidth
              value={locationForm.mapLink}
              onChange={(e) => setLocationForm({ ...locationForm, mapLink: e.target.value })}
              helperText="Google Maps'ten konumu kopyalayıp yapıştırabilirsiniz"
            />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              veya
            </Typography>
            <TextField
              label="Enlem (Latitude) - Opsiyonel"
              placeholder="Örn: 38.4192"
              fullWidth
              type="number"
              value={locationForm.latitude}
              onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
            />
            <TextField
              label="Boylam (Longitude) - Opsiyonel"
              placeholder="Örn: 27.1287"
              fullWidth
              type="number"
              value={locationForm.longitude}
              onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationModalOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveLocation}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyDetail;