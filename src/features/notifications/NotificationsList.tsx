import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, 
  InputAdornment, Chip, Card, CardContent,
  Avatar, Pagination, CircularProgress, Alert, Button
} from '@mui/material';
import {
  Search as SearchIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  VisibilityOff as UnreadIcon,
  Visibility as ReadIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import NotificationDetailModal from './components/NotificationDetailModal';
import { useNotificationLogs } from '../../api/useNotificationLogs';

const NotificationsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'payment' | 'exam' | 'lesson'>('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Tarih filtresi - Son 3 gün default
  const getThreeDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    date.setHours(0, 0, 0, 0);
    // Yerel tarihi YYYY-MM-DD formatına çevir (timezone offset olmadan)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getToday = () => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    // Yerel tarihi YYYY-MM-DD formatına çevir (timezone offset olmadan)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getThreeDaysAgo());
  const [endDate, setEndDate] = useState(getToday());

  // API hooks
  const { 
    loading, 
    error, 
    getNotificationLogs
  } = useNotificationLogs();

  // State for notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 0
  });

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      console.log('Bildirimler yükleniyor, parametreler:', params);
      
      const result = await getNotificationLogs(params);
      
      console.log('API Response:', result);
      
      setNotifications(result.notifications);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Bildirimler yüklenirken hata:', err);
    }
  };

  // İlk yükleme ve filtre değişikliklerinde
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter, startDate, endDate, searchTerm]);

  // Sayfa değiştiğinde
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, startDate, endDate]);

  // Arama handler - Enter tuşu veya buton ile
  const handleSearch = () => {
    setCurrentPage(1);
    loadNotifications();
  };

  // Enter tuşu ile arama
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Yenile butonu handler
  const handleRefresh = () => {
    loadNotifications();
  };

  // Bildirim türüne göre renk ve ikon
  const getNotificationTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return { 
          color: 'primary', 
          icon: <EventNoteIcon fontSize="small" />, 
          text: 'Sınav',
          bgColor: '#f3e5f5',
          borderColor: '#9c27b0' // Mor
        };
      case 'payment':
        return { 
          color: 'error', 
          icon: <AttachMoneyIcon fontSize="small" />, 
          text: 'Ödeme',
          bgColor: '#ffebee',
          borderColor: '#f44336' // Kırmızı
        };
      case 'lesson':
        return { 
          color: 'success', 
          icon: <EventNoteIcon fontSize="small" />, 
          text: 'Ders',
          bgColor: '#e8f5e9',
          borderColor: '#4caf50' // Yeşil
        };
      case 'general':
        return { 
          color: 'info', 
          icon: <InfoIcon fontSize="small" />, 
          text: 'Genel',
          bgColor: '#e3f2fd',
          borderColor: '#2196f3' // Mavi
        };
      case 'company_student':
      case 'student':
        return { 
          color: 'secondary', 
          icon: <InfoIcon fontSize="small" />, 
          text: 'Öğrenci',
          bgColor: '#fce4ec',
          borderColor: '#e91e63' // Pembe
        };
      case 'instructor':
        return { 
          color: 'info', 
          icon: <InfoIcon fontSize="small" />, 
          text: 'Eğitmen',
          bgColor: '#e1f5fe',
          borderColor: '#03a9f4' // Açık Mavi
        };
      default:
        return { 
          color: 'info', 
          icon: <InfoIcon fontSize="small" />, 
          text: 'Genel',
          bgColor: '#e3f2fd',
          borderColor: '#2196f3' // Mavi (default)
        };
    }
  };

  // Tarih formatlama
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Bildirim detayını göster (sadece görüntüleme - okundu işaretleme yok)
  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);
    setDetailModalOpen(true);
    
    // NOT: Okundu işaretleme öğrenci mobil uygulamasında yapılacak
    // İşletme paneli sadece görüntüleme amaçlıdır
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
      {/* Başlık ve Üst Kısım */}
      <Box>
        <PageBreadcrumb />
        
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            mt: 2
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              Gönderilen Bildirimler
            </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Öğrencilere gönderilen bildirimleri görüntüleyin
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Arama ve Filtre Alanı */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Tarih Filtresi ve Yenile Butonu */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.5)', // Takvim ikonunu görünür yap
                  cursor: 'pointer'
                }
              }}
            />
            <TextField
              label="Bitiş Tarihi"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  filter: 'invert(0.5)', // Takvim ikonunu görünür yap
                  cursor: 'pointer'
                }
              }}
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Yenile
          </Button>
        </Box>

        {/* Arama ve Tip Filtreleri */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}
        >
          <TextField
            placeholder="Bildirim Ara (Başlık, Öğrenci Adı, İçerik)"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ 
              maxWidth: { xs: '100%', sm: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label="Tümü" 
              color={typeFilter === 'all' ? 'primary' : 'default'}
              variant={typeFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('all')}
              sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer' }}
            />
            <Chip 
              label="Genel" 
              color={typeFilter === 'general' ? 'primary' : 'default'}
              variant={typeFilter === 'general' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('general')}
              sx={{ borderRadius: 2, cursor: 'pointer' }}
            />
            <Chip 
              label="Sınav" 
              color={typeFilter === 'exam' ? 'primary' : 'default'}
              variant={typeFilter === 'exam' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('exam')}
              sx={{ borderRadius: 2, cursor: 'pointer' }}
            />
            <Chip 
              label="Ödeme" 
              color={typeFilter === 'payment' ? 'primary' : 'default'}
              variant={typeFilter === 'payment' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('payment')}
              sx={{ borderRadius: 2, cursor: 'pointer' }}
            />
            <Chip 
              label="Ders" 
              color={typeFilter === 'lesson' ? 'primary' : 'default'}
              variant={typeFilter === 'lesson' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('lesson')}
              sx={{ borderRadius: 2, cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Bildirim Listesi */}
      {!loading && !error && notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ 
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Bildirim Bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arama kriterlerinizi değiştirin veya farklı filtreler deneyin.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {notifications.map(notification => {
            const typeInfo = getNotificationTypeInfo(notification.type);
            return (
              <Card 
                key={notification.id}
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: notification.isRead ? 'grey.200' : typeInfo.borderColor,
                  borderLeftWidth: 4,
                  borderLeftColor: notification.isRead ? 'grey.300' : typeInfo.borderColor,
                  backgroundColor: notification.isRead ? 'grey.50' : 'primary.lighter',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: typeInfo.borderColor,
                    backgroundColor: 'primary.lighter',
                    transform: 'translateX(4px)',
                    boxShadow: `0 2px 12px ${typeInfo.borderColor}33` // 33 = 20% opacity
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    backgroundColor: typeInfo.borderColor,
                    transition: 'width 0.2s ease'
                  },
                  '&:hover::before': {
                    width: 8
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent sx={{ p: 2, pl: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Sol: Tip İkonu ve Durum Göstergesi */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      minWidth: 'fit-content'
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36,
                            bgcolor: 'white',
                            color: typeInfo.borderColor,
                            border: '2px solid',
                            borderColor: typeInfo.borderColor,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {typeInfo.icon}
                        </Avatar>
                        {/* Okunma durumu badge'i */}
                        {!notification.isRead && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#ff5722',
                              border: '2px solid white',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    {/* Orta: İçerik */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={notification.isRead ? 500 : 600}
                          color={notification.isRead ? 'text.secondary' : 'text.primary'}
                          noWrap 
                          sx={{ flex: 1 }}
                        >
                          {notification.title}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="text.primary"
                          fontWeight={500}
                        >
                          {notification.studentName}
                        </Typography>
                        <Box sx={{ 
                          width: 4, 
                          height: 4, 
                          borderRadius: '50%', 
                          backgroundColor: 'text.secondary' 
                        }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={typeInfo.text}
                          color={typeInfo.color as any}
                          size="small"
                          variant="filled"
                          sx={{ 
                            borderRadius: 1.5, 
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        />
                        <Chip 
                          label={notification.isAutomatic ? 'Otomatik' : 'Manuel'}
                          color={notification.isAutomatic ? 'info' : 'secondary'}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 1.5,
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 500,
                            backgroundColor: 'white'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Sağ: Durum ve Ok İkonu */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      minWidth: 'fit-content' 
                    }}>
                      {notification.isRead ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          color: 'success.main'
                        }}>
                          <ReadIcon fontSize="small" />
                          <Typography variant="caption" fontWeight={500}>
                            Okundu
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          color: 'warning.main'
                        }}>
                          <UnreadIcon fontSize="small" />
                          <Typography variant="caption" fontWeight={500}>
                            Yeni
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateX(0)',
                        transition: 'transform 0.2s ease',
                        '.MuiCard-root:hover &': {
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                          →
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
      
      {/* Pagination - Sadece bildirim varsa göster */}
      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 4,
          mb: 2
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Sayfa {pagination.page} / {pagination.totalPages} 
                ({pagination.total} bildirimden {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} arası)
              </Typography>
              <Pagination 
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton 
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 500
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Bildirim Detay Modal */}
      <NotificationDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        notification={selectedNotification}
      />
    </Box>
  );
};

export default NotificationsList;