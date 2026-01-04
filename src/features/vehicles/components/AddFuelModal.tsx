import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
} from '@mui/material';

interface AddFuelModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  currentKm: number;
}

const AddFuelModal: React.FC<AddFuelModalProps> = ({
  open,
  onClose,
  onAdd,
  currentKm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fuelDate: new Date().toISOString().split('T')[0],
    currentKm: '',
    totalCost: '',
    receiptNo: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        fuelDate: new Date().toISOString().split('T')[0],
        currentKm: currentKm.toString(),
        totalCost: '',
        receiptNo: '',
        notes: '',
      });
    }
  }, [open, currentKm]);

  const handleSubmit = async () => {
    if (!formData.totalCost) {
      alert('Lütfen toplam tutarı girin');
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        fuelDate: formData.fuelDate,
        currentKm: formData.currentKm ? parseInt(formData.currentKm) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
        receiptNo: formData.receiptNo || undefined,
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Yakıt ekleme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yakıt Kaydı Ekle</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Tarih"
                type="date"
                value={formData.fuelDate}
                onChange={(e) => setFormData({ ...formData, fuelDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Kilometre"
                type="number"
                value={formData.currentKm}
                onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                helperText={`Güncel: ${currentKm.toLocaleString('tr-TR')}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Toplam Tutar (₺)"
                type="number"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fiş/Fatura No"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Yakıt kaydı ile ilgili notlar..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !formData.totalCost}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFuelModal;
