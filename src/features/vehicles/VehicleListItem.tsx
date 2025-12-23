import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Vehicle } from '../../api/vehicles';

interface VehicleListItemProps {
  vehicle: Vehicle;
  onDelete: (vehicle: Vehicle) => void;
}

const VehicleListItem: React.FC<VehicleListItemProps> = ({ vehicle, onDelete }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'ASSIGNED': return 'Zimmetli';
      case 'MAINTENANCE': return 'Bakımda';
      case 'REPAIR': return 'Tamirde';
      case 'INACTIVE': return 'Hizmet Dışı';
      default: return status;
    }
  };

  const getTransmissionText = (type: string): string => {
    return type === 'MANUAL' ? 'Manuel' : 'Otomatik';
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR');
  };

  const getInsuranceStatus = (endDate?: string): { 
    color: string; 
    icon: React.ReactNode; 
    label: string;
    isWarning: boolean;
  } => {
    if (!endDate) return { color: '#9e9e9e', icon: null, label: '-', isWarning: false };
    
    const today = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        color: '#f44336', 
        icon: <WarningIcon sx={{ fontSize: 16 }} />, 
        label: 'Süresi Dolmuş',
        isWarning: true
      };
    } else if (diffDays < 30) {
      return { 
        color: '#ff9800', 
        icon: <WarningIcon sx={{ fontSize: 16 }} />, 
        label: `${diffDays} gün kaldı`,
        isWarning: true
      };
    } else {
      return { 
        color: '#4caf50', 
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, 
        label: formatDate(endDate),
        isWarning: false
      };
    }
  };

  const trafficStatus = getInsuranceStatus(vehicle.trafficInsuranceEnd);
  const kaskoStatus = getInsuranceStatus(vehicle.kaskoInsuranceEnd);
  const inspectionStatus = getInsuranceStatus(vehicle.inspectionEnd);
  const hasInsuranceWarning = trafficStatus.isWarning || kaskoStatus.isWarning || inspectionStatus.isWarning;

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s',
        border: hasInsuranceWarning ? '2px solid #ff9800' : '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <CarIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {vehicle.licensePlate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Details */}
        <Stack spacing={1.5}>
          {/* Status & Transmission */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={getStatusText(vehicle.status)}
              color={getStatusColor(vehicle.status)}
              size="small"
            />
            <Chip
              label={getTransmissionText(vehicle.transmissionType)}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${vehicle.currentKm.toLocaleString('tr-TR')} km`}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Instructor Assignment */}
          {vehicle.currentInstructor && (
            <Box sx={{ 
              bgcolor: 'info.lighter', 
              p: 1.5, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.light'
            }}>
              <Typography variant="caption" color="info.dark" fontWeight="600">
                Zimmetli Eğitmen
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {vehicle.currentInstructor.firstName} {vehicle.currentInstructor.lastName}
              </Typography>
            </Box>
          )}

          {/* Insurance Information */}
          {(vehicle.trafficInsuranceEnd || vehicle.kaskoInsuranceEnd || vehicle.inspectionEnd) && (
            <Box sx={{ 
              bgcolor: hasInsuranceWarning ? '#fff3e0' : '#f1f5f9',
              p: 1.5, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: hasInsuranceWarning ? '#ffb74d' : '#e2e8f0'
            }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ display: 'block', mb: 1 }}>
                Sigorta & Muayene Bilgileri
              </Typography>
              
              {vehicle.trafficInsuranceEnd && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontSize="0.8rem">
                    Trafik Sigortası:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trafficStatus.icon && (
                      <Box sx={{ color: trafficStatus.color, display: 'flex', alignItems: 'center' }}>
                        {trafficStatus.icon}
                      </Box>
                    )}
                    <Typography variant="body2" fontSize="0.8rem" sx={{ color: trafficStatus.color, fontWeight: 600 }}>
                      {trafficStatus.label}
                    </Typography>
                  </Box>
                </Box>
              )}

              {vehicle.kaskoInsuranceEnd && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontSize="0.8rem">
                    Kasko:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {kaskoStatus.icon && (
                      <Box sx={{ color: kaskoStatus.color, display: 'flex', alignItems: 'center' }}>
                        {kaskoStatus.icon}
                      </Box>
                    )}
                    <Typography variant="body2" fontSize="0.8rem" sx={{ color: kaskoStatus.color, fontWeight: 600 }}>
                      {kaskoStatus.label}
                    </Typography>
                  </Box>
                </Box>
              )}

              {vehicle.inspectionEnd && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontSize="0.8rem">
                    Araç Muayenesi:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {inspectionStatus.icon && (
                      <Box sx={{ color: inspectionStatus.color, display: 'flex', alignItems: 'center' }}>
                        {inspectionStatus.icon}
                      </Box>
                    )}
                    <Typography variant="body2" fontSize="0.8rem" sx={{ color: inspectionStatus.color, fontWeight: 600 }}>
                      {inspectionStatus.label}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Stack>

        {/* Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { navigate(`/vehicles/${vehicle.id}`); handleMenuClose(); }}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            Detaylar
          </MenuItem>
          <MenuItem onClick={() => { navigate(`/vehicles/${vehicle.id}/edit`); handleMenuClose(); }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Düzenle
          </MenuItem>
          {vehicle.status !== 'ASSIGNED' && (
            <MenuItem onClick={() => { navigate(`/vehicles/${vehicle.id}/assign`); handleMenuClose(); }}>
              <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
              Zimmetle
            </MenuItem>
          )}
          <MenuItem onClick={() => { onDelete(vehicle); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Sil
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default VehicleListItem;
