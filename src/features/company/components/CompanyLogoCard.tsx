import React from 'react';
import { Paper, Typography, Box, Avatar } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { getImageUrl } from '../../../utils/api';

interface CompanyLogoCardProps {
  logo?: string;
  companyName: string;
}

const CompanyLogoCard: React.FC<CompanyLogoCardProps> = ({ logo, companyName }) => {
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
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight={600} color="primary.main" textAlign="center">
          İşletme Logosu
        </Typography>
      </Box>

      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{ 
            width: 140, 
            height: 140, 
            mx: 'auto',
            border: '2px solid',
            borderColor: 'divider'
          }}
          src={logo ? getImageUrl(logo) : undefined}
          alt={companyName}
        >
          <BusinessIcon sx={{ fontSize: 70, color: 'primary.main' }} />
        </Avatar>
      </Box>
    </Paper>
  );
};

export default CompanyLogoCard;
