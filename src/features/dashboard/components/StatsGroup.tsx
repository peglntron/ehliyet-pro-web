import React from 'react';
import { Box, Typography } from '@mui/material';
import StatCard from './StatCard';
import type { StatItem } from '../types/types';

interface StatsGroupProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const StatsGroup: React.FC<StatsGroupProps> = ({ 
  title, 
  subtitle, 
  stats,
  columns = { xs: 1, sm: 2, md: 3, lg: 5 }
}) => {
  return (
    <Box mb={4}>
      {/* Grup Başlığı */}
      <Box mb={2}>
        <Typography 
          variant="h6" 
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* İstatistik Kartları Grid */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: `repeat(${columns.xs}, 1fr)`,
            sm: `repeat(${columns.sm}, 1fr)`,
            md: `repeat(${columns.md}, 1fr)`,
            lg: `repeat(${columns.lg}, 1fr)`
          },
          gap: 3
        }}
      >
        {stats.map(stat => (
          <Box key={stat.id}>
            <StatCard
              title={stat.title}
              value={stat.value}
              iconComponent={stat.iconComponent}
              color={stat.color}
              description={stat.description}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StatsGroup;
