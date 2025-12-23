import React from 'react';
import {
  Box, Typography, Button, Paper, Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import type { Student } from '../../types/types';

interface StudentExamInfoCardProps {
  student: Student | null;
  onEdit: () => void;
  formatDate: (date?: string) => string;
}

const StudentExamInfoCard: React.FC<StudentExamInfoCardProps> = ({
  student,
  onEdit,
  formatDate
}) => {
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
          Sınav Bilgileri
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
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        {/* Yazılı Sınav */}
        <Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
            <SchoolIcon color="primary" fontSize="medium" />
            <Typography variant="subtitle1" fontWeight={600}>Yazılı Sınav</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {student?.writtenExam.lastExamDate ? (
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(student.writtenExam.lastExamDate)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sınav tarihi girilmedi
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Deneme: {student?.writtenExam.attempts}/{student?.writtenExam.maxAttempts}
              </Typography>
            </Box>
            
            <Chip 
              label={
                student?.writtenExam.status === 'passed' ? 'Geçti' :
                student?.writtenExam.status === 'failed' ? 'Kaldı' : 'Girmedi'
              }
              color={
                student?.writtenExam.status === 'passed' ? 'success' :
                student?.writtenExam.status === 'failed' ? 'error' : 'default'
              }
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            />
          </Box>
        </Box>
        
        {/* Direksiyon Sınavı */}
        <Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
            <DirectionsCarIcon color="primary" fontSize="medium" />
            <Typography variant="subtitle1" fontWeight={600}>Direksiyon Sınavı</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {student?.drivingExam.lastExamDate ? (
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(student.drivingExam.lastExamDate)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sınav tarihi girilmedi
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Deneme: {student?.drivingExam.attempts}/{student?.drivingExam.maxAttempts}
              </Typography>
            </Box>
            
            <Chip 
              label={
                student?.drivingExam.status === 'passed' ? 'Geçti' :
                student?.drivingExam.status === 'failed' ? 'Kaldı' : 'Girmedi'
              }
              color={
                student?.drivingExam.status === 'passed' ? 'success' :
                student?.drivingExam.status === 'failed' ? 'error' : 'default'
              }
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default StudentExamInfoCard;
