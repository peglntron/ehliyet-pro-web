import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getVehicles, assignVehicle, type Vehicle } from '../../../api/vehicles';

interface AssignedVehiclesProps {
  instructorId: string;
  instructorName: string;
}

const AssignedVehicles: React.FC<AssignedVehiclesProps> = ({ instructorId, instructorName }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [assignedKm, setAssignedKm] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const allVehicles = await getVehicles();
        const assignedVehicles = allVehicles.filter(v => v.currentInstructorId === instructorId);
        setVehicles(assignedVehicles);
      } catch (err) {
        console.error('Araçlar yüklenirken hata:', err);
        setError('Araç bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchVehicles();
    }
  }, [instructorId]);

  const handleOpenAssignModal = async () => {
    try {
      // Tüm araçları getir ve zimmetli olmayanları filtrele
      const allVehicles = await getVehicles();
      const available = allVehicles.filter(v => !v.currentInstructorId);
      setAvailableVehicles(available);
      setSelectedVehicleId('');
      setAssignedKm('');
      setAssignModalOpen(true);
    } catch (err) {
      console.error('Araçlar yüklenirken hata:', err);
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    // Seçilen aracın mevcut km'sini otomatik doldur
    const selectedVehicle = availableVehicles.find((v: any) => v.id === vehicleId);
    if (selectedVehicle) {
      setAssignedKm(selectedVehicle.currentKm.toString());
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicleId) return;

    try {
      setAssigning(true);
      const kmValue = assignedKm ? parseInt(assignedKm) : undefined;
      await assignVehicle(selectedVehicleId, instructorId, kmValue);
      
      // Listeyi yenile
      const allVehicles = await getVehicles();
      const assignedVehicles = allVehicles.filter(v => v.currentInstructorId === instructorId);
      setVehicles(assignedVehicles);
      
      setAssignModalOpen(false);
      setSelectedVehicleId('');
      setAssignedKm('');
    } catch (err) {
      console.error('Araç zimmetleme hatası:', err);
      alert('Araç zimmetlenirken bir hata oluştu');
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon color="primary" />
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Zimmetli Araçlar
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon color="primary" />
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Zimmetli Araçlar
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCarIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Zimmetli Araçlar
          </Typography>
          <Chip
            label={vehicles.length}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, ml: 1 }}
          />
        </Box>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAssignModal}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Araç Zimmetle
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {vehicles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <DirectionsCarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {instructorName} adlı eğitmene zimmetli araç bulunmuyor.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Plaka</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Marka/Model</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Yıl</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Kilometre</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Zimmet Tarihi</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>İşlem</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => {
                  // En son aktif zimmetin tarihini al
                  const activeAssignment = vehicle.assignmentHistory?.find(a => a.isActive);
                  const assignmentDate = activeAssignment?.assignedDate;
                  
                  return (
                    <TableRow 
                      key={vehicle.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{vehicle.licensePlate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{vehicle.brand} {vehicle.model}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{vehicle.year}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{vehicle.currentKm.toLocaleString()} km</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(assignmentDate)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Araç Detayını Görüntüle">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVehicleClick(vehicle.id);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Araç Zimmetleme Modal */}
      <Dialog 
        open={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {instructorName} için Araç Zimmetle
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {availableVehicles.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Zimmetlenebilecek müsait araç bulunmamaktadır.
              </Alert>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel>Araç Seçin *</InputLabel>
                  <Select
                    value={selectedVehicleId}
                    label="Araç Seçin *"
                    onChange={(e) => handleVehicleChange(e.target.value)}
                  >
                    {availableVehicles.map((vehicle: any) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Teslim KM *"
                  type="number"
                  value={assignedKm}
                  onChange={(e) => setAssignedKm(e.target.value)}
                  placeholder="Aracın teslim anındaki km değeri"
                  helperText="Araç seçildiğinde mevcut km otomatik gelir, düzenleyebilirsiniz"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => {
              setAssignModalOpen(false);
              setSelectedVehicleId('');
              setAssignedKm('');
            }}
            disabled={assigning}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignVehicle}
            disabled={!selectedVehicleId || !assignedKm || assigning}
          >
            {assigning ? 'Zimmetleniyor...' : 'Zimmetle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AssignedVehicles;