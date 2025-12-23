import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
  Paid as PaidIcon,
  CreditCard as CreditCardIcon,
  Store as StoreIcon,
  MonetizationOn as MonetizationOnIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { apiClient } from '../../../utils/api';
import { exportCashReportToExcel } from '../../../utils/excelExport';

interface CashReportData {
  transactions: {
    id: string;
    payment_date: string;
    student_first_name: string;
    student_last_name: string;
    amount: number;
    payment_method: string;
    payment_type: string;
    description: string;
    installmentNumber: number | null;  // Prisma camelCase olarak döndürür
    totalInstallments: number | null;  // Prisma camelCase olarak döndürür
  }[];
  summary: {
    totalAmount: number;
    cashAmount: number;
    creditCardAmount: number;
    posAmount: number;
    bankTransferAmount: number;
    transactionCount: number;
  };
}

const CashReport: React.FC = () => {
  // Bugünden 1 gün önce (dün)
  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // Bugün
  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState<string>(getYesterday());
  const [endDate, setEndDate] = useState<string>(getToday());
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<CashReportData | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  // API'den veri çek
  const fetchCashReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (paymentMethodFilter !== 'ALL') params.append('paymentMethod', paymentMethodFilter);

      const queryString = params.toString();
      const endpoint = `/companies/cash-report${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(endpoint);
      
      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message || 'Kasa raporu yüklenemedi');
      }

      // Giderleri de çek (aynı tarih aralığı)
      const expenseParams = new URLSearchParams();
      if (startDate) expenseParams.append('startDate', startDate);
      if (endDate) expenseParams.append('endDate', endDate);
      
      const expenseResponse = await apiClient.get(`/expenses?${expenseParams.toString()}`);
      if (expenseResponse.success && expenseResponse.stats) {
        setTotalExpenses(expenseResponse.stats.totalAmount || 0);
      }
    } catch (err: any) {
      console.error('Cash report error:', err);
      setError(err.message || 'Kasa raporu yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme - sadece bir kere
  useEffect(() => {
    fetchCashReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Boş dependency array - sadece mount'ta çalışır

  // Özet veriler
  const totalIncome = reportData?.summary.totalAmount || 0;
  const transactionCount = reportData?.summary.transactionCount || 0;

  // Ödeme yöntemi dağılımı
  const paymentMethodStats = {
    cash: reportData?.summary.cashAmount || 0,
    credit: reportData?.summary.creditCardAmount || 0,
    pos: reportData?.summary.posAmount || 0,
    bank: reportData?.summary.bankTransferAmount || 0
  };

  const filteredTransactions = reportData?.transactions || [];

  // Excel export handler
  const handleExcelExport = () => {
    if (!reportData) return;
    exportCashReportToExcel(reportData.transactions, reportData.summary);
  };


  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
      case 'CASH': 
        return 'Nakit';
      case 'credit':
      case 'CREDIT_CARD': 
        return 'Kredi Kartı';
      case 'pos':
      case 'POS': 
        return 'POS';
      case 'bank':
      case 'BANK_TRANSFER': 
        return 'Havale/EFT';
      default: 
        return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
      case 'CASH': 
        return <PaidIcon sx={{ fontSize: 20 }} />;
      case 'credit':
      case 'CREDIT_CARD': 
        return <CreditCardIcon sx={{ fontSize: 20 }} />;
      case 'pos':
      case 'POS': 
        return <StoreIcon sx={{ fontSize: 20 }} />;
      case 'bank':
      case 'BANK_TRANSFER': 
        return <AccountBalanceIcon sx={{ fontSize: 20 }} />;
      default: 
        return <MonetizationOnIcon sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Kasa Raporu ve Mali Analiz
      </Typography>

      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtreler */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Tarih Aralığı ve Filtreler
        </Typography>
        <Grid container spacing={3} alignItems="end">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Ödeme Yöntemi</InputLabel>
              <Select
                value={paymentMethodFilter}
                label="Ödeme Yöntemi"
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tümü</MenuItem>
                <MenuItem value="CASH">Nakit</MenuItem>
                <MenuItem value="CREDIT_CARD">Kredi Kartı</MenuItem>
                <MenuItem value="POS">POS</MenuItem>
                <MenuItem value="BANK_TRANSFER">Havale/EFT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              sx={{ py: 1.75 }}
              disabled={loading}
              onClick={fetchCashReport}
            >
              Yenile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              sx={{ py: 1.75 }}
              disabled={loading || !reportData}
              onClick={handleExcelExport}
            >
              Excel İndir
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Özet Kartları */}
          <Grid container spacing={3} mb={4}>
            {/* Üst Satır - 3 Kart: Gelir, İşlem, Gider */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <TrendingUpIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Toplam Gelir
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <TrendingDownIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Toplam Gider
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <DateRangeIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Toplam İşlem
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {transactionCount}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Alt Satır - 4 Kart (Ödeme Yöntemleri) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <PaidIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Nakit
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{paymentMethodStats.cash.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <CreditCardIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Kredi Kartı
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{paymentMethodStats.credit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <StoreIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        POS
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{paymentMethodStats.pos.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 40, height: 40 }}>
                        <AccountBalanceIcon fontSize="small" sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Havale/EFT
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      ₺{paymentMethodStats.bank.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* İşlem Listesi */}
          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <Box p={2}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                İşlem Detayları ({filteredTransactions.length} adet)
              </Typography>
            </Box>
            <Divider />

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Öğrenci</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ödeme Yöntemi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Taksit Bilgisi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Açıklama</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transaction.payment_date).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {transaction.student_first_name} {transaction.student_last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {/* İşlem Detayları: installmentNumber'a göre belirle */}
                        {transaction.installmentNumber && transaction.totalInstallments ? (
                          <Chip 
                            label="Taksit Ödemesi"
                            size="small" 
                            color="info"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        ) : transaction.payment_type === 'PAYMENT' ? (
                          <Chip 
                            label="Kısmi Ödeme" 
                            size="small" 
                            color="warning"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        ) : (
                          <Chip 
                            label="Ödeme" 
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          fontWeight={600}
                          color="success.main"
                        >
                          +₺{Number(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            {getPaymentMethodIcon(transaction.payment_method)}
                          </Box>
                          <Typography variant="body2">
                            {getPaymentMethodName(transaction.payment_method)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {transaction.installmentNumber && transaction.totalInstallments ? (
                          <Chip 
                            label={`${transaction.installmentNumber}/${transaction.totalInstallments}`}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.description || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default CashReport;