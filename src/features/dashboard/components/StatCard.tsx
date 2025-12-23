import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import type { ElementType } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  iconComponent: ElementType;
  color: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  iconComponent: IconComponent, 
  color, 
  description 
}) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        boxShadow: '0 3px 25px rgba(0,0,0,0.08)',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Kart üst kısmı - Gradient arka plan ve ikon */}
      <Box 
        sx={{ 
          background: `linear-gradient(45deg, ${color} 0%, ${color}99 100%)`,
          p: 3,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              textShadow: '0 2px 5px rgba(0,0,0,0.1)',
              mb: 0.5 
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            sx={{ opacity: 0.9 }}
          >
            {title}
          </Typography>
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          <IconComponent />
        </Avatar>
      </Box>
      
      {/* Kart alt kısmı - Sadece açıklama, trend kısmını kaldırdık */}
      {description && (
        <CardContent sx={{ 
          p: 2.5, 
          bgcolor: 'white',
          flexGrow: 1
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            {description}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default StatCard;