import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FiberManualRecord as DotIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { dashboardApi, type Activity } from '../utils/api';
import {
  School,
  QuestionAnswer,
  People,
  BusinessCenter,
  Person,
  Book,
  Category,
  HelpOutline,
  Domain,
  Traffic,
  Badge as BadgeIcon,
  Article
} from '@mui/icons-material';

// Icon mapping
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    domain: Domain,
    person: Person,
    business_center: BusinessCenter,
    help_outline: HelpOutline,
    book: Book,
    category: Category,
    article: Article,
    traffic: Traffic,
    badge: BadgeIcon,
    school: School
  };
  return icons[iconName] || QuestionAnswer;
};

// Format time
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const LiveActivities: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch today's activities
  const fetchActivities = async () => {
    try {
      setError(null);
      const response = await dashboardApi.getTodayActivities();
      if (response.success && response.data) {
        setActivities(response.data.activities);
        setTodayDate(new Date(response.data.date).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
        setIsConnected(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aktiviteler yüklenemedi');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling mechanism (simulated WebSocket)
  useEffect(() => {
    fetchActivities();
    
    // Poll every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchActivities();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchActivities();
  };

  const handleBack = () => {
    navigate('/');
  };

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
          flexDirection={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={handleBack} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    Canlı Aktiviteler
                  </Typography>
                  <Badge
                    color={isConnected ? 'success' : 'error'}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        animation: isConnected ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 }
                        }
                      }
                    }}
                  >
                    <DotIcon sx={{ color: isConnected ? 'success.main' : 'error.main' }} />
                  </Badge>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {todayDate} - Bugünün tüm aktiviteleri canlı olarak izleniyor
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            <Chip 
              label={isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
              color={isConnected ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`${activities.length} Aktivite`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <IconButton 
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{ 
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <RefreshIcon sx={{ 
                animation: isLoading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && activities.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400,
          bgcolor: 'white',
          borderRadius: 3
        }}>
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary" mt={2}>
              Aktiviteler yükleniyor...
            </Typography>
          </Box>
        </Box>
      ) : activities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <People sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Bugün henüz aktivite yok
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Yeni aktiviteler otomatik olarak burada görünecektir
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => {
              const IconComponent = getIconComponent(activity.icon);
              
              return (
                <React.Fragment key={activity.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        bgcolor: 'grey.50'
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: activity.color,
                          color: 'white'
                        }}
                      >
                        <IconComponent />
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle1" fontWeight={600} component="span">
                            {activity.title}
                          </Typography>
                          <Chip 
                            label={activity.type}
                            size="small"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: `${activity.color}20`,
                              color: activity.color,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" component="span" sx={{ mt: 0.5, display: 'block' }}>
                            {formatTime(activity.timestamp)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Auto-refresh info */}
      {activities.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            Sayfa her 5 saniyede bir otomatik güncellenir
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LiveActivities;
