import React from 'react';
import {
  Box, Typography, Button, Paper, Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { Instructor } from '../../../../types/instructor';

interface InstructorEducationInfoCardProps {
  instructor: Instructor | null;
  onEdit: () => void;
}

const InstructorEducationInfoCard: React.FC<InstructorEducationInfoCardProps> = ({
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
        borderColor: 'divider'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <SchoolIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Eğitim ve Yeterlilik Bilgileri
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
          <DriveEtaIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Uzmanlık Alanı</Typography>
            <Typography variant="body2">{instructor.specialization || '-'}</Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <DriveEtaIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Ehliyet Türleri</Typography>
            <Typography variant="body2">
              {instructor.licenseTypes && instructor.licenseTypes.length > 0 
                ? instructor.licenseTypes.join(', ') 
                : '-'}
            </Typography>
          </Box>
        </Box>
        
        {instructor.experience && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
              <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Deneyim</Typography>
                <Typography variant="body2">{instructor.experience} yıl</Typography>
              </Box>
            </Box>
          </>
        )}
        
        <Divider />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <PersonIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Max Öğrenci/Dönem</Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {instructor.maxStudentsPerPeriod || 10} öğrenci
            </Typography>
          </Box>
        </Box>
        
        {instructor.notes && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
              <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Notlar</Typography>
                <Typography variant="body2">{instructor.notes}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default InstructorEducationInfoCard;
