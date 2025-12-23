import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../../api/vehicles';
import type { Vehicle, VehicleStats } from '../../api/vehicles';
import { useSnackbar } from '../../contexts/SnackbarContext';
import VehicleListItem from './VehicleListItem';

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      showSnackbar('Araçlar yüklenirken hata oluştu', 'error');
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

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    
    try {
      setDeleting(true);
      await vehicleAPI.delete(selectedVehicle.id);
      showSnackbar('Araç başarıyla silindi', 'success');
      loadVehicles();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Araç silinirken hata oluştu', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Araç Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles/new')}
          sx={{ borderRadius: 2 }}
        >
          Yeni Araç Ekle
        </Button>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Toplam Araç</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.dark">{stats.available}</Typography>
              <Typography variant="body2" color="success.dark">Müsait</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="info.dark">{stats.assigned}</Typography>
              <Typography variant="body2" color="info.dark">Zimmetli</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="warning.dark">{stats.maintenance}</Typography>
              <Typography variant="body2" color="warning.dark">Bakımda</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Search */}
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
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Vehicle Cards Grid */}
      {filteredVehicles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz araç kaydı bulunmuyor'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredVehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
              <VehicleListItem vehicle={vehicle} onDelete={handleDeleteClick} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Aracı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedVehicle?.licensePlate}</strong> plakalı aracı silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            İptal
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleList;
