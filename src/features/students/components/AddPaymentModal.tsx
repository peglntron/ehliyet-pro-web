import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, FormControl, InputLabel, Select,
  MenuItem, IconButton, Typography, Divider, Alert, CircularProgress,
  Tabs, Tab, Checkbox, FormControlLabel, Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Student } from '../types/types';
import { useCompanySettings } from '../../../api/useCompanySettings';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payment: any) => void;
  student: Student | null;
  remainingAmount: number;
  mode?: 'payment' | 'debt'; // Varsayılan tab seçimi için
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  onSuccess,
  student,
  remainingAmount,
  mode = 'payment' // Varsayılan ödeme
}) => {
  const { settings: companySettings, fetchSettings } = useCompanySettings();
  
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    status: 'paid',
    description: '',
    isInstallment: false,      // YENİ: Taksitli mi?
    installmentCount: '1',     // YENİ: Taksit sayısı
    firstInstallmentDate: new Date().toISOString().split('T')[0]  // YENİ: İlk taksit tarihi
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Company settings'i yükle
  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Tutar kontrolü
    if (!formData.amount.trim()) {
      newErrors.amount = 'Tutar gereklidir';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Geçerli bir tutar girin';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Tutar 0\'dan büyük olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !student) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      // Borç Ekle
        if (formData.isInstallment && Number(formData.installmentCount) > 1) {
          // Taksitli Borç - Her taksit için ayrı DEBT kaydı oluştur
          const installmentCount = Number(formData.installmentCount);
          const installmentAmount = Number(formData.amount) / installmentCount;
          const createdPayments = [];
          
          const firstDate = new Date(formData.firstInstallmentDate);
          const originalDay = firstDate.getDate(); // İlk taksit günü (ör: 31)
          
          for (let i = 0; i < installmentCount; i++) {
            // Her taksit için tamamen yeni tarih hesapla
            const targetYear = firstDate.getFullYear() + Math.floor((firstDate.getMonth() + i) / 12);
            const targetMonth = (firstDate.getMonth() + i) % 12;
            
            // Hedef ayın kaç günü olduğunu bul
            const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            
            // Eğer orijinal gün (ör: 31) hedef ayda yoksa (ör: Şubat 28), ayın son gününü kullan
            const dayToUse = Math.min(originalDay, lastDayOfTargetMonth);
            
            // Yeni tarihi oluştur
            const dueDate = new Date(targetYear, targetMonth, dayToUse);
            
            const paymentResponse = await fetch(`${API_URL}/api/payments/students/${student.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                amount: installmentAmount,
                paymentDate: dueDate.toISOString(),
                method: 'CASH',
                status: 'PENDING',
                type: 'INSTALLMENT', // TAKSİTLİ ÖDEMELER İÇİN INSTALLMENT
                description: formData.description || 'Borç',
                isInitialPayment: false,
                installmentNumber: i + 1,
                totalInstallments: installmentCount
              })
            });

            if (!paymentResponse.ok) {
              const errorData = await paymentResponse.json();
              throw new Error(errorData.message || `${i + 1}. taksit oluşturulamadı`);
            }

            const paymentResult = await paymentResponse.json();
            createdPayments.push(paymentResult.data);
          }
          
          // İlk taksiti döndür (UI güncellensin)
          onSuccess(createdPayments[0]);
        } else {
          // Tek Seferlik Borç
          const paymentResponse = await fetch(`${API_URL}/api/payments/students/${student.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: parseFloat(formData.amount),
              paymentDate: formData.date, // Kullanıcının seçtiği tarih
              method: 'CASH',
              status: 'PENDING',
              type: 'DEBT',
              description: formData.description || 'Borç',
              isInitialPayment: false
            })
          });

          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            throw new Error(errorData.message || 'Borç kaydı oluşturulamadı');
          }

          const paymentResult = await paymentResponse.json();
          onSuccess(paymentResult.data);
        }
      }
      
      // Formu sıfırla
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        status: 'paid',
        description: '',
        isInstallment: false,
        installmentCount: '1',
        firstInstallmentDate: new Date().toISOString().split('T')[0]
      });
      
      // Modal'ı kapat
      onClose();
    } catch (error) {
      console.error('İşlem hatası:', error);
      setErrorMessage(error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Borç Ekle
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Kursiyer:</strong> {student?.name} {student?.surname}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Mevcut Toplam Borç:</strong> {Number(student?.totalPayment || 0).toLocaleString('tr-TR')} ₺
            </Typography>
          </Alert>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Hızlı Seçim Butonları */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
              Hızlı Seçim:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {companySettings?.defaultCoursePrice && (
                <Chip
                  label={`Kurs Ücreti (${Number(companySettings.defaultCoursePrice).toLocaleString('tr-TR')} ₺)`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amount: String(companySettings.defaultCoursePrice),
                      description: 'Kurs ücreti'
                    }));
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                  color={formData.amount === String(companySettings.defaultCoursePrice) ? 'primary' : 'default'}
                  variant={formData.amount === String(companySettings.defaultCoursePrice) ? 'filled' : 'outlined'}
                />
              )}
              {companySettings?.defaultWrittenExamPrice && (
                <Chip
                  label={`Yazılı Sınav (${Number(companySettings.defaultWrittenExamPrice).toLocaleString('tr-TR')} ₺)`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amount: String(companySettings.defaultWrittenExamPrice),
                      description: 'Yazılı sınav ücreti'
                    }));
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                  color={formData.amount === String(companySettings.defaultWrittenExamPrice) ? 'primary' : 'default'}
                  variant={formData.amount === String(companySettings.defaultWrittenExamPrice) ? 'filled' : 'outlined'}
                />
              )}
              {companySettings?.defaultDrivingExamPrice && (
                <Chip
                  label={`Direksiyondan Kalınca (${Number(companySettings.defaultDrivingExamPrice).toLocaleString('tr-TR')} ₺)`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amount: String(companySettings.defaultDrivingExamPrice),
                      description: 'Direksiyon sınavından kalma ücreti'
                    }));
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                  color={formData.amount === String(companySettings.defaultDrivingExamPrice) ? 'primary' : 'default'}
                  variant={formData.amount === String(companySettings.defaultDrivingExamPrice) ? 'filled' : 'outlined'}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Toplam Borç Tutarı (₺)"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              error={!!errors.amount}
              helperText={errors.amount || (formData.isInstallment ? `Taksit başına: ${(Number(formData.amount) / Number(formData.installmentCount) || 0).toLocaleString('tr-TR')} ₺` : 'Mevcut toplam borca eklenecek tutar')}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            {!formData.isInstallment && (
              <TextField
                fullWidth
                label="Borç Tarihi"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            )}
          </Box>
          
          {/* Taksitli Borç Seçeneği - Sadece ayar aktifse göster */}
          {companySettings?.enableInstallmentPayments && (
            <Box 
              sx={{ 
                p: 2, 
                border: '2px solid',
                borderColor: formData.isInstallment ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: formData.isInstallment ? 'primary.50' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
            <FormControl component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isInstallment}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        isInstallment: e.target.checked,
                        installmentCount: e.target.checked ? '3' : '1'
                      }));
                    }}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { 
                        fontSize: 24 
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    sx={{ 
                      fontWeight: formData.isInstallment ? 600 : 400,
                      fontSize: '1rem',
                      color: formData.isInstallment ? 'primary.main' : 'text.primary',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Taksitli Borç
                  </Typography>
                }
              />
            </FormControl>
            
            {formData.isInstallment && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="installment-count-label">Taksit Sayısı</InputLabel>
                  <Select
                    labelId="installment-count-label"
                    name="installmentCount"
                    value={formData.installmentCount}
                    label="Taksit Sayısı"
                    onChange={handleSelectChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {Array.from({ length: (companySettings?.maxInstallmentCount || 12) - 1 }, (_, i) => i + 2).map(count => (
                      <MenuItem key={count} value={count.toString()}>
                        {count} Taksit
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  sx={{ flex: 1 }}
                  type="date"
                  label="İlk Taksit Tarihi"
                  name="firstInstallmentDate"
                  value={formData.firstInstallmentDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Box>
            )}
          </Box>
          )}
          
          <TextField
            fullWidth
            label="Açıklama"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Borç ekleme sebebi (örn: Kurs ücreti, Ek ders ücreti)"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          {formData.isInstallment && formData.amount && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>{formData.installmentCount} aylık taksit planı oluşturulacak</strong>
                <br />
                Taksit tutarı: {(Number(formData.amount) / Number(formData.installmentCount)).toLocaleString('tr-TR')} ₺
                <br />
                İlk taksit: {new Date(formData.firstInstallmentDate).toLocaleDateString('tr-TR')}
                <br />
                Son taksit: {new Date(new Date(formData.firstInstallmentDate).setMonth(new Date(formData.firstInstallmentDate).getMonth() + Number(formData.installmentCount) - 1)).toLocaleDateString('tr-TR')}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Kaydediliyor...' : 'Borç Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentModal;
