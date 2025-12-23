import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import type { PaymentSummary } from '../types/types';

interface OverdueSummaryCardsProps {
  summary: PaymentSummary;
}

const OverdueSummaryCards: React.FC<OverdueSummaryCardsProps> = ({ summary }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
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
      
      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
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
      
      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
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
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Geciken Tutar
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="error.main">
            {summary.totalOverdueAmount.toLocaleString('tr-TR')} ₺
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
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
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Yaklaşan Ödemeler
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="warning.main">
            {summary.totalUpcomingAmount.toLocaleString('tr-TR')} ₺
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              bgcolor: 'info.main', 
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AccountBalanceIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Toplam Alacak
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="info.main">
            {summary.totalRemainingAmount.toLocaleString('tr-TR')} ₺
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OverdueSummaryCards;
