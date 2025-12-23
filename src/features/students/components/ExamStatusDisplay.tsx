import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { Student } from '../types/types';
import { getExamStatusDisplay, getStudentOverallStatus } from '../utils/examUtils';

interface ExamStatusDisplayProps {
  student: Student;
  compact?: boolean;
  showDetails?: boolean;
}

const ExamStatusDisplay: React.FC<ExamStatusDisplayProps> = ({ 
  student, 
  compact = false, 
  showDetails = true 
}) => {
  const examStatus = getExamStatusDisplay(student);
  const overallStatus = getStudentOverallStatus(student);
  
  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title={`Yazılı: ${examStatus.written.display}`}>
          <Chip
            size="small"
            label="Y"
            color={examStatus.written.status === 'passed' ? 'success' : 
                   examStatus.written.status === 'failed' ? 'error' : 'default'}
            sx={{ minWidth: 32, fontSize: '0.7rem' }}
          />
        </Tooltip>
        <Tooltip title={`Direksiyon: ${examStatus.driving.display}`}>
          <Chip
            size="small"
            label="D"
            color={examStatus.driving.status === 'passed' ? 'success' : 
                   examStatus.driving.status === 'failed' ? 'error' : 'default'}
            sx={{ minWidth: 32, fontSize: '0.7rem' }}
          />
        </Tooltip>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Genel Durum */}
      <Chip
        label={overallStatus.display}
        color={overallStatus.color}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
      />
      
      {showDetails && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {/* Yazılı Sınav Durumu */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Yazılı Sınav
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {examStatus.written.status === 'passed' && <CheckCircleIcon fontSize="small" color="success" />}
              {examStatus.written.status === 'failed' && <CancelIcon fontSize="small" color="error" />}
              {examStatus.written.status === 'not-taken' && <ScheduleIcon fontSize="small" color="action" />}
              
              <Typography variant="body2">
                {examStatus.written.display}
              </Typography>
              
              {examStatus.written.attempts > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ({examStatus.written.attempts}/{examStatus.written.maxAttempts})
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Direksiyon Sınav Durumu */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Direksiyon Sınav
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {examStatus.driving.status === 'passed' && <CheckCircleIcon fontSize="small" color="success" />}
              {examStatus.driving.status === 'failed' && <CancelIcon fontSize="small" color="error" />}
              {examStatus.driving.status === 'not-taken' && <ScheduleIcon fontSize="small" color="action" />}
              
              <Typography variant="body2">
                {examStatus.driving.display}
              </Typography>
              
              {examStatus.driving.attempts > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ({examStatus.driving.attempts}/{examStatus.driving.maxAttempts})
                </Typography>
              )}
              
              {/* 2+ kez kaldığında uyarı göster */}
              {examStatus.driving.status === 'failed' && examStatus.driving.attempts >= 2 && (
                <Tooltip title="2+ kez direksiyondan kaldı">
                  <WarningIcon fontSize="small" color="warning" />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExamStatusDisplay;