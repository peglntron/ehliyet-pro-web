import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../../api/vehicles';
import type { Vehicle, VehicleStats } from '../../api/vehicles';
import { useSnackbar } from '../../contexts/SnackbarContext';
import LoadingBackdrop from '../../components/LoadingBackdrop';

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

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'MAINTENANCE': return 'warning';
      case 'REPAIR': return 'error';
      case 'INACTIVE': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'ASSIGNED': return 'Zimmetli';
      case 'MAINTENANCE': return 'Bakımda';
      case 'REPAIR': return 'Tamirde';
      case 'INACTIVE': return 'Hizmet Dışı';
      default: return status;
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const getInsuranceStatus = (endDate?: string): { color: string; icon: React.ReactNode; label: string } => {
    if (!endDate) return { color: '#9e9e9e', icon: null, label: '-' };
    
    const today = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: '#f44336', icon: <WarningIcon />, label: 'Süresi Dolmuş' };
    } else if (diffDays < 30) {
      return { color: '#ff9800', icon: <WarningIcon />, label: `${diffDays} gün kaldı` };
    } else {
      return { color: '#4caf50', icon: <CheckCircleIcon />, label: formatDate(endDate) };
    }
  };

  const columns: GridColDef<Vehicle>[] = [
    {
      field: 'licensePlate',
      headerName: 'Plaka',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'brandModel',
      headerName: 'Marka/Model',
      width: 200,
      valueGetter: (_value, row) => `${row.brand} ${row.model}`,
    },
    {
      field: 'year',
      headerName: 'Yıl',
      width: 80,
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value as string)}
          color={getStatusColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'currentInstructor',
      headerName: 'Zimmet',
      width: 180,
      valueGetter: (_value, row) => {
        if (row.currentInstructor) {
          return `${row.currentInstructor.firstName} ${row.currentInstructor.lastName}`;
        }
        return '-';
      },
    },
    {
      field: 'trafficInsuranceEnd',
      headerName: 'Trafik Sig. Bitiş',
      width: 180,
      renderCell: (params) => {
        const status = getInsuranceStatus(params.value as string);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {status.icon && (
              <Box sx={{ color: status.color, display: 'flex', alignItems: 'center' }}>
                {status.icon}
              </Box>
            )}
            <Typography variant="body2" sx={{ color: status.color }}>
              {status.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'kaskoInsuranceEnd',
      headerName: 'Kasko Bitiş',
      width: 180,
      renderCell: (params) => {
        const status = getInsuranceStatus(params.value as string);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {status.icon && (
              <Box sx={{ color: status.color, display: 'flex', alignItems: 'center' }}>
                {status.icon}
              </Box>
            )}
            <Typography variant="body2" sx={{ color: status.color }}>
              {status.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Görüntüle">
            <IconButton
              size="small"
              onClick={() => navigate(`/vehicles/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton
              size="small"
              onClick={() => navigate(`/vehicles/${params.row.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'ASSIGNED' && (
            <Tooltip title="Zimmetle">
              <IconButton
                size="small"
                onClick={() => navigate(`/vehicles/${params.row.id}/assign`)}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Sil">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedVehicle(params.row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Araç Yönetimi</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles/new')}
        >
          Yeni Araç Ekle
        </Button>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Toplam Araç</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
            <Typography variant="h4">{stats.available}</Typography>
            <Typography variant="body2">Müsait</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
            <Typography variant="h4">{stats.assigned}</Typography>
            <Typography variant="body2">Zimmetli</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
            <Typography variant="h4">{stats.maintenance}</Typography>
            <Typography variant="body2">Bakımda</Typography>
          </Paper>
        </Box>
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
        />
      </Box>

      {/* Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredVehicles}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }}
        />
      </Paper>

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

      <LoadingBackdrop open={loading} message="Araçlar yükleniyor..." />
    </Box>
  );
};

export default VehicleList;
