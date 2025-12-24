import React from 'react';
import {
  Box, Typography, Button, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { Student, Installment, Payment } from '../../types/types';

interface StudentPaymentInfoCardProps {
  student: Student | null;
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  onAddPayment: () => void;
  onAddDebt: () => void; // YENİ: Borç ekleme
  onInstallmentPayment: (installment: Installment) => void;
  onMarkPaymentPaid: (paymentId: string) => void;
  formatDate: (date?: string) => string;
  getInstallmentStatusText: (status: string) => string;
  getInstallmentStatusColor: (status: string) => string;
  getPaymentStatusInfo: (status: string) => { text: string; color: string };
  getPaymentMethodText: (method: string) => string;
}

const StudentPaymentInfoCard: React.FC<StudentPaymentInfoCardProps> = ({
  student,
  totalDebt,
  paidAmount,
  remainingAmount,
  onAddPayment,
  onAddDebt, // YENİ
  onInstallmentPayment,
  onMarkPaymentPaid,
  formatDate,
  getInstallmentStatusText,
  getInstallmentStatusColor,
  getPaymentStatusInfo,
  getPaymentMethodText
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600} color="primary.main">
          Ödeme Bilgileri
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddDebt}
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Borç Ekle
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 2,
        mb: 3,
        px: 2,
        py: 1.5,
        bgcolor: 'rgba(0,0,0,0.02)',
        borderRadius: 2
      }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>Toplam Tutar</Typography>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {Number(totalDebt).toLocaleString('tr-TR')} ₺
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>Ödenen Tutar</Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">
            {Number(paidAmount).toLocaleString('tr-TR')} ₺
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>Toplam Kalan</Typography>
          <Typography variant="h6" fontWeight={700} color={remainingAmount > 0 ? "error.main" : "success.main"}>
            {remainingAmount.toLocaleString('tr-TR')} ₺
          </Typography>
        </Box>
      </Box>
      
      {/* Taksit Sistemi */}
      {student?.installments && student.installments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Taksit Durumu
          </Typography>
          <TableContainer sx={{ maxHeight: 300, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Taksit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {student.installments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>{installment.installmentNumber}. Taksit</TableCell>
                    <TableCell>{installment.amount.toLocaleString('tr-TR')} ₺</TableCell>
                    <TableCell>{formatDate(installment.dueDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getInstallmentStatusText(installment.status)} 
                        color={getInstallmentStatusColor(installment.status) as any} 
                        size="small" 
                        sx={{ borderRadius: 1 }} 
                      />
                    </TableCell>
                    <TableCell>
                      {installment.status === 'pending' && remainingAmount > 0 && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onInstallmentPayment(installment)}
                          sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
                        >
                          Öde
                        </Button>
                      )}
                      {installment.status === 'paid' && installment.paymentDate && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(installment.paymentDate)}
                          </Typography>
                          <Typography variant="caption" color="primary.main" sx={{ display: 'block', fontWeight: 600 }}>
                            {installment.paymentMethod === 'cash' && '💵 Nakit'}
                            {installment.paymentMethod === 'credit' && '💳 Kredi Kartı'}
                            {installment.paymentMethod === 'pos' && '🏪 POS'}
                            {installment.paymentMethod === 'bank' && '🏦 Havale/EFT'}
                          </Typography>
                        </Box>
                      )}
                      {remainingAmount <= 0 && installment.status === 'pending' && (
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          Ödeme Tamamlandı
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Bölüm ayracı */}
      {student?.installments && student.installments.length > 0 && (
        <Box sx={{ my: 2, borderBottom: '1px solid', borderColor: 'divider' }} />
      )}

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Ödeme Geçmişi
        </Typography>
        {student?.payments && student.payments.length > 0 ? (
          <TableContainer sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ödeme Yöntemi</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  // Taksitli borçları grupla
                  const processedInstallments = new Set<number>();
                  const installmentGroups = new Map<string, Payment[]>();
                  
                  // Taksitli borçları grupla (aynı description + totalInstallments)
                  student.payments?.forEach(p => {
                    console.log('Checking payment:', p.id, 'installmentNumber:', p.installmentNumber, 'type:', p.type, 'totalInstallments:', p.totalInstallments, 'status:', p.status);
                    // DEBT veya INSTALLMENT tipinde ve installmentNumber varsa grupla (status'e bakmadan)
                    if (p.installmentNumber && (p.type === 'DEBT' || p.type === 'INSTALLMENT')) {
                      const baseKey = `${p.description}_${p.totalInstallments || 0}`;
                      console.log('Found installment payment - baseKey:', baseKey);
                      if (!installmentGroups.has(baseKey)) {
                        installmentGroups.set(baseKey, []);
                      }
                      installmentGroups.get(baseKey)!.push(p);
                    }
                  });
                  
                  console.log('Installment groups:', installmentGroups);
                  console.log('Total groups:', installmentGroups.size);
                  
                  return student.payments.map((payment, index) => {
                  // Eğer payment amount undefined ise skip et
                  if (!payment || payment.amount === undefined || payment.amount === null) {
                    return null;
                  }
                  
                  // relatedDebtId varsa (child payment), şimdilik atla - parent ile birlikte göstereceğiz
                  if (payment.relatedDebtId) {
                    return null;
                  }
                  
                  // Taksitli borç - sadece ilk taksitte parent row göster
                  if (payment.installmentNumber && (payment.type === 'DEBT' || payment.type === 'INSTALLMENT')) {
                    const groupKey = `${payment.description}_${payment.totalInstallments || 0}`;
                    const group = installmentGroups.get(groupKey) || [];
                    
                    // İlk taksit değilse atla
                    if (payment.installmentNumber !== 1) {
                      return null;
                    }
                    
                    const totalAmount = group.reduce((sum, p) => sum + p.amount, 0);
                    
                    return (
                      <React.Fragment key={`installment-group-${groupKey}`}>
                        {/* TAKSİT PLANI PARENT ROW */}
                        <TableRow sx={{ 
                          bgcolor: 'background.paper',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                          '& > td': { py: 2 }
                        }}>
                          <TableCell>
                            <Typography variant="body1" fontWeight={700}>
                              {formatDate(payment.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={700} color="primary.main" fontSize="1.1rem">
                              {totalAmount.toLocaleString('tr-TR')} ₺
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="TAKSİT PLANI" 
                              size="medium" 
                              color="primary"
                              variant='outlined'
                              sx={{ fontWeight: 700, fontSize: '0.8rem' , borderRadius:1}}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight={700}>
                              {payment.description || 'Taksitli Borç'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {group.length} Taksit
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* TAKSİT CHILD ROWS */}
                        {group.map((installment) => {
                          const instStatusInfo = getPaymentStatusInfo(installment.status);
                          const instIsPending = installment.status === 'PENDING';
                          const instIsPaid = installment.status === 'PAID';
                          
                          return (
                            <TableRow 
                              key={installment.id}
                              sx={{ 
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                '& > td': { py: 1 }
                              }}
                            >
                              <TableCell sx={{ pl: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">↳</Typography>
                                  <Typography variant="body2">{formatDate(installment.date)}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {installment.amount.toLocaleString('tr-TR')} ₺
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{getPaymentMethodText(installment.method)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${installment.installmentNumber}. Taksit`}
                                  size="small" 
                                  color="info"
                                  sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius:1 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {installment.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={instStatusInfo.text} 
                                  color={instStatusInfo.color as any} 
                                  size="small" 
                                  sx={{ borderRadius: 1 }} 
                                />
                              </TableCell>
                              <TableCell>
                                {instIsPending && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    onClick={() => onMarkPaymentPaid(installment.id)}
                                    sx={{ textTransform: 'none', minWidth: 100, px: 2 }}
                                  >
                                    Ödeme Al
                                  </Button>
                                )}
                                {instIsPaid && (
                                  <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  }
                  
                  const paymentStatusInfo = getPaymentStatusInfo(payment.status);
                  const isPending = payment.status === 'PENDING';
                  const isPaid = payment.status === 'PAID';
                  
                  // Bu borca ait child payment'ları bul
                  const childPayments = student.payments?.filter(p => p.relatedDebtId === payment.id) || [];
                  
                  return (
                    <React.Fragment key={payment.id}>
                      {/* PARENT ROW */}
                      <TableRow sx={{ 
                        bgcolor: 'background.paper',
                        borderLeft: childPayments.length > 0 ? '4px solid' : 'none',
                        borderColor: payment.type === 'DEBT' ? 'error.main' : payment.type === 'PAYMENT' ? 'success.main' : 'info.main',
                        '& > td': { py: childPayments.length > 0 ? 2 : 1 }
                      }}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={700}>
                          {formatDate(payment.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body1" 
                          fontWeight={700}
                          fontSize="1.1rem"
                        >
                          {payment.amount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{getPaymentMethodText(payment.method)}</Typography>
                      </TableCell>
                      <TableCell>
                        {payment.type === 'DEBT' ? (
                          <Chip 
                            label="BORÇ" 
                            size="medium"
                            color="error"
                            sx={{ fontWeight: 700, fontSize: '0.8rem', borderRadius:1}}
                          />
                        ) : payment.type === 'INSTALLMENT' ? (
                          <Chip 
                            label="TAKSİT" 
                            size="small" 
                            color="info"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        ) : (
                          <Chip 
                            label="ÖDEME" 
                            size="small" 
                            color="success"
                            sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius:1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body1"
                          fontWeight={700}
                        >
                          {payment.description || '-'}
                        </Typography>
                        {payment.installmentNumber && (
                          <Chip 
                            label={`${payment.installmentNumber}. Taksit`}
                            size="small" 
                            variant="outlined"
                            color="info"
                            sx={{ mt: 0.5, fontSize: '0.7rem', height: 20, borderRadius:1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={paymentStatusInfo.text} 
                          color={paymentStatusInfo.color as any} 
                          size="small" 
                          sx={{ borderRadius: 1 }} 
                        />
                      </TableCell>
                      <TableCell>
                        {/* DEBT tipinde ve PENDING ise "Ödeme Alındı" butonu göster */}
                        {payment.type === 'DEBT' && isPending && (
                          <Button
                            variant="contained"
                            size="small"
                            color="info"
                            onClick={() => onMarkPaymentPaid(payment.id)}
                            sx={{ textTransform: 'none', minWidth: 100, px: 2 }}
                          >
                            Ödeme Al
                          </Button>
                        )}
                        {payment.type === 'DEBT' && isPaid && (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                        {/* PAYMENT ve INSTALLMENT tiplerinde işlem göster */}
                        {payment.type !== 'DEBT' && isPending && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => onMarkPaymentPaid(payment.id)}
                            sx={{ textTransform: 'none', minWidth: 100, px: 2 }}
                          >
                            Ödeme Al
                          </Button>
                        )}
                        {payment.type !== 'DEBT' && isPaid && (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* CHILD ROWS - Bu borca yapılan kısmi ödemeler */}
                    {childPayments.map((childPayment) => {
                      const childStatusInfo = getPaymentStatusInfo(childPayment.status);
                      return (
                        <TableRow 
                          key={childPayment.id}
                          sx={{ 
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                            '& > td': { py: 1 }
                          }}
                        >
                          <TableCell sx={{ pl: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">↳</Typography>
                              <Typography variant="body2">{formatDate(childPayment.date)}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {childPayment.amount.toLocaleString('tr-TR')} ₺
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{getPaymentMethodText(childPayment.method)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="ÖDEME" 
                              size="small" 
                              color="success"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' , borderRadius:1}}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {childPayment.description || 'Kısmi Ödeme'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={childStatusInfo.text} 
                              color={childStatusInfo.color as any} 
                              size="small" 
                              sx={{ borderRadius: 1 }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </React.Fragment>
                  );
                })})()}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography color="text.secondary" textAlign="center">
              Henüz ödeme kaydı bulunmamaktadır
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default StudentPaymentInfoCard;
