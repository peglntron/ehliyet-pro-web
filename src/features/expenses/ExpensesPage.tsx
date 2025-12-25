import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, Grid, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import {
  useExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from './api/useExpenses';
import { useExpenseCategories } from './api/useExpenseCategories';
import type { Expense, ExpenseFormData } from './types/types';
import { useSnackbar } from '../../contexts/SnackbarContext';

const ExpensesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
    isPaid: undefined as boolean | undefined
  });
  
  const { expenses, stats, loading, refetch } = useExpenses(filters);
  const { categories } = useExpenseCategories();
  const { showSnackbar } = useSnackbar();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    expenseCategoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    invoiceNumber: '',
    paymentMethod: 'Nakit',
    isPaid: false,
    paidDate: '',
    isRecurring: false,
    recurringDay: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        expenseCategoryId: expense.expenseCategoryId,
        amount: expense.amount.toString(),
        date: expense.date.split('T')[0],
        description: expense.description || '',
        invoiceNumber: expense.invoiceNumber || '',
        paymentMethod: expense.paymentMethod || 'Nakit',
        isPaid: expense.isPaid,
        paidDate: expense.paidDate ? expense.paidDate.split('T')[0] : '',
        isRecurring: expense.isRecurring || false,
        recurringDay: expense.recurringDay ? expense.recurringDay.toString() : ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        expenseCategoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        invoiceNumber: '',
        paymentMethod: 'Nakit',
        isPaid: false,
        paidDate: '',
        isRecurring: false,
        recurringDay: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const handleSubmit = async () => {
    if (!formData.expenseCategoryId) {
      showSnackbar('Gider kalemi seçilmelidir', 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showSnackbar('Geçerli bir tutar giriniz', 'error');
      return;
    }

    // Tekrarlı gider kontrolü
    if (formData.isRecurring) {
      const day = parseInt(formData.recurringDay);
      if (!day || day < 1 || day > 31) {
        showSnackbar('Tekrarlı gider için 1-31 arası bir gün seçilmelidir', 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData);
        showSnackbar('Gider başarıyla güncellendi', 'success');
      } else {
        await createExpense(formData);
        showSnackbar('Gider başarıyla eklendi', 'success');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || 'Bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Bu gideri silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await deleteExpense(expense.id);
      showSnackbar('Gider başarıyla silindi', 'success');
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const handleApplyFilters = () => {
    setOpenFilterDialog(false);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: '',
      startDate: '',
      endDate: '',
      isPaid: undefined
    });
    setOpenFilterDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
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
            <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight={700} color="#1a202c">
                Giderler
              </Typography>
              <Typography variant="body1" color="#64748b">
                İşletme giderlerinizi kaydedin ve takip edin
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setOpenFilterDialog(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Filtrele
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Yeni Gider Ekle
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Toplam Gider Sayısı</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalExpenses}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Toplam Tutar</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Ödenen</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.paidAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Ödenmemiş</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.unpaidAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell><strong>Tarih</strong></TableCell>
                  <TableCell><strong>Gider Kalemi</strong></TableCell>
                  <TableCell><strong>Açıklama</strong></TableCell>
                  <TableCell align="right"><strong>Tutar</strong></TableCell>
                  <TableCell><strong>Ödeme Yöntemi</strong></TableCell>
                  <TableCell align="center"><strong>Tekrar</strong></TableCell>
                  <TableCell align="center"><strong>Durum</strong></TableCell>
                  <TableCell align="right"><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        Henüz gider eklenmemiş
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Başlamak için "Yeni Gider Ekle" butonuna tıklayın
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(expense.date).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expense.expenseCategory?.name || 'Bilinmiyor'}
                          color="default"
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {expense.description || '-'}
                        </Typography>
                        {expense.invoiceNumber && (
                          <Typography variant="caption" color="text.secondary">
                            Fatura: {expense.invoiceNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="error.main">
                          {expense.amount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.paymentMethod || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {expense.isRecurring ? (
                          <Chip
                            label={`Her Ayın ${expense.recurringDay}. Günü`}
                            color="info"
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={expense.isPaid ? 'Ödendi' : 'Ödenmedi'}
                          color={expense.isPaid ? 'success' : 'warning'}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(expense)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(expense)}
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
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {/* Tekrarlı Gider Checkbox */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({
                        ...formData,
                        isRecurring: e.target.checked,
                        recurringDay: e.target.checked ? '1' : '',
                        date: e.target.checked ? '' : new Date().toISOString().split('T')[0]
                      })}
                    />
                  }
                  label="Tekrarlı Gider (Her Ay Otomatik)"
                />
              </Grid>

              {/* Gider Kalemi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gider Kalemi</InputLabel>
                  <Select
                    value={formData.expenseCategoryId}
                    label="Gider Kalemi"
                    onChange={(e) => setFormData({ ...formData, expenseCategoryId: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    {categories.filter(c => c.isActive).map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tutar */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Tutar (₺)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>

              {/* Tarih veya Tekrar Günü */}
              <Grid item xs={12} md={6}>
                {formData.isRecurring ? (
                  <TextField
                    fullWidth
                    required
                    label="Her Ayın Kaçıncı Günü"
                    type="number"
                    value={formData.recurringDay}
                    onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                    InputProps={{ 
                      sx: { borderRadius: 2 },
                      inputProps: { min: 1, max: 31 }
                    }}
                    helperText="1-31 arası (Ayın son günü için dikkatli olun)"
                  />
                ) : (
                  <DatePicker
                    label="Gider Tarihi"
                    value={formData.date ? new Date(formData.date) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, date: newValue.toISOString().split('T')[0] });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        InputProps: { sx: { borderRadius: 2 } }
                      }
                    }}
                  />
                )}
              </Grid>

              {/* Ödeme Yöntemi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ödeme Yöntemi</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Ödeme Yöntemi"
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                    <MenuItem value="Banka Transferi">Banka Transferi</MenuItem>
                    <MenuItem value="Çek">Çek</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Fatura Numarası */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fatura Numarası"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>

              {/* Ödendi Butonu */}
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant={formData.isPaid ? "contained" : "outlined"}
                  color={formData.isPaid ? "success" : "warning"}
                  onClick={() => setFormData({
                    ...formData,
                    isPaid: !formData.isPaid,
                    paidDate: !formData.isPaid ? new Date().toISOString().split('T')[0] : ''
                  })}
                  sx={{ 
                    height: '56px',
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {formData.isPaid ? '✓ Ödendi' : 'Ödenmedi'}
                </Button>
              </Grid>

              {/* Açıklama */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama / Not"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
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

        {/* Filter Dialog */}
        <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filtrele</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Gider Kalemi</InputLabel>
                  <Select
                    value={filters.categoryId}
                    label="Gider Kalemi"
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={filters.startDate ? new Date(filters.startDate) : null}
                  onChange={(newValue) => {
                    setFilters({ ...filters, startDate: newValue ? newValue.toISOString().split('T')[0] : '' });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: { sx: { borderRadius: 2 } }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={filters.endDate ? new Date(filters.endDate) : null}
                  onChange={(newValue) => {
                    setFilters({ ...filters, endDate: newValue ? newValue.toISOString().split('T')[0] : '' });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: { sx: { borderRadius: 2 } }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Ödeme Durumu</InputLabel>
                  <Select
                    value={filters.isPaid === undefined ? '' : filters.isPaid.toString()}
                    label="Ödeme Durumu"
                    onChange={(e) => setFilters({
                      ...filters,
                      isPaid: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="true">Ödendi</MenuItem>
                    <MenuItem value="false">Ödenmedi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
              Temizle
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ borderRadius: 2 }}
            >
              Uygula
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ExpensesPage;
