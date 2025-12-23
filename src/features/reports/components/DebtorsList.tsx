import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon,
  FileDownload as FileDownloadIcon,
  Sms as SmsIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

interface DebtorStudent {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  daysPastDue: number;
  installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: 'paid' | 'overdue' | 'upcoming';
    paidDate?: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const DebtorsList: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2025-09-01');
  const [endDate, setEndDate] = useState<string>('2025-09-30');

  // Mock borçlu öğrenci verileri
  const debtorStudents: DebtorStudent[] = [
    {
      id: '1',
      name: 'Ahmet',
      surname: 'Yılmaz',
      phone: '05321234567',
      email: 'ahmet@email.com',
      totalAmount: 3500,
      paidAmount: 1500,
      remainingAmount: 2000,
      overdueAmount: 1200,
      lastPaymentDate: '2025-08-15',
      nextPaymentDate: '2025-09-15',
      daysPastDue: 12,
      riskLevel: 'high',
      installments: [
        { installmentNumber: 1, amount: 1500, dueDate: '2025-08-15', status: 'paid', paidDate: '2025-08-15' },
        { installmentNumber: 2, amount: 1200, dueDate: '2025-09-15', status: 'overdue' },
        { installmentNumber: 3, amount: 800, dueDate: '2025-10-15', status: 'upcoming' }
      ]
    },
    {
      id: '2',
      name: 'Mehmet',
      surname: 'Kaya',
      phone: '05331234567',
      totalAmount: 4000,
      paidAmount: 2000,
      remainingAmount: 2000,
      overdueAmount: 2000,
      lastPaymentDate: '2025-07-20',
      nextPaymentDate: '2025-08-20',
      daysPastDue: 38,
      riskLevel: 'critical',
      installments: [
        { installmentNumber: 1, amount: 2000, dueDate: '2025-07-20', status: 'paid', paidDate: '2025-07-20' },
        { installmentNumber: 2, amount: 2000, dueDate: '2025-08-20', status: 'overdue' }
      ]
    },
    {
      id: '3',
      name: 'Fatma',
      surname: 'Demir',
      phone: '05441234567',
      email: 'fatma@email.com',
      totalAmount: 3000,
      paidAmount: 2000,
      remainingAmount: 1000,
      overdueAmount: 500,
      lastPaymentDate: '2025-09-01',
      nextPaymentDate: '2025-09-20',
      daysPastDue: 7,
      riskLevel: 'medium',
      installments: [
        { installmentNumber: 1, amount: 1000, dueDate: '2025-08-01', status: 'paid', paidDate: '2025-08-01' },
        { installmentNumber: 2, amount: 1000, dueDate: '2025-09-01', status: 'paid', paidDate: '2025-09-01' },
        { installmentNumber: 3, amount: 500, dueDate: '2025-09-20', status: 'overdue' },
        { installmentNumber: 4, amount: 500, dueDate: '2025-10-20', status: 'upcoming' }
      ]
    },
    {
      id: '4',
      name: 'Ali',
      surname: 'Şahin',
      phone: '05551234567',
      totalAmount: 2800,
      paidAmount: 1400,
      remainingAmount: 1400,
      overdueAmount: 700,
      lastPaymentDate: '2025-08-25',
      nextPaymentDate: '2025-09-25',
      daysPastDue: 2,
      riskLevel: 'low',
      installments: [
        { installmentNumber: 1, amount: 1400, dueDate: '2025-08-25', status: 'paid', paidDate: '2025-08-25' },
        { installmentNumber: 2, amount: 700, dueDate: '2025-09-25', status: 'overdue' },
        { installmentNumber: 3, amount: 700, dueDate: '2025-10-25', status: 'upcoming' }
      ]
    }
  ];

  // Filtrelenmiş veriler
  const filteredDebtors = debtorStudents.filter(student => {
    const nextPayment = new Date(student.nextPaymentDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return nextPayment >= start && nextPayment <= end && student.remainingAmount > 0;
  });

  // İstatistikler
  const totalDebtors = filteredDebtors.length;
  const totalDebt = filteredDebtors.reduce((sum, student) => sum + student.remainingAmount, 0);
  const totalOverdue = filteredDebtors.reduce((sum, student) => sum + student.overdueAmount, 0);
  const criticalDebtors = filteredDebtors.filter(s => s.riskLevel === 'critical').length;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Düşük Risk';
      case 'medium': return 'Orta Risk';
      case 'high': return 'Yüksek Risk';
      case 'critical': return 'Kritik Risk';
      default: return level;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Borçlu Öğrenciler Listesi
      </Typography>

      {/* Uyarı */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>{totalOverdue.toLocaleString()} ₺</strong> vadesi geçmiş borç bulunmaktadır. 
          <strong> {criticalDebtors} öğrenci</strong> kritik risk seviyesindedir.
        </Typography>
      </Alert>

      {/* Filtreler */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Tarih Aralığı Filtresi
        </Typography>
        <Grid container spacing={3} alignItems="end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{ py: 1.5 }}
            >
              Excel İndir
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SmsIcon />}
              sx={{ py: 1.5 }}
            >
              Toplu SMS
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Özet Kartları */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalDebtors}
                  </Typography>
                  <Typography color="text.secondary">
                    Borçlu Öğrenci
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    ₺{totalDebt.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">
                    Toplam Borç
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <CalendarTodayIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    ₺{totalOverdue.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">
                    Vadesi Geçmiş
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {criticalDebtors}
                  </Typography>
                  <Typography color="text.secondary">
                    Kritik Risk
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Borçlu Öğrenciler Listesi */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Borçlu Öğrenciler Detayı ({filteredDebtors.length} adet)
          </Typography>
        </Box>
        <Divider />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Öğrenci</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>İletişim</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Toplam Tutar</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ödenen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kalan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vadesi Geçen</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Geçikme</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Risk Seviyesi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDebtors.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box>
                      <Typography fontWeight={600}>
                        {student.name} {student.surname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {student.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        📱 {student.phone}
                      </Typography>
                      {student.email && (
                        <Typography variant="body2" color="text.secondary">
                          📧 {student.email}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      ₺{student.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="success.main" fontWeight={600}>
                      ₺{student.paidAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="warning.main" fontWeight={600}>
                      ₺{student.remainingAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="error.main" fontWeight={600}>
                      ₺{student.overdueAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${student.daysPastDue} gün`}
                      size="small"
                      color={student.daysPastDue > 30 ? 'error' : student.daysPastDue > 7 ? 'warning' : 'info'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getRiskLevelText(student.riskLevel)}
                      size="small"
                      color={getRiskLevelColor(student.riskLevel) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Ara">
                        <IconButton size="small" color="primary">
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="SMS Gönder">
                        <IconButton size="small" color="warning">
                          <SmsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ödeme Al">
                        <IconButton size="small" color="success">
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {student.email && (
                        <Tooltip title="Email Gönder">
                          <IconButton size="small" color="info">
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DebtorsList;