// Bu dosya tab yapısı uygulanmış yeni versiyondur
// Tamamlandığında InstructorDetail.tsx'in yerine geçecek
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
  Box, Typography, Button, Paper, Divider, Grid,
  Chip, Snackbar, Alert, Avatar, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Work as WorkIcon,
  Notes as NotesIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useInstructor, useInstructorMonthlyTrend } from './api/useInstructors';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog';
import EditPersonalInfoModal from './components/EditPersonalInfoModal';
import EditEducationInfoModal from './components/EditEducationInfoModal';
import EditAddressInfoModal from './components/EditAddressInfoModal';
import AssignedVehicles from './components/AssignedVehicles';
import InstructorPersonalInfoCard from './components/detail/InstructorPersonalInfoCard';
import InstructorAddressInfoCard from './components/detail/InstructorAddressInfoCard';
import InstructorEducationInfoCard from './components/detail/InstructorEducationInfoCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const InstructorDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { instructor, loading, error, refetch } = useInstructor(id || '');
  const { trends: monthlyTrends, loading: trendsLoading } = useInstructorMonthlyTrend(id || '');
  
  const urlParams = new URLSearchParams(location.search);
  const autoOpenEdit = urlParams.get('edit');
  
  // State tanımlamaları
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [educationInfoModalOpen, setEducationInfoModalOpen] = useState(false);
  const [addressInfoModalOpen, setAddressInfoModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    if (autoOpenEdit === 'personal') {
      setPersonalInfoModalOpen(true);
    } else if (autoOpenEdit === 'education') {
      setEducationInfoModalOpen(true);
    } else if (autoOpenEdit === 'address') {
      setAddressInfoModalOpen(true);
    } else if (autoOpenEdit === 'notes') {
      setNotesModalOpen(true);
    }
  }, [autoOpenEdit]);
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'success', text: 'Aktif' };
      case 'INACTIVE':
        return { color: 'error', text: 'Pasif' };
      case 'PENDING':
        return { color: 'warning', text: 'Onay Bekliyor' };
      default:
        return { color: 'default', text: status };
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const handleToggleStatus = async () => {
    if (!instructor) return;
    try {
      const newStatus = instructor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      // API'ye status güncellemesi gönder
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/instructors/${instructor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }
      
      setSnackbarMessage(`Eğitmen başarıyla ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} yapıldı!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetch();
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setSnackbarMessage('Durum değiştirilirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!instructor) return;
    setDeleteLoading(true);
    try {
      setSnackbarMessage('Eğitmen başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/instructors'), 1500);
    } catch (error) {
      console.error('Silme hatası:', error);
      setSnackbarMessage('Eğitmen silinirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const handlePersonalInfoUpdated = () => {
    setSnackbarMessage('Kişisel bilgiler başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setPersonalInfoModalOpen(false);
    refetch();
  };
  
  const handleEducationInfoUpdated = () => {
    setSnackbarMessage('Eğitim bilgileri başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setEducationInfoModalOpen(false);
    refetch();
  };
  
  const handleAddressInfoUpdated = () => {
    setSnackbarMessage('Adres bilgileri başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setAddressInfoModalOpen(false);
    refetch();
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !instructor) {
    return (
      <Box sx={{ height: '100%', width: '100%', p: 3 }}>
        <PageBreadcrumb />
        <Paper
          elevation={0}
          sx={{ 
            p: 3,
            mt: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            color: 'error.main'
          }}
        >
          <Typography variant="h6" gutterBottom>{error || 'Eğitmen bulunamadı'}</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/instructors')}
            sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Eğitmen Listesine Dön
          </Button>
        </Paper>
      </Box>
    );
  }
  
  const statusInfo = getStatusInfo(instructor.status);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'auto',
        bgcolor: '#f8fafc',
        p: { xs: 2, md: 3 }
      }}
    >
      {/* Header */}
      <Box>
        <Box sx={{ flexDirection: { xs: 'column', sm: 'row' }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <PageBreadcrumb />
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/instructors')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2, py: 1 }}
          >
            Eğitmen Listesine Dön
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={(instructor.profileImage || instructor.profilePhoto) ? `${API_URL}${instructor.profileImage || instructor.profilePhoto}` : undefined}
              alt={`${instructor.firstName} ${instructor.lastName}`}
              sx={{ width: 80, height: 80, border: '4px solid', borderColor: 'primary.main', boxShadow: 3 }}
            >
              {!(instructor.profileImage || instructor.profilePhoto) && `${instructor.firstName[0]}${instructor.lastName[0]}`}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {instructor.firstName} {instructor.lastName}
                </Typography>
                <Chip label={statusInfo.text} color={statusInfo.color as any} sx={{ borderRadius: 2, fontWeight: 600 }} />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {instructor.specialization || 'Eğitmen'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* İçerik - Tab Yapısı */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0, flex: 1 }}>
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { minHeight: 64, textTransform: 'none', fontSize: '1rem', fontWeight: 500 }
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Kişisel ve Adres Bilgileri" />
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Eğitim ve Yeterlilik" />
            <Tab icon={<DriveEtaIcon />} iconPosition="start" label="Zimmetli Araçlar" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="İstatistikler" />
            <Tab icon={<NotesIcon />} iconPosition="start" label="İşlemler ve Notlar" />
          </Tabs>
        </Paper>

        {/* Tab 1: Kişisel ve Adres */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InstructorPersonalInfoCard instructor={instructor} onEdit={() => setPersonalInfoModalOpen(true)} formatDate={formatDate} />
            </Grid>
            <Grid item xs={12} md={6}>
              <InstructorAddressInfoCard instructor={instructor} onEdit={() => setAddressInfoModalOpen(true)} />
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Eğitim */}
        {activeTab === 1 && (
          <InstructorEducationInfoCard instructor={instructor} onEdit={() => setEducationInfoModalOpen(true)} />
        )}

        {/* Tab 3: Araçlar */}
        {activeTab === 2 && (
          <AssignedVehicles instructorId={instructor.id} />
        )}

        {/* Tab 4: İstatistikler */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            {/* Ana Başlık */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>Performans İstatistikleri</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Eğitmenin bu dönem, tüm zamanlar ve aylık performans metrikleri
              </Typography>
            </Grid>

            {/* BÖLÜM 1: BU DÖNEM (AYLIK) İSTATİSTİKLER */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2, mb: 2 }}>
                Bu Dönem (Aralık 2025)
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                  color: '#2c3e50',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Bu Ay Eşleştirilen
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.monthlyTotalStudents || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Yeni öğrenci
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                  color: '#2c3e50',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Bu Ay Başarılı
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.monthlyPassedStudents || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Sınavı geçen
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                  color: '#2c3e50',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Bu Ay Başarı Oranı
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  %{(instructor.monthlySuccessRate || 0).toFixed(0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Dönem performansı
                </Typography>
              </Paper>
            </Grid>

            {/* BÖLÜM 2: TÜM ZAMANLAR İSTATİSTİKLER */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2, mb: 2 }}>
                Tüm Zamanlar
              </Typography>
            </Grid>

            {/* İstatistik Kartları */}
            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Toplam Öğrenci
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.studentCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Eğitim verilen
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Başarılı Öğrenci
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.passedStudents || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Sınavı geçen
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Toplam Deneme
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.totalAttempts || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Direksiyon sınavı
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Başarı Oranı
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  %{(instructor.successRate || 0).toFixed(1)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {instructor.passedStudents || 0} / {instructor.totalAttempts || 0} deneme
                </Typography>
              </Paper>
            </Grid>

            {/* YENİ: Mevcut Aktif Öğrenci */}
            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: '#2c3e50',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Mevcut Aktif Öğrenci
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {instructor.currentActiveStudents || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Şu anda eğitimde
                </Typography>
              </Paper>
            </Grid>

            {/* YENİ: İlk Denemede Başarı */}
            <Grid item xs={12} md={6} lg={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  color: '#2c3e50',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  İlk Denemede Başarı
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  %{(instructor.firstAttemptSuccessRate || 0).toFixed(0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Kalite göstergesi
                </Typography>
              </Paper>
            </Grid>

            {/* Performans Özeti */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  background: 'linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Performans Özeti
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {instructor.firstName} {instructor.lastName}, kariyeri boyunca toplam <strong>{instructor.studentCount || 0}</strong> öğrenciye 
                      direksiyon eğitimi vermiştir. Bu öğrenciler <strong>{instructor.totalAttempts || 0}</strong> adet 
                      direksiyon sınavı denemesi yapmış ve bunların <strong>{instructor.passedStudents || 0}</strong> tanesi 
                      başarılı olmuştur. Bu dönem (Aralık 2025) <strong>{instructor.monthlyTotalStudents || 0}</strong> yeni öğrenci eşleştirmesi yapılmış, 
                      bunlardan <strong>{instructor.monthlyPassedStudents || 0}</strong> tanesi sınavı geçmiştir.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Tüm Zamanlar: %${(instructor.successRate || 0).toFixed(1)}`}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={`Bu Dönem: %${(instructor.monthlySuccessRate || 0).toFixed(1)}`}
                        sx={{ 
                          background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                          color: '#2c3e50',
                          fontWeight: 600
                        }}
                      />
                      <Chip 
                        label={`İlk Deneme Başarı: %${(instructor.firstAttemptSuccessRate || 0).toFixed(0)}`}
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {instructor.totalAttempts && instructor.totalAttempts > 0 && (
                        <Chip 
                          label={`Ortalama Deneme: ${(instructor.totalAttempts / (instructor.studentCount || 1)).toFixed(1)}`}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* BÖLÜM 3: SON 6 AY PERFORMANS TRENDİ */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2, mb: 2 }}>
                Son 6 Ay Performans Trendi
              </Typography>
            </Grid>

            {/* 6 Aylık Performans Trendi Grafiği */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'divider'
                }}
              >
                {trendsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : monthlyTrends && monthlyTrends.length > 0 ? (
                  <Chart
                    options={{
                      chart: {
                        id: 'instructor-trend',
                        toolbar: { show: true },
                        zoom: { enabled: false }
                      },
                      xaxis: {
                        categories: monthlyTrends.map(t => {
                          const [year, month] = t.month.split('-');
                          const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                          return `${monthNames[parseInt(month) - 1]} ${year}`;
                        }),
                        labels: {
                          style: { fontSize: '12px' }
                        }
                      },
                      yaxis: [
                        {
                          title: { text: 'Başarı Oranı (%)' },
                          min: 0,
                          max: 100,
                          labels: {
                            formatter: (val) => `%${val.toFixed(0)}`
                          }
                        },
                        {
                          opposite: true,
                          title: { text: 'Deneme Sayısı' },
                          min: 0,
                          labels: {
                            formatter: (val) => val.toFixed(0)
                          }
                        }
                      ],
                      stroke: {
                        width: [3, 3],
                        curve: 'smooth'
                      },
                      colors: ['#667eea', '#f5576c'],
                      dataLabels: {
                        enabled: true,
                        enabledOnSeries: [0],
                        formatter: (val) => `%${Number(val).toFixed(0)}`
                      },
                      legend: {
                        position: 'top',
                        horizontalAlign: 'right'
                      },
                      tooltip: {
                        shared: true,
                        intersect: false,
                        y: [
                          {
                            formatter: (val) => `%${val.toFixed(1)}`
                          },
                          {
                            formatter: (val) => `${val} deneme`
                          }
                        ]
                      },
                      grid: {
                        borderColor: '#f1f1f1'
                      }
                    }}
                    series={[
                      {
                        name: 'Başarı Oranı',
                        type: 'line',
                        data: monthlyTrends.map(t => t.success_rate)
                      },
                      {
                        name: 'Toplam Deneme',
                        type: 'column',
                        data: monthlyTrends.map(t => t.total_attempts)
                      }
                    ]}
                    type="line"
                    height={350}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz aylık performans verisi bulunmuyor
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 5: İşlemler ve Notlar */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            {/* Notlar - Sol */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary.main">Notlar</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setNotesModalOpen(true)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Düzenle
                  </Button>
                </Box>
                <Box sx={{ p: 3 }}>
                  {instructor.notes ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{instructor.notes}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">Henüz not eklenmemiş.</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* İşlemler - Sağ */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary.main">İşlemler</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Kullanıcı Bilgisi */}
                    {instructor.user && (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'primary.50', 
                          border: '1px solid', 
                          borderColor: 'primary.200',
                          borderRadius: 2,
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: instructor.user.isActive ? 'primary.main' : 'grey.400',
                              width: 40,
                              height: 40
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              {instructor.user.phone}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Kullanıcı Hesabı
                            </Typography>
                          </Box>
                          <Chip 
                            label={instructor.user.isActive ? 'Aktif' : 'Pasif'}
                            color={instructor.user.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Paper>
                    )}
                    
                    <Button
                      variant="outlined"
                      color={instructor.status === 'ACTIVE' ? 'error' : 'success'}
                      startIcon={instructor.status === 'ACTIVE' ? <LockIcon /> : <LockOpenIcon />}
                      onClick={handleToggleStatus}
                      fullWidth
                      sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}
                    >
                      {instructor.status === 'ACTIVE' ? 'Pasif Yap' : 'Aktif Yap'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Modallar */}
      <EditPersonalInfoModal
        open={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        onSuccess={handlePersonalInfoUpdated}
        instructor={instructor}
      />
      
      <EditEducationInfoModal
        open={educationInfoModalOpen}
        onClose={() => setEducationInfoModalOpen(false)}
        onSuccess={handleEducationInfoUpdated}
        instructor={instructor}
      />
      
      <EditAddressInfoModal
        open={addressInfoModalOpen}
        onClose={() => setAddressInfoModalOpen(false)}
        onSuccess={handleAddressInfoUpdated}
        instructor={instructor}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eğitmeni Sil"
        content={`${instructor.firstName} ${instructor.lastName} isimli eğitmeni silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        loading={deleteLoading}
      />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InstructorDetail;
