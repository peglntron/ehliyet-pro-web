import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import LicenseManagementSection from './LicenseManagementSection';

interface LicenseInfoFormProps {
  formData: {
    registrationDate: string;
    licenseEndDate: string;
    isActive: boolean;
  };
  errors?: {
    licenseEndDate?: string;
  };
  onChange: (data: Partial<LicenseInfoFormProps['formData']>) => void;
  onErrorChange?: (errors: Partial<LicenseInfoFormProps['errors']>) => void;
  onAddLicense: () => void;
  companyId?: string;
  isEditMode?: boolean;
}

const LicenseInfoForm: React.FC<LicenseInfoFormProps> = ({ 
  formData, 
  onChange, 
  onAddLicense,
  companyId,
  isEditMode = false
}) => {
  const [isTrialPeriod, setIsTrialPeriod] = useState(false);

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ isActive: e.target.checked });
  };

  const handleLicenseUpdated = (newEndDate: string) => {
    onChange({ licenseEndDate: newEndDate });
  };

  const handleTrialPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsTrialPeriod(checked);
    
    if (checked) {
      // 7 gün sonrasını hesapla
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      onChange({ licenseEndDate: trialEndDate.toISOString().split('T')[0] });
    } else {
      onChange({ licenseEndDate: '' });
    }
  };

  return (
    <Box>
      {/* 7 Günlük Deneme Süresi - Sadece yeni işletme oluştururken göster */}
      {!isEditMode && (
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Deneme Süresi
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={isTrialPeriod}
                onChange={handleTrialPeriodChange}
                color="primary"
              />
            }
            label={
              <Box sx={{ ml: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  7 Günlük Deneme Süresi Tanımla
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Seçilirse otomatik olarak bugünden 7 gün sonrası lisans bitiş tarihi olarak ayarlanır
                </Typography>
              </Box>
            }
          />
          
          {isTrialPeriod && formData.licenseEndDate && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Lisans bitiş tarihi: {new Date(formData.licenseEndDate).toLocaleDateString('tr-TR')}
            </Alert>
          )}
        </Paper>
      )}

      {/* Lisans Yönetimi Bölümü */}
      <LicenseManagementSection
        companyId={companyId}
        currentLicenseEndDate={formData.licenseEndDate}
        onAddLicense={onAddLicense}
        onLicenseUpdated={handleLicenseUpdated}
        isNewCompany={!isEditMode}
      />

      {/* Aktiflik Durumu */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Durum Bilgisi
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={handleActiveChange}
              color="primary"
            />
          }
          label={
            <Box sx={{ ml: 1 }}>
              <Typography variant="body1" fontWeight={600}>
                İşletme Durumu
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.isActive ? 'İşletme aktif' : 'İşletme pasif'}
              </Typography>
            </Box>
          }
        />
      </Paper>
    </Box>
  );
};

export default LicenseInfoForm;
