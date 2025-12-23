import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Alert, Chip, Avatar, Card, CardContent, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import { Business as BusinessIcon, Phone, AccountBalance, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon, Delete as DeleteIcon, CloudUpload as UploadIcon, Map as MapIcon } from '@mui/icons-material';
import { useCompanyInfo, useUpdateCompanyInfo, useCompanyPhones, useCompanyIbans } from './api/useCompanyInfo';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBreadcrumb from '../../components/PageBreadcrumb';

interface PhoneFormData {
  number: string;
  description: string;
}

interface IbanFormData {
  iban: string;
  bankName: string;
  accountHolder: string;
  description: string;
}

const CompanyInfo: React.FC = () => {
  // API hooks
  const { company, loading, error, refetch } = useCompanyInfo();
  const { updateCompanyInfo, loading: updateLoading } = useUpdateCompanyInfo();
  const { addPhone, updatePhone, deletePhone } = useCompanyPhones();
  const { addIban, updateIban, deleteIban } = useCompanyIbans();

  // State
  const [formData, setFormData] = useState<any>({});
  const [phoneDialog, setPhoneDialog] = useState(false);
  const [ibanDialog, setIbanDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [phoneForm, setPhoneForm] = useState<PhoneFormData>({ number: '', description: '' });
  const [ibanForm, setIbanForm] = useState<IbanFormData>({ iban: '', bankName: '', accountHolder: '', description: '' });
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingIbanId, setEditingIbanId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  // Initialize form data
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        owner: company.owner || '',
        authorizedPerson: company.authorizedPerson || '',
        email: company.email || '',
        website: company.website || '',
        description: company.description || '',
        address: company.address || '',
        district: company.district || '',
        province: company.province || '',
        logo: company.logo || '',
        latitude: company.location?.latitude || '',
        longitude: company.location?.longitude || '',
        mapLink: company.location?.mapLink || ''
      });
    }
  }, [company]);

  // Helper function to calculate days until license expiry
  const calculateDaysUntilExpiry = (licenseEndDate: string) => {
    const today = new Date();
    const endDate = new Date(licenseEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Şirket bilgileri bulunamadı.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageBreadcrumb />

      {/* Header with Edit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
          İşletme Bilgileri
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setEditDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Düzenle
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Sol kolon */}
        <Grid item xs={12} lg={8}>
          {/* Temel Bilgiler */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" />
              Temel Bilgiler
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İşletme Adı"
                  value={company.name || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInput-underline:after': {
                      borderBottomColor: 'primary.main',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İşletme Sahibi"
                  value={company.owner || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Müdür"
                  value={company.authorizedPerson || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  value={company.email || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={company.website || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Adres Bilgileri */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Adres Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İl"
                  value={company.province || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İlçe"
                  value={company.district || ''}
                  variant="standard"
                  disabled
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  value={company.address || ''}
                  variant="standard"
                  disabled
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Google Maps Linki"
                  value={company.location?.mapLink || ''}
                  variant="standard"
                  disabled
                  placeholder="https://maps.google.com/?q=41.0082,28.9784"
                  sx={{
                    '& .MuiInput-underline:before': {
                      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  }}
                />
              </Grid>
              {company.location?.mapLink && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="white">
                      Google Maps'te görüntülemek için:
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      href={company.location.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        bgcolor: 'white', 
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      Haritada Aç
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Açıklama */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Açıklama
            </Typography>
            <TextField
              fullWidth
              label="İşletme Açıklaması"
              value={company.description || ''}
              variant="standard"
              disabled
              multiline
              rows={4}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  color: 'rgba(0, 0, 0, 0.87)',
                },
              }}
            />
          </Paper>

          {/* Telefon Numaraları */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="primary" />
                Telefon Numaraları
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setPhoneForm({ number: '', description: '' });
                  setEditingPhoneId(null);
                  setPhoneDialog(true);
                }}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Telefon Ekle
              </Button>
            </Box>
            {company.phones && company.phones.length > 0 ? (
              <Grid container spacing={2}>
                {company.phones.map((phone: any, index: number) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {phone.number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {phone.description}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPhoneForm({ number: phone.number, description: phone.description });
                                setEditingPhoneId(phone.id);
                                setPhoneDialog(true);
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                try {
                                  await deletePhone(phone.id);
                                  setSnackbarMessage('Telefon numarası silindi!');
                                  setSnackbarSeverity('success');
                                  setSnackbarOpen(true);
                                  refetch();
                                } catch (error) {
                                  setSnackbarMessage('Silme sırasında hata oluştu!');
                                  setSnackbarSeverity('error');
                                  setSnackbarOpen(true);
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">Henüz telefon numarası eklenmemiş.</Alert>
            )}
          </Paper>

          {/* IBAN Bilgileri */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance color="primary" />
                IBAN Bilgileri
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setIbanForm({ iban: '', bankName: '', accountHolder: '', description: '' });
                  setEditingIbanId(null);
                  setIbanDialog(true);
                }}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                IBAN Ekle
              </Button>
            </Box>
            {company.ibans && company.ibans.length > 0 ? (
              <Grid container spacing={2}>
                {company.ibans.map((iban: any, index: number) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} color="primary">
                              {iban.bankName}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', my: 1, bgcolor: 'white', p: 1, borderRadius: 1 }}>
                              {iban.iban}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Hesap Sahibi:</strong> {iban.accountHolder}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Açıklama:</strong> {iban.description}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setIbanForm({ 
                                  iban: iban.iban, 
                                  bankName: iban.bankName, 
                                  accountHolder: iban.accountHolder, 
                                  description: iban.description 
                                });
                                setEditingIbanId(iban.id);
                                setIbanDialog(true);
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={async () => {
                                try {
                                  await deleteIban(iban.id);
                                  setSnackbarMessage('IBAN bilgisi silindi!');
                                  setSnackbarSeverity('success');
                                  setSnackbarOpen(true);
                                  refetch();
                                } catch (error) {
                                  setSnackbarMessage('Silme sırasında hata oluştu!');
                                  setSnackbarSeverity('error');
                                  setSnackbarOpen(true);
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">Henüz IBAN bilgisi eklenmemiş.</Alert>
            )}
          </Paper>
        </Grid>

        {/* Sağ kolon */}
        <Grid item xs={12} lg={4}>
          {/* Logo */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              İşletme Logosu
            </Typography>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              src={company.logo}
            >
              <BusinessIcon sx={{ fontSize: 60 }} />
            </Avatar>
          </Paper>

          {/* Durum Bilgileri */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Durum Bilgileri
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Durum
              </Typography>
              <Chip
                label={company.isActive ? 'Aktif' : 'Pasif'}
                color={company.isActive ? 'success' : 'error'}
                variant="filled"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Kayıt Tarihi
              </Typography>
              <Typography variant="body1">
                {formatDate(company.registrationDate)}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Lisans Bitiş Tarihi
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {formatDate(company.licenseEndDate)}
              </Typography>
              {(() => {
                const daysUntilExpiry = calculateDaysUntilExpiry(company.licenseEndDate);
                let chipColor: 'success' | 'warning' | 'error' = 'success';
                let chipLabel = '';
                
                if (daysUntilExpiry < 0) {
                  chipColor = 'error';
                  chipLabel = `${Math.abs(daysUntilExpiry)} gün geçmiş!`;
                } else if (daysUntilExpiry === 0) {
                  chipColor = 'error';
                  chipLabel = 'Bugün bitiyor!';
                } else if (daysUntilExpiry <= 30) {
                  chipColor = 'error';
                  chipLabel = `${daysUntilExpiry} gün kaldı!`;
                } else if (daysUntilExpiry <= 90) {
                  chipColor = 'warning';
                  chipLabel = `${daysUntilExpiry} gün kaldı`;
                } else {
                  chipColor = 'success';
                  chipLabel = `${daysUntilExpiry} gün kaldı`;
                }

                return (
                  <Chip
                    label={chipLabel}
                    color={chipColor}
                    size="small"
                    variant="filled"
                    sx={{ 
                      fontWeight: 600,
                      animation: daysUntilExpiry <= 30 ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                );
              })()}
            </Box>
            
            {/* Google Maps Link */}
            {company.location?.mapLink && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Konum
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href={company.location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2, mb: 1 }}
                  fullWidth
                  startIcon={<MapIcon />}
                >
                  Google Maps'te Görüntüle
                </Button>
                {company.location.latitude && company.location.longitude && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                    {company.location.latitude}, {company.location.longitude}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Telefon Dialog */}
      <Dialog
        open={phoneDialog}
        onClose={() => setPhoneDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPhoneId ? 'Telefon Numarasını Düzenle' : 'Yeni Telefon Numarası Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={phoneForm.number}
                onChange={(e) => setPhoneForm({...phoneForm, number: e.target.value})}
                placeholder="0212 555 1234"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                value={phoneForm.description}
                onChange={(e) => setPhoneForm({...phoneForm, description: e.target.value})}
                placeholder="Ana Hat, Kayıt Hattı, Mobil Hat vs."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneDialog(false)}>İptal</Button>
          <Button 
            onClick={async () => {
              try {
                if (editingPhoneId) {
                  await updatePhone(editingPhoneId, phoneForm);
                  setSnackbarMessage('Telefon numarası güncellendi!');
                } else {
                  await addPhone(phoneForm);
                  setSnackbarMessage('Telefon numarası eklendi!');
                }
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setPhoneDialog(false);
                refetch();
              } catch (error) {
                setSnackbarMessage('İşlem sırasında hata oluştu!');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            disabled={!phoneForm.number.trim()}
          >
            {editingPhoneId ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IBAN Dialog */}
      <Dialog
        open={ibanDialog}
        onClose={() => setIbanDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingIbanId ? 'IBAN Bilgisini Düzenle' : 'Yeni IBAN Bilgisi Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IBAN"
                value={ibanForm.iban}
                onChange={(e) => setIbanForm({...ibanForm, iban: e.target.value})}
                placeholder="TR33 0006 1005 1978 6457 8413 26"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Banka Adı"
                value={ibanForm.bankName}
                onChange={(e) => setIbanForm({...ibanForm, bankName: e.target.value})}
                placeholder="İş Bankası, Ziraat Bankası vs."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hesap Sahibi"
                value={ibanForm.accountHolder}
                onChange={(e) => setIbanForm({...ibanForm, accountHolder: e.target.value})}
                placeholder="Ad Soyad veya Şirket Adı"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Açıklama"
                value={ibanForm.description}
                onChange={(e) => setIbanForm({...ibanForm, description: e.target.value})}
                placeholder="Ana Hesap, Kurs Ücretleri vs."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIbanDialog(false)}>İptal</Button>
          <Button 
            onClick={async () => {
              try {
                if (editingIbanId) {
                  await updateIban(editingIbanId, ibanForm);
                  setSnackbarMessage('IBAN bilgisi güncellendi!');
                } else {
                  await addIban(ibanForm);
                  setSnackbarMessage('IBAN bilgisi eklendi!');
                }
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setIbanDialog(false);
                refetch();
              } catch (error) {
                setSnackbarMessage('İşlem sırasında hata oluştu!');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            disabled={!ibanForm.iban.trim() || !ibanForm.bankName.trim()}
          >
            {editingIbanId ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ana Düzenleme Modalı */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Şirket Bilgilerini Düzenle
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Temel Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Temel Bilgiler
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İşletme Adı"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İşletme Sahibi"
                value={formData.owner || ''}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yetkili Kişi"
                value={formData.authorizedPerson || ''}
                onChange={(e) => setFormData({...formData, authorizedPerson: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                variant="outlined"
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website || ''}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                variant="outlined"
              />
            </Grid>

            {/* Logo Upload */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {(formData.logo || company?.logo) && (
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={formData.logo || company?.logo}
                  >
                    <BusinessIcon />
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {(formData.logo || company?.logo) ? 'Logo Değiştir' : 'Logo Yükle'}
                  <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Logo file seçildi:', file.name, file.size);
                      
                      // Dosya boyutu kontrolü (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setSnackbarMessage('Logo dosyası 5MB\'dan büyük olamaz');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        return;
                      }

                      // Desteklenen formatlar
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                      if (!allowedTypes.includes(file.type)) {
                        setSnackbarMessage('Sadece JPG, PNG veya WebP formatları desteklenmektedir');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        return;
                      }

                      try {
                        // FormData oluştur
                        const formDataUpload = new FormData();
                        formDataUpload.append('logo', file);
                        formDataUpload.append('companyId', company.id);

                        // Loading state
                        setSnackbarMessage('Logo yükleniyor...');
                        setSnackbarSeverity('info');
                        setSnackbarOpen(true);

                        // Backend'e upload et
                        const response = await fetch('/api/companies/upload-logo', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: formDataUpload
                        });

                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(`HTTP ${response.status}: ${errorText || 'Logo yükleme başarısız'}`);
                        }

                        const result = await response.json();

                        if (result.success) {
                          // Logo URL'ini form data'ya ekle (functional update kullan)
                          setFormData((prev: typeof formData) => ({...prev, logo: result.data.logoUrl}));
                          
                          // Header'daki logo'yu güncelle
                          window.dispatchEvent(new CustomEvent('logoUpdated'));
                          
                          setSnackbarMessage('Logo başarıyla yüklendi');
                          setSnackbarSeverity('success');
                          setSnackbarOpen(true);
                        } else {
                          throw new Error(result.message || 'Logo yükleme başarısız');
                        }
                      } catch (error) {
                        console.error('Logo upload hatası:', error);
                        setSnackbarMessage(error instanceof Error ? error.message : 'Logo yükleme sırasında hata oluştu');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                      }
                    }
                  }}
                />
              </Button>
              </Box>
            </Grid>

            {/* Adres Bilgileri */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                Adres Bilgileri
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İl"
                value={formData.province || ''}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlçe"
                value={formData.district || ''}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>

            {/* Google Maps Link */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Google Maps Linki"
                value={formData.mapLink || ''}
                onChange={(e) => {
                  const mapLink = e.target.value;
                  const newFormData = {...formData, mapLink};
                  
                  // Google Maps linkinden enlem/boylam çıkar
                  if (mapLink) {
                    // Farklı Google Maps link formatlarını destekle
                    const patterns = [
                      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ?q=lat,lng
                      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng
                      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng
                      /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // center=lat,lng
                    ];
                    
                    for (const pattern of patterns) {
                      const match = mapLink.match(pattern);
                      if (match) {
                        newFormData.latitude = match[1];
                        newFormData.longitude = match[2];
                        break;
                      }
                    }
                  }
                  
                  setFormData(newFormData);
                }}
                variant="outlined"
                placeholder="https://maps.google.com/?q=41.0082,28.9784"
                helperText="Google Maps linkini yapıştırın - enlem/boylam otomatik çıkarılacak"
              />
            </Grid>

            {/* Konum Bilgileri */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Enlem (Latitude)"
                value={formData.latitude || ''}
                onChange={(e) => {
                  const newFormData = {...formData, latitude: e.target.value};
                  // Otomatik mapLink oluştur
                  if (e.target.value && formData.longitude) {
                    newFormData.mapLink = `https://maps.google.com/?q=${e.target.value},${formData.longitude}`;
                  }
                  setFormData(newFormData);
                }}
                variant="outlined"
                helperText="Google Maps linkini otomatik oluşturmak için enlem/boylam girin"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Boylam (Longitude)"
                value={formData.longitude || ''}
                onChange={(e) => {
                  const newFormData = {...formData, longitude: e.target.value};
                  // Otomatik mapLink oluştur
                  if (e.target.value && formData.latitude) {
                    newFormData.mapLink = `https://maps.google.com/?q=${formData.latitude},${e.target.value}`;
                  }
                  setFormData(newFormData);
                }}
                variant="outlined"
              />
            </Grid>

            {/* Açıklama */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                Açıklama
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="İşletme Açıklaması"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            startIcon={<CancelIcon />}
          >
            İptal
          </Button>
          <Button
            onClick={async () => {
              try {
                console.log('Kaydet butonu tıklandı, formData:', formData);
                // Logo upload işlemi burada yapılabilir
                const updateData = {
                  name: formData.name,
                  owner: formData.owner,
                  authorizedPerson: formData.authorizedPerson,
                  email: formData.email,
                  website: formData.website,
                  description: formData.description,
                  address: formData.address,
                  district: formData.district,
                  province: formData.province,
                  logo: formData.logo, // Base64 string
                  location: {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    mapLink: formData.mapLink
                  }
                };

                console.log('API\'ye gönderilecek updateData:', updateData);
                await updateCompanyInfo(updateData);
                setEditDialog(false);
                
                // Header'daki logo'yu güncelle
                window.dispatchEvent(new CustomEvent('logoUpdated'));
                
                setSnackbarMessage('Şirket bilgileri başarıyla güncellendi!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                refetch();
              } catch (error) {
                setSnackbarMessage('Güncelleme sırasında hata oluştu!');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updateLoading}
          >
            {updateLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyInfo;