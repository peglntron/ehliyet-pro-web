import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: 'bar' | 'line' | 'donut' | 'area' | 'radialBar';
  series: any[];
  options: ApexOptions;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type,
  series,
  options,
  height = 350
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chart Başlığı */}
      <Box mb={2}>
        <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: height }}>
        <Chart
          options={options}
          series={series}
          type={type}
          height={height}
        />
      </Box>
    </Paper>
  );
};

export default ChartCard;
