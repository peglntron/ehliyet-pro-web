import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  Button
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { vehicleAPI } from '../../../api/vehicles';
import type { Vehicle, AssignmentStats } from '../../../api/vehicles';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../utils/api';
import { exportVehicleStatsToExcel } from '../../../utils/excelExport';

interface VehicleStatsData {
  vehicles: any[];
  summary: {
    totalVehicles: number;
    totalFuelCost: number;
    totalFuelLiters: number;
    activeAssignments: number;
    overdueService: number;
    expiredInspection: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-stats-tabpanel-${index}`}
      aria-labelledby={`vehicle-stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VehicleStatistics: React.FC = () => {
  const navigate = useNavigate();
  
  // Bugünden 1 gün önce (dün)
  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // Bugün
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [tabValue, setTabValue] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(getYesterday());
  const [endDate, setEndDate] = useState<string>(getToday());
  const [vehicleStatsData, setVehicleStatsData] = useState<VehicleStatsData | null>(null);

  useEffect(() => {
    loadData();
    loadVehicleStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece ilk yüklemede çalışır

  // Tarih değiştiğinde araç istatistiklerini yenile
  useEffect(() => {
    if (startDate && endDate) {
      loadVehicleStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehiclesData, statsData] = await Promise.all([
        vehicleAPI.getAll(),
        vehicleAPI.getAssignmentStats()
      ]);
      setVehicles(vehiclesData);
      setAssignmentStats(statsData);
    } catch (err: any) {
      console.error('Error loading vehicle data:', err);
      setError(err.response?.data?.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleStats = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const endpoint = `/companies/vehicle-stats${queryString ? `?${queryString}` : ''}`;
      
      console.log('Loading vehicle stats from:', endpoint);
      const response = await apiClient.get(endpoint);
      
      console.log('Vehicle stats response:', response);
      if (response.success) {
        setVehicleStatsData(response.data);
      } else {
        console.warn('Vehicle stats failed:', response);
      }
    } catch (err: any) {
      console.error('Vehicle stats error:', err);
      // Hata olsa bile buton aktif kalsın, vehicles data kullan
    }
  };

  const handleExcelExport = () => {
    console.log('Excel export başlatılıyor...');
    console.log('vehicleStatsData:', vehicleStatsData);
    console.log('vehicles:', vehicles);
    
    if (vehicleStatsData?.vehicles && vehicleStatsData.vehicles.length > 0) {
      // API'den gelen detaylı stats varsa onu kullan
      console.log('API stats kullanılıyor, araç sayısı:', vehicleStatsData.vehicles.length);
      exportVehicleStatsToExcel(vehicleStatsData.vehicles, vehicleStatsData.summary);
    } else if (vehicles.length > 0) {
      // Yoksa mevcut vehicles listesini kullan
      console.log('Mevcut vehicles kullanılıyor, araç sayısı:', vehicles.length);
      const summary = {
        totalVehicles: vehicles.length,
        totalFuelCost: 0,
        totalFuelLiters: 0,
        activeAssignments: 0,
        overdueService: 0,
        expiredInspection: 0
      };
      exportVehicleStatsToExcel(vehicles, summary);
    } else {
      console.warn('Excel export için veri yok!');
      alert('Excel export için veri bulunamadı. Lütfen sayfayı yenileyin.');
    }
  };

  const handleRefresh = () => {
    loadData();
    loadVehicleStats();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'MAINTENANCE': return 'warning';
      case 'REPAIR': return 'error';
      case 'INACTIVE': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'ASSIGNED': return 'Zimmetli';
      case 'MAINTENANCE': return 'Bakımda';
      case 'REPAIR': return 'Tamirde';
      case 'INACTIVE': return 'Hizmet Dışı';
      default: return status;
    }
  };

  const getServiceStatus = (currentKm: number, nextServiceKm?: number) => {
    if (!nextServiceKm) return { text: '-', color: 'default' };
    const remaining = nextServiceKm - currentKm;
    if (remaining < 0) return { text: 'Gecikmiş', color: 'error' };
    if (remaining < 2000) return { text: 'Yaklaşıyor', color: 'warning' };
    return { text: 'Normal', color: 'success' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const assignedVehicles = vehicles.filter(v => v.status === 'ASSIGNED').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Araç İstatistikleri ve Zimmet Takibi
      </Typography>

      {/* Tarih Filtresi */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Tarih Aralığı Seçin
        </Typography>
        <Grid container spacing={3} alignItems="end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              sx={{ py: 1.75 }}
              disabled={loading}
              onClick={handleRefresh}
            >
              Yenile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              sx={{ py: 1.75 }}
              disabled={loading || (!vehicleStatsData?.vehicles && vehicles.length === 0)}
              onClick={handleExcelExport}
            >
              Excel İndir
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <DirectionsCarIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalVehicles}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Toplam Araç
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <CheckCircleIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {activeVehicles}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Müsait Araç
                  </Typography>
                </Box>
              </Stack>
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
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <PersonIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {assignedVehicles}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Zimmetli Araç
                  </Typography>
                </Box>
              </Stack>
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
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <BuildIcon sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {maintenanceVehicles}
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Bakımda
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {assignmentStats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #2ebfa5 0%, #f77b9a 100%)',
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
                      <TimelineIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {assignmentStats.summary.totalAssignments}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>
                        Toplam Zimmet
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #ffd89b 0%, #f7956f 100%)',
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
                      <SpeedIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {assignmentStats.summary.totalKmDriven.toLocaleString()}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>
                        Toplam KM
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #c89ef9 0%, #5ba3f9 100%)',
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
                      <ScheduleIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {assignmentStats.summary.totalDays}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>
                        Toplam Gün
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #f46dc9 0%, #5580dc 100%)',
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
                      <SpeedIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {assignmentStats.summary.totalDays > 0
                          ? Math.round(assignmentStats.summary.totalKmDriven / assignmentStats.summary.totalDays)
                          : 0}
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>
                        Ort. KM/Gün
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Araç Detay Listesi" />
          <Tab label="Eğitmen Bazlı İstatistikler" />
          <Tab label="Araç Bazlı İstatistikler" />
          <Tab label="Sigorta Takibi" />
        </Tabs>

        {/* Araç Detay Listesi */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Araç Bilgisi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Zimmetli Eğitmen</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kilometre</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bakım Durumu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const serviceStatus = getServiceStatus(vehicle.currentKm, vehicle.nextServiceKm);
                  
                  return (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {vehicle.licensePlate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {vehicle.currentInstructor ? (
                            <>
                              <Typography fontWeight={600}>
                                {vehicle.currentInstructor.firstName} {vehicle.currentInstructor.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.currentInstructor.phone}
                              </Typography>
                            </>
                          ) : (
                            <Typography color="text.secondary" fontStyle="italic">
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {vehicle.currentKm.toLocaleString()} km
                          </Typography>
                          {vehicle.lastServiceDate && (
                            <Typography variant="body2" color="text.secondary">
                              Son servis: {new Date(vehicle.lastServiceDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip 
                            label={serviceStatus.text}
                            size="small"
                            color={serviceStatus.color as any}
                            sx={{ fontWeight: 600 }}
                          />
                          {vehicle.nextServiceKm && (
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              Sonraki: {vehicle.nextServiceKm.toLocaleString()} km
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(vehicle.status)}
                          size="small"
                          color={getStatusColor(vehicle.status) as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Detay Görüntüle">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Henüz araç kaydı bulunmuyor
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Eğitmen Bazlı İstatistikler */}
        <TabPanel value={tabValue} index={1}>
          {assignmentStats && (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Eğitmen</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Aktif</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tamamlanan</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam KM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam Gün</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Ort. KM/Gün</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Araç Sayısı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignmentStats.byInstructor.map((item) => (
                    <TableRow key={item.instructor.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.instructor.firstName} {item.instructor.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.instructor.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.activeAssignments}
                          color="warning"
                          size="small"
                          sx={{ minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.completedAssignments}
                          color="success"
                          size="small"
                          sx={{ minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {item.totalKm.toLocaleString()} km
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.totalDays} gün</TableCell>
                      <TableCell align="right">
                        {item.averageKmPerDay > 0 ? `${item.averageKmPerDay} km/gün` : '-'}
                      </TableCell>
                      <TableCell align="center">{item.vehicles.length}</TableCell>
                    </TableRow>
                  ))}
                  {assignmentStats.byInstructor.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Henüz zimmet kaydı bulunmuyor
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Araç Bazlı İstatistikler */}
        <TabPanel value={tabValue} index={2}>
          {assignmentStats && (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Zimmet Sayısı</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Aktif</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam KM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam Gün</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Eğitmen Sayısı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignmentStats.byVehicle.map((item) => (
                    <TableRow key={item.vehicle.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.vehicle.licensePlate}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.vehicle.brand} {item.vehicle.model}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={item.totalAssignments} size="small" sx={{ minWidth: 40 }} />
                      </TableCell>
                      <TableCell align="center">
                        {item.activeAssignments > 0 ? (
                          <Chip
                            label={item.activeAssignments}
                            color="warning"
                            size="small"
                            sx={{ minWidth: 40 }}
                          />
                        ) : (
                          <Chip label="0" variant="outlined" size="small" sx={{ minWidth: 40 }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {item.totalKm.toLocaleString()} km
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.totalDays} gün</TableCell>
                      <TableCell align="center">{item.instructors.length}</TableCell>
                    </TableRow>
                  ))}
                  {assignmentStats.byVehicle.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Henüz zimmet kaydı bulunmuyor
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Sigorta Takibi */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Araç Bilgisi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trafik Sigortası Başlangıç</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trafik Sigortası Bitiş</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kasko Başlangıç</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kasko Bitiş</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const today = new Date();
                  
                  // Trafik sigortası kontrolü
                  const trafficDaysRemaining = vehicle.trafficInsuranceEnd 
                    ? Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  const trafficStatus = 
                    trafficDaysRemaining === null ? 'Bilgi yok' :
                    trafficDaysRemaining < 0 ? 'Süresi dolmuş!' :
                    trafficDaysRemaining <= 30 ? `${trafficDaysRemaining} gün kaldı` :
                    'Geçerli';
                  
                  const trafficColor = 
                    trafficDaysRemaining === null ? 'default' :
                    trafficDaysRemaining < 0 ? 'error' :
                    trafficDaysRemaining <= 30 ? 'warning' :
                    'success';
                  
                  // Kasko sigortası kontrolü
                  const kaskoDaysRemaining = vehicle.kaskoInsuranceEnd 
                    ? Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  const kaskoStatus = 
                    kaskoDaysRemaining === null ? 'Bilgi yok' :
                    kaskoDaysRemaining < 0 ? 'Süresi dolmuş!' :
                    kaskoDaysRemaining <= 30 ? `${kaskoDaysRemaining} gün kaldı` :
                    'Geçerli';
                  
                  const kaskoColor = 
                    kaskoDaysRemaining === null ? 'default' :
                    kaskoDaysRemaining < 0 ? 'error' :
                    kaskoDaysRemaining <= 30 ? 'warning' :
                    'success';
                  
                  // Genel durum - hangisi daha kritikse onu göster
                  const criticalStatus = 
                    (trafficDaysRemaining !== null && trafficDaysRemaining < 0) || 
                    (kaskoDaysRemaining !== null && kaskoDaysRemaining < 0)
                      ? 'Acil!' :
                    (trafficDaysRemaining !== null && trafficDaysRemaining <= 30) || 
                    (kaskoDaysRemaining !== null && kaskoDaysRemaining <= 30)
                      ? 'Uyarı' :
                    (trafficDaysRemaining === null && kaskoDaysRemaining === null)
                      ? 'Bilgi Yok' :
                    'Normal';
                  
                  const criticalColor = 
                    criticalStatus === 'Acil!' ? 'error' :
                    criticalStatus === 'Uyarı' ? 'warning' :
                    criticalStatus === 'Bilgi Yok' ? 'default' :
                    'success';
                  
                  return (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>
                            {vehicle.licensePlate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {vehicle.trafficInsuranceStart ? (
                          <Typography variant="body2">
                            {new Date(vehicle.trafficInsuranceStart).toLocaleDateString('tr-TR')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {vehicle.trafficInsuranceEnd ? (
                            <>
                              <Typography variant="body2" fontWeight={600}>
                                {new Date(vehicle.trafficInsuranceEnd).toLocaleDateString('tr-TR')}
                              </Typography>
                              <Chip 
                                label={trafficStatus}
                                size="small"
                                color={trafficColor as any}
                                sx={{ mt: 0.5, fontWeight: 600 }}
                              />
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {vehicle.kaskoInsuranceStart ? (
                          <Typography variant="body2">
                            {new Date(vehicle.kaskoInsuranceStart).toLocaleDateString('tr-TR')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {vehicle.kaskoInsuranceEnd ? (
                            <>
                              <Typography variant="body2" fontWeight={600}>
                                {new Date(vehicle.kaskoInsuranceEnd).toLocaleDateString('tr-TR')}
                              </Typography>
                              <Chip 
                                label={kaskoStatus}
                                size="small"
                                color={kaskoColor as any}
                                sx={{ mt: 0.5, fontWeight: 600 }}
                              />
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={criticalStatus}
                          size="small"
                          color={criticalColor as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Henüz araç kaydı bulunmuyor
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default VehicleStatistics;