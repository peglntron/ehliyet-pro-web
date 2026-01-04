import React, { useState, useEffect } from 'react';
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
  Grid,
} from '@mui/material';

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  currentKm: number;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  open,
  onClose,
  onAdd,
  currentKm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: 'PERIODIC',
    serviceDate: new Date().toISOString().split('T')[0],
    serviceKm: '',
    cost: '',
    serviceProvider: '',
    description: '',
    partsChanged: '',
    nextServiceKm: '',
    nextServiceDate: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        serviceType: 'PERIODIC',
        serviceDate: new Date().toISOString().split('T')[0],
        serviceKm: currentKm.toString(),
        cost: '',
        serviceProvider: '',
        description: '',
        partsChanged: '',
        nextServiceKm: '',
        nextServiceDate: '',
      });
    }
  }, [open, currentKm]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const serviceData = {
        serviceType: formData.serviceType,
        serviceDate: formData.serviceDate,
        serviceKm: formData.serviceKm ? parseInt(formData.serviceKm) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        serviceProvider: formData.serviceProvider || undefined,
        description: formData.description || undefined,
        partsChanged: formData.partsChanged || undefined,
        nextServiceKm: formData.nextServiceKm ? parseInt(formData.nextServiceKm) : undefined,
        nextServiceDate: formData.nextServiceDate || undefined,
      };
      await onAdd(serviceData);
      onClose();
    } catch (error) {
      console.error('Servis ekleme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Servis Kaydı Ekle</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Servis Tipi</InputLabel>
                <Select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  label="Servis Tipi"
                >
                  <MenuItem value="PERIODIC">Periyodik Bakım</MenuItem>
                  <MenuItem value="REPAIR">Tamir</MenuItem>
                  <MenuItem value="ACCIDENT">Kaza Onarımı</MenuItem>
                  <MenuItem value="TIRE_CHANGE">Lastik Değişimi</MenuItem>
                  <MenuItem value="OIL_CHANGE">Yağ Değişimi</MenuItem>
                  <MenuItem value="BRAKE_SERVICE">Fren Servisi</MenuItem>
                  <MenuItem value="INSPECTION">Muayene</MenuItem>
                  <MenuItem value="OTHER">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Servis Tarihi"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Servis Kilometresi"
                type="number"
                value={formData.serviceKm}
                onChange={(e) => setFormData({ ...formData, serviceKm: e.target.value })}
                helperText={`Güncel: ${currentKm.toLocaleString('tr-TR')} km`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maliyet (₺)"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Servis Yeri"
                value={formData.serviceProvider}
                onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                placeholder="Servis istasyonu adı..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Yapılan işlemler..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Değiştirilen Parçalar"
                value={formData.partsChanged}
                onChange={(e) => setFormData({ ...formData, partsChanged: e.target.value })}
                placeholder="Yağ filtresi, hava filtresi, vb..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sonraki Servis KM"
                type="number"
                value={formData.nextServiceKm}
                onChange={(e) => setFormData({ ...formData, nextServiceKm: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sonraki Servis Tarihi"
                type="date"
                value={formData.nextServiceDate}
                onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
          disabled={submitting}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServiceModal;
