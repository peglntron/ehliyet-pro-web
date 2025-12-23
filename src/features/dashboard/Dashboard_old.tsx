import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import StatCard from './components/StatCard';
import ActivityList from './components/ActivityList';
import { useDashboardStats, useActivities } from './api/dashboardData';

const Dashboard: React.FC = () => {
  const allStats = useDashboardStats();
  const activities = useActivities(10);
  
  // Ana kartlar (ilk 5) ve toplam kartlar (kalan) olarak ayır
  const mainStats = allStats.slice(0, 5);
  const totalStats = allStats.slice(5);

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto', // Tüm dashboard içeriği scrollable
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header ve Breadcrumb */}
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
              Yönetim Paneli
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ehliyet sınavı hazırlık sistemine hoş geldiniz
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 4px 10px rgba(66, 165, 245, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: '0 6px 15px rgba(66, 165, 245, 0.3)',
              }
            }}
          >
            Raporları Görüntüle
          </Button>
        </Box>
      </Box>
      
      {/* Ana İstatistik Kartları */}
      <Box mb={4}>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',              
              sm: 'repeat(2, 1fr)',   
              md: 'repeat(3, 1fr)',   
              lg: 'repeat(5, 1fr)'    
            },
            gap: 3
          }}
        >
          {mainStats.map(stat => (
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
      
      {/* Toplam İstatistikler Başlığı */}
      <Box mb={3}>
        <Divider sx={{ mb: 3 }} />
        <Typography 
          variant="h5" 
          fontWeight={700} 
          color="text.primary"
        >
          Toplam İstatistikler
        </Typography>
      </Box>
      
      {/* Toplam İstatistik Kartları */}
      <Box mb={4}>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',              
              sm: 'repeat(2, 1fr)',   
              md: 'repeat(3, 1fr)',  
              lg: 'repeat(5, 1fr)'    
            },
            gap: 3
          }}
        >
          {totalStats.map(stat => (
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
      
      {/* Aktivite Listesi - mb-4 ile alt kısımda boşluk bırakıyoruz */}
      <Box mb={4}>
        <ActivityList 
          activities={activities}
          title="Son Aktiviteler"
          subtitle="Sistemdeki son değişiklikler ve aktiviteler"
        />
      </Box>
    </Box>
  );
};

export default Dashboard;