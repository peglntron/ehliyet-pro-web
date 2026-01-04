import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { vehicleAPI } from '../../api/vehicles';

const AddEditVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { showSnackbar } = useSnackbar();

  // State tanımlamaları
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Form verileri
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    transmissionType: 'MANUAL' as 'MANUAL' | 'AUTOMATIC',
    fuelType: 'DIESEL' as 'DIESEL' | 'PETROL' | 'HYBRID' | 'ELECTRIC' | 'LPG',
    status: 'AVAILABLE' as 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'REPAIR' | 'INACTIVE',
    currentKm: '' as string | number,
    trafficInsuranceStart: null as Date | null,
    trafficInsuranceEnd: null as Date | null,
    kaskoInsuranceStart: null as Date | null,
    kaskoInsuranceEnd: null as Date | null,
    inspectionStart: null as Date | null,
    inspectionEnd: null as Date | null,
    notes: ''
  });
  
  const [initialFormData, setInitialFormData] = useState(formData);
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  
  useUnsavedChangesWarning({ hasUnsavedChanges });

  const [autoFilledFields, setAutoFilledFields] = useState({
    trafficInsuranceEnd: false,
    kaskoInsuranceEnd: false,
    inspectionEnd: false
  });

  // Düzenleme modunda veriyi yükle
  useEffect(() => {
    if (isEdit && id) {
      const loadVehicle = async () => {
        try {
          setLoading(true);
          const vehicleData = await vehicleAPI.getById(id);
          const loadedData = {
            licensePlate: vehicleData.licensePlate,
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year,
            color: vehicleData.color || '',
            transmissionType: vehicleData.transmissionType,
            fuelType: vehicleData.fuelType,
            status: vehicleData.status,
            currentKm: vehicleData.currentKm,
            trafficInsuranceStart: vehicleData.trafficInsuranceStart ? new Date(vehicleData.trafficInsuranceStart) : null,
            trafficInsuranceEnd: vehicleData.trafficInsuranceEnd ? new Date(vehicleData.trafficInsuranceEnd) : null,
            kaskoInsuranceStart: vehicleData.kaskoInsuranceStart ? new Date(vehicleData.kaskoInsuranceStart) : null,
            kaskoInsuranceEnd: vehicleData.kaskoInsuranceEnd ? new Date(vehicleData.kaskoInsuranceEnd) : null,
            inspectionStart: vehicleData.inspectionStart ? new Date(vehicleData.inspectionStart) : null,
            inspectionEnd: vehicleData.inspectionEnd ? new Date(vehicleData.inspectionEnd) : null,
            notes: vehicleData.notes || ''
          };
          setFormData(loadedData);
          setInitialFormData(loadedData);
        } catch (error) {
          console.error('Araç verisi yükleme hatası:', error);
          showSnackbar('Araç verisi yüklenirken hata oluştu!', 'error');
        } finally {
          setLoading(false);
        }
      };
      loadVehicle();
    }
  }, [isEdit, id]);

  // Form alanlarını güncelle
  const handleInputChange = (field: string, value: string | number | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Sigorta ve muayene tarihi değişikliklerini handle et
  const handleInsuranceStartChange = (
    field: 'trafficInsuranceStart' | 'kaskoInsuranceStart' | 'inspectionStart', 
    value: Date | null
  ) => {
    let endField: string;
    let autoFilledKey: string;
    
    if (field === 'trafficInsuranceStart') {
      endField = 'trafficInsuranceEnd';
      autoFilledKey = 'trafficInsuranceEnd';
    } else if (field === 'kaskoInsuranceStart') {
      endField = 'kaskoInsuranceEnd';
      autoFilledKey = 'kaskoInsuranceEnd';
    } else {
      endField = 'inspectionEnd';
      autoFilledKey = 'inspectionEnd';
    }
    
    setFormData(prev => {
      const updates: any = { [field]: value };
      
      // Eğer başlangıç tarihi girildi, otomatik olarak +1 yıl ekle (bitiş dolu olsa bile)
      if (value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        updates[endField] = endDate;
        
        setAutoFilledFields(prevAuto => ({
          ...prevAuto,
          [autoFilledKey]: true
        }));
        
        // 3 saniye sonra mesajı kaldır
        setTimeout(() => {
          setAutoFilledFields(prevAuto => ({
            ...prevAuto,
            [autoFilledKey]: false
          }));
        }, 3000);
      } else {
        // Başlangıç silinirse bitiş de silinsin
        updates[endField] = null;
      }
      
      return { ...prev, ...updates };
    });
  };

  // Form kaydetme
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validasyon
      if (!formData.licensePlate || !formData.brand || !formData.model) {
        showSnackbar('Lütfen zorunlu alanları doldurun!', 'error');
        setSaving(false);
        return;
      }

      // Tarihleri ISO string formatına çevir (timezone offset olmadan YYYY-MM-DD)
      const formatDateForBackend = (date: Date | null) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const dataToSave = {
        ...formData,
        trafficInsuranceStart: formatDateForBackend(formData.trafficInsuranceStart),
        trafficInsuranceEnd: formatDateForBackend(formData.trafficInsuranceEnd),
        kaskoInsuranceStart: formatDateForBackend(formData.kaskoInsuranceStart),
        kaskoInsuranceEnd: formatDateForBackend(formData.kaskoInsuranceEnd),
      };

      // Düzenleme modunda ASSIGNED veya AVAILABLE durumundaki araçlar için status'u göndermeyeceğiz
      let dataToSend: any = dataToSave;
      if (isEdit && (formData.status === 'ASSIGNED' || formData.status === 'AVAILABLE')) {
        const { status, ...rest } = dataToSend;
        dataToSend = rest;
      }

      if (isEdit && id) {
        await vehicleAPI.update(id, dataToSend);
      } else {
        await vehicleAPI.create(dataToSend);
      }
      
      showSnackbar(`Araç başarıyla ${isEdit ? 'güncellendi' : 'eklendi'}!`, 'success');
      navigate('/vehicles');

    } catch (error: any) {
      console.error('Araç kaydetme hatası:', error);
      showSnackbar(error.response?.data?.message || 'Araç kaydedilirken hata oluştu!', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Km kaydı ekleme

  const handleCancel = () => {
    navigate('/vehicles');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
        </Typography>

        <Box component="form" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Temel Bilgiler
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              required
              fullWidth
              label="Plaka"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
              placeholder="34 ABC 123"
            />

            <TextField
              required
              fullWidth
              label="Marka"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Renault, Volkswagen vb."
            />

            <TextField
              required
              fullWidth
              label="Model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Megane, Passat vb."
            />

            <TextField
              fullWidth
              type="number"
              label="Model Yılı"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            />

            <TextField
              fullWidth
              label="Renk"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Beyaz, Siyah vb."
            />

            <FormControl fullWidth>
              <InputLabel>Vites Tipi</InputLabel>
              <Select
                value={formData.transmissionType}
                onChange={(e) => handleInputChange('transmissionType', e.target.value)}
                label="Vites Tipi"
              >
                <MenuItem value="MANUAL">Manuel</MenuItem>
                <MenuItem value="AUTOMATIC">Otomatik</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Yakıt Tipi</InputLabel>
              <Select
                value={formData.fuelType}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
                label="Yakıt Tipi"
              >
                <MenuItem value="DIESEL">Dizel</MenuItem>
                <MenuItem value="PETROL">Benzin</MenuItem>
                <MenuItem value="HYBRID">Hibrit</MenuItem>
                <MenuItem value="ELECTRIC">Elektrik</MenuItem>
                <MenuItem value="LPG">LPG</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Mevcut KM"
              value={formData.currentKm}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
                handleInputChange('currentKm', value === '' ? '' : parseInt(value));
              }}
              placeholder="0"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
            />
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Sigorta Bilgileri
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <DatePicker
                label="Trafik Sigortası Başlangıç"
                value={formData.trafficInsuranceStart}
                onChange={(newValue: Date | null) => handleInsuranceStartChange('trafficInsuranceStart', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: autoFilledFields.trafficInsuranceEnd ? "Bitiş tarihi otomatik olarak 1 yıl sonra ayarlandı" : ""
                  }
                }}
              />

              <DatePicker
                label="Trafik Sigortası Bitiş"
                value={formData.trafficInsuranceEnd}
                onChange={(newValue: Date | null) => handleInputChange('trafficInsuranceEnd', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Otomatik hesaplanan tarihi değiştirebilirsiniz"
                  }
                }}
              />

              <DatePicker
                label="Kasko Başlangıç"
                value={formData.kaskoInsuranceStart}
                onChange={(newValue: Date | null) => handleInsuranceStartChange('kaskoInsuranceStart', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: autoFilledFields.kaskoInsuranceEnd ? "Bitiş tarihi otomatik olarak 1 yıl sonra ayarlandı" : ""
                  }
                }}
              />

              <DatePicker
                label="Kasko Bitiş"
                value={formData.kaskoInsuranceEnd}
                onChange={(newValue: Date | null) => handleInputChange('kaskoInsuranceEnd', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Otomatik hesaplanan tarihi değiştirebilirsiniz"
                  }
                }}
              />
            </Box>

            {/* Muayene Tarihleri */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <DatePicker
                label="Muayene Başlangıç"
                value={formData.inspectionStart}
                onChange={(newValue: Date | null) => handleInsuranceStartChange('inspectionStart', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: autoFilledFields.inspectionEnd ? "Bitiş tarihi otomatik olarak 1 yıl sonra ayarlandı" : ""
                  }
                }}
              />

              <DatePicker
                label="Muayene Bitiş"
                value={formData.inspectionEnd}
                onChange={(newValue: Date | null) => handleInputChange('inspectionEnd', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Otomatik hesaplanan tarihi değiştirebilirsiniz"
                  }
                }}
              />
            </Box>
          </LocalizationProvider>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Ek Bilgiler
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notlar"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Araçla ilgili notlar..."
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>
              İptal
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <LoadingBackdrop 
        open={saving}
        message={isEdit ? 'Araç güncelleniyor...' : 'Araç kaydediliyor...'}
      />
    </Box>
  );
};

export default AddEditVehicle;
