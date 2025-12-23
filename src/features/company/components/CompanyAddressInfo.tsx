import React from 'react';
import { Paper, Typography, Box, Button, Divider } from '@mui/material';
import { LocationOn as LocationIcon, Map as MapIcon, Edit as EditIcon } from '@mui/icons-material';

interface CompanyAddressInfoProps {
  company: {
    province?: string;
    district?: string;
    address?: string;
    location?: {
      mapLink?: string;
      latitude?: string;
      longitude?: string;
    };
  };
  onEdit?: () => void;
}

const CompanyAddressInfo: React.FC<CompanyAddressInfoProps> = ({ company, onEdit }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: 3
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocationIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Adres Bilgileri
          </Typography>
        </Box>
        {onEdit && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ borderRadius: 2 }}
          >
            Düzenle
          </Button>
        )}
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            İl
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.province || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            İlçe
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.district || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: company.location?.mapLink ? 2 : 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Adres
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.address || '-'}
          </Typography>
        </Box>

        {company.location?.mapLink && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.200'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ mb: 0.5 }}>
                    Google Maps Konumu
                  </Typography>
                  {company.location.latitude && company.location.longitude && (
                    <Typography variant="caption" color="text.secondary">
                      {company.location.latitude}, {company.location.longitude}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  href={company.location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<MapIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Haritada Görüntüle
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CompanyAddressInfo;
