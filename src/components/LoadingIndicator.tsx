import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullHeight?: boolean;
  showBackground?: boolean;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = 'Yükleniyor...',
  size = 'medium',
  fullHeight = false,
  showBackground = true,
  fullScreen = false
}) => {
  // Boyut değerlerini belirle
  const spinnerSizes = {
    small: 24,
    medium: 40,
    large: 56
  };
  
  // İçerik bileşeni
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: showBackground ? 4 : 2,
        borderRadius: 2,
        height: fullHeight ? '100%' : 'auto',
        width: fullScreen ? '100%' : 'auto'
      }}
    >
      <CircularProgress 
        size={spinnerSizes[size]} 
        sx={{ 
          mb: 2, 
          color: 'primary.main' 
        }} 
      />
      
      {text && (
        <Typography 
          variant={size === 'small' ? 'body2' : 'body1'} 
          color="text.secondary"
          fontWeight={500}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  // Arka planın varlığına göre bileşeni sarmala
  return fullScreen ? (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}
    >
      {showBackground ? (
        <Paper 
          elevation={4} 
          sx={{ borderRadius: 2 }}
        >
          {content}
        </Paper>
      ) : (
        content
      )}
    </Box>
  ) : showBackground ? (
    <Paper 
      elevation={1} 
      sx={{ 
        borderRadius: 2,
        height: fullHeight ? '100%' : 'auto'
      }}
    >
      {content}
    </Paper>
  ) : (
    content
  );
};

export default LoadingIndicator;
