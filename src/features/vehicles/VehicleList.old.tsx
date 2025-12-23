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
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsCar as CarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../../api/vehicles';
import type { Vehicle, VehicleStats } from '../../api/vehicles';

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vehicle: Vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    
    if (window.confirm(`${selectedVehicle.licensePlate} plakalı aracı silmek istediğinizden emin misiniz?`)) {
      try {
        await vehicleAPI.delete(selectedVehicle.id);
        loadVehicles();
        handleMenuClose();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Araç silinirken bir hata oluştu');
      }
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
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2">Toplam Araç</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckCircleIcon />
                <Typography variant="h4">{stats.available}</Typography>
              </Box>
              <Typography variant="body2">Müsait</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <AssignmentIcon />
                <Typography variant="h4">{stats.assigned}</Typography>
              </Box>
              <Typography variant="body2">Zimmetli</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <BuildIcon />
                <Typography variant="h4">{stats.maintenance}</Typography>
              </Box>
              <Typography variant="body2">Bakımda</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CancelIcon />
                <Typography variant="h4">{stats.outOfService}</Typography>
              </Box>
              <Typography variant="body2">Hizmet Dışı</Typography>
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
            <Card>
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
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, vehicle)}
                  >
                    <MoreVertIcon />
                  </IconButton>
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
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    fullWidth
                  >
                    Detay
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/vehicles/${selectedVehicle?.id}`);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/vehicles/${selectedVehicle?.id}/assign`);
          handleMenuClose();
        }}>
          <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
          Zimmetle
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VehicleList;
