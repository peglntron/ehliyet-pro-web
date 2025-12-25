import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Avatar, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Business as BusinessIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useCompanyInfo, useUpdateCompanyInfo, useCompanyPhones, useCompanyIbans } from './api/useCompanyInfo';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useSnackbar } from '../../contexts/SnackbarContext';
import CompanyBasicInfo from './components/CompanyBasicInfo';
import CompanyAddressInfo from './components/CompanyAddressInfo';
import CompanyDescriptionInfo from './components/CompanyDescriptionInfo';
import CompanyPhonesCard from './components/CompanyPhonesCard';
import CompanyIbansCard from './components/CompanyIbansCard';
import CompanyStatusCard from './components/CompanyStatusCard';
import CompanyUsersTab from '../settings/components/CompanyUsersTab';
import AddUserModal from './components/AddUserModal';
import { getImageUrl } from '../../utils/api';

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
  const { showSnackbar } = useSnackbar();

  // State
  const [formData, setFormData] = useState<any>({});
  const [phoneDialog, setPhoneDialog] = useState(false);
  const [ibanDialog, setIbanDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [phoneForm, setPhoneForm] = useState<PhoneFormData>({ number: '', description: '' });
  const [ibanForm, setIbanForm] = useState<IbanFormData>({ iban: '', bankName: '', accountHolder: '', description: '' });
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingIbanId, setEditingIbanId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [logoUploading, setLogoUploading] = useState(false);

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

  // Handlers
  const handlePhoneAdd = () => {
    setPhoneForm({ number: '', description: '' });
    setEditingPhoneId(null);
    setPhoneDialog(true);
  };

  const handlePhoneEdit = (phone: any) => {
    setPhoneForm({ number: phone.number, description: phone.description });
    setEditingPhoneId(phone.id);
    setPhoneDialog(true);
  };

  const handlePhoneDelete = async (id: string) => {
    try {
      await deletePhone(id);
      showSnackbar('Telefon numarası silindi!', 'success');
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Silme sırasında hata oluştu!';
      console.error('Phone delete error:', error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handlePhoneSave = async () => {
    try {
      if (editingPhoneId) {
        await updatePhone(editingPhoneId, phoneForm);
        showSnackbar('Telefon numarası güncellendi!', 'success');
      } else {
        await addPhone(phoneForm);
        showSnackbar('Telefon numarası eklendi!', 'success');
      }
      setPhoneDialog(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'İşlem sırasında hata oluştu!';
      console.error('Phone save error:', error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleIbanAdd = () => {
    setIbanForm({ iban: '', bankName: '', accountHolder: '', description: '' });
    setEditingIbanId(null);
    setIbanDialog(true);
  };

  const handleIbanEdit = (iban: any) => {
    setIbanForm({ 
      iban: iban.iban, 
      bankName: iban.bankName, 
      accountHolder: iban.accountHolder, 
      description: iban.description 
    });
    setEditingIbanId(iban.id);
    setIbanDialog(true);
  };

  const handleIbanDelete = async (id: string) => {
    try {
      await deleteIban(id);
      showSnackbar('IBAN bilgisi silindi!', 'success');
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Silme sırasında hata oluştu!';
      console.error('IBAN delete error:', error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleIbanSave = async () => {
    try {
      if (editingIbanId) {
        await updateIban(editingIbanId, ibanForm);
        showSnackbar('IBAN bilgisi güncellendi!', 'success');
      } else {
        await addIban(ibanForm);
        showSnackbar('IBAN bilgisi eklendi!', 'success');
      }
      setIbanDialog(false);
      refetch();
    } catch (error: any) {
      const errorMessage = error.message || 'İşlem sırasında hata oluştu!';
      console.error('IBAN save error:', error);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showSnackbar('Sadece resim dosyaları yüklenebilir', 'error');
      return;
    }

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('companyId', company?.id || '');

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/companies/upload-logo', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev: any) => ({ ...prev, logo: result.data.logoUrl }));
        showSnackbar('Logo seçildi. Kaydetmek için Güncelle butonuna basın', 'info');
      } else {
        throw new Error(result.message || 'Logo yüklenemedi');
      }
    } catch (error) {
      showSnackbar('Logo yüklenirken hata oluştu', 'error');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCompanyInfoSave = async () => {
    try {
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
        logo: formData.logo,
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          mapLink: formData.mapLink
        }
      };

      await updateCompanyInfo(updateData);
      setEditDialog(false);
      
      // Header'daki logo'yu güncelle
      window.dispatchEvent(new CustomEvent('logoUpdated'));
      
      showSnackbar('Şirket bilgileri başarıyla güncellendi!', 'success');
      refetch();
    } catch (error) {
      showSnackbar('Güncelleme sırasında hata oluştu!', 'error');
    }
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

      {/* Header with Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          sx={{ 
            width: 60, 
            height: 60,
            border: '2px solid',
            borderColor: 'divider'
          }}
          src={getImageUrl(company.logo)}
          alt={company.name}
        >
          <BusinessIcon sx={{ fontSize: 35, color: 'primary.main' }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {company.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            İşletme Bilgileri
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab label="Genel Bilgiler" />
          <Tab label="İletişim" />
          <Tab label="Durum" />
          <Tab label="Kullanıcılar" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CompanyBasicInfo company={company} onEdit={() => setEditDialog(true)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <CompanyAddressInfo company={company} onEdit={() => setEditDialog(true)} />
            </Grid>
            <Grid item xs={12}>
              <CompanyDescriptionInfo description={company.description} onEdit={() => setEditDialog(true)} />
            </Grid>
          </Grid>
        )}

        {currentTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CompanyPhonesCard 
                phones={company.phones as any}
                onAdd={handlePhoneAdd}
                onEdit={handlePhoneEdit}
                onDelete={handlePhoneDelete}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CompanyIbansCard 
                ibans={company.ibans as any}
                onAdd={handleIbanAdd}
                onEdit={handleIbanEdit}
                onDelete={handleIbanDelete}
              />
            </Grid>
          </Grid>
        )}

        {currentTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CompanyStatusCard 
                isActive={company.isActive}
                registrationDate={company.registrationDate}
                licenseEndDate={company.licenseEndDate}
              />
            </Grid>
          </Grid>
        )}

        {currentTab === 3 && (
          <CompanyUsersTab onAddUser={() => setAddUserDialog(true)} />
        )}
      </Box>

      {/* Telefon Dialog */}
      <Dialog
        open={phoneDialog}
        onClose={() => setPhoneDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
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
            onClick={handlePhoneSave}
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
        <DialogTitle component="div">
          {editingIbanId ? 'IBAN Bilgisini Düzenle' : 'Yeni IBAN Bilgisi Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IBAN"
                value={ibanForm.iban}
                onChange={(e) => setIbanForm({...ibanForm, iban: e.target.value.toUpperCase()})}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                helperText="Boşluklarla veya boşluksuz girebilirsiniz"
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
            onClick={handleIbanSave}
            variant="contained"
            disabled={!ibanForm.iban.trim() || !ibanForm.bankName.trim()}
          >
            {editingIbanId ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ana Düzenleme Modalı - Devamı bir sonraki dosyada */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle component="div">
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
            
            {/* Şirket Logosu */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={formData.logo ? getImageUrl(formData.logo) : ''}
                  sx={{ width: 80, height: 80 }}
                >
                  <BusinessIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Şirket Logosu
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={logoUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    disabled={logoUploading}
                    size="small"
                  >
                    {logoUploading ? 'Yükleniyor...' : 'Logo Yükle'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Maksimum 5MB, JPG/PNG/WebP
                  </Typography>
                </Box>
              </Box>
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
                    const patterns = [
                      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
                      /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
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
            onClick={handleCompanyInfoSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updateLoading}
          >
            {updateLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Modal */}
      <AddUserModal
        open={addUserDialog}
        onClose={() => setAddUserDialog(false)}
        onSuccess={() => {
          showSnackbar('Kullanıcı başarıyla eklendi! SMS ile giriş bilgileri gönderildi.', 'success');
        }}
        onUserAdded={() => {
          setAddUserDialog(false);
          showSnackbar('Kullanıcı başarıyla eklendi!', 'success');
          refetch();
        }}
      />
    </Box>
  );
};

export default CompanyInfo;
