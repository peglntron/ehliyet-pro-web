import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  DirectionsCar as DirectionsCarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { Student } from '../types/types';
import { getExamStatusDisplay, getStudentOverallStatus } from '../utils/examUtils';
import { updateWrittenExamStatus, updateDrivingExamStatus, resetExamStatus } from '../api/examService';

interface NewExamStatusModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateExamStatus: (updatedStudent: Student) => void;
  readOnly?: boolean;
}

const NewExamStatusModal: React.FC<NewExamStatusModalProps> = ({
  open,
  onClose,
  student,
  onUpdateExamStatus,
  readOnly = false
}) => {
  const { showSnackbar } = useSnackbar();
  const [processing, setProcessing] = useState(false);
  const [localStudent, setLocalStudent] = useState<Student | null>(student);

  // Student prop'u değiştiğinde local state'i güncelle
  React.useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  if (!localStudent) return null;

  const examStatus = getExamStatusDisplay(localStudent);

  const handleExamAction = async (examType: 'written' | 'driving', action: 'pass' | 'fail' | 'reset') => {
    if (readOnly || !onUpdateExamStatus || !localStudent) return;

    try {
      setProcessing(true);
      
      // Backend'e istek gönder ve sonucu al
      let updatedStudent: Student;
      
      if (action === 'reset') {
        updatedStudent = await resetExamStatus(localStudent.id, examType);
      } else if (examType === 'written') {
        updatedStudent = await updateWrittenExamStatus(
          localStudent.id, 
          action === 'pass' ? 'PASSED' : 'FAILED',
          undefined // Tarih girilmediğinde null olarak kaydet
        );
      } else {
        updatedStudent = await updateDrivingExamStatus(
          localStudent.id,
          action === 'pass' ? 'PASSED' : 'FAILED', 
          undefined // Tarih girilmediğinde null olarak kaydet
        );
      }
      
      // Önce local state'i güncelle (modal içinde anında görünsün)
      setLocalStudent(updatedStudent);
      
      // Sonra parent'a bildir (liste güncellensin)
      onUpdateExamStatus(updatedStudent);
      
      // Başarı mesajı göster
      const examText = examType === 'written' ? 'yazılı sınav' : 'direksiyon sınav';
      const actionText = action === 'pass' ? 'geçti' : action === 'fail' ? 'kaldı' : 'sıfırlandı';
      showSnackbar(`${examText} ${actionText} olarak işaretlendi`, 'success');
    } catch (error) {
      console.error('Sınav durumu güncellenirken hata:', error);
      showSnackbar(error instanceof Error ? error.message : 'Bir hata oluştu', 'error');
    } finally {
      setProcessing(false);
    }
  };
  
  const overallStatus = getStudentOverallStatus(localStudent);

  // Sınav hakkı kontrolü
  const canTakeWrittenExam = localStudent.writtenExam.attempts < localStudent.writtenExam.maxAttempts;
  
  // Direksiyon sınavı için: Yazılı geçmiş olmalı VE aktif eğitmen ataması olmalı
  const hasActiveInstructor = localStudent.instructorAssignments?.some(a => a.isActive) || false;
  const canTakeDrivingExam = localStudent.drivingExam.attempts < localStudent.drivingExam.maxAttempts && 
                            localStudent.writtenExam.status === 'passed' &&
                            hasActiveInstructor;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Sınav Durumu
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {localStudent.name} {localStudent.surname}
              </Typography>
            </Box>
          </Box>
          
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        {processing && <LinearProgress sx={{ mb: 2 }} />}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Genel Durum */}
          <Alert 
            severity={overallStatus.color === 'success' ? 'success' : 
                     overallStatus.color === 'error' ? 'error' : 
                     overallStatus.color === 'warning' ? 'warning' : 'info'}
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Genel Durum: {overallStatus.display}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Yazılı Sınav */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 
                localStudent.writtenExam.status === 'passed' ? 'success.main' : 
                localStudent.writtenExam.status === 'failed' ? 'error.main' : 'grey.300' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon color={
                      localStudent.writtenExam.status === 'passed' ? 'success' : 
                      localStudent.writtenExam.status === 'failed' ? 'error' : 'action'
                    } />
                    <Typography variant="h6" fontWeight={600}>
                      Yazılı Sınav
                    </Typography>
                  </Box>

                  {/* Durum */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={examStatus.written.display}
                      color={localStudent.writtenExam.status === 'passed' ? 'success' : 
                             localStudent.writtenExam.status === 'failed' ? 'error' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Deneme Sayısı: {localStudent.writtenExam.attempts}/{localStudent.writtenExam.maxAttempts}
                    </Typography>
                  </Box>

                  {/* Detaylar */}
                  {localStudent.writtenExam.passedAtAttempt && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                      ✓ {localStudent.writtenExam.passedAtAttempt}. denemede geçti
                    </Typography>
                  )}
                  
                  {localStudent.writtenExam.failedAttempts && localStudent.writtenExam.failedAttempts.length > 0 && (
                    <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                      ✗ {localStudent.writtenExam.failedAttempts.join(', ')}. denemelerde kaldı
                    </Typography>
                  )}

                  {localStudent.writtenExam.lastExamDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Son sınav: {new Date(localStudent.writtenExam.lastExamDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  )}

                  {/* İşlem Butonları */}
                  {!readOnly && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                      {localStudent.writtenExam.status !== 'passed' && canTakeWrittenExam && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleExamAction('written', 'pass')}
                          disabled={processing}
                          size="small"
                        >
                          Geçti
                        </Button>
                      )}
                      
                      {localStudent.writtenExam.status !== 'passed' && canTakeWrittenExam && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleExamAction('written', 'fail')}
                          disabled={processing}
                          size="small"
                        >
                          Kaldı
                        </Button>
                      )}
                      
                      {localStudent.writtenExam.status !== 'not-taken' && (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleExamAction('written', 'reset')}
                          disabled={processing}
                          size="small"
                        >
                          Sıfırla
                        </Button>
                      )}
                      
                      {!canTakeWrittenExam && localStudent.writtenExam.status === 'failed' && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Yazılı sınav hakkı bitti
                        </Alert>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Direksiyon Sınav */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 
                localStudent.drivingExam.status === 'passed' ? 'success.main' : 
                localStudent.drivingExam.status === 'failed' ? 'error.main' : 'grey.300' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <DirectionsCarIcon color={
                      localStudent.drivingExam.status === 'passed' ? 'success' : 
                      localStudent.drivingExam.status === 'failed' ? 'error' : 'action'
                    } />
                    <Typography variant="h6" fontWeight={600}>
                      Direksiyon Sınav
                    </Typography>
                    {localStudent.drivingExam.status === 'failed' && localStudent.drivingExam.attempts >= 2 && (
                      <WarningIcon color="warning" fontSize="small" />
                    )}
                  </Box>

                  {/* Durum */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={examStatus.driving.display}
                      color={localStudent.drivingExam.status === 'passed' ? 'success' : 
                             localStudent.drivingExam.status === 'failed' ? 'error' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Deneme Sayısı: {localStudent.drivingExam.attempts}/{localStudent.drivingExam.maxAttempts}
                    </Typography>
                  </Box>

                  {/* Detaylar */}
                  {localStudent.drivingExam.passedAtAttempt && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                      ✓ {localStudent.drivingExam.passedAtAttempt}. denemede geçti
                    </Typography>
                  )}
                  
                  {localStudent.drivingExam.failedAttempts && localStudent.drivingExam.failedAttempts.length > 0 && (
                    <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                      ✗ {localStudent.drivingExam.failedAttempts.join(', ')}. denemelerde kaldı
                      {localStudent.drivingExam.attempts >= 2 && (
                        <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                          (Özel Dikkat!)
                        </Typography>
                      )}
                    </Typography>
                  )}

                  {localStudent.drivingExam.lastExamDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Son sınav: {new Date(localStudent.drivingExam.lastExamDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  )}

                  {/* Yazılı sınav uyarısı */}
                  {localStudent.writtenExam.status !== 'passed' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Önce yazılı sınavı geçmelisiniz
                    </Alert>
                  )}

                  {/* Eğitmen ataması uyarısı */}
                  {localStudent.writtenExam.status === 'passed' && !hasActiveInstructor && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Direksiyon sınavına girebilmek için önce bir eğitmen ataması yapılmalıdır
                    </Alert>
                  )}

                  {/* İşlem Butonları */}
                  {!readOnly && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                      {localStudent.drivingExam.status !== 'passed' && canTakeDrivingExam && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleExamAction('driving', 'pass')}
                          disabled={processing}
                          size="small"
                        >
                          Geçti
                        </Button>
                      )}
                      
                      {localStudent.drivingExam.status !== 'passed' && canTakeDrivingExam && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleExamAction('driving', 'fail')}
                          disabled={processing}
                          size="small"
                        >
                          Kaldı
                        </Button>
                      )}
                      
                      {localStudent.drivingExam.status !== 'not-taken' && (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleExamAction('driving', 'reset')}
                          disabled={processing}
                          size="small"
                        >
                          Sıfırla
                        </Button>
                      )}
                      
                      {!canTakeDrivingExam && localStudent.drivingExam.status === 'failed' && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Direksiyon sınav hakkı bitti
                        </Alert>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 4
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewExamStatusModal;