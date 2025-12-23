import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  TrendingUp,
  Warning,
  CheckCircle,
  EventBusy,
  School,
  TodayOutlined,
  PersonAdd,
  Business,
  ErrorOutline,
  Group,
  Domain,
  Book
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { ApexOptions } from 'apexcharts';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import StatsGroup from './components/StatsGroup';
import ChartCard from './components/ChartCard';
import type { StatItem } from './types/types';
import { 
  useDashboardStats, 
  useTodayActivityCount,
  useCompanyTrends,
  useApiLogs,
  useUserRoleDistribution,
  useFinancialStats,
  useLicenseStats,
  useUserActivityStats,
  useCompanyGrowthStats
} from './api/dashboardData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const todayActivityCount = useTodayActivityCount();
  const companyTrends = useCompanyTrends();
  const apiLogs = useApiLogs();
  const userRoles = useUserRoleDistribution();
  const financialStats = useFinancialStats();
  const licenseStats = useLicenseStats();
  const userActivityStats = useUserActivityStats();
  const companyGrowthStats = useCompanyGrowthStats();

  // Soru Dağılımı Grafik Ayarları
  const questionChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Toplam Soru', 'Sınavda Çıkmış', 'Animasyonlu'],
    colors: ['#4caf50', '#9c27b0', '#2196f3'],
    legend: {
      position: 'bottom',
      fontSize: '14px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
            },
            total: {
              show: true,
              label: 'Toplam',
              fontSize: '16px',
              fontWeight: 600,
              color: '#666',
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 600,
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const questionChartSeries = [
    stats.questions[0]?.value || 0,
    stats.questions[1]?.value || 0,
    stats.questions[2]?.value || 0,
  ];

  // Kullanıcı Rollerine Göre Dağılım Grafik Ayarları (DONUT)
  const userRoleChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: userRoles?.distribution.map((r: any) => r.label) || [],
    colors: ['#4caf50', '#9c27b0', '#2196f3', '#ff9800', '#f44336'],
    legend: {
      position: 'bottom',
      fontSize: '14px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 700,
            },
            total: {
              show: true,
              label: 'Toplam',
              fontSize: '14px',
              fontWeight: 600,
              color: '#666',
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} kullanıcı`
      }
    }
  };

  const userRoleChartSeries = userRoles?.distribution.map((r: any) => r.count) || [];

  // Kullanıcı Aktivitesi Grafik Ayarları (LINE)
  const userActivityChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#2196f3'],
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 5,
      colors: ['#2196f3'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    xaxis: {
      categories: userActivityStats?.dailyActivity?.map((d: any) => d.date) || [],
      labels: {
        style: {
          fontSize: '12px',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        }
      },
      title: {
        text: 'Aktif Kullanıcı',
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} kullanıcı`
      }
    }
  };

  const userActivityChartSeries = [{
    name: 'Aktif Kullanıcılar',
    data: userActivityStats?.dailyActivity?.map((d: any) => d.activeUsers) || []
  }];

  // Finansal İstatistikler Grafik Ayarları (BAR)
  const financialChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '60%',
        dataLabels: {
          position: 'top',
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val > 0 ? `${val.toLocaleString('tr-TR')} ₺` : '';
      },
      offsetY: -25,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#666']
      }
    },
    xaxis: {
      categories: financialStats?.monthlyData?.map((d: any) => d.month) || [],
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
        formatter: (value) => `${value.toLocaleString('tr-TR')} ₺`
      },
      title: {
        text: 'Lisans Geliri (₺)',
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    },
    colors: ['#4caf50'],
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value.toLocaleString('tr-TR')} ₺`
      }
    }
  };

  const financialChartSeries = [
    {
      name: 'Lisans Geliri',
      data: financialStats?.monthlyData?.map((d: any) => d.revenue) || []
    }
  ];

  // İşletme Durumu Grafik Ayarları (BAR)
  const companyStatusOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '50%',
        dataLabels: {
          position: 'top',
        },
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -25,
      style: {
        fontSize: '14px',
        fontWeight: 600,
        colors: ['#666']
      }
    },
    xaxis: {
      categories: ['Bu Ay Yeni', 'Pasif İşletme'],
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        }
      }
    },
    colors: ['#4caf50', '#ff9800'],
    legend: {
      show: false
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} işletme`
      }
    }
  };

  const companyStatusSeries = [{
    name: 'İşletme Sayısı',
    data: [
      companyGrowthStats?.newCompaniesThisMonth || 0,
      companyGrowthStats?.inactiveCompanies || 0
    ]
  }];

  // Şirket Trendleri Grafik Ayarları (Yeni + Yenileme)
  const companyTrendsOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: companyTrends?.monthly?.map((m: any) => m.month) || [],
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: 500,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        }
      }
    },
    colors: ['#4caf50', '#ff9800'],
    legend: {
      position: 'top',
      fontSize: '13px',
      fontWeight: 500,
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} işletme`
      }
    }
  };

  const companyTrendsSeries = [
    {
      name: 'Yeni Eklenenler',
      data: companyTrends?.monthly?.map((m: any) => m.newCompanies) || []
    },
    {
      name: 'Lisans Yenileme',
      data: companyTrends?.monthly?.map((m: any) => m.renewedCompanies) || []
    }
  ];

  // API Logs Grafik Ayarları
  const apiLogsOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      stacked: true,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      categories: apiLogs?.daily?.map((d: any) => d.date) || [],
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: 500,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        }
      }
    },
    colors: ['#4caf50', '#f44336'],
    legend: {
      position: 'top',
      fontSize: '13px',
      fontWeight: 500,
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value} istek`
      }
    }
  };

  const apiLogsSeries = [
    {
      name: 'Başarılı',
      data: apiLogs?.daily?.map((d: any) => d.success) || []
    },
    {
      name: 'Hata',
      data: apiLogs?.daily?.map((d: any) => d.error) || []
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
      {/* Header ve Breadcrumb */}
      <Box mb={4}>
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
              Sistem istatistikleri ve performans göstergeleri
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

      {/* YENİ GRUP: Finansal İstatistikler */}
      <Box mb={3}>
        <ChartCard
          title="Lisans Gelir Analizi"
          subtitle={`Bu Ay: ${(financialStats?.monthlyRevenue || 0).toLocaleString('tr-TR')} ₺ | Toplam: ${(financialStats?.totalRevenue || 0).toLocaleString('tr-TR')} ₺ | Bekleyen: ${financialStats?.pendingPayments.count || 0} Adet (${(financialStats?.pendingPayments.amount || 0).toLocaleString('tr-TR')} ₺)`}
          type="bar"
          series={financialChartSeries}
          options={financialChartOptions}
          height={320}
        />
      </Box>

      {/* YENİ GRUP: Lisans Uyarıları */}
      <StatsGroup
        title="Lisans Durumu"
        subtitle="İşletme lisans takibi ve uyarılar"
        stats={[
          {
            id: 'lic1',
            title: 'Yakında Dolacak',
            value: licenseStats?.expiringLicenses || 0,
            iconComponent: Warning,
            color: '#ff9800',
            description: '30 gün içinde süresi dolacak lisanslar'
          },
          {
            id: 'lic2',
            title: 'Süresi Dolmuş',
            value: licenseStats?.expiredLicenses || 0,
            iconComponent: EventBusy,
            color: '#f44336',
            description: 'Yenilenmesi gereken lisanslar'
          },
          {
            id: 'lic3',
            title: 'Aktif Lisanslar',
            value: licenseStats?.activeLicenses || 0,
            iconComponent: CheckCircle,
            color: '#4caf50',
            description: 'Geçerli ve aktif lisanslar'
          }
        ]}
        columns={{ xs: 1, sm: 2, md: 3, lg: 3 }}
      />

      {/* GRUP 1: Kullanıcı İstatistikleri */}
      <StatsGroup
        title="Temel İstatistikler"
        subtitle="Sistemdeki genel durum"
        stats={[
          {
            id: 's1',
            title: 'Toplam Kursiyer',
            value: stats.students[0]?.value || 0,
            iconComponent: stats.students[0]?.iconComponent || Group,
            color: stats.students[0]?.color || '#2e7d32',
            description: stats.students[0]?.description || 'Sistemdeki toplam kursiyer sayısı'
          },
          {
            id: 's2',
            title: 'Toplam Eğitmen',
            value: userActivityStats?.totalInstructors || 0,
            iconComponent: School,
            color: '#9c27b0',
            description: 'Sistemdeki aktif eğitmen sayısı'
          },
          {
            id: 's3',
            title: 'Toplam Kurs',
            value: stats.courses[0]?.value || 0,
            iconComponent: stats.courses[0]?.iconComponent || Domain,
            color: stats.courses[0]?.color || '#c62828',
            description: stats.courses[0]?.description || 'Sistemdeki toplam kurs sayısı'
          },
          {
            id: 's4',
            title: 'Toplam İçerik',
            value: (Number(stats.content[0]?.value) || 0) + (Number(stats.content[1]?.value) || 0),
            iconComponent: stats.content[0]?.iconComponent || Book,
            color: '#f44336',
            description: 'Toplam ders ve ünite sayısı'
          }
        ]}
        columns={{ xs: 1, sm: 2, md: 4, lg: 4 }}
      />

      {/* Grafikler - İlk Sıra: Kullanıcı Aktivitesi + İşletme Büyümesi */}
      <Box mb={4}>
        <Typography 
          variant="h6" 
          fontWeight={700}
          color="text.primary"
          mb={3}
        >
          Kullanıcı ve İşletme Aktivitesi
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="Günlük Aktif Kullanıcılar"
              subtitle="Son 7 günde giriş yapan kullanıcılar"
              type="line"
              series={userActivityChartSeries}
              options={userActivityChartOptions}
              height={300}
            />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="İşletme Durumu"
              subtitle="Aylık yeni kayıt ve pasif işletme sayıları"
              type="bar"
              series={companyStatusSeries}
              options={companyStatusOptions}
              height={300}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Grafikler - İlk Sıra: Soru + Kullanıcı */}
      <Box mb={4}>
        <Typography 
          variant="h6" 
          fontWeight={700}
          color="text.primary"
          mb={3}
        >
          Analiz ve Grafikler
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="Soru Dağılımı"
              subtitle="Soru türlerine göre dağılım"
              type="donut"
              series={questionChartSeries}
              options={questionChartOptions}
              height={300}
            />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="Kullanıcı Rol Dağılımı"
              subtitle="Kullanıcı rollerine göre sistem dağılımı"
              type="donut"
              series={userRoleChartSeries}
              options={userRoleChartOptions}
              height={300}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Grafikler - İkinci Sıra: Şirket Trendleri + API Logs */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="İşletme Trendleri"
              subtitle="Yeni eklenen ve lisans yenileyen işletmeler (Son 6 ay)"
              type="bar"
              series={companyTrendsSeries}
              options={companyTrendsOptions}
              height={320}
            />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <ChartCard
              title="API İstek İstatistikleri"
              subtitle="Son 7 günlük API performansı"
              type="area"
              series={apiLogsSeries}
              options={apiLogsOptions}
              height={320}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Bugünkü Aktiviteler - Özet Kart */}
      <Box mb={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Bugünkü Aktiviteler
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Sistemde bugün gerçekleşen toplam {todayActivityCount} aktivite var
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/live-activities')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Tümünü Gör
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
