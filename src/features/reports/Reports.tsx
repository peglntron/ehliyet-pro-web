import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import InstructorStatistics from './components/InstructorStatistics';
import VehicleStatistics from './components/VehicleStatistics';
import CashReport from './components/CashReport';
import PerformanceAnalysis from './components/PerformanceAnalysis';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Rapor kartları bilgileri
  const reportCards = [
    {
      title: 'Eğitmen İstatistikleri',
      description: 'Eğitmenlerin başarı oranları ve performans analizi',
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd',
      borderColor: '#1976d2'
    },
    {
      title: 'Kasa Raporu',
      description: 'Gelir-gider analizi ve mali durum raporları',
      icon: <AccountBalanceIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#e8f5e8',
      borderColor: '#2e7d32'
    },
    {
      title: 'Araç İstatistikleri',
      description: 'Araç kullanımı, KM takibi ve zimmet durumları',
      icon: <DirectionsCarIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#fff3e0',
      borderColor: '#ed6c02'
    },
    {
      title: 'Performans Analizi',
      description: 'Genel başarı oranları ve trend analizi',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#f3e5f5',
      borderColor: '#9c27b0'
    }
  ];

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Detaylı Raporlar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              İşletme performansı ve detaylı analiz raporları
            </Typography>
          </Box>
          
          <Tooltip title="Raporları Yenile">
            <IconButton 
              color="primary" 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Rapor Kartları Önizleme */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Rapor Kategorileri
        </Typography>
        <Grid container spacing={3}>
          {reportCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={tabValue === index ? 6 : 2}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 2,
                  borderColor: tabValue === index ? card.borderColor : 'transparent',
                  transform: tabValue === index ? 'translateY(-8px)' : 'none',
                  bgcolor: tabValue === index ? `${card.color}15` : 'background.paper',
                  '&:hover': {
                    transform: tabValue === index ? 'translateY(-8px)' : 'translateY(-5px)',
                    borderColor: card.borderColor,
                    boxShadow: tabValue === index ? '0 12px 30px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.15)',
                    bgcolor: `${card.color}15`
                  }
                }}
                onClick={() => setTabValue(index)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: card.color,
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: tabValue === index ? '0 6px 20px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.1)',
                      transform: tabValue === index ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={tabValue === index ? 700 : 600} 
                    mb={1}
                    color={tabValue === index ? 'primary.main' : 'text.primary'}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={tabValue === index ? 'text.primary' : 'text.secondary'}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Rapor İçeriği */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>

        {/* Eğitmen İstatistikleri */}
        <TabPanel value={tabValue} index={0}>
          <InstructorStatistics />
        </TabPanel>

        {/* Kasa Raporu */}
        <TabPanel value={tabValue} index={1}>
          <CashReport />
        </TabPanel>

        {/* Araç İstatistikleri */}
        <TabPanel value={tabValue} index={2}>
          <VehicleStatistics />
        </TabPanel>

        {/* Performans Analizi */}
        <TabPanel value={tabValue} index={3}>
          <PerformanceAnalysis />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;