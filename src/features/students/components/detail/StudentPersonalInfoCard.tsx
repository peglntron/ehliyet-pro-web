import React from 'react';
import {
  Box, Typography, Button, Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import type { Student } from '../../types/types';

interface StudentPersonalInfoCardProps {
  student: Student | null;
  onEdit: () => void;
  formatDate: (date?: string) => string;
}

const StudentPersonalInfoCard: React.FC<StudentPersonalInfoCardProps> = ({
  student,
  onEdit,
  formatDate
}) => {
  // Aktif instructor assignment'tan eğitmen adını al
  const activeAssignment = student?.instructorAssignments?.find(a => a.isActive);
  const instructorName = activeAssignment 
    ? `${activeAssignment.instructor.firstName} ${activeAssignment.instructor.lastName}`
    : (student?.instructorName || 'Henüz eğitmen atanmadı');
  
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
        <Typography variant="h6" fontWeight={600} color="primary.main">
          Kişisel Bilgiler
        </Typography>
        
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
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <PersonIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>TC Kimlik No</Typography>
            <Typography variant="body2">{student?.tcNo}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
            <Typography variant="body2">
              {student?.phone ? `+90 ${student.phone.replace(/^\+?90/, '').replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` : '-'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Ehliyet Sınıfı</Typography>
            <Typography variant="body2" color="text.secondary">
              {student?.licenseType || '-'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Eğitmen</Typography>
            <Typography variant="body2" color="text.secondary">
              {instructorName}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Kayıt Tarihi</Typography>
            <Typography variant="body2">{formatDate(student?.createdAt)}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default StudentPersonalInfoCard;
