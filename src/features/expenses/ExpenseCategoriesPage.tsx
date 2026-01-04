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
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';

const ExpenseCategoriesPage: React.FC = () => {
  const { categories, loading, refetch } = useExpenseCategories();
  const { showSnackbar } = useSnackbar();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<ExpenseCategoryFormData>({
    name: '',
    description: '',
    isActive: true
  });
  const [initialFormData, setInitialFormData] = useState<ExpenseCategoryFormData>(formData);
  const [submitting, setSubmitting] = useState(false);

  const hasUnsavedChanges = openDialog && JSON.stringify(formData) !== JSON.stringify(initialFormData);
  useUnsavedChangesWarning({ hasUnsavedChanges });

  const handleOpenDialog = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      const loadedData = {
        name: category.name,
        description: category.description || '',
        isActive: category.isActive
      };
      setFormData(loadedData);
      setInitialFormData(loadedData);
    } else {
      setEditingCategory(null);
      const newData = {
        name: '',
        description: '',
        isActive: true
      };
      setFormData(newData);
      setInitialFormData(newData);
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

    try {
      setSubmitting(true);
      
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, formData);
        showSnackbar('Gider kalemi başarıyla güncellendi', 'success');
      } else {
        await createExpenseCategory(formData);
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

  const handleDelete = (category: ExpenseCategory) => {
    if (category._count && category._count.expenses > 0) {
      showSnackbar(`Bu kaleme ait ${category._count.expenses} adet gider var. Önce giderleri silmelisiniz.`, 'error');
      return;
    }

    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteExpenseCategory(categoryToDelete.id);
      showSnackbar('Gider kalemi başarıyla silindi', 'success');
      refetch();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      showSnackbar(error.message || 'Silme işlemi başarısız', 'error');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
        <strong>Gider Kalemi Nedir?</strong> Gider kategorilerini (Kira, Maaş, Yakıt, Stopaj vb.) buradan tanımlayın. 
        Bu kalemler tüm işletmeler tarafından kullanılacaktır.
      </Alert>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Kalem Adı</strong></TableCell>
                <TableCell><strong>Açıklama</strong></TableCell>
                <TableCell align="center"><strong>Durum</strong></TableCell>
                <TableCell align="right"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
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
              rows={3}
              placeholder="Bu gider kalemi hakkında kısa açıklama"
              InputProps={{ sx: { borderRadius: 2 } }}
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

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Gider Kalemini Sil
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>"{categoryToDelete?.name}"</strong> kalemini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setCategoryToDelete(null);
            }}
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseCategoriesPage;
