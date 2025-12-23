import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  DirectionsCar as DirectionsCarIcon,
  School as SchoolIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import type { Student } from '../types/types';

interface ExamStatusModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onWrittenExamPass: (student: Student) => void;
  onDrivingExamPass: (student: Student) => void;
  onUndoWrittenExam?: (student: Student) => void;
  onUndoDrivingExam?: (student: Student) => void;
  showOnlyDriving?: boolean; // Sadece direksiyon sınavı seçeneğini göster
}

const ExamStatusModal: React.FC<ExamStatusModalProps> = ({
  open,
  onClose,
  student,
  onWrittenExamPass,
  onDrivingExamPass,
  onUndoWrittenExam,
  onUndoDrivingExam,
  showOnlyDriving = false
}) => {
  if (!student) return null;

  // Öğrencinin mevcut sınav durumunu kontrol et
  const getExamStatus = (student: Student) => {
    switch (student.status) {
      case 'written-passed':
        return { step: 2, text: 'Yazılı Sınavı Geçti' };
      case 'driving-passed':
      case 'both-passed':
        return { step: 3, text: 'Direksiyon Sınavını Geçti' };
      default:
        return { step: 1, text: 'Yeni Kayıt' };
    }
  };

  const currentStatus = getExamStatus(student);

  const handleWrittenExamClick = () => {
    onWrittenExamPass(student);
    onClose();
  };

  const handleDrivingExamClick = () => {
    onDrivingExamPass(student);
    onClose();
  };

  const handleUndoWrittenExam = () => {
    if (onUndoWrittenExam) {
      onUndoWrittenExam(student);
      onClose();
    }
  };

  const handleUndoDrivingExam = () => {
    if (onUndoDrivingExam) {
      onUndoDrivingExam(student);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Sınav Durumu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {student.name} {student.surname}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Mevcut Durum Bilgisi */}
          <Box sx={{ 
            bgcolor: '#f8fafc', 
            p: 2, 
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Mevcut Durum:
            </Typography>
            <Chip 
              label={currentStatus.text} 
              color={currentStatus.step === 1 ? 'default' : currentStatus.step === 2 ? 'info' : 'success'}
              sx={{ borderRadius: 1, fontWeight: 600 }}
            />
          </Box>

          {/* Durum Adımları */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Sınav Aşamaları:
            </Typography>
            
            {/* 1. Aşama - Yazılı Sınav Alanı - Sadece normal modda göster */}
            {!showOnlyDriving && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                <Button
                  variant={currentStatus.step === 2 ? 'contained' : currentStatus.step > 2 ? 'outlined' : 'outlined'}
                  color={currentStatus.step === 2 ? 'success' : currentStatus.step > 2 ? 'inherit' : 'inherit'}
                  startIcon={<CheckIcon />}
                  onClick={handleWrittenExamClick}
                  disabled={currentStatus.step === 2} // Sadece seçili aşamada disabled
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    height: 64,
                    opacity: currentStatus.step > 2 ? 0.6 : 1,
                    bgcolor: currentStatus.step > 2 ? 'grey.100' : undefined,
                    borderColor: currentStatus.step === 2 ? 'success.main' : currentStatus.step > 2 ? 'grey.400' : undefined,
                    flex: 1
                  }}
                >
                  <Box sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      bgcolor: currentStatus.step === 2 ? 'white' : currentStatus.step > 2 ? 'grey.400' : 'transparent',
                      color: currentStatus.step === 2 ? 'success.main' : currentStatus.step > 2 ? 'white' : 'inherit',
                      border: currentStatus.step >= 2 ? 'none' : '2px solid currentColor',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      mr: 2
                    }}>
                      1
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Yazılı Sınavı Geçti
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {currentStatus.step === 2 ? 'Seçili aşama' : 
                         currentStatus.step > 2 ? 'Tamamlandı ✓' : 
                         'Yazılı Sınavı Geçti olarak işaretle'}
                      </Typography>
                    </Box>
                  </Box>
                </Button>
                
                {/* Yazılı Sınavı Geri Al Butonu - Step 2 veya 3'te görünür */}
                {(currentStatus.step === 2 || currentStatus.step === 3) && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<UndoIcon />}
                    onClick={handleUndoWrittenExam}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      minWidth: '100px',
                      height: 64
                    }}
                  >
                    Geri Al
                  </Button>
                )}
              </Box>
            )}
            
            {/* 2. Aşama - Direksiyon Sınav Alanı */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
              <Button
                variant={currentStatus.step === 3 ? 'contained' : 'outlined'}
                color={currentStatus.step === 3 ? 'success' : 'inherit'}
                startIcon={<DirectionsCarIcon />}
                onClick={handleDrivingExamClick}
                disabled={currentStatus.step === 3 || (!showOnlyDriving && currentStatus.step < 2)} // Eşleştirme modunda step kontrolü yok
                sx={{
                  justifyContent: 'flex-start',
                  p: 2,
                  textTransform: 'none',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  height: 64,
                  borderColor: currentStatus.step === 3 ? 'success.main' : undefined,
                  flex: 1
                }}
              >
                <Box sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: currentStatus.step === 3 ? 'white' : 'transparent',
                    color: currentStatus.step === 3 ? 'success.main' : 'inherit',
                    border: currentStatus.step >= 3 ? 'none' : '2px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    mr: 2
                  }}>
                    {showOnlyDriving ? '1' : '2'}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Direksiyon Sınavını Geçti
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {currentStatus.step === 3 
                        ? 'Seçili aşama - Tamamlandı!' 
                        : showOnlyDriving 
                          ? 'Direksiyon sınavını geçti olarak işaretle'
                          : currentStatus.step < 2 
                            ? 'Önce yazılı sınavı geçmelisiniz'
                            : 'Direksiyon sınavını geçti olarak işaretle'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Button>
              
              {/* Direksiyon Sınavı Geri Al Butonu */}
              {(currentStatus.step === 3 || (showOnlyDriving && currentStatus.step >= 3)) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<UndoIcon />}
                  onClick={handleUndoDrivingExam}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    minWidth: '100px',
                    height: 64
                  }}
                >
                  Geri Al
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 3
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamStatusModal;