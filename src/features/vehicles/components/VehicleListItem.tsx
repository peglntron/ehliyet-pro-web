import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { Vehicle } from '../types/types';

interface VehicleListItemProps {
  vehicle: Vehicle;
  onClick: () => void;
  getStatusInfo: (status: string) => { color: any; text: string };
}

const VehicleListItem: React.FC<VehicleListItemProps> = ({ 
  vehicle, 
  onClick,
  getStatusInfo 
}) => {
  const statusInfo = getStatusInfo(vehicle.status);
  
  // Formatlı kilometre
  const formatKm = (km: number): string => {
    return new Intl.NumberFormat('tr-TR').format(km);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 3,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
      onClick={onClick}
    >
      {/* Plaka */}
      <Box sx={{ width: '20%' }}>
        <Typography variant="subtitle1" fontWeight={600} color="primary.main">
          {vehicle.licensePlate}
        </Typography>
      </Box>
      
      {/* Marka/Model */}
      <Box sx={{ width: '25%' }}>
        <Typography variant="body1" fontWeight={600}>
          {vehicle.brand} {vehicle.model}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {vehicle.year} Model
        </Typography>
      </Box>
      
      {/* Kilometre */}
      <Box sx={{ width: '15%' }}>
        <Typography variant="body1" fontWeight={600}>
          {formatKm(vehicle.currentKm)} km
        </Typography>
      </Box>
      
      {/* Durum */}
      <Box sx={{ width: '15%' }}>
        <Chip 
          label={statusInfo.text} 
          color={statusInfo.color} 
          size="small" 
          sx={{ borderRadius: 1, fontWeight: 600 }}
        />
      </Box>
      
      {/* Zimmetli Eğitmen */}
      <Box sx={{ width: '25%' }}>
        {vehicle.assignedInstructorName ? (
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {vehicle.assignedInstructorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {vehicle.assignmentDate && new Intl.DateTimeFormat('tr-TR').format(new Date(vehicle.assignmentDate))} tarihinden beri
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Zimmetli değil
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VehicleListItem;