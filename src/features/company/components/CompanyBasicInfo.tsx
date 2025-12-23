import React from 'react';
import { Paper, Typography, Box, Divider, Button } from '@mui/material';
import { Business as BusinessIcon, Edit as EditIcon } from '@mui/icons-material';

interface CompanyBasicInfoProps {
  company: {
    name: string;
    owner?: string;
    authorizedPerson?: string;
    email?: string;
    website?: string;
  };
  onEdit?: () => void;
}

const CompanyBasicInfo: React.FC<CompanyBasicInfoProps> = ({ company, onEdit }) => {
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
        //   bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Temel Bilgiler
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
            İşletme Adı
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.name || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            İşletme Sahibi
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.owner || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Müdür
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.authorizedPerson || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            E-posta
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.email || '-'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Website
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {company.website || '-'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default CompanyBasicInfo;
