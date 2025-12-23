import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
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

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ isActive: e.target.checked });
  };

  const handleLicenseUpdated = (newEndDate: string) => {
    onChange({ licenseEndDate: newEndDate });
  };

  return (
    <Box>
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
