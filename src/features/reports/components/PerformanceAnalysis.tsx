import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { apiClient } from '../../../utils/api';
import { getInstructorStatsForCurrentMonth } from '../api/instructorMonthlyStats';

interface MonthlyPerformance {
  month: string;
  newStudents: number;
  writtenExamPassed: number;
  drivingExamPassed: number;
  completedStudents: number;
  revenue: number;
  expense: number;
  successRate: number;
  previousRevenue?: number;
  previousExpense?: number;
}

interface InstructorPerformance {
  name: string;
  studentsCount: number;
  successRate: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
  avatar?: string;
}

const PerformanceAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyPerformance[]>([]);
  const [instructorComparison, setInstructorComparison] = useState<InstructorPerformance[]>([]);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Eğitmen performansını çek (bu ayki veriler)
      const instructorStats = await getInstructorStatsForCurrentMonth();
      const instructorPerf: InstructorPerformance[] = instructorStats.slice(0, 5).map(stat => ({
        name: stat.name,
        studentsCount: stat.totalStudents,
        successRate: stat.successRate,
        averageScore: stat.averageScore,
        trend: stat.trend || 'stable',
        avatar: stat.avatar
      }));
      setInstructorComparison(instructorPerf);

      // Bu ay ve geçen ayın verilerini çek
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      const lastMonthDate = new Date(currentDate);
      lastMonthDate.setMonth(currentDate.getMonth() - 1);
      const startOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0, 23, 59, 59);

      // Bu ayın verileri
      const dashboardResponse = await apiClient.get('/companies/dashboard/stats');
      const paymentParams = new URLSearchParams();
      paymentParams.append('startDate', startOfMonth.toISOString().split('T')[0]);
      paymentParams.append('endDate', endOfMonth.toISOString().split('T')[0]);
      const paymentResponse = await apiClient.get(`/companies/cash-report?${paymentParams.toString()}`);
      
      // Bu ayın gider bilgisi
      const expenseParams = new URLSearchParams();
      expenseParams.append('startDate', startOfMonth.toISOString().split('T')[0]);
      expenseParams.append('endDate', endOfMonth.toISOString().split('T')[0]);
      const expenseResponse = await apiClient.get(`/expenses?${expenseParams.toString()}`);

      // Geçen ayın verileri
      const lastMonthPaymentParams = new URLSearchParams();
      lastMonthPaymentParams.append('startDate', startOfLastMonth.toISOString().split('T')[0]);
      lastMonthPaymentParams.append('endDate', endOfLastMonth.toISOString().split('T')[0]);
      const lastMonthPaymentResponse = await apiClient.get(`/companies/cash-report?${lastMonthPaymentParams.toString()}`);
      
      // Geçen ayın gider bilgisi
      const lastMonthExpenseParams = new URLSearchParams();
      lastMonthExpenseParams.append('startDate', startOfLastMonth.toISOString().split('T')[0]);
      lastMonthExpenseParams.append('endDate', endOfLastMonth.toISOString().split('T')[0]);
      const lastMonthExpenseResponse = await apiClient.get(`/expenses?${lastMonthExpenseParams.toString()}`);

      const monthName = currentDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      
      if (dashboardResponse.success) {
        const stats = dashboardResponse.data;
        const totalStudents = stats.total_students || 0;
        const writtenPassed = stats.written_exam_passed || 0;
        const drivingPassed = stats.driving_exam_passed || 0;
        const completed = Math.min(writtenPassed, drivingPassed);
        const revenue = paymentResponse.success ? paymentResponse.data.summary.totalAmount : 0;
        const expense = expenseResponse.success && expenseResponse.data.stats ? expenseResponse.data.stats.totalAmount : 0;
        const successRate = totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0;
        
        // Geçen ayın geliri ve gideri
        const lastMonthRevenue = lastMonthPaymentResponse.success ? lastMonthPaymentResponse.data.summary.totalAmount : 0;
        const lastMonthExpense = lastMonthExpenseResponse.success && lastMonthExpenseResponse.data.stats ? lastMonthExpenseResponse.data.stats.totalAmount : 0;

        setMonthlyData([{
          month: monthName,
          newStudents: totalStudents,
          writtenExamPassed: writtenPassed,
          drivingExamPassed: drivingPassed,
          completedStudents: completed,
          revenue: revenue,
          expense: expense,
          successRate: successRate,
          previousRevenue: lastMonthRevenue,
          previousExpense: lastMonthExpense
        }]);
      }
    } catch (err: any) {
      console.error('Performance data error:', err);
      setError(err.message || 'Performans verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Henüz performans verisi bulunmamaktadır.</Alert>
      </Box>
    );
  }

  // Genel istatistikler
  const currentMonth = monthlyData[0];
  
  // Öğrenci ve başarı oranı için trend bilgisi yok (sadece gelir için var)
  const studentGrowth = '0';
  const successRateChange = '0';
  const revenueGrowth = currentMonth.previousRevenue && currentMonth.previousRevenue > 0
    ? (((currentMonth.revenue - currentMonth.previousRevenue) / currentMonth.previousRevenue) * 100).toFixed(1)
    : '0';

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      default: return <TimelineIcon color="info" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Performans Analizi ve Trend Raporu
      </Typography>

      {/* Genel Performans Kartları */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{
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
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <GroupIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700}>
                    {currentMonth.newStudents}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }} mb={1}>
                    Yeni Öğrenci (Bu Ay)
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {parseFloat(studentGrowth) > 0 ? 
                      <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} /> : 
                      <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                    }
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'white' }}
                      fontWeight={600}
                    >
                      %{Math.abs(parseFloat(studentGrowth))}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
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
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <StarIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700}>
                    %{currentMonth.successRate}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }} mb={1}>
                    Başarı Oranı
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {parseFloat(successRateChange) > 0 ? 
                      <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} /> : 
                      <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                    }
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'white' }}
                      fontWeight={600}
                    >
                      {successRateChange > '0' ? '+' : ''}{successRateChange}%
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{
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
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <SchoolIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700}>
                    {currentMonth.completedStudents}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }} mb={1}>
                    Mezun Öğrenci
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(currentMonth.completedStudents / currentMonth.newStudents) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white'
                      }
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{
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
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700}>
                    ₺{(currentMonth.revenue / 1000).toFixed(1)}K
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }} mb={1}>
                    Bu Ay Gelir
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {parseFloat(revenueGrowth) > 0 ? 
                      <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} /> : 
                      <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                    }
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'white' }}
                      fontWeight={600}
                    >
                      %{Math.abs(parseFloat(revenueGrowth))}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
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
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TrendingDownIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700}>
                    ₺{(currentMonth.expense / 1000).toFixed(1)}K
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }} mb={1}>
                    Bu Ay Gider
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {currentMonth.previousExpense && currentMonth.previousExpense > 0 ? (
                      <>
                        {((currentMonth.expense - currentMonth.previousExpense) / currentMonth.previousExpense * 100) > 0 ? 
                          <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} /> : 
                          <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                        }
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'white' }}
                          fontWeight={600}
                        >
                          %{Math.abs(((currentMonth.expense - currentMonth.previousExpense) / currentMonth.previousExpense * 100)).toFixed(1)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
                        Karşılaştırma yok
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aylık Trend Tablosu */}
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Aylık Performans Trendi
          </Typography>
        </Box>
        <Divider />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ay</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Yeni Öğrenci</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Yazılı Geçen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Direksiyon Geçen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mezun</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gelir</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gider</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Başarı Oranı</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyData.map((month) => (
                <TableRow key={month.month} hover>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {month.month}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={month.newStudents} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AssignmentIcon fontSize="small" color="success" />
                      <Typography>{month.writtenExamPassed}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DriveEtaIcon fontSize="small" color="warning" />
                      <Typography>{month.drivingExamPassed}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={month.completedStudents} 
                      size="small" 
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="success.main">
                      ₺{month.revenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="error.main">
                      ₺{month.expense.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600} mb={0.5}>
                        %{month.successRate}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={month.successRate} 
                        color={getSuccessRateColor(month.successRate) as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Eğitmen Performans Karşılaştırması */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Eğitmen Performans Karşılaştırması
          </Typography>
        </Box>
        <Divider />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Eğitmen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Öğrenci Sayısı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Başarı Oranı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ortalama Puan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trend</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performans</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instructorComparison.map((instructor) => (
                <TableRow key={instructor.name} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar 
                        sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}
                        src={instructor.avatar ? `/uploads/instructors/${instructor.avatar}` : undefined}
                      >
                        {!instructor.avatar && instructor.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography fontWeight={600}>
                        {instructor.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={instructor.studentsCount} 
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600} mb={0.5}>
                        %{instructor.successRate}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={instructor.successRate} 
                        color={getSuccessRateColor(instructor.successRate) as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {instructor.averageScore}/100
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getTrendIcon(instructor.trend)}
                      label={
                        instructor.trend === 'up' ? 'Yükseliş' : 
                        instructor.trend === 'down' ? 'Düşüş' : 'Sabit'
                      }
                      color={
                        instructor.trend === 'up' ? 'success' : 
                        instructor.trend === 'down' ? 'error' : 'info'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        instructor.successRate >= 80 ? 'Mükemmel' :
                        instructor.successRate >= 60 ? 'İyi' : 'Geliştirilmeli'
                      }
                      size="small"
                      color={getSuccessRateColor(instructor.successRate) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PerformanceAnalysis;