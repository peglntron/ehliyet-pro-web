import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart as BarChartIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Grade as GradeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  School as ExamIcon,
  Payment as PaymentIcon,
  MenuBook as LessonIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import StatCard from '../dashboard/components/StatCard';
import { apiClient } from '../../utils/api';

interface DashboardStats {
  total_students: number;
  active_students: number;
  total_instructors: number;
  active_instructors: number;
  written_exam_passed: number;
  driving_exam_passed: number;
  written_exam_success_rate: number;
  driving_exam_success_rate: number;
  total_debtors: number;
  total_debt_amount: number;
  monthly_income: number;
  total_income: number;
  notifications?: {
    general_to_students: number;
    exam_to_students: number;
    payment_to_students: number;
    lesson_to_students: number;
    to_instructors: number;
  };
}

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [instructorStats, setInstructorStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchInstructorStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/companies/dashboard/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      setError('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/instructor-stats');
      if (response.success && response.data.instructors) {
        // Backend'den gelen veriyi frontend formatına çevir
        const formattedStats = response.data.instructors.map((inst: any, index: number) => ({
          id: inst.instructor_id,
          name: `${inst.firstName} ${inst.lastName}`,
          monthlyStudents: Number(inst.monthly_total_students),
          monthlyPassed: Number(inst.monthly_passed_students),
          monthlySuccessRate: Number(inst.monthly_success_rate),
          overallStudents: Number(inst.total_students_all_time),
          overallAttempts: Number(inst.total_exam_attempts),
          overallSuccessRate: Number(inst.all_time_success_rate),
          iconComponent: PersonIcon,
          color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]
        }));
        setInstructorStats(formattedStats);
      }
    } catch (err: any) {
      console.error('Instructor stats error:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }
  
  // Bu ayki bildirim sayıları (5 kart) - Detaylı istatistiklerle uyumlu renkler
  const notificationStats = [
    {
      id: 'notif-1',
      title: 'Genel Bildirimler',
      value: stats.notifications?.general_to_students || 0,
      iconComponent: NotificationsIcon,
      color: '#1e40af',
      description: 'Öğrencilere gönderilen genel bildirimler (Bu ay)'
    },
    {
      id: 'notif-2',
      title: 'Sınav Bildirimleri',
      value: stats.notifications?.exam_to_students || 0,
      iconComponent: ExamIcon,
      color: '#6b21a8',
      description: 'Öğrencilere gönderilen sınav bildirimleri (Bu ay)'
    },
    {
      id: 'notif-3',
      title: 'Ders Bildirimleri',
      value: stats.notifications?.lesson_to_students || 0,
      iconComponent: LessonIcon,
      color: '#047857',
      description: 'Öğrencilere gönderilen ders bildirimleri (Bu ay)'
    },
    {
      id: 'notif-4',
      title: 'Ödeme Bildirimleri',
      value: stats.notifications?.payment_to_students || 0,
      iconComponent: PaymentIcon,
      color: '#b45309',
      description: 'Öğrencilere gönderilen ödeme bildirimleri (Bu ay)'
    },
    {
      id: 'notif-5',
      title: 'Eğitmen Bildirimleri',
      value: stats.notifications?.to_instructors || 0,
      iconComponent: NotificationsActiveIcon,
      color: '#b91c1c',
      description: 'Eğitmenlere gönderilen tüm bildirimler (Bu ay)'
    }
  ];
  
  // Ana istatistikler
  const mainStats = [
    { 
      id: '1',
      title: 'Toplam Öğrenci',
      value: stats.total_students,
      iconComponent: PeopleIcon,
      color: '#3b82f6',
      description: 'Kursa kayıtlı toplam öğrenci sayısı'
    },
    { 
      id: '2',
      title: 'Toplam Eğitmen',
      value: stats.total_instructors,
      iconComponent: PersonIcon,
      color: '#8b5cf6',
      description: 'Kursta görev yapan eğitmen sayısı'
    },
    { 
      id: '3',
      title: 'Yazılı Sınavı Geçen',
      value: stats.written_exam_passed,
      iconComponent: AssignmentIcon,
      color: '#10b981',
      description: 'Yazılı sınavını başarıyla geçen öğrenciler'
    },
    { 
      id: '4',
      title: 'Direksiyonu Geçen',
      value: stats.driving_exam_passed,
      iconComponent: DriveEtaIcon,
      color: '#f59e0b',
      description: 'Direksiyon sınavını başarıyla geçen öğrenciler'
    },
    {
      id: '5',
      title: 'Toplam Borçlular',
      value: stats.total_debtors,
      iconComponent: EmojiEventsIcon,
      color: '#ef4444',
      description: 'Borçları olan öğrencilerin toplamı'
    },
  ];
  
  // Detaylı istatistikler
  const detailedStats = [
    { 
      id: '6',
      title: 'Aktif Öğrenci',
      value: stats.active_students,
      iconComponent: SchoolIcon,
      color: '#2563eb',
      description: 'Eğitime devam eden öğrenciler'
    },
    {
      id: '7',
      title: 'Aktif Eğitmen',
      value: stats.active_instructors,
      iconComponent: PersonIcon,
      color: '#7c3aed',
      description: 'Aktif durumda olan eğitmen sayısı'
    },
    {
      id: '8',
      title: 'Yazılı Başarı Oranı',
      value: `%${stats.written_exam_success_rate.toFixed(1)}`,
      iconComponent: GradeIcon,
      color: '#059669',
      description: 'Yazılı sınav başarı yüzdesi'
    },
    {
      id: '9',
      title: 'Direksiyon Başarısı',
      value: `%${stats.driving_exam_success_rate.toFixed(1)}`,
      iconComponent: StarIcon,
      color: '#d97706',
      description: 'Direksiyon sınav başarı yüzdesi'
    },
    {
      id: '10',
      title: 'Aylık Gelir',
      value: `₺${stats.monthly_income.toLocaleString('tr-TR')}`,
      iconComponent: AccountBalanceWalletIcon,
      color: '#dc2626',
      description: 'Bu ay alınan toplam gelir'
    }
  ];

  // Debug için veriler console'da yazdırılıyor
  console.log('Dashboard Stats:', stats);
  console.log('Instructor Stats:', instructorStats);

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header ve Breadcrumb */}
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              İşletme Paneli
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sürücü kursu işletme istatistikleri ve analiz paneli
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/reports')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 4px 10px rgba(66, 165, 245, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: '0 6px 15px rgba(66, 165, 245, 0.3)',
              }
            }}
          >
            Detaylı Raporlar
          </Button>
        </Box>
      </Box>
      
      
      {/* Toplam İstatistikler Başlığı */}
      <Box mb={3}>
        {/* <Divider sx={{ mb: 3 }} /> */}
        <Typography 
          variant="h5" 
          fontWeight={700} 
          color="text.primary"
        >
          Detaylı İstatistikler
        </Typography>
      </Box>
      
      {/* Ana İstatistik Kartları & Toplam İstatistik Kartları */}
      <Box mb={4}>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',              
              sm: 'repeat(2, 1fr)',   
              md: 'repeat(3, 1fr)',  
              lg: 'repeat(5, 1fr)'    
            },
            gap: 3
          }}
        >
               {mainStats.map((stat: any) => (
            <Box key={stat.id}>
              <StatCard
                title={stat.title}
                value={stat.value}
                iconComponent={stat.iconComponent}
                color={stat.color}
                description={stat.description}
              />
            </Box>
          ))}
          {detailedStats.map((stat: any) => (
            <Box key={stat.id}>
              <StatCard
                title={stat.title}
                value={stat.value}
                iconComponent={stat.iconComponent}
                color={stat.color}
                description={stat.description}
              />
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Bu Ayki Bildirim İstatistikleri */}
      <Box mb={4}>
        <Divider sx={{ mb: 3 }} />
        <Typography 
          variant="h5" 
          fontWeight={700} 
          color="text.primary"
          mb={3}
        >
          Bu Ayki Bildirimler
        </Typography>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',              
              sm: 'repeat(2, 1fr)',   
              md: 'repeat(3, 1fr)',  
              lg: 'repeat(5, 1fr)'    
            },
            gap: 3
          }}
        >
          {notificationStats.map((stat: any) => (
            <Box key={stat.id}>
              <StatCard
                title={stat.title}
                value={stat.value}
                iconComponent={stat.iconComponent}
                color={stat.color}
                description={stat.description}
              />
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Eğitmen Performans İstatistikleri */}
      <Box mb={4}>
        <Divider sx={{ mb: 3 }} />
        <Typography 
          variant="h5" 
          fontWeight={700} 
          color="text.primary"
          mb={1}
        >
          Eğitmen Performansı
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Bu ay: Matching'lerdeki öğrenci başarısı | Genel: Toplam öğrenci / Toplam deneme
        </Typography>
        {instructorStats.length === 0 ? (
          <Alert severity="info">
            Henüz eğitmen istatistiği bulunmuyor. Eğitmenlerinize öğrenci eşleştirmeleri yapıldıkça burada görünecektir.
          </Alert>
        ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',              
              sm: 'repeat(2, 1fr)',   
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {instructorStats.map((instructor: any) => (
            <Box 
              key={instructor.id}
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                  borderColor: instructor.color,
                }
              }}
            >
              {/* Header with gradient */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${instructor.color} 0%, ${instructor.color}dd 100%)`,
                  p: 3,
                  pb: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, transparent, ${instructor.color}, transparent)`,
                    opacity: 0.5
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <instructor.iconComponent sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      color="white"
                      sx={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        mb: 0.5
                      }}
                    >
                      {instructor.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(255,255,255,0.25)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        color="white"
                        sx={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                      >
                        BU AY
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Stats Content */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Öğrenci Sayısı */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Eşleştirilen Öğrenci
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{ 
                          color: instructor.color,
                          fontSize: '1.25rem'
                        }}
                      >
                        {instructor.monthlyStudents}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Sınavı Geçenler
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color="success.main"
                      >
                        {instructor.monthlyPassed}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 6,
                        bgcolor: 'grey.100',
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${instructor.monthlyStudents > 0 ? (instructor.monthlyPassed / instructor.monthlyStudents) * 100 : 0}%`,
                          background: `linear-gradient(90deg, ${instructor.color}, ${instructor.color}cc)`,
                          borderRadius: 3,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Başarı Oranları */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
                        Bu Ay Başarı
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{
                          background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        %{instructor.monthlySuccessRate.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                        {instructor.monthlyPassed}/{instructor.monthlyStudents}
                      </Typography>
                    </Box>
                    
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
                        Genel Verimlilik
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{
                          background: `linear-gradient(135deg, ${instructor.color} 0%, ${instructor.color}cc 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        %{instructor.overallSuccessRate.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                        {instructor.overallStudents} öğr / {instructor.overallAttempts} dnm
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        )}
      </Box>
    </Box>
  );
};

export default CompanyDashboard;