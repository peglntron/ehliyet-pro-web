import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  CircularProgress, Avatar, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsCar as CarIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface DashboardStats {
  activeStudents: number;
  completedLessons: number;
  todayLessons: number;
  upcomingLessons: number;
  monthlyLessons: number;
  examSuccessRate: number;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
  } | null;
  todaySchedule: Array<{
    id: string;
    time: string;
    studentName: string;
    lessonNumber: number;
  }>;
  recentStudents: Array<{
    id: string;
    name: string;
    completedLessons: number;
    totalLessons: number;
  }>;
}

const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/instructors/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Alert severity="error">Dashboard verileri yüklenemedi</Alert>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Aktif Öğrencilerim',
      value: stats.activeStudents,
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Tamamlanan Dersler',
      value: stats.completedLessons,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Bugünkü Dersler',
      value: stats.todayLessons,
      icon: <EventIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Gelecek Dersler',
      value: stats.upcomingLessons,
      icon: <ScheduleIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
    {
      title: 'Bu Ay Verilen Ders',
      value: stats.monthlyLessons,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      title: 'Sınav Başarı Oranı',
      value: `%${stats.examSuccessRate}`,
      icon: <TrophyIcon sx={{ fontSize: 40, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Hoş Geldin */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Hoş Geldiniz, {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Eğitmen Kontrol Paneli
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} mb={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%', 
              background: card.gradient,
              color: '#fff',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }} gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Araç Bilgisi */}
        {stats.vehicle && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CarIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Kullandığım Araç
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={600} color="primary.main" mb={1}>
                  {stats.vehicle.plate}
                </Typography>
                <Typography variant="body1">
                  {stats.vehicle.brand} {stats.vehicle.model}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Bugünkü Program */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Bugünkü Ders Programı
            </Typography>
            {stats.todaySchedule.length === 0 ? (
              <Alert severity="info">Bugün için planlanmış ders bulunmuyor</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Saat</TableCell>
                      <TableCell>Öğrenci</TableCell>
                      <TableCell>Ders No</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.todaySchedule.map((lesson) => (
                      <TableRow key={lesson.id} hover>
                        <TableCell>{lesson.time}</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{lesson.studentName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`Ders ${lesson.lessonNumber}`} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Son Öğrencilerim */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Aktif Öğrencilerim
            </Typography>
            {stats.recentStudents.length === 0 ? (
              <Alert severity="info">Henüz atanmış öğrenci bulunmuyor</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Öğrenci Adı</TableCell>
                      <TableCell align="center">Tamamlanan Ders</TableCell>
                      <TableCell align="center">Toplam Ders</TableCell>
                      <TableCell align="center">İlerleme</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {student.name.charAt(0)}
                            </Avatar>
                            <Typography fontWeight={500}>{student.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{student.completedLessons}</TableCell>
                        <TableCell align="center">{student.totalLessons}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.totalLessons > 0 
                              ? `%${Math.round((student.completedLessons / student.totalLessons) * 100)}` 
                              : '%0'}
                            color={student.completedLessons === student.totalLessons && student.totalLessons > 0 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructorDashboardPage;
