import React from 'react';
import { Backdrop, CircularProgress, Typography } from '@mui/material';

interface LoadingBackdropProps {
  open: boolean;
  message?: string;
  subtitle?: string;
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ 
  open, 
  message = 'İşlem yapılıyor...', 
  subtitle = 'Lütfen bekleyin' 
}) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        gap: 2
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
      <Typography variant="body2" color="rgba(255,255,255,0.8)">
        {subtitle}
      </Typography>
    </Backdrop>
  );
};

export default LoadingBackdrop;
