import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Tabs,
  Tab,
  Stack,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDrivingLessons } from '../api/useDrivingLessons';
import type { DrivingLesson, EligibleStudent } from '../types/drivingLesson';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { useAuth } from '../contexts/AuthContext';
import CreatePlanModal from '../components/driving-lessons/CreatePlanModal';
import EditTimeModal from '../components/driving-lessons/EditTimeModal';
import CalendarView from '../components/driving-lessons/CalendarView';
import MonthCalendarView from '../components/driving-lessons/MonthCalendarView';

const DrivingLessonsPage: React.FC = () => {
  const {
    loading,
    error: apiError,
    getEligibleStudents,
    getDrivingLessons,
    createTomorrowSchedule,
    updateLessonTime,
    markAsInstructorDone,
    cancelLesson
  } = useDrivingLessons();

  const { user } = useAuth();

  const [lessons, setLessons] = useState<DrivingLesson[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'weekly'>('list');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Modal states
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<DrivingLesson | null>(null);
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [listInstructorFilter, setListInstructorFilter] = useState<string>('all');
  const [calendarInstructorFilter, setCalendarInstructorFilter] = useState<string>('');

  const canManageLessons = user && ['INSTRUCTOR', 'COMPANY_ADMIN', 'COMPANY_USER'].includes(user.role);
  const isCompanyRole = user && ['COMPANY_ADMIN', 'COMPANY_USER'].includes(user.role);

  // Eğitmenleri çıkar (takvim görünümü için)
  const instructors = Array.from(
    new Map(
      lessons.map(l => [l.instructor.id, l.instructor])
    ).values()
  );

  // Eğitmen ise kendi instructor ID'sini bul
  const currentInstructorId = user?.role === 'INSTRUCTOR' 
    ? instructors.find(i => i.firstName === user.firstName && i.lastName === user.lastName)?.id 
    : undefined;

  // Takvim görünümü için eğitmen seçimini otomatik yap
  React.useEffect(() => {
    if (instructors.length > 0 && !calendarInstructorFilter) {
      if (currentInstructorId) {
        setCalendarInstructorFilter(currentInstructorId);
      } else {
        setCalendarInstructorFilter(instructors[0].id);
      }
    }
  }, [instructors.length, currentInstructorId, calendarInstructorFilter]);

  // Dersler listesini yükle
  const loadLessons = async () => {
    try {
      // Tarihi lokal saat diliminde YYYY-MM-DD formatına çevir
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const data = await getDrivingLessons({ date: dateString });
      setLessons(data);
    } catch (err) {
      showSnackbar('Dersler yüklenemedi', 'error');
    }
  };

  useEffect(() => {
    loadLessons();
  }, [selectedDate]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenCreatePlan = async () => {
    setCreatePlanOpen(true);
    setLoadingStudents(true);
    try {
      const students = await getEligibleStudents();
      setEligibleStudents(students);
    } catch (err) {
      showSnackbar('Öğrenciler yüklenemedi', 'error');
      setEligibleStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreatePlan = async (date: string, studentIds: string[]) => {
    const results = await createTomorrowSchedule({ studentIds, date });
    const successCount = results.filter(r => r.success).length;
    showSnackbar(`${successCount} ders oluşturuldu`, 'success');
    setSelectedDate(new Date(date));
    loadLessons();
  };

  const handleOpenEditTime = (lesson: DrivingLesson) => {
    setSelectedLesson(lesson);
    setEditTimeOpen(true);
  };

  const handleUpdateTime = async (lessonId: string, time: string) => {
    await updateLessonTime(lessonId, { scheduledTime: time });
    showSnackbar('Saat güncellendi', 'success');
    loadLessons();
  };

  const handleMarkDone = async (lessonId: string) => {
    try {
      await markAsInstructorDone(lessonId);
      showSnackbar('Ders tamamlandı olarak işaretlendi', 'success');
      loadLessons();
    } catch (err) {
      showSnackbar('İşlem başarısız', 'error');
    }
  };

  const handleCancel = async (lessonId: string) => {
    try {
      await cancelLesson(lessonId);
      showSnackbar('Ders iptal edildi', 'success');
      loadLessons();
    } catch (err) {
      showSnackbar('İptal edilemedi', 'error');
    }
  };

  const getStatusChip = (status: DrivingLesson['status']) => {
    const statusMap = {
      PLANNED: { label: 'Planlanacak', color: 'default' as const },
      SCHEDULED: { label: 'Planlandı', color: 'info' as const },
      INSTRUCTOR_DONE: { label: 'Eğitmen Tamamladı', color: 'warning' as const },
      COMPLETED: { label: 'Tamamlandı', color: 'success' as const },
      CANCELLED: { label: 'İptal', color: 'error' as const },
      NO_SHOW: { label: 'Gelmedi', color: 'default' as const }
    };
    
    const { label, color } = statusMap[status];
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Box sx={{ 
      width: '100%',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Başlık ve Üst Kısım */}
      <Box mb={3}>
        <Box sx={{ mb: 2 }}>
          <PageBreadcrumb />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: 3,
          mb: 3
        }}>
          {/* Sol: Başlık */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EventIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'primary.main'
                }}
              >
                Direksiyon Eğitimleri
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Günlük ders planlaması ve takibi
              </Typography>
            </Box>
          </Box>

          {/* Sağ: Plan Oluştur Butonu (Sadece Instructor) */}
          {user?.role === 'INSTRUCTOR' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreatePlan}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              Plan Oluştur
            </Button>
          )}
        </Box>

        {/* Görünüm Tabs */}
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<ViewListIcon />}
            iconPosition="start"
            label="Liste Görünümü"
            value="list"
          />
          <Tab
            icon={<CalendarIcon />}
            iconPosition="start"
            label="Takvim Görünümü"
            value="calendar"
          />
          <Tab
            icon={<CalendarIcon />}
            iconPosition="start"
            label="Haftalık Takvim"
            value="weekly"
          />
        </Tabs>

        {/* Filtre Alanı */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Tarih"
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setSelectedDate(newValue);
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 200 }
                  }
                }}
              />
            </LocalizationProvider>
            
            <Tooltip title="Yenile">
              <IconButton 
                color="primary" 
                onClick={loadLessons}
                sx={{ 
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Eğitmen Filtresi - Liste görünümü için */}
            {isCompanyRole && instructors.length > 0 && viewMode === 'list' && (
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel size="small">Eğitmen Filtrele</InputLabel>
                <Select
                  value={listInstructorFilter}
                  onChange={(e) => setListInstructorFilter(e.target.value)}
                  label="Eğitmen Filtrele"
                  size="small"
                >
                  <MenuItem value="all">Tüm Eğitmenler</MenuItem>
                  {instructors.map(inst => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.firstName} {inst.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Eğitmen Seçici - Takvim görünümü için (Company kullanıcıları) */}
            {viewMode === 'calendar' && user?.role !== 'INSTRUCTOR' && instructors.length > 0 && (
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel size="small">Eğitmen Seçin</InputLabel>
                <Select
                  value={calendarInstructorFilter}
                  onChange={(e) => setCalendarInstructorFilter(e.target.value)}
                  label="Eğitmen Seçin"
                  size="small"
                >
                  {instructors.map(inst => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.firstName} {inst.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      {!loading && lessons.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Bu tarih için ders bulunamadı
          </Typography>
        </Paper>
      )}

      {/* Takvim Görünümü */}
      {!loading && lessons.length > 0 && viewMode === 'calendar' && calendarInstructorFilter && (
        <CalendarView
          lessons={lessons}
          selectedDate={selectedDate.toISOString().split('T')[0]}
          onEditTime={handleOpenEditTime}
          onMarkDone={handleMarkDone}
          onCancel={handleCancel}
          canManage={!!canManageLessons}
          selectedInstructorId={calendarInstructorFilter}
        />
      )}

      {/* Haftalık Takvim Görünümü */}
      {!loading && viewMode === 'weekly' && (
        <MonthCalendarView
          lessons={lessons}
          onSelectDate={(date: Date) => {
            setSelectedDate(date);
          }}
          onSelectLesson={(lesson: DrivingLesson) => {
            setSelectedLesson(lesson);
            setEditTimeOpen(true);
          }}
        />
      )}

      {/* Liste Görünümü */}
      {!loading && lessons.length > 0 && viewMode === 'list' && (
        <List>
          {lessons
            .filter(lesson => listInstructorFilter === 'all' || lesson.instructorId === listInstructorFilter)
            .map((lesson) => (
            <Paper key={lesson.id} sx={{ mb: 2, p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <Typography variant="h6">
                    {lesson.student.firstName} {lesson.student.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ders {lesson.lessonNumber} / {lesson.student.totalLessonsEntitled}
                    {' • '}
                    {lesson.student.lessonsRemaining} ders kaldı
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Eğitmen: {lesson.instructor.firstName} {lesson.instructor.lastName}
                  </Typography>
                </Box>

                {canManageLessons && (lesson.status === 'PLANNED' || lesson.status === 'SCHEDULED') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => handleOpenEditTime(lesson)}
                  >
                    {lesson.scheduledTime || 'Saat Gir'}
                  </Button>
                )}

                {!canManageLessons && lesson.status === 'SCHEDULED' && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon fontSize="small" color="primary" />
                    <Typography variant="body1" fontWeight={600}>
                      {lesson.scheduledTime}
                    </Typography>
                  </Box>
                )}

                {getStatusChip(lesson.status)}

                {canManageLessons && lesson.status === 'SCHEDULED' && (
                  <>
                    <IconButton
                      color="success"
                      onClick={() => handleMarkDone(lesson.id)}
                      title="Verdim"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleCancel(lesson.id)}
                      title="İptal"
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Paper>
          ))}
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modals */}
      <CreatePlanModal
        open={createPlanOpen}
        onClose={() => setCreatePlanOpen(false)}
        onConfirm={handleCreatePlan}
        eligibleStudents={eligibleStudents}
        loading={loadingStudents}
      />

      <EditTimeModal
        open={editTimeOpen}
        lesson={selectedLesson}
        onClose={() => setEditTimeOpen(false)}
        onConfirm={handleUpdateTime}
      />
    </Box>
  );
};

export default DrivingLessonsPage;