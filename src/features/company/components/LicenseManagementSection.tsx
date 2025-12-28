import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getLicensePayments, confirmPayment } from '../api/useCompanies';

interface LicensePayment {
  id: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  isPaid: boolean;
  paidAt: string | null;
  description: string;
  createdAt: string;
}

interface LicenseManagementSectionProps {
  companyId?: string;
  currentLicenseEndDate?: string;
  onAddLicense: () => void;
  onLicenseUpdated?: (newEndDate: string) => void;
  isNewCompany?: boolean;
}

const LicenseManagementSection: React.FC<LicenseManagementSectionProps> = ({
  companyId,
  currentLicenseEndDate,
  onAddLicense,
  onLicenseUpdated,
  isNewCompany = false
}) => {
  const [payments, setPayments] = useState<LicensePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<LicensePayment | null>(null);

  // Ödeme geçmişini yükle
  const loadPayments = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const data = await getLicensePayments(companyId);
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && showHistory) {
      loadPayments();
    }
  }, [companyId, showHistory]);

  // Ödeme onaylama
  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    try {
      await confirmPayment(selectedPayment.id, { paymentMethod: 'CASH' });
      setConfirmDialogOpen(false);
      setSelectedPayment(null);
      loadPayments(); // Listeyi yenile
      
      // Parent component'e bildir
      if (onLicenseUpdated && selectedPayment.endDate) {
        onLicenseUpdated(selectedPayment.endDate);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  // Lisans durumunu hesapla
  const getLicenseStatus = () => {
    if (!currentLicenseEndDate) {
      return { status: 'none', daysLeft: 0, color: 'info' as const };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const licenseEnd = new Date(currentLicenseEndDate);
      
      // Geçersiz tarih kontrolü
      if (isNaN(licenseEnd.getTime())) {
        return { status: 'none', daysLeft: 0, color: 'info' as const };
      }
      
      licenseEnd.setHours(0, 0, 0, 0);
      const timeDiff = licenseEnd.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        return { status: 'expired', daysLeft, color: 'error' as const };
      } else if (daysLeft <= 7) {
        return { status: 'expiring', daysLeft, color: 'warning' as const };
      } else {
        return { status: 'active', daysLeft, color: 'success' as const };
      }
    } catch (error) {
      console.error('License date calculation error:', error);
      return { status: 'none', daysLeft: 0, color: 'info' as const };
    }
  };

  const { status, daysLeft, color } = getLicenseStatus();

  // Tarih formatlama
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 3,
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Lisans Yönetimi
        </Typography>
        
        {!isNewCompany && companyId && (
          <Button
            startIcon={<HistoryIcon />}
            onClick={() => setShowHistory(!showHistory)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {showHistory ? 'Gizle' : 'Geçmiş'}
          </Button>
        )}
      </Box>

      {/* Lisans Durumu */}
      {isNewCompany || !currentLicenseEndDate ? (
        <Alert 
          severity="info" 
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddLicense}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Lisans Ekle
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={500}>
            {isNewCompany 
              ? 'İşletme kaydedildikten sonra lisans ekleyebilirsiniz.'
              : 'Bu işletmenin lisansı bulunmamaktadır. Lisans eklemek için butona tıklayın.'}
          </Typography>
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert 
            severity={color}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onAddLicense}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Yenile
              </Button>
            }
            sx={{ borderRadius: 2 }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {status === 'expired' && 'Lisans Süresi Dolmuş'}
                {status === 'expiring' && `Lisans ${daysLeft} Gün İçinde Dolacak`}
                {status === 'active' && 'Lisans Aktif'}
              </Typography>
              <Typography variant="caption">
                Bitiş Tarihi: {formatDate(currentLicenseEndDate)} • 
                {daysLeft > 0 ? ` ${daysLeft} gün kaldı` : ` ${Math.abs(daysLeft)} gün önce doldu`}
              </Typography>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Ödeme Geçmişi */}
      {showHistory && companyId && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Ödeme Geçmişi
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : payments.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Henüz ödeme kaydı bulunmamaktadır.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Başlangıç</TableCell>
                    <TableCell>Bitiş</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>₺{payment.amount.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{formatDate(payment.startDate)}</TableCell>
                      <TableCell>{formatDate(payment.endDate)}</TableCell>
                      <TableCell>
                        {payment.isPaid ? (
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Ödendi" 
                            size="small" 
                            color="success"
                          />
                        ) : (
                          <Chip 
                            icon={<PendingIcon />}
                            label="Bekliyor" 
                            size="small" 
                            color="warning"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {!payment.isPaid && (
                          <Tooltip title="Ödeme Alındı Olarak İşaretle">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Ödeme Onay Dialogu */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          Ödeme Onayı
          <IconButton
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bu ödemeyi alındı olarak işaretlemek istediğinize emin misiniz?
          </Typography>
          {selectedPayment && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Açıklama:</strong> {selectedPayment.description}</Typography>
              <Typography variant="body2"><strong>Tutar:</strong> ₺{selectedPayment.amount.toLocaleString('tr-TR')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleConfirmPayment} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Ödeme Alındı
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LicenseManagementSection;
