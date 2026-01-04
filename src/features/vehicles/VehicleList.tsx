import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsCar as CarIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../../api/vehicles';
import AssignVehicleModal from './components/AssignVehicleModal';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { Vehicle, VehicleStats } from '../../api/vehicles';

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Sigorta istatistikleri
  const [insuranceStats, setInsuranceStats] = useState({
    trafficExpiringSoon: 0,
    kaskoExpiringSoon: 0,
    inspectionExpiringSoon: 0
  });

  useEffect(() => {
    loadVehicles();
    loadStats();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, vehicles]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleAPI.getAll();
      setVehicles(data);
      setFilteredVehicles(data);
      
      // Sigorta istatistiklerini hesapla
      const now = new Date();
      let trafficCount = 0;
      let kaskoCount = 0;
      let inspectionCount = 0;
      
      data.forEach(vehicle => {
        if (vehicle.trafficInsuranceEnd) {
          const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 30) trafficCount++;
        }
        if (vehicle.kaskoInsuranceEnd) {
          const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 30) kaskoCount++;
        }
        if (vehicle.inspectionEnd) {
          const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 30) inspectionCount++;
        }
      });
      
      setInsuranceStats({
        trafficExpiringSoon: trafficCount,
        kaskoExpiringSoon: kaskoCount,
        inspectionExpiringSoon: inspectionCount
      });
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await vehicleAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const filterVehicles = () => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.licensePlate.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.currentInstructor?.firstName.toLowerCase().includes(query) ||
        vehicle.currentInstructor?.lastName.toLowerCase().includes(query)
    );
    setFilteredVehicles(filtered);
  };

  const handleAssign = async (data: { instructorId: string; assignedKm?: number; assignedNotes?: string }) => {
    if (!selectedVehicle) return;
    
    try {
      await vehicleAPI.assign(selectedVehicle.id, data);
      showSnackbar('Araç başarıyla zimmetlendi!', 'success');
      loadVehicles();
      loadStats();
      setAssignModalOpen(false);
      setSelectedVehicle(null);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Zimmetleme sırasında bir hata oluştu', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'ASSIGNED':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'REPAIR':
        return 'warning';
      case 'INACTIVE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Müsait';
      case 'ASSIGNED':
        return 'Zimmetli';
      case 'MAINTENANCE':
        return 'Bakımda';
      case 'REPAIR':
        return 'Tamirde';
      case 'INACTIVE':
        return 'Hizmet Dışı';
      default:
        return status;
    }
  };

  const getTransmissionText = (type: string) => {
    return type === 'MANUAL' ? 'Manuel' : 'Otomatik';
  };

  const getFuelTypeText = (type: string) => {
    switch (type) {
      case 'DIESEL':
        return 'Dizel';
      case 'GASOLINE':
      case 'PETROL':
        return 'Benzin';
      case 'HYBRID':
        return 'Hibrit';
      case 'ELECTRIC':
        return 'Elektrik';
      case 'LPG':
        return 'LPG';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Araç Yönetimi</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles/add')}
        >
          Yeni Araç Ekle
        </Button>
      </Box>

      {/* İstatistik Kartları */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2">Toplam</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckCircleIcon />
                <Typography variant="h4">{stats.available}</Typography>
              </Box>
              <Typography variant="body2">Müsait</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <AssignmentIcon />
                <Typography variant="h4">{stats.assigned}</Typography>
              </Box>
              <Typography variant="body2">Zimmetli</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <BuildIcon />
                <Typography variant="h4">{stats.maintenance}</Typography>
              </Box>
              <Typography variant="body2">Bakımda</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'orange', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography variant="h4">{insuranceStats.trafficExpiringSoon}</Typography>
              </Box>
              <Typography variant="body2" fontSize="0.75rem">Trafik ≤30g</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.7}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ff6f00', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography variant="h4">{insuranceStats.kaskoExpiringSoon}</Typography>
              </Box>
              <Typography variant="body2" fontSize="0.75rem">Kasko ≤30g</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={1.8}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#d84315', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography variant="h4">{insuranceStats.inspectionExpiringSoon}</Typography>
              </Box>
              <Typography variant="body2" fontSize="0.75rem">Muayene ≤30g</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Arama */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Plaka, marka, model veya eğitmen adı ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredVehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{vehicle.licensePlate}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.brand} {vehicle.model}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getStatusText(vehicle.status)}
                    color={getStatusColor(vehicle.status)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`${vehicle.year}`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Vites:</strong> {getTransmissionText(vehicle.transmissionType)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Yakıt:</strong> {getFuelTypeText(vehicle.fuelType)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>KM:</strong> {vehicle.currentKm.toLocaleString('tr-TR')}
                  </Typography>
                  {vehicle.currentInstructor && (
                    <Typography variant="body2" color="info.main">
                      <strong>Zimmetli:</strong> {vehicle.currentInstructor.firstName} {vehicle.currentInstructor.lastName}
                    </Typography>
                  )}
                  
                  {/* Sigorta & Muayene Bilgileri */}
                  {(vehicle.trafficInsuranceEnd || vehicle.kaskoInsuranceEnd || vehicle.inspectionEnd) && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      {vehicle.trafficInsuranceEnd && (
                        <Typography variant="body2" fontSize="0.75rem">
                          <strong>Trafik:</strong>{' '}
                          <Box component="span" sx={{ 
                            color: (() => {
                              const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return 'error.main';
                              if (diffDays < 30) return 'warning.main';
                              return 'success.main';
                            })()
                          }}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.trafficInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Dolmuş';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün`;
                              return `✓ ${new Date(vehicle.trafficInsuranceEnd).toLocaleDateString('tr-TR')}`;
                            })()}
                          </Box>
                        </Typography>
                      )}
                      {vehicle.kaskoInsuranceEnd && (
                        <Typography variant="body2" fontSize="0.75rem">
                          <strong>Kasko:</strong>{' '}
                          <Box component="span" sx={{ 
                            color: (() => {
                              const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return 'error.main';
                              if (diffDays < 30) return 'warning.main';
                              return 'success.main';
                            })()
                          }}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.kaskoInsuranceEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Dolmuş';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün`;
                              return `✓ ${new Date(vehicle.kaskoInsuranceEnd).toLocaleDateString('tr-TR')}`;
                            })()}
                          </Box>
                        </Typography>
                      )}
                      {vehicle.inspectionEnd && (
                        <Typography variant="body2" fontSize="0.75rem">
                          <strong>Muayene:</strong>{' '}
                          <Box component="span" sx={{ 
                            color: (() => {
                              const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return 'error.main';
                              if (diffDays < 30) return 'warning.main';
                              return 'success.main';
                            })()
                          }}>
                            {(() => {
                              const diffDays = Math.ceil((new Date(vehicle.inspectionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return '⚠️ Dolmuş';
                              if (diffDays < 30) return `⚠️ ${diffDays} gün`;
                              return `✓ ${new Date(vehicle.inspectionEnd).toLocaleDateString('tr-TR')}`;
                            })()}
                          </Box>
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Zimmet Modal */}
      {selectedVehicle && (
        <AssignVehicleModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedVehicle(null);
          }}
          onAssign={handleAssign}
          currentKm={selectedVehicle.currentKm}
        />
      )}
    </Box>
  );
};

export default VehicleList;
