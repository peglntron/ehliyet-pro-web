import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import {
  useExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory
} from './api/useExpenseCategories';
import type { ExpenseCategory, ExpenseCategoryFormData } from './types/types';
import { useSnackbar } from '../../contexts/SnackbarContext';

const ExpenseCategoriesPage: React.FC = () => {
  const { categories, loading, refetch } = useExpenseCategories();
  const { showSnackbar } = useSnackbar();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<ExpenseCategoryFormData>({
    name: '',
    description: '',
    isActive: true,
    autoCreateDay: '',
    defaultAmount: '',
    paymentMethod: '',
    autoDescription: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleOpenDialog = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
        autoCreateDay: category.autoCreateDay || '',
        defaultAmount: category.defaultAmount?.toString() || '',
        paymentMethod: category.paymentMethod || '',
        autoDescription: category.autoDescription || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        isActive: true,
        autoCreateDay: '',
        defaultAmount: '',
        paymentMethod: '',
        autoDescription: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Kalem adı zorunludur', 'error');
      return;
    }

    // Otomatik gider validasyonu
    if (formData.autoCreateDay) {
      const day = typeof formData.autoCreateDay === 'string' 
        ? parseInt(formData.autoCreateDay) 
        : formData.autoCreateDay;
      
      if (day < 1 || day > 28) {
        showSnackbar('Otomatik oluşturma günü 1-28 arasında olmalıdır', 'error');
        return;
      }
      
      if (!formData.defaultAmount || parseFloat(formData.defaultAmount) <= 0) {
        showSnackbar('Otomatik gider için varsayılan tutar belirtilmelidir', 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        defaultAmount: formData.defaultAmount ? parseFloat(formData.defaultAmount) : undefined,
        autoCreateDay: formData.autoCreateDay ? 
          (typeof formData.autoCreateDay === 'string' ? parseInt(formData.autoCreateDay) : formData.autoCreateDay) 
          : undefined
      };
      
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, submitData);
        showSnackbar('Gider kalemi başarıyla güncellendi', 'success');
      } else {
        await createExpenseCategory(submitData);
        showSnackbar('Gider kalemi başarıyla oluşturuldu', 'success');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || 'Bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: ExpenseCategory) => {
    if (category._count && category._count.expenses > 0) {
      showSnackbar(`Bu kaleme ait ${category._count.expenses} adet gider var. Önce giderleri silmelisiniz.`, 'error');
      return;
    }

    if (!window.confirm(`"${category.name}" kalemini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await deleteExpenseCategory(category.id);
      showSnackbar('Gider kalemi başarıyla silindi', 'success');
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || 'Silme işlemi başarısız', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4, px: { xs: 2, md: 4 } }}>
      <PageBreadcrumb />

      {/* Header */}
      <Box sx={{
        mb: 4,
        mt: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CategoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1a202c">
              Gider Kalemleri
            </Typography>
            <Typography variant="body1" color="#64748b">
              Kira, Maaş, Stopaj, Yakıt gibi gider kalemlerini tanımlayın
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          Yeni Kalem Ekle
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Gider Kalemi Nedir?</strong> İşletmenizin gider kategorilerini (Kira, Maaş, Yakıt vb.) buradan tanımlayın. 
        Daha sonra gider girişlerinde bu kalemleri seçerek filtreleme ve raporlama yapabilirsiniz.
      </Alert>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Kalem Adı</strong></TableCell>
                <TableCell><strong>Açıklama</strong></TableCell>
                <TableCell><strong>Otomatik Gider</strong></TableCell>
                <TableCell align="center"><strong>Gider Sayısı</strong></TableCell>
                <TableCell align="center"><strong>Durum</strong></TableCell>
                <TableCell align="right"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      Henüz gider kalemi eklenmemiş
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Başlamak için "Yeni Kalem Ekle" butonuna tıklayın
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{category.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {category.autoCreateDay && category.defaultAmount ? (
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            Her ayın {category.autoCreateDay}. günü
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.defaultAmount.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={category._count?.expenses || 0}
                        size="small"
                        color={category._count?.expenses ? 'info' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={category.isActive ? 'Aktif' : 'Pasif'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(category)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Gider Kalemini Düzenle' : 'Yeni Gider Kalemi'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Kalem Adı *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Kira, Maaş, Stopaj, Yakıt"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            {/* Otomatik Gider Oluşturma */}
            <Box sx={{ 
              bgcolor: '#f0f7ff', 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid #2196f3',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>
                🔄 Otomatik Gider Oluşturma (İsteğe Bağlı)
              </Typography>
              <Alert severity="info" sx={{ mb: 1 }}>
                Bu gider kaleminin her ay otomatik oluşturulmasını istiyorsanız aşağıdaki alanları doldurun
              </Alert>
              
              <TextField
                fullWidth
                label="Her Ayın Kaçında Oluşturulsun?"
                type="number"
                value={formData.autoCreateDay}
                onChange={(e) => setFormData({ ...formData, autoCreateDay: e.target.value ? parseInt(e.target.value) : '' })}
                inputProps={{ min: 1, max: 28 }}
                placeholder="Örn: 5 (Her ayın 5'inde)"
                helperText="1-28 arası bir gün seçin (boş bırakılabilir)"
                InputProps={{ sx: { borderRadius: 2 } }}
                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              />
              
              <TextField
                fullWidth
                label="Varsayılan Tutar (₺)"
                type="number"
                value={formData.defaultAmount}
                onChange={(e) => setFormData({ ...formData, defaultAmount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Örn: 15000"
                helperText="Otomatik gün seçildiyse zorunludur"
                InputProps={{ sx: { borderRadius: 2 } }}
                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              />
              
              <FormControl fullWidth>
                <InputLabel>Varsayılan Ödeme Yöntemi</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Varsayılan Ödeme Yöntemi"
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Banka Transferi">Banka Transferi</MenuItem>
                  <MenuItem value="Çek">Çek</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Otomatik Açıklama"
                value={formData.autoDescription}
                onChange={(e) => setFormData({ ...formData, autoDescription: e.target.value })}
                placeholder="Örn: Aylık kira ödemesi"
                multiline
                rows={2}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>

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
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseCategoriesPage;
