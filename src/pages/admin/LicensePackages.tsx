import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { apiClient } from '../../utils/api';

interface LicensePackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const LicensePackages: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [packages, setPackages] = useState<LicensePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<LicensePackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    durationType: 'month' as 'day' | 'month',
    price: '',
    description: '',
    isActive: true
  });

  // Paketleri yükle
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/license-packages');
      if (response.success && response.data) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      showSnackbar('Paketler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Yeni paket ekle modal'ını aç
  const handleAddClick = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      duration: '',
      durationType: 'month',
      price: '',
      description: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  // 7 günlük deneme paketi şablonu
  const handleTrialTemplate = () => {
    setFormData({
      name: '7 Günlük Deneme',
      duration: '7',
      durationType: 'day',
      price: '0',
      description: 'Ücretsiz 7 günlük deneme süresi',
      isActive: true
    });
  };

  // Paket düzenle modal'ını aç
  const handleEditClick = (pkg: LicensePackage) => {
    setEditingPackage(pkg);
    // Süre tipini belirle: eğer 1 aydan az ise gün, değilse ay
    const isDays = pkg.duration < 1;
    setFormData({
      name: pkg.name,
      duration: isDays ? Math.round(pkg.duration * 30).toString() : pkg.duration.toString(),
      durationType: isDays ? 'day' : 'month',
      price: pkg.price.toString(),
      description: pkg.description || '',
      isActive: pkg.isActive
    });
    setDialogOpen(true);
  };

  // Form kaydet
  const handleSave = async () => {
    try {
      // Validasyon
      if (!formData.name || !formData.duration || !formData.price) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun', 'warning');
        return;
      }

      // Süreyi aya çevir (backend ay bazında saklıyor)
      const durationValue = parseInt(formData.duration);
      const durationInMonths = formData.durationType === 'day' 
        ? durationValue / 30 
        : durationValue;

      const data = {
        name: formData.name,
        duration: durationInMonths,
        price: parseFloat(formData.price),
        description: formData.description || null,
        isActive: formData.isActive
      };

      if (editingPackage) {
        // Güncelle
        const response = await apiClient.put(`/admin/license-packages/${editingPackage.id}`, data);
        if (response.success) {
          showSnackbar('Paket başarıyla güncellendi', 'success');
          fetchPackages();
          setDialogOpen(false);
        }
      } else {
        // Yeni ekle
        const response = await apiClient.post('/admin/license-packages', data);
        if (response.success) {
          showSnackbar('Paket başarıyla oluşturuldu', 'success');
          fetchPackages();
          setDialogOpen(false);
        }
      }
    } catch (error: any) {
      console.error('Error saving package:', error);
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  // Paket sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/admin/license-packages/${id}`);
      if (response.success) {
        showSnackbar('Paket başarıyla silindi', 'success');
        fetchPackages();
      }
    } catch (error: any) {
      console.error('Error deleting package:', error);
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageBreadcrumb />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Lisans Paketleri Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Yeni Paket Ekle
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Önemli:</strong> Fiyat güncellemesi yeni alımlarda geçerli olur. Mevcut aktif lisanslar eski fiyattan devam eder.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Paket Adı</strong></TableCell>
              <TableCell align="center"><strong>Süre (Ay)</strong></TableCell>
              <TableCell align="right"><strong>Fiyat</strong></TableCell>
              <TableCell><strong>Açıklama</strong></TableCell>
              <TableCell align="center"><strong>Durum</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Yükleniyor...</TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Henüz paket bulunmuyor</TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => {
                // Süreyi formatla: 1 aydan az ise gün, değilse ay olarak göster
                const isDays = pkg.duration < 1;
                const displayDuration = isDays 
                  ? `${Math.ceil(pkg.duration * 30)} Gün`
                  : `${pkg.duration} Ay`;
                
                return (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell align="center">{displayDuration}</TableCell>
                    <TableCell align="right">{formatCurrency(pkg.price)}</TableCell>
                    <TableCell>{pkg.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={pkg.isActive ? 'Aktif' : 'Pasif'}
                      color={pkg.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(pkg)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPackage ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Hızlı Şablon Butonu - Sadece yeni paket eklerken */}
            {!editingPackage && (
              <Button 
                variant="outlined" 
                onClick={handleTrialTemplate}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                📋 7 Günlük Deneme Şablonunu Kullan
              </Button>
            )}
            
            <TextField
              label="Paket Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Süre"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                sx={{ flex: 2 }}
                helperText={formData.durationType === 'day' ? 'Gün olarak giriniz' : 'Ay olarak giriniz'}
              />
              <TextField
                select
                label="Birim"
                value={formData.durationType}
                onChange={(e) => setFormData({ ...formData, durationType: e.target.value as 'day' | 'month' })}
                sx={{ flex: 1 }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="day">Gün</option>
                <option value="month">Ay</option>
              </TextField>
            </Box>
            
            <TextField
              label="Fiyat (TL)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              fullWidth
              helperText="Fiyat güncellemesi yeni alımlarda geçerli olur"
            />
            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Aktif"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CancelIcon />}>
            İptal
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LicensePackages;
