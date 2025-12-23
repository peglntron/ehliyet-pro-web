import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, IconButton, 
  Chip, Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as ReadIcon,
  RadioButtonUnchecked as UnreadIcon
} from '@mui/icons-material';

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: any;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  open,
  onClose,
  notification
}) => {
  if (!notification) return null;

  // Bildirim türüne göre renk ve ikon
  const getNotificationTypeInfo = (type: string) => {
    switch (type) {
      case 'exam':
        return { 
          color: 'info', 
          icon: <EventNoteIcon />, 
          text: 'Sınav Bildirimi',
          bgColor: '#e3f2fd' 
        };
      case 'payment':
        return { 
          color: 'warning', 
          icon: <AttachMoneyIcon />, 
          text: 'Ödeme Bildirimi',
          bgColor: '#fff3e0' 
        };
      case 'warning':
        return { 
          color: 'error', 
          icon: <WarningIcon />, 
          text: 'Uyarı Bildirimi',
          bgColor: '#ffebee' 
        };
      default:
        return { 
          color: 'primary', 
          icon: <InfoIcon />, 
          text: 'Genel Bildirim',
          bgColor: '#f3e5f5' 
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
      minute: '2-digit',
      weekday: 'long'
    }).format(date);
  };

  const typeInfo = getNotificationTypeInfo(notification.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 50, 
              height: 50,
              bgcolor: typeInfo.bgColor,
              color: `${typeInfo.color}.main`
            }}
          >
            {typeInfo.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Bildirim Detayı
            </Typography>
            <Chip 
              label={typeInfo.text}
              color={typeInfo.color as any}
              size="small"
              sx={{ borderRadius: 1, mt: 0.5 }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Başlık */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
              Bildirim Başlığı
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {notification.title}
            </Typography>
          </Box>

          {/* Alıcı */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
              Alıcı
            </Typography>
            <Typography variant="body1">
              {notification.studentName}
            </Typography>
          </Box>

          {/* İçerik */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
              Bildirim İçeriği
            </Typography>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {notification.message}
              </Typography>
            </Box>
          </Box>

          {/* Gönderim Bilgileri */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
              Gönderim Bilgileri
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Gönderim Zamanı:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(notification.createdAt)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Okunma Durumu:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {notification.isRead ? (
                    <>
                      <ReadIcon fontSize="small" color="success" />
                      <Typography variant="body2" fontWeight={500} color="success.main">
                        Okundu
                      </Typography>
                    </>
                  ) : (
                    <>
                      <UnreadIcon fontSize="small" color="warning" />
                      <Typography variant="body2" fontWeight={500} color="warning.main">
                        Okunmadı
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Gönderim Türü:
                </Typography>
                <Chip 
                  label={notification.isAutomatic ? 'Otomatik (Sistem)' : 'Manuel (İşletme)'}
                  size="small"
                  color={notification.isAutomatic ? 'info' : 'secondary'}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Gönderim Kanalı:
                </Typography>
                <Chip 
                  label="FCM (Mobil Bildirim)"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;