import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  FileDownload as FileDownloadIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { 
  getMatchingList, 
  getInstructorStatsByMatching,
  type MatchingGroup,
  type InstructorStat 
} from '../api/instructorStatisticsApi';
import { getInstructorStatsForCurrentMonth } from '../api/instructorMonthlyStats';
import { exportInstructorStatsToExcel } from '../../../utils/excelExport';

const InstructorStatistics: React.FC = () => {
  const [selectedMatching, setSelectedMatching] = useState<string>('');
  const [matchingGroups, setMatchingGroups] = useState<MatchingGroup[]>([]);
  const [instructorStats, setInstructorStats] = useState<InstructorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eşleştirme listesini yükle
  useEffect(() => {
    loadMatchingList();
  }, []);

  // Seçili eşleştirme değiştiğinde istatistikleri yükle
  useEffect(() => {
    if (selectedMatching === 'current-month') {
      loadMonthlyStats();
    } else if (selectedMatching) {
      loadInstructorStats(selectedMatching);
    } else {
      setInstructorStats([]);
    }
  }, [selectedMatching]);

  const loadMatchingList = async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await getMatchingList();
      setMatchingGroups(groups);
    } catch (err) {
      console.error('Eşleştirmeler yüklenemedi:', err);
      setError('Eşleştirmeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);
      const stats = await getInstructorStatsForCurrentMonth();
      setInstructorStats(stats);
    } catch (err) {
      console.error('Aylık istatistikler yüklenemedi:', err);
      setError('Aylık istatistikler yüklenirken hata oluştu');
      setInstructorStats([]);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadInstructorStats = async (matchingId: string) => {
    try {
      setStatsLoading(true);
      setError(null);
      const stats = await getInstructorStatsByMatching(matchingId);
      setInstructorStats(stats);
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
      setError('İstatistikler yüklenirken hata oluştu');
      setInstructorStats([]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Genel istatistikler
  const filteredStats = instructorStats;
  const totalInstructors = filteredStats.length;
  const totalStudents = filteredStats.reduce((sum, stat) => sum + stat.totalStudents, 0);
  const totalPassed = filteredStats.reduce((sum, stat) => sum + stat.passedStudents, 0);
  const overallSuccessRate = totalStudents > 0 ? Math.round((totalPassed / totalStudents) * 100) : 0;
  const averageSuccessRate = filteredStats.length > 0 ? Math.round(filteredStats.reduce((sum, stat) => sum + stat.successRate, 0) / filteredStats.length) : 0;

  // Performans renk ve etiket fonksiyonları
  const getPerformanceLabel = (rate: number): string => {
    if (rate >= 85) return 'Mükemmel';
    if (rate >= 75) return 'İyi';
    if (rate >= 60) return 'Normal';
    if (rate >= 40) return 'Geliştirmeli';
    return 'Kötü';
  };

  const getPerformanceColor = (rate: number): 'error' | 'warning' | 'info' | 'success' => {
    if (rate >= 85) return 'success';      // Mükemmel (Koyu Yeşil)
    if (rate >= 75) return 'success';      // İyi (Yeşil)
    if (rate >= 60) return 'info';         // Normal (Mavi/Sarı)
    if (rate >= 40) return 'warning';      // Geliştirmeli (Turuncu)
    return 'error';                        // Kötü (Kırmızı)
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 85) return 'success';
    if (rate >= 75) return 'success';
    if (rate >= 60) return 'info';
    if (rate >= 40) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Eğitmen Performans İstatistikleri
      </Typography>

      {/* Hata Mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Eşleştirme Seçimi ve Excel Export */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Eşleştirme Seçiniz</InputLabel>
            <Select
              value={selectedMatching}
              label="Eşleştirme Seçiniz"
              onChange={(e) => setSelectedMatching(e.target.value)}
            >
              <MenuItem value="">
                <em>Lütfen bir eşleştirme seçiniz</em>
              </MenuItem>
              <MenuItem value="current-month">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" color="primary" />
                  <strong>Bu Ay - Tüm Eşleştirmeler</strong>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              {matchingGroups.map(group => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name} - {group.licenseClass} Sınıfı ({group.totalStudents} öğrenci) - {new Date(group.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            startIcon={<FileDownloadIcon />}
            disabled={!selectedMatching || instructorStats.length === 0}
            onClick={() => {
              const matchingName = selectedMatching === 'current-month' 
                ? 'Bu_Ay_Tum_Eslestirmeler'
                : matchingGroups.find(g => g.id === selectedMatching)?.name || 'Eslestirme';
              exportInstructorStatsToExcel(instructorStats, matchingName);
            }}
            sx={{ height: '56px' }}
          >
            Excel İndir
          </Button>
        </Grid>
      </Grid>

      {/* İstatistikler - Sadece eşleştirme seçildiğinde göster */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : !selectedMatching ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Eşleştirme Seçimi Yapınız
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Eğitmen istatistiklerini görmek için yukarıdan bir eşleştirme seçiniz
          </Typography>
          {matchingGroups.length === 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
              Henüz uygulanmış eşleştirme bulunmamaktadır
            </Typography>
          )}
        </Paper>
      ) : statsLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Özet Kartları */}
          <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
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
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Toplam Eğitmen
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {totalInstructors}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Aktif eğitmen sayısı
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Toplam Öğrenci
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {totalStudents}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Eğitim alan öğrenci
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Genel Başarı
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  %{overallSuccessRate}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {totalPassed}/{totalStudents} başarılı
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{
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
            <CardContent>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                  Eğitmen Ortalaması
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  %{averageSuccessRate}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Ortalama başarı oranı
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Eğitmen Listesi */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Eğitmen Detay Listesi
          </Typography>
        </Box>
        <Divider />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sıra</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Eğitmen Adı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Eşleştirme Grubu</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Toplam Öğrenci</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Geçen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kalan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Başarı Oranı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ortalama Puan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trend</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performans</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bu eşleştirmede henüz eğitmen ataması bulunmamaktadır
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStats.map((instructor, index) => (
                <TableRow key={instructor.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="1.1rem">
                      #{index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {instructor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {instructor.matchingGroup}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={instructor.totalStudents} 
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={instructor.passedStudents} 
                      size="small" 
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={instructor.failedStudents} 
                      size="small" 
                      color="error"
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
                    {instructor.trend ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {instructor.trend === 'up' ? (
                          <>
                            <TrendingUpIcon color="success" />
                            <Typography variant="body2" color="success.main" fontWeight={600}>
                              Yükselişte
                            </Typography>
                          </>
                        ) : instructor.trend === 'down' ? (
                          <>
                            <TrendingDownIcon color="error" />
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                              Düşüşte
                            </Typography>
                          </>
                        ) : (
                          <>
                            <TimelineIcon color="info" />
                            <Typography variant="body2" color="info.main" fontWeight={600}>
                              Sabit
                            </Typography>
                          </>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getPerformanceLabel(instructor.successRate)}
                      size="small"
                      color={getPerformanceColor(instructor.successRate)}
                      sx={{ 
                        fontWeight: 600,
                        ...(instructor.successRate >= 85 && {
                          bgcolor: 'success.dark',
                          color: 'white'
                        }),
                        ...(instructor.successRate >= 75 && instructor.successRate < 85 && {
                          bgcolor: 'success.main',
                          color: 'white'
                        }),
                        ...(instructor.successRate >= 60 && instructor.successRate < 75 && {
                          bgcolor: 'warning.light',
                          color: 'text.primary'
                        })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        </>
      )}
    </Box>
  );
};

export default InstructorStatistics;