import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  DirectionsCar as DirectionsCarIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import type { Student } from '../types/types';

interface StudentDetailModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onNotificationClick: (student: Student) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  open,
  onClose,
  student,
  onNotificationClick
}) => {
  if (!student) return null;

  // Formatlı tarih
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Durum bilgisine göre renk ve metin belirleme
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'primary', text: 'Aktif' };
      case 'completed':
        return { color: 'success', text: 'Tamamlandı' };
      case 'failed':
        return { color: 'error', text: 'Başarısız' };
      case 'inactive':
        return { color: 'default', text: 'Pasif' };
      default:
        return { color: 'default', text: status };
    }
  };

  // Ödeme durumuna göre renk ve metin belirleme
  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'success', text: 'Ödendi' };
      case 'pending':
        return { color: 'warning', text: 'Beklemede' };
      case 'canceled':
        return { color: 'error', text: 'İptal' };
      default:
        return { color: 'default', text: status };
    }
  };
  
  // Ödeme yöntemine göre metin belirleme
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'credit':
        return 'Kredi Kartı';
      case 'bank':
        return 'Banka Havalesi';
      default:
        return method;
    }
  };

  const statusInfo = getStatusInfo(student.status);
  const remainingAmount = (student.totalPayment || 0) - (student.paidAmount || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>
          Kursiyer Detayları
        </Typography>
        <Chip 
          label={statusInfo.text} 
          color={statusInfo.color as any} 
          sx={{ borderRadius: 2, fontWeight: 600 }}
        />
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {student.name} {student.surname}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {student.licenseClass ? `${student.licenseClass} Sınıfı Ehliyet Adayı` : 'Ehliyet Adayı'}
          </Typography>
        </Box>
        
        {/* İki sütunlu bilgi kartları */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          {/* Sol Taraf - Kişisel Bilgiler */}
          <Box sx={{ flex: 1 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                Kişisel Bilgiler
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <PersonIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>TC Kimlik No</Typography>
                    <Typography variant="body2">{student.tcNo}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
                    <Typography variant="body2">
                      {student.phone ? `+90 ${student.phone.replace(/^\+?90/, '').replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` : '-'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Eğitmen</Typography>
                    <Typography variant="body2">{student.instructor || '-'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Kayıt Tarihi</Typography>
                    <Typography variant="body2">{formatDate(student.createdAt)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Sağ Taraf - Sınav Bilgileri */}
          <Box sx={{ flex: 1 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                Sınav Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Yazılı Sınav Tarihi ve Saati</Typography>
                    <Typography variant="body2">
                      {student.writtenExamDate 
                        ? `${formatDate(student.writtenExamDate)}${student.writtenExamTime ? ` - ${student.writtenExamTime}` : ''}` 
                        : '-'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <DirectionsCarIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Direksiyon Sınav Tarihi ve Saati</Typography>
                    <Typography variant="body2">
                      {student.drivingExamDate 
                        ? `${formatDate(student.drivingExamDate)}${student.drivingExamTime ? ` - ${student.drivingExamTime}` : ''}` 
                        : '-'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Sınav Yeri</Typography>
                    <Typography variant="body2">{student.examLocation || '-'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Sınav Aracı</Typography>
                    <Typography variant="body2">{student.examVehicle || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
        
        {/* Ödeme Bilgileri */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
            Ödeme Bilgileri
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Toplam Tutar</Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {student.totalPayment?.toLocaleString('tr-TR')} ₺
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Ödenen Tutar</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {student.paidAmount?.toLocaleString('tr-TR')} ₺
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Kalan Tutar</Typography>
              <Typography variant="h5" fontWeight={700} color={remainingAmount > 0 ? "error.main" : "text.primary"}>
                {remainingAmount.toLocaleString('tr-TR')} ₺
              </Typography>
            </Box>
          </Box>
          
          {student.payments && student.payments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Ödeme Yöntemi</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {student.payments.map((payment) => {
                    const paymentStatusInfo = getPaymentStatusInfo(payment.status);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.amount.toLocaleString('tr-TR')} ₺</TableCell>
                        <TableCell>{getPaymentMethodText(payment.method)}</TableCell>
                        <TableCell>{payment.description || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={paymentStatusInfo.text} 
                            color={paymentStatusInfo.color as any} 
                            size="small" 
                            sx={{ borderRadius: 1 }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={2}>
              Henüz ödeme kaydı bulunmamaktadır
            </Typography>
          )}
        </Paper>
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
        
        <Button
          variant="contained"
          startIcon={<NotificationsIcon />}
          onClick={() => onNotificationClick(student)}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Bildirim Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailModal;
