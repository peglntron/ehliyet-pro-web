import React from 'react';
import { Card, CardContent, Box, Avatar, Typography, Chip } from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import type { StudentPaymentStatus } from '../types/types';

interface OverduePaymentCardProps {
  payment: StudentPaymentStatus;
  onClick: () => void;
  formatDate: (date: string) => string;
}

const OverduePaymentCard: React.FC<OverduePaymentCardProps> = ({ 
  payment, 
  onClick,
  formatDate 
}) => {
  // Ödeme durumu bilgilerini al
  const getPaymentStatusInfo = (status: string, overdueDays: number) => {
    switch (status) {
      case 'overdue':
        return { 
          color: 'error', 
          icon: <WarningIcon fontSize="small" />, 
          text: `${overdueDays} gün gecikmiş`,
          bgColor: '#ffebee' 
        };
      case 'upcoming':
        return { 
          color: 'warning', 
          icon: <ScheduleIcon fontSize="small" />, 
          text: 'Yaklaşan ödeme',
          bgColor: '#fff3e0' 
        };
      case 'partial':
        return { 
          color: 'info', 
          icon: <AttachMoneyIcon fontSize="small" />, 
          text: 'Kısmi ödeme',
          bgColor: '#e3f2fd' 
        };
      default:
        return { 
          color: 'success', 
          icon: <AttachMoneyIcon fontSize="small" />, 
          text: 'Tamamlandı',
          bgColor: '#e8f5e8' 
        };
    }
  };

  const statusInfo = getPaymentStatusInfo(payment.paymentStatus, payment.overdueDays);
  const nextInstallment = payment.overdueInstallments.length > 0 
    ? payment.overdueInstallments[0] 
    : payment.upcomingInstallments[0];

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        border: '1px solid',
        borderColor: statusInfo.color === 'error' ? '#f44336' : 
                    statusInfo.color === 'warning' ? '#ff9800' : 
                    statusInfo.color === 'info' ? '#2196f3' : '#4caf50',
        borderLeftWidth: 4,
        borderLeftColor: statusInfo.color === 'error' ? '#f44336' : 
                        statusInfo.color === 'warning' ? '#ff9800' : 
                        statusInfo.color === 'info' ? '#2196f3' : '#4caf50',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: statusInfo.color === 'error' ? '#f44336' : 
                      statusInfo.color === 'warning' ? '#ff9800' : 
                      statusInfo.color === 'info' ? '#2196f3' : '#4caf50',
          backgroundColor: '#f8fafc',
          transform: 'translateX(4px)',
          boxShadow: `0 2px 12px ${
            statusInfo.color === 'error' ? 'rgba(244, 67, 54, 0.15)' : 
            statusInfo.color === 'warning' ? 'rgba(255, 152, 0, 0.15)' :
            statusInfo.color === 'info' ? 'rgba(33, 150, 243, 0.15)' : 
            'rgba(76, 175, 80, 0.15)'
          }`
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, pl: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Sol: Öğrenci Bilgileri */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            minWidth: 'fit-content'
          }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: statusInfo.color === 'error' ? '#f44336' : 
                        statusInfo.color === 'warning' ? '#ff9800' : 
                        statusInfo.color === 'info' ? '#2196f3' : '#4caf50',
                color: 'white'
              }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
          </Box>
          
          {/* Orta: Öğrenci ve Ödeme Bilgileri */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                color="text.primary"
                noWrap 
                sx={{ flex: 1 }}
              >
                {payment.studentName} {payment.studentSurname}
              </Typography>
              <Chip 
                label={statusInfo.text}
                color={statusInfo.color as any}
                size="small"
                variant="filled"
                icon={statusInfo.icon}
                sx={{ 
                  borderRadius: 1.5, 
                  fontSize: '0.7rem',
                  height: 24,
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {payment.phone}
                </Typography>
              </Box>
              
              {nextInstallment && (
                <>
                  <Box sx={{ 
                    width: 4, 
                    height: 4, 
                    borderRadius: '50%', 
                    backgroundColor: 'text.secondary' 
                  }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {nextInstallment.installmentNumber ? 'Taksit Tarihi' : 'Ödeme Tarihi'}: {formatDate(nextInstallment.dueDate)}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Kalan Borç</Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {payment.remainingAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">Ödenen</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {payment.paidAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">Toplam Tutar</Typography>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  {payment.totalAmount.toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">Geciken</Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {payment.overdueInstallments.length} {payment.installments.some(i => i.installmentNumber) ? 'taksit' : 'ödeme'}
                </Typography>
              </Box>
              
              {/* Sadece taksitli ödemesi olanlar için yaklaşan taksit göster */}
              {payment.installments.some(i => i.installmentNumber) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Yaklaşan Taksit</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {payment.upcomingInstallments.length} taksit
                  </Typography>
                </Box>
              )}
              
              {/* Sadece taksitli ödemesi olanlar için taksit durumu göster */}
              {payment.installments.some(i => i.installmentNumber) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Taksit Durumu</Typography>
                  <Typography variant="body2" fontWeight={600} color="info.main">
                    {payment.installments.filter(i => i.installmentNumber && i.status === 'paid').length}/
                    {payment.installments.filter(i => i.installmentNumber).length} ödendi
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Sağ: Ok İkonu */}
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
      </CardContent>
    </Card>
  );
};

export default OverduePaymentCard;
