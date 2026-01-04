import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Stepper, Step, StepLabel, CircularProgress,
  Alert, Divider, Chip, Avatar, Snackbar
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../students/api/useStudents';
import { useInstructors } from '../instructors/api/useInstructors';
import { useLicenseClassOptions } from '../../hooks/useLicenseClassOptions';
import type { Student } from '../students/types/types';
import type { MatchingRequest, MatchingResult, MatchingStats, MatchingError } from './types/types';
import { saveMatchingResults, performMatching, getEligibleStudents } from './api/matchingService';
import MatchingResults from './components/MatchingResults';
import SelectionTabs from './components/SelectionTabs';
import MatchingStatsComponent from './components/MatchingStatsComponent';
import StudentSwapModal from './components/StudentSwapModal';
import SaveMatchingModal from './components/SaveMatchingModal';
import { applyMatchingToStudents } from './api/studentMatchingSync';

const steps = [
  'Parametreleri Seç',
  'Eşleştirme Sonuçları',
  'Kaydet ve Tamamla'
];

const StudentInstructorMatching: React.FC = () => {
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [activeStep, setActiveStep] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const { instructors, loading: instructorsLoading } = useInstructors();
  const { options: licenseClasses, loading: licenseClassesLoading } = useLicenseClassOptions();
  
  // Seçim ve filtreleme state'leri
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<Set<string>>(new Set());
  const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false); // Kullanıcı kendisi seçecek
  const [isAllInstructorsSelected, setIsAllInstructorsSelected] = useState(false); // Kullanıcı kendisi seçecek
  
  // Eşleştirme parametreleri
  const [matchingRequest, setMatchingRequest] = useState<MatchingRequest>({
    licenseTypes: ['B'], // Default B sınıfı, çoklu seçilebilir
    considerGender: true,
    prioritizeFirstDrivingAttempt: true // Default TRUE
  });
  
  // Sonuç verileri
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [errors, setErrors] = useState<MatchingError[]>([]);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Swap modal
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  
  // Save matching modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // Öğrencileri yükle (PENDING/APPLIED matching'lerde olmayanlar)
  useEffect(() => {
    console.log('🔄 [useEffect-STUDENTS] TETİKLENDİ - licenseTypes:', matchingRequest.licenseTypes);
    
    const loadStudents = async () => {
      try {
        console.log('📡 [useEffect-STUDENTS] API çağrısı başlıyor...');
        // ℹ️ prioritizeFirst: false - Tüm öğrencileri getir, filtreleme algoritmada yapılacak
        const data = await getEligibleStudents(
          matchingRequest.licenseTypes,
          false, // Backend'de filtreleme yok, sadece eşleştirme algoritmasında kullanılacak
          []
        );
        console.log('✅ [useEffect-STUDENTS] Uygun öğrenciler yüklendi:', data.length, 'öğrenci');
        
        // 🔥 BATCH: Tüm state değişikliklerini birlikte yap
        console.log('🔧 [BATCH] Stateler güncelleniyor...');
        setStudents(data);
        setStudentsLoading(false);
        console.log('✅ [BATCH] Tamamlandı!');
      } catch (error) {
        console.error('❌ [useEffect-STUDENTS] Hata:', error);
        setStudentsLoading(false);
      }
    };

    // Debounce: 500ms bekle
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 500);

    return () => {
      console.log('🧹 [useEffect-STUDENTS] Cleanup');
      clearTimeout(timeoutId);
    };
  }, [matchingRequest.licenseTypes]);
  
  // Eğitmenler yüklendiğinde tümünü otomatik seç
  useEffect(() => {
    console.log('🔄 [useEffect-INSTRUCTORS] TETİKLENDİ - licenseTypes:', matchingRequest.licenseTypes, 'count:', instructors.length);
    
    if (instructors.length > 0 && !instructorsLoading) {
      const eligibleInstructors = instructors
        .filter(instructor => 
          instructor.status?.toLowerCase() === 'active' &&
          instructor.licenseTypes?.some(lt => matchingRequest.licenseTypes.includes(lt))
        )
        .map(i => i.id);
      
      console.log('👥 [useEffect-INSTRUCTORS] Uygun eğitmenler:', eligibleInstructors.length);
      
      if (eligibleInstructors.length > 0) {
        // 🔥 BATCH: 2 state birlikte (React otomatik batch yapar)
        setSelectedInstructorIds(new Set(eligibleInstructors));
        setIsAllInstructorsSelected(true);
        console.log('✅ [BATCH-INSTRUCTORS] 2 state birlikte değişti!');
      }
    }
  }, [instructors, instructorsLoading, matchingRequest.licenseTypes]);
  
  // ❌ KALDIRILDI - Student reset artık loadStudents içinde yapılıyor (batch ile)
  
  // Seçim kontrol fonksiyonları
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      setIsAllStudentsSelected(false);
      return newSet;
    });
  };
  

  
    // Tümünü seç/kaldır fonksiyonları
  const handleSelectAllStudents = () => {
    // Sadece uygun öğrencileri seç (yazılı geçmiş, seçili ehliyet sınıfları)
    const allIds = students
      .filter(student => {
        // Backend'den flat field veya nested object gelebilir
        const writtenStatus = (student.writtenExamStatus || student.writtenExam?.status)?.toLowerCase();
        const drivingStatus = (student.drivingExamStatus || student.drivingExam?.status)?.toLowerCase();
        const studentStatus = student.status?.toLowerCase();
        
        const basicConditions = 
          matchingRequest.licenseTypes.includes(student.licenseType) &&
          writtenStatus === 'passed' &&
          drivingStatus !== 'passed' &&
          studentStatus === 'active';
        
        // Aktif eğitmen ataması kontrolü
        const hasActiveInstructor = student.instructorAssignments && 
                                     student.instructorAssignments.length > 0 && 
                                     student.instructorAssignments.some(a => a.isActive);
        
        // "İlk Defa Girenler" parametresi aktifse
        if (matchingRequest.prioritizeFirstDrivingAttempt) {
          const attempts = student.drivingExamAttempts ?? student.drivingExam?.attempts ?? 0;
          return basicConditions && !hasActiveInstructor && attempts === 0;
        }
        
        return basicConditions && !hasActiveInstructor;
      })
      .map(s => s.id);
    
    console.log('✅ Tümünü seç:', allIds.length, 'öğrenci seçildi');
    setSelectedStudentIds(new Set(allIds));
    setIsAllStudentsSelected(true);
  };
  
  const handleDeselectAllStudents = () => {
    setSelectedStudentIds(new Set());
    setIsAllStudentsSelected(false);
  };
  
  const handleSelectAllInstructors = () => {
    // Sadece uygun eğitmenleri seç (aktif, seçili ehliyet sınıfları - çoklu)
    const allIds = instructors
      .filter(instructor => 
        instructor.status?.toLowerCase() === 'active' &&
        instructor.licenseTypes?.some(lt => matchingRequest.licenseTypes.includes(lt))
      )
      .map(i => i.id);
    
    console.log('✅ Tümünü seç (eğitmenler):', allIds.length, 'eğitmen seçildi');
    setSelectedInstructorIds(new Set(allIds));
    setIsAllInstructorsSelected(true);
  };
  
  const handleDeselectAllInstructors = () => {
    setSelectedInstructorIds(new Set());
    setIsAllInstructorsSelected(false);
  };

  const handleInstructorToggle = (instructorId: string) => {
    const newSet = new Set(selectedInstructorIds);
    if (newSet.has(instructorId)) {
      newSet.delete(instructorId);
    } else {
      newSet.add(instructorId);
    }
    setSelectedInstructorIds(newSet);
    setIsAllInstructorsSelected(false);
  };
  
  // Eşleştirmeyi başlat
  const handleStartMatching = async () => {
    // Seçim kontrolü
    if (selectedStudentIds.size === 0) {
      setSnackbarMessage('Hiçbir öğrenci seçmediniz! Lütfen en az bir öğrenci seçin.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (selectedInstructorIds.size === 0) {
      setSnackbarMessage('Hiçbir eğitmen seçmediniz! Lütfen en az bir eğitmen seçin.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setProcessing(true);
    
    try {
      const result = await performMatching(
        students, 
        instructors, 
        matchingRequest,
        selectedStudentIds,
        selectedInstructorIds
      );
      
      // Backend'den gelen hatayı kontrol et
      if (result.errors && result.errors.length > 0 && result.matches.length === 0) {
        const firstError = result.errors[0];
        if (firstError.reason === 'NO_ELIGIBLE_STUDENTS') {
          setSnackbarMessage(firstError.details || 'Yazılı sınavı geçmiş öğrenci bulunamadı');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          setProcessing(false);
          return;
        }
        if (firstError.reason === 'NO_SUITABLE_INSTRUCTOR') {
          setSnackbarMessage(firstError.details || 'Uygun eğitmen bulunamadı');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setProcessing(false);
          return;
        }
      }
      
      setMatches(result.matches);
      setErrors(result.errors);
      setStats(result.stats);
      setActiveStep(1);
      
      if (result.matches.length > 0) {
        setSnackbarMessage(`${result.matches.length} öğrenci başarıyla eşleştirildi!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error('Matching error:', error);
      setSnackbarMessage(error.message || 'Eşleştirme sırasında bir hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setProcessing(false);
    }
  };
  
  // Eşleştirmeyi kaydet
  const handleSaveMatching = async () => {
    if (matches.length === 0) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Backend API'sine kaydet
      const result = await saveMatchingResults(
        matchingRequest.licenseTypes,
        matchingRequest.considerGender ?? true,
        matchingRequest.prioritizeFirstDrivingAttempt ?? false,
        Array.from(selectedStudentIds),
        Array.from(selectedInstructorIds),
        {
          matches,
          stats: stats!
        }
      );
      
      if (result) {
        // Başarılı mesajı göster
        setSnackbarMessage('Eşleştirme başarıyla kaydedildi!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setIsSaved(true);
        setActiveStep(2);
        
        // matchingId'yi sakla (uygulama için)
        (window as any).__lastMatchingId = result;
      }
    } catch (error) {
      console.error('Save error:', error);
      setSnackbarMessage('Eşleştirme kaydedilemedi!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  // Eşleştirmeyi öğrencilere uygula
  const handleApplyMatching = async () => {
    const matchingId = (window as any).__lastMatchingId;
    if (!matchingId) {
      setSnackbarMessage('Önce eşleştirmeyi kaydetmelisiniz!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setProcessing(true);
    
    try {
      await applyMatchingToStudents(matchingId);
      
      setSnackbarMessage('Eşleştirme öğrencilere başarıyla uygulandı!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Öğrenci listesini yenile
      const freshStudents = await getStudents();
      setStudents(freshStudents || []);
      
    } catch (error) {
      console.error('Apply error:', error);
      setSnackbarMessage('Eşleştirme uygulanamadı!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setProcessing(false);
    }
  };
  
  // Yeni eşleştirme başlat
  const handleNewMatching = () => {
    setActiveStep(0);
    setMatches([]);
    setErrors([]);
    setStats(null);
    setIsSaved(false);
  };

  // Öğrenci değiş tokuş
  const handleStudentSwap = (sourceInstructorId: string, targetInstructorId: string, studentId: string) => {
    setMatches(prevMatches => {
      return prevMatches.map(match => {
        if (match.studentId === studentId && match.instructorId === sourceInstructorId) {
          // Hedef eğitmenin bilgilerini al
          const targetInstructor = instructors.find(i => i.id === targetInstructorId);
          if (targetInstructor) {
            return {
              ...match,
              instructorId: targetInstructorId,
              instructorName: `${targetInstructor.firstName} ${targetInstructor.lastName}`,
              instructorGender: targetInstructor.gender as 'male' | 'female',
            };
          }
        }
        return match;
      });
    });
  };

  const isLoading = studentsLoading || instructorsLoading || licenseClassesLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Standardized Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderBottomColor: 'divider'
      }}>
        <Box sx={{ flex: 1 }}>
          <PageBreadcrumb />
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mt: 1,
              mb: 1
            }}
          >
            Öğrenci-Eğitmen Eşleştirme ({matchingRequest.licenseTypes.some(t => ['A', 'A1', 'A2'].includes(t)) ? 'Motor' : 'Otomobil'} - {matchingRequest.licenseTypes.join(', ')} Sınıfı)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Öğrencileri eğitmenlerle otomatik veya manuel olarak eşleştirin
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 3 }}>
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
            Kayıtlı Eşleştirmeler
          </Button>
        </Box>
      </Box>


      {/* Stepper */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Adım 0: Parametreler */}
      {activeStep === 0 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Eşleştirme Parametreleri
          </Typography>
          
          <Box mt={3} mb={4}>
            <Box display="flex" gap={3} flexWrap="wrap" mb={3}>
              {/* Ehliyet Türü - Multi-Select */}
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel>Ehliyet Türleri (Çoklu Seçim)</InputLabel>
                <Select
                  multiple
                  value={matchingRequest.licenseTypes}
                  label="Ehliyet Türleri (Çoklu Seçim)"
                  onChange={(e) => {
                    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                    setMatchingRequest(prev => ({
                      ...prev,
                      licenseTypes: value
                    }));
                  }}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={{
                    autoFocus: false,
                    disableAutoFocusItem: true,
                    variant: 'menu',
                    PaperProps: {
                      style: {
                        maxHeight: 400
                      }
                    }
                  }}
                >
                  {licenseClasses.map((licenseClass) => (
                    <MenuItem key={licenseClass.id} value={licenseClass.value}>
                      <Checkbox checked={matchingRequest.licenseTypes.indexOf(licenseClass.value) > -1} />
                      {licenseClass.label}
                    </MenuItem>
                  ))}
                  {licenseClasses.length === 0 && (
                    <MenuItem value="B">
                      <Checkbox checked={matchingRequest.licenseTypes.indexOf('B') > -1} />
                      B - Otomobil/Kamyonet
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              
              {/* Cinsiyet Eşleştirmesi */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={matchingRequest.considerGender}
                    onChange={(e) => setMatchingRequest(prev => ({
                      ...prev,
                      considerGender: e.target.checked
                    }))}
                  />
                }
                label="Öğrenci Cinsiyetlerini Eşit Dağıt"
                sx={{ ml: 1 }}
              />
              
              {/* İlk Direksiyon Hakkı Önceliği */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={matchingRequest.prioritizeFirstDrivingAttempt || false}
                    onChange={(e) => setMatchingRequest(prev => ({
                      ...prev,
                      prioritizeFirstDrivingAttempt: e.target.checked
                    }))}
                  />
                }
                label="Sadece İlk Direksiyon Hakkı Olanları Seç"
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* İstatistikler */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Seçim Yapın
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mt={2}>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${selectedStudentIds.size} Öğrenci Seçildi`}
                    color={selectedStudentIds.size > 0 ? "primary" : "default"}
                    variant="filled"
                  />
                  <Chip
                    icon={<PersonAddIcon />}
                    label={`${selectedInstructorIds.size} Eğitmen Seçildi`}
                    color={selectedInstructorIds.size > 0 ? "success" : "default"}
                    variant="filled"
                  />
                  <Chip
                    icon={<AnalyticsIcon />}
                    label={`${matchingRequest.licenseTypes.join(', ')} Sınıfları Ehliyet`}
                    color="info"
                    variant="outlined"
                  />
                </Box>
                
                {/* Eşleştirmeyi Başlat Butonu */}
                {/* <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleStartMatching}
                  disabled={
                    isLoading || 
                    processing ||
                    selectedStudentIds.size === 0 ||
                    selectedInstructorIds.size === 0
                  }
                  sx={{ 
                    minWidth: 180,
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Eşleştirmeyi Başlat
                </Button> */}
              </Box>
              
              {/* Seçim uyarıları */}
              {selectedStudentIds.size === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Lütfen eşleştirmek istediğiniz öğrencileri seçin.
                </Alert>
              )}
              
              {selectedInstructorIds.size === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Lütfen öğrenci atamak istediğiniz eğitmenleri seçin.
                </Alert>
              )}
              
              {/* Öğrenci ve Eğitmen Seçimi */}
              <Box mt={3}>
                <SelectionTabs
                  students={students}
                  instructors={instructors}
                  selectedStudentIds={selectedStudentIds}
                  selectedInstructorIds={selectedInstructorIds}
                  onStudentToggle={handleStudentToggle}
                  onInstructorToggle={handleInstructorToggle}
                  onSelectAllStudents={handleSelectAllStudents}
                  onDeselectAllStudents={handleDeselectAllStudents}
                  onSelectAllInstructors={handleSelectAllInstructors}
                  onDeselectAllInstructors={handleDeselectAllInstructors}
                  licenseTypes={matchingRequest.licenseTypes}
                  prioritizeFirstDrivingAttempt={matchingRequest.prioritizeFirstDrivingAttempt || false}
                />
                </Box>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartMatching}
              disabled={
                processing || 
                selectedStudentIds.size === 0 ||
                selectedInstructorIds.size === 0
              }
              startIcon={processing ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              {processing ? 'Eşleştiriliyor...' : 'Eşleştirmeyi Başlat'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Adım 1: Sonuçlar */}
      {activeStep === 1 && stats && (
        <Box>
          {/* İstatistikler */}
          <MatchingStatsComponent 
            stats={stats} 
            matchingResults={matches}
            students={students}
            instructors={instructors}
          />
          
          {/* Sonuçlar */}
          <MatchingResults 
            matches={matches} 
            errors={errors}
            onSave={handleSaveMatching}
            onReset={()=> {}}
            saving={saving}
            onOpenSwapModal={() => setSwapModalOpen(true)}
            showActions={false}
          />
          
          {/* Adım 2 Navigation */}
          <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={processing}
              >
                Geri
              </Button>
              
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                disabled={matches.length === 0}
                size="large"
                sx={{ px: 4 }}
              >
                İleri
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Adım 2: Tamamlandı */}
      {activeStep === 2 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Avatar sx={{ bgcolor: isSaved ? 'success.main' : 'primary.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
            <SaveIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h4" fontWeight={600} color={isSaved ? 'success.main' : 'primary.main'} gutterBottom>
            {isSaved ? 'Eşleştirme Kaydedildi!' : 'Eşleştirme Hazır!'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" mb={3}>
            {matches.length} öğrenci başarıyla eğitmenlerle eşleştirildi. 
            {!isSaved && 'Eşleştirmeyi kaydetmek için aşağıdaki butonları kullanabilirsiniz.'}
            {isSaved && 'Eşleştirme başarıyla kaydedildi.'}
          </Typography>
          
          {!isSaved && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={() => setSaveModalOpen(true)}
                sx={{ px: 4, py: 1.5 }}
              >
                Eşleştirmeyi Kaydet
              </Button>
              
              {/* <Button
                variant="outlined"
                size="large"
                onClick={handleNewMatching}
                sx={{ px: 4, py: 1.5 }}
              >
                Yeni Eşleştirme Başlat
              </Button> */}
            </Box>
          )}
          
          {isSaved && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/matching/saved')}
                sx={{ px: 4, py: 1.5 }}
              >
                Eşleştirmeleri Görüntüle
              </Button>
              
              {/* <Button
                variant="outlined"
                size="large"
                onClick={handleNewMatching}
                sx={{ px: 4, py: 1.5 }}
              >
                Yeni Eşleştirme Başlat
              </Button> */}
            </Box>
          )}
        </Paper>
      )}
      
      {/* Öğrenci Değiş Tokuş Modal */}
      <StudentSwapModal
        open={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        matchingResults={matches}
        students={students}
        instructors={instructors}
        onSwap={handleStudentSwap}
      />

      {/* Eşleştirme Kaydetme Modal */}
      <SaveMatchingModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSaved={() => {
          setSaveModalOpen(false);
          setIsSaved(true);
          // Alert kaldırıldı, state ile gösterim yapılıyor
        }}
        matches={matches}
        licenseTypes={matchingRequest.licenseTypes}
      />

      {/* Validasyon ve Bildirim Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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
    </Box>
  );
};

export default StudentInstructorMatching;