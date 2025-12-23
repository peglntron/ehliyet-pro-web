import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DirectionsCar,
  Person,
  Timeline,
  CheckCircle,
  Schedule,
  Speed
} from '@mui/icons-material';
import { vehicleAPI } from '../api/vehicles';
import type { AssignmentStats } from '../api/vehicles';

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
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VehicleAssignmentStats: React.FC = () => {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleAPI.getAssignmentStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading assignment stats:', err);
      setError(err.response?.data?.message || 'İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (!stats) {
    return (
      <Box p={3}>
        <Alert severity="info">İstatistik verisi bulunamadı</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Başlık */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Zimmet İstatistikleri
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Araç zimmet kayıtları ve kullanım istatistikleri
        </Typography>
      </Box>

      {/* Özet Kartlar */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Toplam Zimmet
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.totalAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Aktif Zimmet
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.activeAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Tamamlanan
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.completedAssignments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Speed color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Toplam KM
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.summary.totalKmDriven.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Eğitmen Sayısı
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.uniqueInstructors}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DirectionsCar color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Araç Sayısı
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.uniqueVehicles}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timeline color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Toplam Gün
                </Typography>
              </Box>
              <Typography variant="h4">{stats.summary.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Speed color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Ort. KM/Gün
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.summary.totalDays > 0
                  ? Math.round(stats.summary.totalKmDriven / stats.summary.totalDays)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detaylı İstatistikler - Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Eğitmen Bazlı" />
          <Tab label="Araç Bazlı" />
        </Tabs>

        {/* Eğitmen Bazlı İstatistikler */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Eğitmen</TableCell>
                  <TableCell align="center">Aktif</TableCell>
                  <TableCell align="center">Tamamlanan</TableCell>
                  <TableCell align="right">Toplam KM</TableCell>
                  <TableCell align="right">Toplam Gün</TableCell>
                  <TableCell align="right">Ort. KM/Gün</TableCell>
                  <TableCell align="center">Araç Sayısı</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.byInstructor.map((item) => (
                  <TableRow key={item.instructor.id}>
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
                {stats.byInstructor.length === 0 && (
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
        </TabPanel>

        {/* Araç Bazlı İstatistikler */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Araç</TableCell>
                  <TableCell align="center">Zimmet Sayısı</TableCell>
                  <TableCell align="center">Aktif</TableCell>
                  <TableCell align="right">Toplam KM</TableCell>
                  <TableCell align="right">Toplam Gün</TableCell>
                  <TableCell align="center">Eğitmen Sayısı</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.byVehicle.map((item) => (
                  <TableRow key={item.vehicle.id}>
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
                {stats.byVehicle.length === 0 && (
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
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default VehicleAssignmentStats;
