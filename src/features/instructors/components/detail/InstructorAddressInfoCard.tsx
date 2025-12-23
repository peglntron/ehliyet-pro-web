import React from 'react';
import {
  Box, Typography, Button, Paper, Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import type { Instructor } from '../../../../types/instructor';

interface InstructorAddressInfoCardProps {
  instructor: Instructor | null;
  onEdit: () => void;
}

const InstructorAddressInfoCard: React.FC<InstructorAddressInfoCardProps> = ({
  instructor,
  onEdit
}) => {
  if (!instructor) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Adres Bilgileri
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Düzenle
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>İl</Typography>
            <Typography variant="body2">{instructor.province || '-'}</Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>İlçe</Typography>
            <Typography variant="body2">{instructor.district || '-'}</Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Adres</Typography>
            <Typography variant="body2">{instructor.address || '-'}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default InstructorAddressInfoCard;
