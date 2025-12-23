import React from 'react';
import { 
  Box, 
  Typography, 
  TableCell, 
  Chip, 
  Tooltip 
} from '@mui/material';
import { 
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import type { Student } from '../../students/types/types';
import { getExamStatusDisplay, getStudentOverallStatus } from '../../students/utils/examUtils';

interface MatchingStudentRowProps {
  student: Student;
  showExamStatus?: boolean;
}

const MatchingStudentRow: React.FC<MatchingStudentRowProps> = ({ 
  student, 
  showExamStatus = true 
}) => {
  const examStatus = getExamStatusDisplay(student);
  const overallStatus = getStudentOverallStatus(student);
  
  // 2+ kez direksiyondan kaldı mı kontrolü
  const multipleFailures = student.drivingExam.status === 'failed' && student.drivingExam.attempts >= 2;
  
  return (
    <>
      {/* Öğrenci Adı */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            {student.name} {student.surname}
          </Typography>
          {multipleFailures && (
            <Tooltip title="2+ kez direksiyondan kaldı - özel dikkat gerekli">
              <WarningIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      
      {/* TC No */}
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {student.tcNo}
        </Typography>
      </TableCell>
      
      {/* Telefon */}
      <TableCell>
        <Typography variant="body2">
          {student.phone}
        </Typography>
      </TableCell>
      
      {/* Ehliyet Türü */}
      <TableCell>
        <Chip 
          label={student.licenseType} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      </TableCell>
      
      {showExamStatus && (
        <>
          {/* Yazılı Sınav Durumu */}
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {examStatus.written.status === 'passed' && (
                <CheckCircleIcon fontSize="small" color="success" />
              )}
              {examStatus.written.status === 'failed' && (
                <ErrorIcon fontSize="small" color="error" />
              )}
              <Typography variant="body2">
                {examStatus.written.display}
              </Typography>
              {examStatus.written.attempts > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ({examStatus.written.attempts}/{examStatus.written.maxAttempts})
                </Typography>
              )}
            </Box>
          </TableCell>
          
          {/* Direksiyon Sınav Durumu */}
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {examStatus.driving.status === 'passed' && (
                <CheckCircleIcon fontSize="small" color="success" />
              )}
              {examStatus.driving.status === 'failed' && (
                <ErrorIcon fontSize="small" color="error" />
              )}
              <Typography variant="body2">
                {examStatus.driving.display}
              </Typography>
              {examStatus.driving.attempts > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ({examStatus.driving.attempts}/{examStatus.driving.maxAttempts})
                </Typography>
              )}
              {multipleFailures && (
                <Chip 
                  label="Dikkat!" 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </TableCell>
          
          {/* Genel Durum */}
          <TableCell>
            <Chip
              label={overallStatus.display}
              color={overallStatus.color}
              size="small"
              variant={overallStatus.status === 'completed' ? 'filled' : 'outlined'}
            />
          </TableCell>
        </>
      )}
    </>
  );
};

export default MatchingStudentRow;