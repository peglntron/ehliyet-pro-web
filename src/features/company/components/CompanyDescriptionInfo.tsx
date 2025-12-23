import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { Description as DescriptionIcon, Edit as EditIcon } from '@mui/icons-material';

interface CompanyDescriptionInfoProps {
  description?: string;
  onEdit?: () => void;
}

const CompanyDescriptionInfo: React.FC<CompanyDescriptionInfoProps> = ({ description, onEdit }) => {
  if (!description) return null;

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
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Açıklama
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
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CompanyDescriptionInfo;
