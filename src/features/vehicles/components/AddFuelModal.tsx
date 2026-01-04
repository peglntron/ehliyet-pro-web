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
    liters: '',
    pricePerLiter: '',
    totalCost: '',
    station: '',
    receiptNo: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        fuelDate: new Date().toISOString().split('T')[0],
        currentKm: currentKm.toString(),
        liters: '',
        pricePerLiter: '',
        totalCost: '',
        station: '',
        receiptNo: '',
        notes: '',
      });
    }
  }, [open, currentKm]);

  // Otomatik toplam hesaplama
  useEffect(() => {
    if (formData.liters && formData.pricePerLiter) {
      const total = parseFloat(formData.liters) * parseFloat(formData.pricePerLiter);
      setFormData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
    }
  }, [formData.liters, formData.pricePerLiter]);

  const handleSubmit = async () => {
    if (!formData.liters) {
      alert('Lütfen litre miktarını girin');
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        fuelDate: formData.fuelDate,
        currentKm: formData.currentKm ? parseInt(formData.currentKm) : undefined,
        liters: parseFloat(formData.liters),
        pricePerLiter: formData.pricePerLiter ? parseFloat(formData.pricePerLiter) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
        station: formData.station || undefined,
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
                label="Kilometre"
                type="number"
                value={formData.currentKm}
                onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                helperText={`Güncel: ${currentKm.toLocaleString('tr-TR')}`}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Litre"
                type="number"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Litre Fiyatı (₺)"
                type="number"
                value={formData.pricePerLiter}
                onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Toplam (₺)"
                type="number"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                inputProps={{ step: '0.01' }}
                helperText="Otomatik hesaplanır"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="İstasyon"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                placeholder="Petrol Ofisi, Shell, vb..."
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
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          disabled={submitting || !formData.liters}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFuelModal;
