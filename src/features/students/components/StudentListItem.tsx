import React from 'react';
import { Box, Typography, Chip, Button, Avatar, Tooltip } from '@mui/material';
import { 
  School as SchoolIcon,
  Send as SendIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { Student } from '../types/types';

// Borç kaydı kontrolü
const hasDebtRecord = (student: Student): boolean => {
  if (!student.payments || student.payments.length === 0) {
    return false;
  }
  
  // DEBT veya INSTALLMENT kaydı var mı?
  return student.payments.some(p => 
    p.type === 'DEBT' || p.type === 'INSTALLMENT'
  );
};

// Yeni sınav sistemi için exam status utility
const getExamStatus = (student: Student) => {
  // Öğrenci FAILED durumunda mı? (Hak bitti)
  if (student.status === 'failed') {
    // Yazılı hakkı dolmuş
    if (student.writtenExam.attempts >= student.writtenExam.maxAttempts) {
      return { 
        step: 0, 
        text: 'Yazılı Hakkı Bitti', 
        color: 'error',
        borderColor: '#d32f2f',
        bgColor: '#ffebee',
        icon: <ErrorIcon />
      };
    }
    // Direksiyon hakkı dolmuş
    if (student.drivingExam.attempts >= student.drivingExam.maxAttempts) {
      return { 
        step: 0, 
        text: 'Direksiyon Hakkı Bitti', 
        color: 'error',
        borderColor: '#d32f2f',
        bgColor: '#ffebee',
        icon: <ErrorIcon />
      };
    }
  }
  
  // 2+ kez direksiyondan kalan öğrenciler
  const multipleFailures = student.drivingExam.status === 'failed' && student.drivingExam.attempts >= 2;
  
  // Her iki sınav da geçildi
  if (student.writtenExam.status === 'passed' && student.drivingExam.status === 'passed') {
    return { 
      step: 4, 
      text: 'Tamamlandı', 
      color: 'success',
      borderColor: '#4caf50',
      bgColor: '#e8f5e8',
      icon: <CheckCircleIcon />
    };
  }
  
  // Yazılıdan geçti, direksiyon geçti
  if (student.writtenExam.status === 'passed' && student.drivingExam.status === 'passed') {
    return { 
      step: 3, 
      text: 'Direksiyon Geçti', 
      color: 'success',
      borderColor: '#4caf50',
      bgColor: '#e8f5e8',
      icon: <CheckCircleIcon />
    };
  }
  
  // Yazılıdan geçti, direksiyondan kaldı (özellikle 2+ kez)
  if (student.writtenExam.status === 'passed' && student.drivingExam.status === 'failed') {
    return { 
      step: 2, 
      text: multipleFailures ? `Direksiyon Kaldı (${student.drivingExam.attempts})` : 'Direksiyondan Kaldı', 
      color: multipleFailures ? 'error' : 'warning',
      borderColor: multipleFailures ? '#f44336' : '#ff9800',
      bgColor: multipleFailures ? '#ffebee' : '#fff3e0',
      icon: multipleFailures ? <ErrorIcon /> : <WarningIcon />
    };
  }
  
  // Yazılıdan geçti, direksiyon bekliyor
  if (student.writtenExam.status === 'passed' && student.drivingExam.status === 'not-taken') {
    return { 
      step: 2, 
      text: 'Direksiyon Bekliyor', 
      color: 'info',
      borderColor: '#2196f3',
      bgColor: '#e3f2fd',
      icon: <PendingIcon />
    };
  }
  
  // Yazılıdan kaldı
  if (student.writtenExam.status === 'failed') {
    const isExhausted = student.writtenExam.attempts >= student.writtenExam.maxAttempts;
    return { 
      step: 1, 
      text: isExhausted ? 'Yazılı Hak Bitti' : `Yazılıdan Kaldı (${student.writtenExam.attempts})`, 
      color: 'error',
      borderColor: '#f44336',
      bgColor: '#ffebee',
      icon: <ErrorIcon />
    };
  }
  
  // Henüz sınava girmedi - Sınav Bekliyor (Yazılı)
  if (student.writtenExam.status === 'not-taken' && student.drivingExam.status === 'not-taken') {
    return { 
      step: 1, 
      text: 'Sınav Bekliyor', 
      color: 'secondary',
      borderColor: '#9c27b0',
      bgColor: '#f3e5f5',
      icon: <PendingIcon />
    };
  }
  
  // Pasif öğrenci
  if (student.status === 'inactive') {
    return { 
      step: 0, 
      text: 'Pasif', 
      color: 'default',
      borderColor: '#9e9e9e',
      bgColor: '#f5f5f5',
      icon: <PersonIcon />
    };
  }
  
  // Default aktif
  return { 
    step: 1, 
    text: 'Aktif', 
    color: 'primary',
    borderColor: '#2196f3',
    bgColor: '#e3f2fd',
    icon: <PersonIcon />
  };
};

interface StudentListItemProps {
  student: Student;
  onClick: () => void;
  onSendNotification?: (student: Student) => void;
  onExamStatusClick?: (student: Student) => void;
}

const StudentListItem: React.FC<StudentListItemProps> = ({ 
  student, 
  onClick,
  onSendNotification,
  onExamStatusClick
}) => {
  // 3 aşamalı exam status
  const examStatus = getExamStatus(student);
  
  return (
    <Box 
      sx={{ 
        borderLeft: '4px solid',
        borderLeftColor: examStatus.borderColor,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: examStatus.bgColor,
          transform: 'translateX(4px)',
          borderLeftWidth: '8px'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ p: 2, pl: 3, display: 'flex', alignItems: 'center' }}>
          {/* Avatar - Sabit genişlik */}
          <Box sx={{ 
            width: 50,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            mr: 1
          }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: 'white',
                color: examStatus.borderColor,
                border: '2px solid',
                borderColor: examStatus.borderColor,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {examStatus.icon}
            </Avatar>
          </Box>
          
          {/* Ad Soyad / TC No - 22% */}
          <Box sx={{ width: '22%', pr: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {student.name} {student.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {student.tcNo}
            </Typography>
          </Box>
          
          {/* Telefon - 13% */}
          <Box sx={{ width: '13%', pr: 2 }}>
            <Typography variant="body2">
              +90 {student.phone}
            </Typography>
          </Box>
          
          {/* Sınav Tarihi - 13% */}
          <Box sx={{ width: '13%', pr: 2 }}>
            {(student.writtenExamDate || student.drivingExamDate) ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {student.drivingExamDate 
                    ? new Date(student.drivingExamDate).toLocaleDateString('tr-TR')
                    : student.writtenExamDate
                      ? new Date(student.writtenExamDate).toLocaleDateString('tr-TR')
                      : '-'}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                  {student.drivingExamDate && student.drivingExamTime
                    ? student.drivingExamTime
                    : student.writtenExamDate && student.writtenExamTime
                      ? student.writtenExamTime
                      : ''}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">-</Typography>
            )}
          </Box>
          
          {/* Sınav Durumu - 14% */}
          <Box sx={{ width: '14%', pr: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip 
                label={examStatus.text}
                color={examStatus.color as any}
                size="small"
                variant="filled"
                sx={{ 
                  borderRadius: 1.5, 
                  fontSize: '0.7rem',
                  height: 22,
                  fontWeight: 600,
                }}
              />
              
              {/* Sınav detayları */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip 
                  label={`Yazılı: ${student.writtenExam.attempts}/${student.writtenExam.maxAttempts}`}
                  size="small"
                  variant="outlined"
                  color={student.writtenExam.status === 'passed' ? 'success' : 
                         student.writtenExam.status === 'failed' ? 'error' : 'default'}
                  sx={{ fontSize: '0.6rem', height: 18 ,borderRadius: 1.5, }}
                />
                <Chip 
                  label={`Direksiyon: ${student.drivingExam.attempts}/${student.drivingExam.maxAttempts}`}
                  size="small"
                  variant="outlined"
                  color={student.drivingExam.status === 'passed' ? 'success' : 
                         student.drivingExam.status === 'failed' ? 'error' : 'default'}
                  sx={{ fontSize: '0.6rem', height: 18 ,borderRadius: 1.5, }}
                />
              </Box>
            </Box>
          </Box>
          
          {/* Borç Kaydı - 10% */}
          <Box sx={{ width: '10%', pr: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {hasDebtRecord(student) ? (
              <Chip
                label="Var"
                size="small"
                color="success"
              />
            ) : (
              <Tooltip title="Borç kaydı girilmemiş" arrow>
                <Chip
                  label="Yok"
                  size="small"
                  color="error"
                />
              </Tooltip>
            )}
          </Box>
          
          {/* İşlemler - 28% */}
          <Box sx={{ width: '28%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
            >
              {/* Sınav Durumu Butonu - FAILED durumunda Sıfırla butonu olarak göster */}
              <Button
                variant={student.status === 'failed' ? 'contained' : (examStatus.step >= 2 ? 'contained' : 'outlined')}
                color={student.status === 'failed' ? 'warning' : (examStatus.step >= 3 ? 'success' : examStatus.step >= 2 ? 'info' : 'primary')}
                startIcon={<SchoolIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onExamStatusClick?.(student);
                }}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: '100px',
                  height: '24px',
                  px: 1
                }}
              >
                {student.status === 'failed' ? 'Sıfırla' : 'Sınav'}
              </Button>
              
              {/* Bildirim Gönder Butonu */}
              <Button
                variant="outlined"
                color="info"
                startIcon={<SendIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onSendNotification?.(student);
                }}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: '100px',
                  height: '24px',
                  px: 1,
                  backgroundColor: 'white'
                }}
              >
                Bildirim
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
  );
};

export default StudentListItem;
