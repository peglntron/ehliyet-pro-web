import React from 'react';import React from 'react';

import {import {

  Paper,  Box, Typography, TextField, Paper, FormControlLabel,

  Typography,  Switch, InputAdornment, Button, FormHelperText,

  Box,  Tooltip, Chip, Divider, Alert

  Switch,} from '@mui/material';

  FormControlLabel,import {

} from '@mui/material';  CalendarToday as CalendarTodayIcon,

import LicenseManagementSection from './LicenseManagementSection';  Business as BusinessIcon,

  Add as AddIcon,

interface LicenseInfoFormProps {  Refresh as RefreshIcon,

  formData: {  Check as CheckIcon,

    registrationDate: string;  Warning as WarningIcon,

    licenseEndDate: string;  ErrorOutline as ErrorIcon

    isActive: boolean;} from '@mui/icons-material';

  };

  errors?: {interface LicenseInfoFormProps {

    licenseEndDate?: string;  formData: {

  };    registrationDate: string;

  onChange: (data: Partial<LicenseInfoFormProps['formData']>) => void;    licenseEndDate: string;

  onErrorChange?: (errors: Partial<LicenseInfoFormProps['errors']>) => void;    isActive: boolean;

  onAddLicense: () => void;  };

  companyId?: string;  errors: {

  isEditMode?: boolean;    licenseEndDate?: string;

}  };

  onChange: (data: Partial<LicenseInfoFormProps['formData']>) => void;

const LicenseInfoForm: React.FC<LicenseInfoFormProps> = ({   onErrorChange: (errors: Partial<LicenseInfoFormProps['errors']>) => void;

  formData,   onAddLicense: () => void;

  onChange,   isEditMode: boolean;

  onAddLicense,}

  companyId,

  isEditMode = falseconst LicenseInfoForm: React.FC<LicenseInfoFormProps> = ({ 

}) => {  formData, 

  errors, 

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {  onChange, 

    onChange({ isActive: e.target.checked });  onErrorChange,

  };  onAddLicense,

  isEditMode

  return (}) => {

    <Box>  // Switch değişikliğini handle et

      {/* Lisans Yönetimi Bölümü */}  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {

      <LicenseManagementSection    onChange({ isActive: e.target.checked });

        companyId={companyId}  };

        currentLicenseEndDate={formData.licenseEndDate}  

        onAddLicense={onAddLicense}  // Tarih formatını düzenleme

        isNewCompany={!isEditMode}  const formatDateForDisplay = (dateString: string): string => {

      />    const date = new Date(dateString);

    return date.toLocaleDateString('tr-TR', {

      {/* Aktiflik Durumu */}      day: '2-digit',

      <Paper       month: 'long',

        elevation={0}      year: 'numeric'

        sx={{     });

          mb: 3,  };

          p: { xs: 2, md: 4 },  

          borderRadius: 3,  // Lisans durumunu kontrol et

          border: '1px solid',  const getLicenseStatus = (): { status: 'expired' | 'expiring' | 'valid', daysLeft: number } => {

          borderColor: 'divider'    if (!formData.licenseEndDate) {

        }}      return { status: 'valid', daysLeft: 0 };

      >    }

        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>

          Durum Bilgisi    const today = new Date();

        </Typography>    const licenseEnd = new Date(formData.licenseEndDate);

            

        <FormControlLabel    // Bir ay sonra

          control={    const oneMonthLater = new Date(today);

            <Switch    oneMonthLater.setMonth(today.getMonth() + 1);

              checked={formData.isActive}    

              onChange={handleActiveChange}    // Kalan gün sayısını hesapla

              color="primary"    const timeDiff = licenseEnd.getTime() - today.getTime();

            />    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          }    

          label={    if (licenseEnd < today) {

            <Box sx={{ ml: 1 }}>      return { status: 'expired', daysLeft };

              <Typography variant="body1" fontWeight={600}>    } else if (licenseEnd < oneMonthLater) {

                İşletme Durumu      return { status: 'expiring', daysLeft };

              </Typography>    } else {

              <Typography variant="caption" color="text.secondary">      return { status: 'valid', daysLeft };

                {formData.isActive ? 'İşletme aktif' : 'İşletme pasif'}    }

              </Typography>  };

            </Box>  

          }  const { status: licenseStatus, daysLeft } = formData.licenseEndDate ? getLicenseStatus() : { status: 'valid' as const, daysLeft: 0 };

        />  

      </Paper>  // Lisans durumuna göre bilgi ve renk seçimi

    </Box>  const statusConfig = {

  );    expired: { 

};      icon: <ErrorIcon />, 

      color: 'error' as const, 

export default LicenseInfoForm;      label: 'Süresi Dolmuş', 

      message: 'Lisans süresi dolmuş, lütfen yenileyin.' 
    },
    expiring: { 
      icon: <WarningIcon />, 
      color: 'warning' as const, 
      label: 'Yakında Bitecek', 
      message: `Lisans süresi ${daysLeft} gün sonra dolacak, yenilemeyi düşünebilirsiniz.` 
    },
    valid: { 
      icon: <CheckIcon />, 
      color: 'success' as const, 
      label: 'Geçerli', 
      message: `Lisans geçerli durumda, ${daysLeft} gün kaldı.` 
    }
  };
  
  const licenseStatusInfo = statusConfig[licenseStatus];
  
  return (
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
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: 4 
        }}
      >
        <CalendarTodayIcon color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={700} color={(theme) => theme.palette.primary.main}>
          Lisans Bilgileri
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Lisans Durum Özeti - Yeni Eklendi */}
        {formData.licenseEndDate && (
          <Alert 
            severity={licenseStatusInfo.color} 
            icon={licenseStatusInfo.icon}
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': { 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                width: '100%',
                gap: 2
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {licenseStatusInfo.message}
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                Kayıt: {formatDateForDisplay(formData.registrationDate)} • 
                Bitiş: {formatDateForDisplay(formData.licenseEndDate)}
              </Typography>
            </Box>
            
            <Button
              size="small"
              variant="outlined"
              color={licenseStatusInfo.color}
              startIcon={formData.licenseEndDate ? <RefreshIcon /> : <AddIcon />}
              onClick={onAddLicense}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                whiteSpace: 'nowrap'
              }}
            >
              {licenseStatus === 'expired' ? 'Hemen Yenile' : 'Lisansı Yenile'}
            </Button>
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Kayıt Tarihi - Salt okunur */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CalendarTodayIcon fontSize="small" color="primary" />
              Kayıt Tarihi
            </Typography>
            <Tooltip title="Kayıt tarihi sistem tarafından otomatik belirlenir">
              <TextField
                value={formatDateForDisplay(formData.registrationDate)}
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                  sx: {
                    borderRadius: 2,
                    height: 56,
                    fontSize: '1rem',
                    bgcolor: 'rgba(0,0,0,0.04)'
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Tooltip>
          </Box>
          
          {/* Lisans Bitiş Tarihi - Salt okunur + Yenile butonu */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                color="text.primary" 
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CalendarTodayIcon fontSize="small" color="primary" />
                Lisans Bitiş Tarihi
              </Typography>
              
              {!formData.licenseEndDate && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onAddLicense}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  Ekle
                </Button>
              )}
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              {formData.licenseEndDate ? (
                <TextField
                  value={formatDateForDisplay(formData.licenseEndDate)}
                  fullWidth
                  error={!!errors.licenseEndDate}
                  disabled
                  InputProps={{
                    readOnly: true,
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon 
                          fontSize="small" 
                          color={errors.licenseEndDate ? "error" : "action"} 
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip 
                          label={licenseStatusInfo.label}
                          size="small"
                          color={licenseStatusInfo.color}
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 1
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <TextField
                  value="Lisans eklenmemiş"
                  fullWidth
                  error={!!errors.licenseEndDate}
                  disabled
                  InputProps={{
                    readOnly: true,
                    sx: {
                      borderRadius: 2,
                      height: 56,
                      fontSize: '1rem',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon 
                          fontSize="small" 
                          color={errors.licenseEndDate ? "error" : "action"} 
                        />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              
              {errors.licenseEndDate && (
                <FormHelperText error>
                  {errors.licenseEndDate}
                </FormHelperText>
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider />
        
        {/* Kurs Durumu */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="text.primary" 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BusinessIcon fontSize="small" color="primary" />
            Sürücü Kursu Durumu
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Typography 
                  variant="body1" 
                  fontWeight={500} 
                  fontSize="1rem"
                  color={(theme) => formData.isActive ? theme.palette.success.main : theme.palette.text.secondary}
                >
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </Typography>
              }
            />
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
};

export default LicenseInfoForm;
