import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  Alert
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';

interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  vehiclePlate: string;
  currentKm: number;
  lastServiceKm?: number;
  onSave: (maintenanceData: MaintenanceData) => void;
}

interface MaintenanceData {
  serviceDate: string;
  currentKm: number;
  serviceType: string;
  description: string;
  cost: number;
  nextServiceKm: number;
  serviceProvider: string;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  open,
  onClose,
  vehiclePlate,
  currentKm,
  lastServiceKm,
  onSave
}) => {
  const [formData, setFormData] = useState<MaintenanceData>({
    serviceDate: new Date().toISOString().split('T')[0],
    currentKm: currentKm,
    serviceType: '',
    description: '',
    cost: 0,
    nextServiceKm: currentKm + 10000, // Varsayılan olarak 10.000 km sonra
    serviceProvider: ''
  });

  const handleInputChange = (field: keyof MaintenanceData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'currentKm' || field === 'cost' || field === 'nextServiceKm' 
      ? Number(event.target.value) 
      : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const kmDifference = lastServiceKm ? formData.currentKm - lastServiceKm : 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <BuildIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Bakım Kaydı Ekle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehiclePlate} - Araç Bakım Bilgileri
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* Mevcut Durum Bilgisi */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Mevcut KM:</strong> {currentKm.toLocaleString()} km
            {lastServiceKm && (
              <>
                <br />
                <strong>Son Bakımdan Bu Yana:</strong> {kmDifference.toLocaleString()} km
              </>
            )}
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Bakım Tarihi */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bakım Tarihi"
              type="date"
              value={formData.serviceDate}
              onChange={handleInputChange('serviceDate')}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* Mevcut KM */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bakım Sırasındaki KM"
              type="number"
              value={formData.currentKm}
              onChange={handleInputChange('currentKm')}
              required
              helperText="Bakım yapıldığı sıradaki kilometre"
            />
          </Grid>

          {/* Bakım Türü */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bakım Türü"
              value={formData.serviceType}
              onChange={handleInputChange('serviceType')}
              placeholder="Örn: Periyodik Bakım, Yağ Değişimi, Fren Tamiri"
              required
            />
          </Grid>

          {/* Servis Sağlayıcısı */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Servis Sağlayıcısı"
              value={formData.serviceProvider}
              onChange={handleInputChange('serviceProvider')}
              placeholder="Örn: Yetkili Servis, Oto Tamirhanesi"
            />
          </Grid>

          {/* Bakım Maliyeti */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bakım Maliyeti (₺)"
              type="number"
              value={formData.cost}
              onChange={handleInputChange('cost')}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          {/* Sonraki Bakım KM */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sonraki Bakım KM"
              type="number"
              value={formData.nextServiceKm}
              onChange={handleInputChange('nextServiceKm')}
              required
              helperText="Bir sonraki bakım yapılacak kilometre"
            />
          </Grid>

          {/* Açıklama */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bakım Açıklaması"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Yapılan işlemler, değiştirilen parçalar, notlar..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          İptal
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!formData.serviceDate || !formData.serviceType || formData.currentKm <= 0}
        >
          Bakım Kaydını Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceModal;