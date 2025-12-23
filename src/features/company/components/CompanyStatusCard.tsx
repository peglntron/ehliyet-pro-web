import React from 'react';
import { Paper, Typography, Box, Chip, Grid, LinearProgress } from '@mui/material';
import { Info as InfoIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon, Error as ErrorIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

interface CompanyStatusCardProps {
  isActive: boolean;
  registrationDate: string;
  licenseEndDate: string;
}

const CompanyStatusCard: React.FC<CompanyStatusCardProps> = ({ 
  isActive, 
  registrationDate, 
  licenseEndDate 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysUntilExpiry = (licenseEnd: string) => {
    const today = new Date();
    const endDate = new Date(licenseEnd);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry(licenseEndDate);
  
  // Lisans durumu için renk ve mesaj belirleme
  let statusColor: 'success' | 'warning' | 'error' = 'success';
  let statusIcon = <CheckCircleIcon sx={{ fontSize: 60 }} />;
  let statusMessage = '';
  let progressValue = 100;
  
  if (daysUntilExpiry < 0) {
    statusColor = 'error';
    statusIcon = <ErrorIcon sx={{ fontSize: 60 }} />;
    statusMessage = `Lisansınız ${Math.abs(daysUntilExpiry)} gün önce sona erdi!`;
    progressValue = 0;
  } else if (daysUntilExpiry === 0) {
    statusColor = 'error';
    statusIcon = <ErrorIcon sx={{ fontSize: 60 }} />;
    statusMessage = 'Lisansınız bugün sona eriyor!';
    progressValue = 5;
  } else if (daysUntilExpiry <= 30) {
    statusColor = 'error';
    statusIcon = <ErrorIcon sx={{ fontSize: 60 }} />;
    statusMessage = `Lisansınız ${daysUntilExpiry} gün içinde sona erecek!`;
    progressValue = (daysUntilExpiry / 30) * 100;
  } else if (daysUntilExpiry <= 90) {
    statusColor = 'warning';
    statusIcon = <WarningIcon sx={{ fontSize: 60 }} />;
    statusMessage = `Lisans yenileme zamanı yaklaşıyor (${daysUntilExpiry} gün)`;
    progressValue = (daysUntilExpiry / 365) * 100;
  } else {
    statusColor = 'success';
    statusIcon = <CheckCircleIcon sx={{ fontSize: 60 }} />;
    statusMessage = `Lisansınız aktif (${daysUntilExpiry} gün geçerli)`;
    progressValue = (daysUntilExpiry / 365) * 100;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
          borderColor: 'divider'
        }}
      >
        <InfoIcon color="primary" />
        <Typography variant="h6" fontWeight={600} color="primary.main">
          İşletme Durumu
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Sol Taraf - Bilgi Kartları */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {/* Aktif/Pasif Durum */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5,
                  bgcolor: isActive ? 'success.50' : 'error.50',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: isActive ? 'success.main' : 'error.main',
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Durum
                  </Typography>
                  <Chip
                    label={isActive ? 'Aktif' : 'Pasif'}
                    color={isActive ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontWeight: 700, fontSize: '1rem', py: 2.5, px: 4 }}
                  />
                </Box>
              </Grid>

              {/* Kayıt Tarihi */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Kayıt Tarihi
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(registrationDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Lisans Başlangıç Tarihi (Kayıt Tarihi ile aynı olarak gösteriyoruz) */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Lisans Başlangıç Tarihi
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 20, color: 'info.main' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(registrationDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Lisans Bitiş Tarihi */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5,
                  bgcolor: `${statusColor}.50`,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: `${statusColor}.main`,
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Lisans Bitiş Tarihi
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 20, color: `${statusColor}.main` }} />
                    <Typography variant="body1" fontWeight={600} color={`${statusColor}.main`}>
                      {formatDate(licenseEndDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Sağ Taraf - Lisans Yenileme Durumu */}
          <Grid item xs={12} md={7}>
            <Box sx={{ 
              p: 4, 
              bgcolor: `${statusColor}.50`, 
              borderRadius: 2,
              border: '3px solid',
              borderColor: `${statusColor}.main`,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Lisans Durumu
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, color: `${statusColor}.main` }}>
                {statusIcon}
              </Box>
              
              <Typography variant="h5" fontWeight={700} color={`${statusColor}.main`} sx={{ mb: 3 }}>
                {statusMessage}
              </Typography>
              
              {/* Progress Bar */}
              <Box sx={{ px: 4 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(progressValue, 100)} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: `${statusColor}.main`,
                      borderRadius: 6
                    },
                    animation: daysUntilExpiry <= 30 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 }
                    }
                  }}
                />
                <Typography variant="body2" fontWeight={600} color={`${statusColor}.main`} sx={{ mt: 1.5 }}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} gün kaldı` : 'Süresi dolmuş'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CompanyStatusCard;
