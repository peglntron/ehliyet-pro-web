import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import type { PaymentSummary } from '../types/types';

interface OverdueSummaryCardsProps {
  summary: PaymentSummary;
}

const OverdueSummaryCards: React.FC<OverdueSummaryCardsProps> = ({ summary }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ 
          p: 2.5, 
          borderRadius: 2, 
          height: '100%',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'primary.main', 
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Borçlu Öğrenci
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {summary.totalStudents}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ 
          p: 2.5, 
          borderRadius: 2, 
          height: '100%',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'error.main', 
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WarningIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Geciken Ödeme
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="error.main">
            {summary.overdueStudents}
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ 
          p: 2.5, 
          borderRadius: 2, 
          height: '100%',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'error.main', 
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
              Geciken Kalan Borç
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="error.main">
            {summary.totalOverdueAmount.toLocaleString('tr-TR')} ₺
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Vadesi geçmiş tutar
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ 
          p: 2.5, 
          borderRadius: 2, 
          height: '100%',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'warning.main', 
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ScheduleIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
              Yaklaşan Ödemeler
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="warning.main">
            {summary.totalUpcomingAmount.toLocaleString('tr-TR')} ₺
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            7 gün içinde vadesi
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OverdueSummaryCards;
