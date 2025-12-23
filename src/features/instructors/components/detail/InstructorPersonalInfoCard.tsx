import React from 'react';
import {
  Box, Typography, Button, Paper, Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import type { Instructor } from '../../../../types/instructor';

interface InstructorPersonalInfoCardProps {
  instructor: Instructor | null;
  onEdit: () => void;
  formatDate: (date?: string) => string;
}

const InstructorPersonalInfoCard: React.FC<InstructorPersonalInfoCardProps> = ({
  instructor,
  onEdit,
  formatDate
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
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Kişisel Bilgiler
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
          <PersonIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>TC Kimlik No</Typography>
            <Typography variant="body2">{instructor.tcNo || '-'}</Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
            <Typography variant="body2">
              {instructor.phone ? `+90 ${instructor.phone}` : '-'}
            </Typography>
          </Box>
        </Box>
        
        {instructor.email && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
              <EmailIcon color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>E-posta</Typography>
                <Typography variant="body2">{instructor.email}</Typography>
              </Box>
            </Box>
          </>
        )}
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 2 }}>
          <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>İşe Başlama Tarihi</Typography>
            <Typography variant="body2">{formatDate(instructor.startDate)}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default InstructorPersonalInfoCard;
