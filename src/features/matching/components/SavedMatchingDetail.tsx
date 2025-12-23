import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  SwapHoriz as SwapHorizIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import type { SavedMatching } from '../types/savedMatchingTypes';
import type { Student } from '../../students/types/types';
import { fetchSavedMatching, updateMatching, deleteMatching, archiveMatching } from '../api/savedMatchingApi';
import { getStudents, sendNotification } from '../../students/api/useStudents';
import { studentAPI } from '../../../api/students';
import { useInstructors } from '../../instructors/api/useInstructors';
import type { MatchingResult } from '../types/types';
import StudentSwapModal from './StudentSwapModal';
import AddStudentModal from './AddStudentModal';
import PDFExportHTML from './PDFExportHTML';
import NewExamStatusModal from '../../students/components/NewExamStatusModal';
import NotificationModal from '../../students/components/NotificationModal';
import { updateExamStatus } from '../../students/utils/examStatusUpdater';
import { formatDate } from '../../../utils/dateFormat';
import PageBreadcrumb from '../../../components/PageBreadcrumb';

const SavedMatchingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [matching, setMatching] = useState<SavedMatching | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ studentId: string; currentInstructorId: string } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isLocked, setIsLocked] = useState(false);
  const [examStatusModalOpen, setExamStatusModalOpen] = useState(false);
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState<Student | null>(null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [selectedInstructorForAddStudent, setSelectedInstructorForAddStudent] = useState<string>('');
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedInstructorForNotification, setSelectedInstructorForNotification] = useState<string>('');
  const [selectedStudentForNotification, setSelectedStudentForNotification] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  
  const { instructors } = useInstructors();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Paralel olarak veri yükle
        const [matchingData, studentsData] = await Promise.all([
          fetchSavedMatching(id),
          getStudents() // Mock data yerine gerçek API çağrısı
        ]);
        
        if (!matchingData) {
          setError('Eşleştirme bulunamadı');
          return;
        }
        
        setMatching(matchingData);
        setStudents(studentsData);
        setIsLocked(matchingData.isLocked || false);
      } catch (err) {
        setError('Veri yüklenirken hata oluştu');
        console.error('Error loading saved matching:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'archived': return 'error'; // Pasif için kırmızı/error rengi
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'archived': return 'Pasif'; // Arşivlendi → Pasif
      case 'draft': return 'Taslak';
      default: return status;
    }
  };



  // PDF için MatchingResult formatına dönüştürme fonksiyonu
  const prepareMatchingResults = (): MatchingResult[] => {
    if (!matching?.matches) return [];

    return matching.matches.map(match => {
      const student = students.find(s => s.id === match.studentId);
      const instructor = instructors.find(i => i.id === match.instructorId);
      
      // studentStatus'u MatchingResult tipine uygun hale getir
      const convertStatus = (status?: string) => {
        if (!status) return 'active' as const;
        if (['active', 'inactive', 'completed', 'failed'].includes(status)) {
          return status as 'active' | 'inactive' | 'completed' | 'failed';
        }
        // Diğer statusları en yakın duruma çevir
        if (status.includes('passed') || status === 'both-passed') return 'completed' as const;
        return 'active' as const;
      };

      // Gender normalizasyon
      const normalizeGender = (g?: string): 'male' | 'female' => {
        if (!g) return 'male';
        const lower = g.toLowerCase();
        return lower === 'female' || lower === 'f' ? 'female' : 'male';
      };
      
      return {
        ...match,
        studentName: student ? `${student.name} ${student.surname}` : 'Öğrenci Bulunamadı',
        instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Eğitmen Bulunamadı',
        studentGender: normalizeGender(student?.gender || match.studentGender),
        instructorGender: normalizeGender(instructor?.gender || match.instructorGender),
        studentStatus: convertStatus(student?.status),
        licenseType: student?.licenseType || matching.licenseTypes?.[0] || matching.licenseType,
        matchDate: new Date().toISOString().split('T')[0]
      };
    });
  };

    const handleStudentSwapClick = (studentId: string, currentInstructorId: string) => {
    if (isLocked) {
      setSnackbarMessage('Bu eşleştirme kilitli olduğu için değişiklik yapılamaz.');
      setSnackbarOpen(true);
      return;
    }
    setSelectedStudent({ studentId, currentInstructorId });
    setSwapModalOpen(true);
  };

  const handleToggleLock = async () => {
    if (matching) {
      try {
        const newLockStatus = !isLocked;
        setIsLocked(newLockStatus);
        
        // API'ye kaydet
        await updateMatching(matching.id, { isLocked: newLockStatus });
        
        // Local state'i güncelle
        setMatching({
          ...matching,
          isLocked: newLockStatus,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Current User'
        });

        setSnackbarMessage(newLockStatus ? 'Eşleştirme kilitlendi.' : 'Eşleştirme kilidi açıldı.');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Lock toggle error:', error);
        setSnackbarMessage('Kilit durumu değiştirilirken hata oluştu.');
        setSnackbarOpen(true);
        // Rollback
        setIsLocked(!isLocked);
      }
    }
  };

  // Taslak eşleştirmeyi onayla (PENDING → APPLIED)
  const handleApplyMatching = async () => {
    if (!matching) return;

    if (isLocked) {
      setSnackbarMessage('Kilitli eşleştirmeler onaylanamaz! Önce kilidi açın.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/matching/${matching.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMatching({
          ...matching,
          status: 'active',
          lastModified: new Date().toISOString()
        });

        setSnackbarMessage('Eşleştirme başarıyla onaylandı ve öğrencilere uygulandı!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error(data.message || 'Onaylama başarısız');
      }
    } catch (error: any) {
      console.error('Apply matching error:', error);
      setSnackbarMessage(error.message || 'Eşleştirme onaylanırken hata oluştu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Aktif eşleştirmeyi pasif yap (APPLIED → CANCELLED)
  const handleMakePassive = () => {
    if (!matching) return;

    if (matching.status !== 'active') {
      setSnackbarMessage('Sadece aktif eşleştirmeler arşivlenebilir.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!matching) return;
    
    try {
      setArchiving(true);
      const archivedMatching = await archiveMatching(matching.id);
      setMatching(archivedMatching);

      setSnackbarMessage('Eşleştirme arşivlendi.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Archive error:', error);
      setSnackbarMessage('Arşivleme işlemi başarısız oldu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  const handleArchiveCancel = () => {
    setArchiveDialogOpen(false);
  };

  const handleDeleteClick = () => {
    // Arşivlenmiş kayıtlar silinemez
    if (matching?.status === 'archived') {
      setSnackbarMessage('Arşivlenmiş eşleştirmeler silinemez!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    } else if (isLocked) {
      setSnackbarMessage('Kilitli eşleştirmeler silinemez! Önce kilidi açın.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    } else {
      // Unlocked ve non-archived ise sil
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!matching) return;
    
    try {
      setDeleting(true);
      await deleteMatching(matching.id);
      
      setSnackbarMessage('Eşleştirme başarıyla silindi.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // 1 saniye bekleyip listeye dön
      setTimeout(() => {
        navigate('/matching/saved');
      }, 1000);
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbarMessage('Eşleştirme silinirken hata oluştu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStudentSwap = async (fromInstructorId: string, toInstructorId: string, studentId: string) => {
    try {
      console.log('Swapping student:', { fromInstructorId, toInstructorId, studentId });
      
      if (matching) {
        const student = students.find(s => s.id === studentId);
        const toInstructor = instructors.find(i => i.id === toInstructorId);
        const fromInstructor = instructors.find(i => i.id === fromInstructorId);
        
        if (!toInstructor || !student) {
          setSnackbarMessage('Eğitmen veya öğrenci bulunamadı.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setSwapModalOpen(false);
          setSelectedStudent(null);
          return;
        }

        // 1. License type kontrolü
        const studentLicenseType = student.licenseType;
        const instructorLicenseTypes = toInstructor.licenseTypes || [];
        
        if (!instructorLicenseTypes.includes(studentLicenseType)) {
          setSnackbarMessage(`${toInstructor.firstName} ${toInstructor.lastName} eğitmeni ${studentLicenseType} sınıfı ehliyet yetkisine sahip değil. (Yetkileri: ${instructorLicenseTypes.join(', ')})`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setSwapModalOpen(false);
          setSelectedStudent(null);
          return;
        }

        // 2. Max student kontrolü
        // Hedef eğitmenin toplam aktif öğrenci sayısı
        const realActiveStudents = toInstructor.studentAssignments?.length || 0;
        const matchingStudentsTo = matching.matches.filter(m => m.instructorId === toInstructorId).length;
        const matchingStudentsFrom = matching.matches.filter(m => m.instructorId === fromInstructorId).length;
        
        // Matching uygulandıysa (APPLIED), zaten database'e kaydedilmiş, matching sayısını kullan
        // Uygulanmadıysa (PENDING/draft), gerçek database sayısını kullan
        const isApplied = matching.status === 'APPLIED';
        
        // Swap işlemi: 1 öğrenci çıkıyor (from), 1 öğrenci giriyor (to) - net değişim yok
        // Ama eğer matching henüz uygulanmadıysa, gerçek database sayısına matching'deki değişimi ekle
        let currentStudentCount;
        if (isApplied) {
          // Matching zaten uygulandı, matching'deki sayıları kullan
          currentStudentCount = matchingStudentsTo;
        } else {
          // Matching henüz uygulanmadı, gerçek sayı + matching'deki yeni eklemeler
          currentStudentCount = realActiveStudents + matchingStudentsTo;
        }
        
        const maxStudents = toInstructor.maxStudentsPerPeriod || 10;

        console.log(`[SWAP CHECK] Target: ${toInstructor.firstName} ${toInstructor.lastName}:`, {
          realActiveStudents,
          matchingStudentsTo,
          matchingStudentsFrom,
          currentStudentCount,
          maxStudents,
          isApplied,
          matchingStatus: matching.status
        });

        if (currentStudentCount >= maxStudents) {
          setSnackbarMessage(`${toInstructor.firstName} ${toInstructor.lastName} maksimum öğrenci sayısına (${maxStudents}) ulaştı. Transfer yapılamaz.`);
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          setSwapModalOpen(false);
          setSelectedStudent(null);
          return;
        }

        // Swap işlemi
        const updatedMatches = matching.matches.map(match => {
          if (match.studentId === studentId && match.instructorId === fromInstructorId) {
            return {
              ...match,
              instructorId: toInstructorId,
              isTransferred: true,
              previousInstructorId: fromInstructorId,
              transferReason: 'Manuel değişim'
            };
          }
          return match;
        });

        // API'ye kaydet
        await updateMatching(matching.id, { 
          matches: updatedMatches,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Current User'
        });

        // Backend'den güncel veriyi çek
        const updatedMatchingData = await fetchSavedMatching(matching.id);
        if (updatedMatchingData) {
          setMatching(updatedMatchingData);
        }

        // Başarı mesajı göster
        setSnackbarMessage(`${student.name} ${student.surname} başarıyla ${fromInstructor?.firstName} ${fromInstructor?.lastName}'den ${toInstructor.firstName} ${toInstructor.lastName}'e aktarıldı. (${currentStudentCount + 1}/${maxStudents})`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
      setSwapModalOpen(false);
      setSelectedStudent(null);
      
    } catch (error) {
      console.error('Error swapping student:', error);
      setSnackbarMessage('Öğrenci aktarımı sırasında hata oluştu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSwapModalOpen(false);
      setSelectedStudent(null);
    }
  };

  // Sınav durumu modal handler'ları
  const handleExamStatusClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentForStatus(student);
      setExamStatusModalOpen(true);
    }
  };

  const handleExamStatusModalClose = () => {
    setExamStatusModalOpen(false);
    setSelectedStudentForStatus(null);
  };

  // Öğrenci ekle modal handler'ı
  const handleAddStudentClick = (instructorId: string) => {
    if (isLocked) {
      setSnackbarMessage('Bu eşleştirme kilitli olduğu için değişiklik yapılamaz.');
      setSnackbarOpen(true);
      return;
    }
    setSelectedInstructorForAddStudent(instructorId);
    setAddStudentModalOpen(true);
  };

  // Eşleştirmede bulunmayan öğrencileri hesapla
  const getAvailableStudents = () => {
    if (!matching) return [];
    
    const matchedStudentIds = matching.matches.map(match => match.studentId);
    return students.filter(student => 
      !matchedStudentIds.includes(student.id) && 
      student.status === 'active' &&
      student.licenseType && matching.licenseTypes.includes(student.licenseType) // Çoklu licenseTypes desteği
    );
  };

  // Öğrenci ekleme fonksiyonu
  const handleAddStudent = async (studentId: string, instructorId: string) => {
    try {
      setAddStudentModalOpen(false);
      setSelectedInstructorForAddStudent('');
      
      console.log('Adding student:', { studentId, instructorId });
      
      if (matching) {
        // Eğitmenin mevcut öğrenci sayısını hesapla
        const instructor = instructors.find(i => i.id === instructorId);
        if (!instructor) {
          setSnackbarMessage('Eğitmen bulunamadı.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        // Eğitmenin toplam aktif öğrenci sayısı
        const realActiveStudents = instructor.studentAssignments?.length || 0;
        const matchingStudents = (matching.matches || []).filter(m => m.instructorId === instructorId).length;
        
        // Matching uygulandıysa matching sayısını, uygulanmadıysa gerçek + matching toplamını kullan
        const isApplied = matching.status === 'APPLIED';
        const currentStudentCount = isApplied ? matchingStudents : (realActiveStudents + matchingStudents);
        const maxStudents = instructor.maxStudentsPerPeriod || 10;

        console.log(`[ADD STUDENT CHECK] ${instructor.firstName} ${instructor.lastName}:`, {
          realActiveStudents,
          matchingStudents,
          currentStudentCount,
          maxStudents,
          isApplied,
          matchingStatus: matching.status
        });

        // Max student kontrolü
        if (currentStudentCount >= maxStudents) {
          setSnackbarMessage(`${instructor.firstName} ${instructor.lastName} maksimum öğrenci sayısına (${maxStudents}) ulaştı. Daha fazla öğrenci eklenemez.`);
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          return;
        }

        const newMatch = {
          studentId,
          instructorId,
          matchedAt: new Date().toISOString(),
          isTransferred: false
        };

        const updatedMatches = [...matching.matches, newMatch];

        // API'ye kaydet
        await updateMatching(matching.id, { 
          matches: updatedMatches,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Current User'
        });

        // Backend'den güncel veriyi çek (results fresh olsun)
        const updatedMatchingData = await fetchSavedMatching(matching.id);
        if (updatedMatchingData) {
          setMatching(updatedMatchingData);
        }

        // Başarı mesajı göster
        const student = students.find(s => s.id === studentId);
        
        setSnackbarMessage(`${student?.name} ${student?.surname} başarıyla ${instructor.firstName} ${instructor.lastName}'e atandı. (${currentStudentCount + 1}/${maxStudents})`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (error) {
      console.error('Error adding student:', error);
      setSnackbarMessage('Öğrenci ekleme sırasında hata oluştu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Bildirim gönderme fonksiyonu
  const handleSendNotification = async (instructorId: string) => {
    try {
      // Eğitmenin öğrencilerini bul
      const instructorStudents = matching?.matches
        ?.filter(match => match.instructorId === instructorId)
        ?.map(match => students.find(s => s.id === match.studentId))
        ?.filter((student): student is Student => student != null) || [];

      if (instructorStudents.length === 0) {
        setSnackbarMessage('Bu eğitmenin öğrencisi bulunmamaktadır.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      // İlk öğrenciyi seç ve modal'ı aç (modal üzerinden tüm öğrencilere gönderilecek)
      setSelectedInstructorForNotification(instructorId);
      setSelectedStudentForNotification(instructorStudents[0]);
      setNotificationModalOpen(true);

    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      setSnackbarMessage('Bildirim gönderilirken hata oluştu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !matching) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Eşleştirme bulunamadı'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/matching/saved')}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  // Eğitmen bazında gruplama
  const instructorGroups = new Map<string, any[]>();
  matching.matches.forEach(match => {
    if (!instructorGroups.has(match.instructorId)) {
      instructorGroups.set(match.instructorId, []);
    }
    instructorGroups.get(match.instructorId)!.push(match);
  });

  return (
    <>
      <Box sx={{ p: 3 }}>
        <PageBreadcrumb />

        {/* Başlık Satırı */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 0.5
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main'
            }}
          >
            {matching.name} {formatDate(matching.createdAt)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/matching/saved')}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Listeye Dön
            </Button>
            
            <PDFExportHTML
              matches={prepareMatchingResults()}
              students={students}
              instructors={instructors as any}
              licenseType={matching.licenseTypes.join(', ')}
            />
          </Box>
        </Box>

        {/* Açıklama */}
        {matching.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
            {matching.description}
          </Typography>
        )}

        {/* Chipler ve Action Butonları */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'divider'
        }}>
          <Box display="flex" gap={2} alignItems="center">
            <Chip 
              label={getStatusLabel(matching.status)} 
              size="small" 
              color={getStatusColor(matching.status)} 
            />
            <Chip 
              label={matching.licenseTypes.join(', ') + ' Sınıfları'} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={isLocked ? "Kilitli" : "Açık"} 
              size="small" 
              color={isLocked ? "error" : "success"}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Onayla Butonu - Sadece draft (PENDING) için */}
            {matching.status === 'draft' && (
              <Tooltip title="Eşleştirmeyi onayla, öğrencilere uygula ve eğitmenlere bildirim gönder">
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApplyMatching}
                    sx={{ borderRadius: 2 }}
                  >
                    Onayla ve Bildir
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Sil Butonu */}
            <Tooltip title={
              matching.status === 'archived' 
                ? "Arşivlenmiş eşleştirmeler silinemez" 
                : isLocked
                  ? "Kilitli eşleştirmeler silinemez - önce kilidi açın"
                  : "Eşleştirmeyi sil"
            }>
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={matching.status === 'archived' || isLocked}
                  sx={{ borderRadius: 2 }}
                >
                  Sil
                </Button>
              </span>
            </Tooltip>
            
            {/* Kilitle Butonu */}
            {matching.status !== 'archived' && (
              <Tooltip title={isLocked ? "Kilidi Aç - Düzenlenebilir yap" : "Kilitle - Değişiklik yapılamaz"}>
                <span>
                  <Button
                    variant="outlined"
                    color={isLocked ? "error" : "success"}
                    onClick={handleToggleLock}
                    disabled={matching.status === 'draft'}
                    sx={{ borderRadius: 2 }}
                    startIcon={isLocked ? <LockIcon /> : <LockOpenIcon />}
                  >
                    {isLocked ? "Kilidi Aç" : "Kilitle"}
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Arşivle Butonu */}
            {matching.status === 'active' && isLocked && (
              <Tooltip title="Dönemi tamamla ve arşive taşı">
                <span>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleMakePassive}
                    sx={{ borderRadius: 2 }}
                  >
                    Arşivle
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

      {/* Eşleştirme Detayları Başlığı */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Eşleştirme Detayları
        </Typography>
      </Box>

      {Array.from(instructorGroups.entries()).map(([instructorId, matches]) => {
        const instructor = instructors.find(i => i.id === instructorId);
        
        return (
          <Paper key={instructorId} elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            {/* Eğitmen Başlığı */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Bilinmeyen Eğitmen'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {matches.length} Öğrenci Atandı
                    {instructor?.phone && ` • Tel: ${instructor.phone}`}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title={isLocked ? "Eşleştirme kilitli, öğrenci eklenemez" : "Bu eğitmene yeni öğrenci ekle"}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAddStudentClick(instructorId)}
                      disabled={isLocked}
                      sx={{ 
                        minWidth: 'auto',
                        opacity: isLocked ? 0.5 : 1,
                        borderRadius: 2
                      }}
                    >
                      Öğrenci Ekle
                    </Button>
                  </span>
                </Tooltip>
                
                <Tooltip title="Bu eğitmenin tüm öğrencilerine mobil bildirim gönder">
                  <Button
                    variant="contained"
                    size="small"
                    color="info"
                    startIcon={<NotificationsIcon />}
                    onClick={() => handleSendNotification(instructorId)}
                    sx={{ 
                      minWidth: 'auto',
                      borderRadius: 2
                    }}
                  >
                    Bildirim Gönder
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Öğrenci Tablosu */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Öğrenci</strong></TableCell>
                    <TableCell><strong>Telefon</strong></TableCell>
                    <TableCell><strong>Cinsiyet</strong></TableCell>
                    <TableCell><strong>Yazılı Sınav</strong></TableCell>
                    <TableCell><strong>Direksiyon Sınav</strong></TableCell>
                    <TableCell><strong>Genel Durum</strong></TableCell>
                    <TableCell><strong>Eğitmen Durumu</strong></TableCell>
                    <TableCell align="center"><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match, index) => {
                    const student = students.find(s => s.id === match.studentId);
                    
                    return (
                      <TableRow key={match.studentId} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {student ? `${student.name} ${student.surname}` : 'Bilinmeyen Öğrenci'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {student?.phone || 'Belirtilmemiş'}
                        </TableCell>
                        <TableCell>
                          {student?.gender === 'male' ? 'Erkek' : 'Kadın'}
                        </TableCell>
                        {/* Yazılı Sınav */}
                        <TableCell>
                          {student ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={student.writtenExam.status === 'passed' ? `${student.writtenExam.passedAtAttempt}. Hakta Geçti` :
                                       student.writtenExam.status === 'failed' ? `${student.writtenExam.attempts}. Hakta Kaldı` :
                                       'Henüz Girmedi'}
                                size="small"
                                color={student.writtenExam.status === 'passed' ? 'success' :
                                       student.writtenExam.status === 'failed' ? 'error' : 'default'}
                                variant="filled"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({student.writtenExam.attempts}/{student.writtenExam.maxAttempts})
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        
                        {/* Direksiyon Sınav */}
                        <TableCell>
                          {student ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={student.drivingExam.status === 'passed' ? `${student.drivingExam.passedAtAttempt}. Hakta Geçti` :
                                       student.drivingExam.status === 'failed' ? `${student.drivingExam.attempts}. Hakta Kaldı` :
                                       'Henüz Girmedi'}
                                size="small"
                                color={student.drivingExam.status === 'passed' ? 'success' :
                                       student.drivingExam.status === 'failed' ? 'error' : 'default'}
                                variant="filled"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({student.drivingExam.attempts}/{student.drivingExam.maxAttempts})
                              </Typography>
                              {student.drivingExam.status === 'failed' && student.drivingExam.attempts >= 2 && (
                                <Chip label="Dikkat!" size="small" color="warning" sx={{ fontSize: '0.6rem' }} />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        
                        {/* Genel Durum */}
                        <TableCell>
                          {student ? (
                            <Chip
                              label={student.writtenExam.status === 'passed' && student.drivingExam.status === 'passed' ? 'Tamamlandı' :
                                     student.writtenExam.status === 'passed' && student.drivingExam.status === 'not-taken' ? 'Direksiyon Bekliyor' :
                                     student.writtenExam.status === 'passed' && student.drivingExam.status === 'failed' ? 'Direksiyondan Kaldı' :
                                     student.writtenExam.status === 'failed' ? 'Yazılıdan Kaldı' :
                                     'Sınav Bekliyor'}
                              size="small"
                              color={student.writtenExam.status === 'passed' && student.drivingExam.status === 'passed' ? 'success' :
                                     student.writtenExam.status === 'passed' ? 'info' :
                                     student.writtenExam.status === 'failed' || student.drivingExam.status === 'failed' ? 'error' : 'default'}
                              variant="filled"
                              sx={{ fontSize: '0.7rem', minWidth: 100 }}
                              onClick={!isLocked ? () => handleExamStatusClick(match.studentId) : undefined}
                              disabled={isLocked}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={match.isTransferred ? 'Transfer Edildi' : 'İlk Eğitmen'} 
                            size="small" 
                            color={match.isTransferred ? 'warning' : 'success'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isLocked ? "Eşleştirme kilitli, değişiklik yapılamaz" : "Öğrenciyi başka eğitmene aktar"}>
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SwapHorizIcon />}
                                onClick={() => handleStudentSwapClick(match.studentId, match.instructorId)}
                                disabled={isLocked}
                                sx={{ 
                                  minWidth: 'auto',
                                  opacity: isLocked ? 0.5 : 1
                                }}
                              >
                                Değiştir
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}

      </Box>
      
      {/* Student Swap Modal */}
      {matching && instructors.length > 0 && students.length > 0 && (
        <StudentSwapModal
          open={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false);
            setSelectedStudent(null);
          }}
          onSwap={handleStudentSwap}
          matchingLicenseTypes={matching.licenseTypes}
          matchingResults={matching.matches.map(match => {
            const student = students.find(s => s.id === match.studentId);
            const instructor = instructors.find(i => i.id === match.instructorId);
            
            // Gender normalization helper
            const normalizeGender = (g?: string): 'male' | 'female' => {
              if (!g) return 'male';
              const lower = g.toLowerCase();
              return lower === 'female' || lower === 'f' ? 'female' : 'male';
            };
            
            // studentStatus'u MatchingResult tipine uygun hale getir
            const convertStatus = (status?: string) => {
              if (!status) return 'active' as const;
              if (['active', 'inactive', 'completed', 'failed'].includes(status)) {
                return status as 'active' | 'inactive' | 'completed' | 'failed';
              }
              // Diğer statusları en yakın duruma çevir
              if (status.includes('passed') || status === 'both-passed') return 'completed' as const;
              return 'active' as const;
            };
            
            return {
              studentId: match.studentId,
              instructorId: match.instructorId,
              studentName: student ? `${student.name} ${student.surname}` : 'Öğrenci Bulunamadı',
              instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Eğitmen Bulunamadı',
              studentGender: student?.gender || 'male' as 'male' | 'female',
              instructorGender: normalizeGender(instructor?.gender || 'male'),
              studentStatus: convertStatus(student?.status),
              licenseType: student?.licenseType || matching.licenseTypes?.[0] || matching.licenseType,
              matchDate: match.matchedAt || matching.createdDate,
            };
          })}
          students={students}
          instructors={instructors as any}
          selectedStudentId={selectedStudent?.studentId}
          selectedInstructorId={selectedStudent?.currentInstructorId}
        />
      )}

      {/* New Exam Status Modal */}
      <NewExamStatusModal 
        open={examStatusModalOpen}
        onClose={handleExamStatusModalClose}
        student={selectedStudentForStatus}
        onUpdateExamStatus={(studentId, examType, action) => {
          // Local state'i güncelle
          const student = students.find(s => s.id === studentId);
          if (student) {
            const updatedStudent = updateExamStatus(student, examType, action);
            
            setStudents(prevStudents => 
              prevStudents.map(s => 
                s.id === studentId ? updatedStudent : s
              )
            );
            
            const actionText = action === 'pass' ? 'geçti' : action === 'fail' ? 'kaldı' : 'sıfırlandı';
            const examText = examType === 'written' ? 'yazılı sınav' : 'direksiyon sınav';
            setSnackbarMessage(`${student.name} ${student.surname}'in ${examText}ı ${actionText} olarak işaretlendi.`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          }
        }}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        open={addStudentModalOpen}
        onClose={() => {
          setAddStudentModalOpen(false);
          setSelectedInstructorForAddStudent('');
        }}
        onAddStudent={handleAddStudent}
        availableStudents={getAvailableStudents()}
        instructorId={selectedInstructorForAddStudent}
        instructorName={
          instructors.find(i => i.id === selectedInstructorForAddStudent)
            ? `${instructors.find(i => i.id === selectedInstructorForAddStudent)?.firstName} ${instructors.find(i => i.id === selectedInstructorForAddStudent)?.lastName}`
            : ''
        }
      />
      
      {/* Notification Modal */}
      <NotificationModal
        open={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          setSelectedInstructorForNotification('');
          setSelectedStudentForNotification(null);
        }}
        student={selectedStudentForNotification}
        customTitle={
          selectedInstructorForNotification
            ? (() => {
                const instructor = instructors.find(i => i.id === selectedInstructorForNotification);
                const studentCount = matching?.matches?.filter(match => match.instructorId === selectedInstructorForNotification).length || 0;
                return `${instructor?.firstName} ${instructor?.lastName}'nın Tüm Kursiyerlerine Bildirim Gönder (${studentCount} Kursiyer)`;
              })()
            : undefined
        }
        onSuccess={async (notificationData) => {
          // İlk öğrenciye modal üzerinden gönderildi
          // Şimdi aynı bildirimi diğer öğrencilere de gönderelim
          if (!selectedInstructorForNotification || !matching || !notificationData) return;
          
          const instructorStudents = matching.matches
            ?.filter(match => match.instructorId === selectedInstructorForNotification)
            ?.map(match => students.find(s => s.id === match.studentId))
            ?.filter((student): student is Student => student != null) || [];
          
          // İlk öğrenci dışındakilere gönder
          const remainingStudents = instructorStudents.slice(1);
          
          if (remainingStudents.length > 0) {
            // Sırayla her öğrenciye gönder
            for (const student of remainingStudents) {
              try {
                await sendNotification(student.id, {
                  title: notificationData.title,
                  message: notificationData.message.replace('{name}', `${student.name} ${student.surname}`),
                  type: notificationData.type,
                  studentName: `${student.name} ${student.surname}`
                });
              } catch (error) {
                console.error(`Bildirim gönderme hatası (${student.name} ${student.surname}):`, error);
              }
            }
          }
          
          const instructor = instructors.find(i => i.id === selectedInstructorForNotification);
          
          setSnackbarMessage(
            `${instructor?.firstName} ${instructor?.lastName} eğitmeninin ${instructorStudents.length} öğrencisine bildirim gönderildi.`
          );
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }}
      />

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={archiveDialogOpen}
        onClose={handleArchiveCancel}
        aria-labelledby="archive-dialog-title"
        aria-describedby="archive-dialog-description"
      >
        <DialogTitle id="archive-dialog-title">
          Eşleştirmeyi Arşivle
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="archive-dialog-description">
            Bu eşleştirmeyi arşivlemek istediğinizden emin misiniz?
            Arşivlenen eşleştirmeler "Arşiv" sekmesinden görüntülenebilir.
          </DialogContentText>
          {matching && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Eşleştirme:</strong> {matching.name}</Typography>
              <Typography variant="body2"><strong>Öğrenci Sayısı:</strong> {matching.matches.length}</Typography>
              <Typography variant="body2"><strong>Oluşturulma:</strong> {new Date(matching.createdDate).toLocaleDateString('tr-TR')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleArchiveCancel} disabled={archiving}>
            İptal
          </Button>
          <Button 
            onClick={handleArchiveConfirm} 
            color="warning" 
            variant="contained"
            disabled={archiving}
            startIcon={archiving ? <CircularProgress size={20} /> : undefined}
          >
            {archiving ? 'Arşivleniyor...' : 'Arşivle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Eşleştirmeyi Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bu eşleştirmeyi kalıcı olarak silmek istediğinizden emin misiniz? 
            Bu işlem geri alınamaz.
          </DialogContentText>
          {matching && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Eşleştirme:</strong> {matching.name}</Typography>
              <Typography variant="body2"><strong>Öğrenci Sayısı:</strong> {matching.matches.length}</Typography>
              <Typography variant="body2"><strong>Oluşturulma:</strong> {new Date(matching.createdDate).toLocaleDateString('tr-TR')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SavedMatchingDetail;