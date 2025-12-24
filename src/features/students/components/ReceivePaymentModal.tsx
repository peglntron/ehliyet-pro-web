import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material';

interface ReceivePaymentModalProps {
  open: boolean;
  onClose: () => void;
  debtId: string;
  debtAmount: number;
  debtDescription: string;
  onSuccess: () => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  open,
  onClose,
  debtId,
  debtAmount,
  debtDescription,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>(debtAmount.toString());
  const [method, setMethod] = useState<string>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Geçerli bir tutar giriniz');
      return;
    }

    if (paymentAmount > debtAmount) {
      setError('Ödeme tutarı borç tutarından fazla olamaz');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      // Borç bilgisini al
      const debtResponse = await fetch(`${API_URL}/api/payments/${debtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!debtResponse.ok) {
        throw new Error('Borç bilgisi alınamadı');
      }
      
      const debtData = await debtResponse.json();
      const debt = debtData.data;
      
      // Tam ödeme mi kısmi ödeme mi? (debtAmount zaten kalan borç)
      const isFullPayment = paymentAmount >= debtAmount;
      
      if (isFullPayment) {
        // TAM ÖDEME: Önce ödeme kaydı oluştur, sonra borcu PAID yap
        const paymentResponse = await fetch(`${API_URL}/api/payments/students/${debt.studentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: paymentAmount,
            method: method,
            status: 'PAID',
            type: 'PAYMENT',
            description: `${debtDescription} için son ödeme`,
            paymentDate: new Date().toISOString(),
            relatedDebtId: debtId
          })
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.message || 'Ödeme kaydı oluşturulamadı');
        }
        
        // Borcu PAID yap
        const response = await fetch(`${API_URL}/api/payments/${debtId}/mark-paid`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            method: method,
            paymentDate: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Borç güncellenirken hata oluştu');
        }
      } else {
        // KISMİ ÖDEME: Sadece ödeme kaydı oluştur
        const response = await fetch(`${API_URL}/api/payments/students/${debt.studentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: paymentAmount,
            method: method,
            status: 'PAID',
            type: 'PAYMENT',
            description: `${debtDescription} için kısmi ödeme`,
            paymentDate: new Date().toISOString(),
            relatedDebtId: debtId
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ödeme kaydı oluşturulamadı');
        }
      }

      onSuccess();
      onClose();
      setAmount('');
      setMethod('CASH');
    } catch (err) {
      console.error('Ödeme hatası:', err);
      setError(err instanceof Error ? err.message : 'Ödeme alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setMethod('CASH');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ödeme Al</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Borç:</strong> {debtDescription}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <strong>Borç Tutarı:</strong> {debtAmount.toLocaleString('tr-TR')} ₺
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Ödeme Tutarı"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: '₺'
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Ödeme Yöntemi</InputLabel>
            <Select
              value={method}
              label="Ödeme Yöntemi"
              onChange={(e) => setMethod(e.target.value)}
            >
              <MenuItem value="CASH">Nakit</MenuItem>
              <MenuItem value="CREDIT_CARD">Kredi Kartı</MenuItem>
              <MenuItem value="DEBIT_CARD">Banka Kartı</MenuItem>
              <MenuItem value="BANK_TRANSFER">Havale/EFT</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Ödeme Al'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
