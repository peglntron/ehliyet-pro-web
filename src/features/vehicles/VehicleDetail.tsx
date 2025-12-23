import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  LocalGasStation as GasIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleAPI } from '../../api/vehicles';
import type { Vehicle } from '../../api/vehicles';
import AssignVehicleModal from './components/AssignVehicleModal';
import UnassignVehicleModal from './components/UnassignVehicleModal';
import AddServiceModal from './components/AddServiceModal';
import AddFuelModal from './components/AddFuelModal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const VehicleDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await vehicleAPI.getById(id);
      setVehicle(data);
    } catch (error) {
      console.error('Araç yüklenirken hata:', error);
      showSnackbar('Araç bilgileri yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAssign = async (data: { instructorId: string; assignedKm?: number; assignedNotes?: string }) => {
    if (!id) return;
    try {
      await vehicleAPI.assign(id, data);
      showSnackbar('Araç başarıyla zimmete verildi', 'success');
      loadVehicle();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Zimmet işlemi başarısız', 'error');
      throw error;
    }
  };

  const handleUnassign = async (data: { returnedKm?: number; returnedNotes?: string }) => {
    if (!id) return;
    try {
      await vehicleAPI.unassign(id, data);
      showSnackbar('Zimmet başarıyla kaldırıldı', 'success');
      loadVehicle();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Zimmet kaldırma işlemi başarısız', 'error');
      throw error;
    }
  };

  const handleAddService = async (data: any) => {
    if (!id) return;
    try {
      await vehicleAPI.addService(id, data);
      showSnackbar('Servis kaydı başarıyla eklendi', 'success');
      loadVehicle();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Servis kaydı eklenemedi', 'error');
      throw error;
    }
  };

  const handleAddFuel = async (data: any) => {
    if (!id) return;
    try {
      await vehicleAPI.addFuel(id, data);
      showSnackbar('Yakıt kaydı başarıyla eklendi', 'success');
      loadVehicle();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Yakıt kaydı eklenemedi', 'error');
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'MAINTENANCE': return 'warning';
      case 'REPAIR': return 'warning';
      case 'INACTIVE': return 'error';
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

  const getFuelTypeText = (type: string) => {
    switch (type) {
      case 'DIESEL': return 'Dizel';
      case 'GASOLINE': return 'Benzin';
      case 'HYBRID': return 'Hibrit';
      case 'ELECTRIC': return 'Elektrik';
      case 'LPG': return 'LPG';
      default: return type;
    }
  };

  const getServiceTypeText = (type: string) => {
    switch (type) {
      case 'PERIODIC': return 'Periyodik Bakım';
      case 'REPAIR': return 'Tamir';
      case 'ACCIDENT': return 'Kaza Onarımı';
      case 'TIRE_CHANGE': return 'Lastik Değişimi';
      case 'OIL_CHANGE': return 'Yağ Değişimi';
      case 'BRAKE_SERVICE': return 'Fren Servisi';
      case 'INSPECTION': return 'Muayene';
      case 'OTHER': return 'Diğer';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!vehicle) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Araç bulunamadı</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/vehicles')} sx={{ mt: 2 }}>
          Araçlar Listesine Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/vehicles')}>
            Geri
          </Button>
          <Typography variant="h4">{vehicle.licensePlate}</Typography>
          <Chip label={getStatusText(vehicle.status)} color={getStatusColor(vehicle.status)} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/vehicles/edit/${id}`)}
          >
            Düzenle
          </Button>
          {vehicle.status === 'AVAILABLE' && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => setAssignModalOpen(true)}
            >
              Zimmetle
            </Button>
          )}
          {vehicle.status === 'ASSIGNED' && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<CancelIcon />}
              onClick={() => setUnassignModalOpen(true)}
            >
              Zimmeti Kaldır
            </Button>
          )}
        </Box>
      </Box>

      {/* Temel Bilgiler */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Araç Bilgileri</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Marka</Typography>
                  <Typography variant="body1">{vehicle.brand}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Model</Typography>
                  <Typography variant="body1">{vehicle.model}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Yıl</Typography>
                  <Typography variant="body1">{vehicle.year}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Renk</Typography>
                  <Typography variant="body1">{vehicle.color || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Vites</Typography>
                  <Typography variant="body1">{vehicle.transmissionType === 'MANUAL' ? 'Manuel' : 'Otomatik'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Yakıt Tipi</Typography>
                  <Typography variant="body1">{getFuelTypeText(vehicle.fuelType)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Kilometre & Zimmet Bilgisi</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Güncel KM</Typography>
                  <Typography variant="h5" color="primary">{vehicle.currentKm.toLocaleString('tr-TR')} km</Typography>
                </Grid>
                {vehicle.currentInstructor && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Zimmetli Eğitmen</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PersonIcon color="info" />
                      <Typography variant="body1">
                        {vehicle.currentInstructor.firstName} {vehicle.currentInstructor.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {vehicle.currentInstructor.phone}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Sigorta Bilgileri" />
          <Tab label="Zimmet Geçmişi" />
          <Tab label="Servis Kayıtları" />
          <Tab label="Yakıt Kayıtları" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Sigorta & Muayene Bilgileri</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Trafik Sigortası
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Başlangıç Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.trafficInsuranceStart 
                          ? new Date(vehicle.trafficInsuranceStart).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Bitiş Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.trafficInsuranceEnd 
                          ? new Date(vehicle.trafficInsuranceEnd).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    {vehicle.trafficInsuranceEnd && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1,
                          bgcolor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#ffebee';
                            if (diffDays < 30) return '#fff3e0';
                            return '#e8f5e9';
                          })(),
                          border: '1px solid',
                          borderColor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#f44336';
                            if (diffDays < 30) return '#ff9800';
                            return '#4caf50';
                          })(),
                        }}>
                          <Typography variant="body2" fontWeight="600" color={(() => {
                            const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return 'error.dark';
                            if (diffDays < 30) return 'warning.dark';
                            return 'success.dark';
                          })()}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Süresi dolmuş!';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün kaldı`;
                              return `✓ Geçerli (${diffDays} gün kaldı)`;
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Kasko Sigortası
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Başlangıç Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.kaskoInsuranceStart 
                          ? new Date(vehicle.kaskoInsuranceStart).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Bitiş Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.kaskoInsuranceEnd 
                          ? new Date(vehicle.kaskoInsuranceEnd).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    {vehicle.kaskoInsuranceEnd && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1,
                          bgcolor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#ffebee';
                            if (diffDays < 30) return '#fff3e0';
                            return '#e8f5e9';
                          })(),
                          border: '1px solid',
                          borderColor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#f44336';
                            if (diffDays < 30) return '#ff9800';
                            return '#4caf50';
                          })(),
                        }}>
                          <Typography variant="body2" fontWeight="600" color={(() => {
                            const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return 'error.dark';
                            if (diffDays < 30) return 'warning.dark';
                            return 'success.dark';
                          })()}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Süresi dolmuş!';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün kaldı`;
                              return `✓ Geçerli (${diffDays} gün kaldı)`;
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Araç Muayenesi
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Başlangıç Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.inspectionStart 
                          ? new Date(vehicle.inspectionStart).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Bitiş Tarihi</Typography>
                      <Typography variant="body1">
                        {vehicle.inspectionEnd 
                          ? new Date(vehicle.inspectionEnd).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Grid>
                    {vehicle.inspectionEnd && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1,
                          bgcolor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#ffebee';
                            if (diffDays < 30) return '#fff3e0';
                            return '#e8f5e9';
                          })(),
                          border: '1px solid',
                          borderColor: (() => {
                            const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return '#f44336';
                            if (diffDays < 30) return '#ff9800';
                            return '#4caf50';
                          })(),
                        }}>
                          <Typography variant="body2" fontWeight="600" color={(() => {
                            const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) return 'error.dark';
                            if (diffDays < 30) return 'warning.dark';
                            return 'success.dark';
                          })()}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Süresi dolmuş!';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün kaldı`;
                              return `✓ Geçerli (${diffDays} gün kaldı)`;
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Zimmet Geçmişi</Typography>
          </Box>
          {vehicle.assignmentHistory && vehicle.assignmentHistory.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Eğitmen</TableCell>
                    <TableCell>Teslim Tarihi</TableCell>
                    <TableCell>Teslim KM</TableCell>
                    <TableCell>İade Tarihi</TableCell>
                    <TableCell>İade KM</TableCell>
                    <TableCell>Toplam KM</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicle.assignmentHistory.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {assignment.instructor?.firstName} {assignment.instructor?.lastName}
                      </TableCell>
                      <TableCell>{new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{assignment.assignedKm?.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        {assignment.returnedDate ? new Date(assignment.returnedDate).toLocaleDateString('tr-TR') : '-'}
                      </TableCell>
                      <TableCell>{assignment.returnedKm?.toLocaleString('tr-TR') || '-'}</TableCell>
                      <TableCell>{assignment.totalKm?.toLocaleString('tr-TR') || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.isActive ? 'Aktif' : 'Tamamlandı'}
                          color={assignment.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">Henüz zimmet kaydı bulunmamaktadır.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Servis Kayıtları</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<BuildIcon />}
              onClick={() => setServiceModalOpen(true)}
            >
              Servis Ekle
            </Button>
          </Box>
          {vehicle.serviceRecords && vehicle.serviceRecords.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell>KM</TableCell>
                    <TableCell>Maliyet</TableCell>
                    <TableCell>Servis Yeri</TableCell>
                    <TableCell>Açıklama</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicle.serviceRecords.map((service: any) => (
                    <TableRow key={service.id}>
                      <TableCell>{new Date(service.serviceDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{getServiceTypeText(service.serviceType)}</TableCell>
                      <TableCell>{service.serviceKm?.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{service.cost ? `${service.cost.toLocaleString('tr-TR')} ₺` : '-'}</TableCell>
                      <TableCell>{service.serviceProvider || '-'}</TableCell>
                      <TableCell>{service.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">Henüz servis kaydı bulunmamaktadır.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Yakıt Kayıtları</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<GasIcon />}
              onClick={() => setFuelModalOpen(true)}
            >
              Yakıt Ekle
            </Button>
          </Box>
          {vehicle.fuelRecords && vehicle.fuelRecords.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>KM</TableCell>
                    <TableCell>Litre</TableCell>
                    <TableCell>Birim Fiyat</TableCell>
                    <TableCell>Toplam</TableCell>
                    <TableCell>Tüketim (km/lt)</TableCell>
                    <TableCell>İstasyon</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicle.fuelRecords.map((fuel: any) => (
                    <TableRow key={fuel.id}>
                      <TableCell>{new Date(fuel.fuelDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{fuel.currentKm?.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{fuel.liters ? Number(fuel.liters).toFixed(2) : '-'} L</TableCell>
                      <TableCell>{fuel.pricePerLiter ? `${Number(fuel.pricePerLiter).toFixed(2)} ₺` : '-'}</TableCell>
                      <TableCell>{fuel.cost ? `${Number(fuel.cost).toFixed(2)} ₺` : '-'}</TableCell>
                      <TableCell>{fuel.consumption ? Number(fuel.consumption).toFixed(2) : '-'}</TableCell>
                      <TableCell>{fuel.station || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">Henüz yakıt kaydı bulunmamaktadır.</Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Modals */}
      <AssignVehicleModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
        currentKm={vehicle.currentKm}
      />

      <UnassignVehicleModal
        open={unassignModalOpen}
        onClose={() => setUnassignModalOpen(false)}
        onUnassign={handleUnassign}
        currentKm={vehicle.currentKm}
        currentInstructor={vehicle.currentInstructor}
      />

      <AddServiceModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onAdd={handleAddService}
        currentKm={vehicle.currentKm}
      />

      <AddFuelModal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        onAdd={handleAddFuel}
        currentKm={vehicle.currentKm}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehicleDetail;
