import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, IconButton, Divider
} from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
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
  onDeletePayment: (paymentId: string) => void; // YENİ: Ödeme silme
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
  onDeletePayment, // YENİ
  formatDate,
  getInstallmentStatusText,
  getInstallmentStatusColor,
  getPaymentStatusInfo,
  getPaymentMethodText
}) => {
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());

  const handleAccordionToggle = (paymentId: string) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

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
                          Ödeme Al
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
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '10%' }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '14%' }}>Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '12%' }}>Ödeme Yöntemi</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '12%' }}>Tip</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '22%' }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '10%' }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '14%' }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  // Taksitli borçları grupla
                  const processedInstallments = new Set<number>();
                  const installmentGroups = new Map<string, Payment[]>();
                  
                  // Ödemeleri createdAt'e göre sırala (en yeni üstte)
                  const sortedPayments = [...(student.payments || [])].sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.date).getTime();
                    const dateB = new Date(b.createdAt || b.date).getTime();
                    return dateB - dateA; // Azalan sıra - en yeni üstte
                  });
                  
                  // Taksitli borçları grupla (aynı description + totalInstallments)
                  sortedPayments.forEach(p => {
                    // DEBT veya INSTALLMENT tipinde ve installmentNumber varsa grupla (status'e bakmadan)
                    if (p.installmentNumber && (p.type === 'DEBT' || p.type === 'INSTALLMENT')) {
                      const baseKey = `${p.description}_${p.totalInstallments || 0}`;
                      if (!installmentGroups.has(baseKey)) {
                        installmentGroups.set(baseKey, []);
                      }
                      installmentGroups.get(baseKey)!.push(p);
                    }
                  });
                  
                  // Görünen item sayısını hesapla (divider için ilk item kontrolü)
                  let renderedItemCount = 0;
                  
                  return sortedPayments.map((payment, index) => {
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
                    const accordionId = `installment-${groupKey}`;
                    const isExpanded = expandedAccordions.has(accordionId);
                    
                    // Taksitlerden herhangi biri ödendi mi kontrol et
                    const hasPaidInstallment = group.some(g => g.status === 'PAID');
                    const allPending = group.every(g => g.status === 'PENDING');
                    const allPaid = group.every(g => g.status === 'PAID');
                    
                    // Taksit planı için durum bilgisi
                    const installmentPlanStatus = allPaid ? 'PAID' : 'PENDING';
                    const installmentPlanStatusInfo = getPaymentStatusInfo(installmentPlanStatus);
                    
                    const shouldShowDivider = renderedItemCount > 0;
                    
                    return (
                      <React.Fragment key={`installment-group-${groupKey}`}>
                        {(() => { renderedItemCount++; return null; })()}
                        {/* TAKSİT PLANI BAŞLIK SATIRI */}
                        <TableRow 
                          onClick={() => handleAccordionToggle(accordionId)}
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.08)',
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                            '& > td': { py: 1.5, borderTop: shouldShowDivider ? '1px solid rgba(224, 224, 224, 1)' : 'none' }
                          }}
                        >
                          <TableCell sx={{ width: '10%' }}>
                            <Typography variant="body2">
                              {formatDate(payment.date)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ width: '14%' }}>
                            <Typography variant="body1" fontWeight={700} color="primary.main" fontSize="1.1rem">
                              {totalAmount.toLocaleString('tr-TR')} ₺
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ width: '12%' }}>
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          </TableCell>
                          <TableCell sx={{ width: '12%' }}>
                            <Chip 
                              label="TAKSİT PLANI" 
                              size="medium" 
                              color="primary"
                              variant='outlined'
                              sx={{ fontWeight: 700, fontSize: '0.85rem', borderRadius: 1, height: 28, minWidth: 85 }}
                            />
                          </TableCell>
                          <TableCell sx={{ width: '22%' }}>
                            <Box>
                              <Typography variant="body1" fontWeight={700}>
                                {group[0]?.description || 'Taksitli Borç'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {group.length} Taksit • {group.filter(g => g.status === 'PAID').length} Ödendi
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: '14%' }}>
                            <Chip 
                              label={installmentPlanStatusInfo.text} 
                              color={installmentPlanStatusInfo.color as any} 
                              size="medium" 
                              variant={installmentPlanStatusInfo.text === 'Ödendi' ? 'filled' : 'outlined'}
                              sx={{ 
                                borderRadius: 1,
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                height: 28,
                                minWidth: 85
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ width: '14%' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
                              {allPending && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePayment(group[0].id);
                                  }}
                                  sx={{ textTransform: 'none', minWidth: 80, px: 2 }}
                                >
                                  Sil
                                </Button>
                              )}
                              <IconButton size="small" sx={{ p: 0, ml: 'auto' }}>
                                <ExpandMoreIcon 
                                  sx={{ 
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                  }} 
                                />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {/* TAKSİT DETAYLARI */}
                        {isExpanded && group.map((installment) => {
                          const instStatusInfo = getPaymentStatusInfo(installment.status);
                          const instIsPending = installment.status === 'PENDING';
                          const instIsPaid = installment.status === 'PAID';
                          
                          return (
                            <TableRow 
                              key={installment.id}
                              sx={{ 
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' }
                              }}
                            >
                              <TableCell sx={{ pl: 6, width: '14%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">↳</Typography>
                                  <Typography variant="body2">{formatDate(installment.date)}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: '12%' }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {installment.amount.toLocaleString('tr-TR')} ₺
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ width: '12%' }}>
                                <Typography variant="body2">{getPaymentMethodText(installment.method)}</Typography>
                              </TableCell>
                              <TableCell sx={{ width: '14%' }}>
                                <Chip 
                                  label={`${installment.installmentNumber}. Taksit`}
                                  size="small" 
                                  color="info"
                                  sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1 }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: '22%' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {installment.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ width: '14%' }}>
                                <Chip 
                                  label={instStatusInfo.text} 
                                  color={instStatusInfo.color as any} 
                                  size="medium" 
                                  variant={instStatusInfo.text === 'Ödendi' ? 'filled' : 'outlined'}
                                  sx={{ 
                                    borderRadius: 1,
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    height: 28,
                                    minWidth: 85
                                  }} 
                                />
                              </TableCell>
                              <TableCell sx={{ width: '14%' }}>
                                {instIsPending && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    onClick={() => onInstallmentPayment(installment)}
                                    sx={{ textTransform: 'none', minWidth: 80, px: 1.5 }}
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
                  const hasChildren = childPayments.length > 0;
                  const accordionId = `debt-${payment.id}`;
                  const isExpanded = expandedAccordions.has(accordionId);
                  
                  const shouldShowDivider = renderedItemCount > 0;
                  
                  // Eğer child payment yoksa normal row göster
                  if (!hasChildren) {
                    renderedItemCount++;
                    return (
                      <React.Fragment key={payment.id}>
                        <TableRow sx={{ 
                        bgcolor: 'rgba(139, 195, 74, 0.06)',
                        borderLeft: '4px solid',
                        borderColor: payment.type === 'DEBT' ? 'error.main' : payment.type === 'PAYMENT' ? 'success.main' : 'info.main',
                        '&:hover': { 
                          bgcolor: 'rgba(25, 118, 210, 0.08)'
                        },
                        '& > td': { py: 1.5, borderTop: shouldShowDivider ? '1px solid rgba(224, 224, 224, 1)' : 'none' }
                      }}>
                        <TableCell sx={{ width: '10%' }}>
                          <Typography variant="body2">
                            {formatDate(payment.date)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={700}
                            fontSize="1.1rem"
                          >
                            {payment.amount.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '12%' }}>
                          <Typography variant="body2">{getPaymentMethodText(payment.method)}</Typography>
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          {payment.type === 'DEBT' ? (
                            <Chip 
                              label="BORÇ" 
                              size="medium"
                              color="error"
                              sx={{ fontWeight: 700, fontSize: '0.85rem', borderRadius: 1, height: 28, minWidth: 85 }}
                            />
                          ) : payment.type === 'INSTALLMENT' ? (
                            <Chip 
                              label="TAKSİT" 
                              size="medium" 
                              color="info"
                              sx={{ fontWeight: 700, fontSize: '0.85rem', borderRadius: 1, height: 28, minWidth: 85 }}
                            />
                          ) : (
                            <Chip 
                              label="ÖDEME" 
                              size="medium" 
                              color="success"
                              sx={{ fontWeight: 700, fontSize: '0.85rem', borderRadius: 1, height: 28, minWidth: 85 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ width: '22%' }}>
                          <Typography 
                            variant="body1"
                            fontWeight={700}
                          >
                            {payment.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Chip 
                            label={paymentStatusInfo.text} 
                            color={paymentStatusInfo.color as any} 
                            size="medium" 
                            variant={paymentStatusInfo.text === 'Ödendi' ? 'filled' : 'outlined'}
                            sx={{ 
                              borderRadius: 1,
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              height: 28,
                              minWidth: 85
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {payment.type === 'DEBT' && isPending && (() => {
                              // Taksitli bir DEBT ise, herhangi bir taksit ödenmişse sil butonu gösterme
                              let canDelete = true;
                              if (payment.totalInstallments && payment.totalInstallments > 0) {
                                const relatedInstallments = student?.payments?.filter(p => 
                                  p.relatedDebtId === payment.id && p.type === 'INSTALLMENT'
                                ) || [];
                                const hasPaidInstallment = relatedInstallments.some(inst => inst.status === 'PAID');
                                canDelete = !hasPaidInstallment;
                              }
                              
                              return (
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    onClick={() => onMarkPaymentPaid(payment.id)}
                                    sx={{ textTransform: 'none', minWidth: 50, px: 1.5, fontSize: '0.8rem' }}
                                  >
                                    Ödeme Al
                                  </Button>
                                  {canDelete && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="error"
                                      onClick={() => onDeletePayment(payment.id)}
                                      sx={{ textTransform: 'none', minWidth: 50, px: 1.5, fontSize: '0.8rem' }}
                                    >
                                      Sil
                                    </Button>
                                  )}
                                </>
                              );
                            })()}
                            {payment.type === 'DEBT' && isPaid && (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                            {payment.type !== 'DEBT' && isPending && (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  onClick={() => onMarkPaymentPaid(payment.id)}
                                  sx={{ textTransform: 'none', minWidth: 50, px: 1.5, fontSize: '0.8rem' }}
                                >
                                  Ödeme Al
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => onDeletePayment(payment.id)}
                                  sx={{ textTransform: 'none', minWidth: 50, px: 1.5, fontSize: '0.8rem' }}
                                >
                                  Sil
                                </Button>
                              </>
                            )}
                            {payment.type !== 'DEBT' && isPaid && (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      </React.Fragment>
                    );
                  }
                  
                  // Child payment varsa - başlık satırı + detaylar
                  renderedItemCount++;
                  return (
                    <React.Fragment key={payment.id}>
                      {/* BORÇ BAŞLIK SATIRI */}
                      <TableRow
                        onClick={() => handleAccordionToggle(accordionId)}
                        sx={{ 
                          bgcolor: 'rgba(46, 125, 50, 0.1)',
                          borderLeft: '4px solid',
                          borderColor: payment.type === 'DEBT' ? 'error.main' : 'info.main',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                          '& > td': { py: 1.5, borderTop: shouldShowDivider ? '1px solid rgba(224, 224, 224, 1)' : 'none' }
                        }}
                      >
                        <TableCell sx={{ width: '10%' }}>
                          <Typography variant="body2">
                            {formatDate(payment.date)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Typography variant="body1" fontWeight={700} fontSize="1.1rem">
                            {payment.amount.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '12%' }}>
                          <Typography variant="body2">{getPaymentMethodText(payment.method)}</Typography>
                        </TableCell>
                        <TableCell sx={{ width: '12%' }}>
                          <Chip 
                            label="BORÇ" 
                            size="medium"
                            color="error"
                            sx={{ fontWeight: 700, fontSize: '0.85rem', borderRadius: 1, height: 28, minWidth: 85 }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '22%' }}>
                          <Box>
                            <Typography variant="body1" fontWeight={700}>
                              {payment.description || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {childPayments.filter(cp => cp.status === 'PAID').reduce((sum, cp) => sum + cp.amount, 0).toLocaleString('tr-TR')} ₺ Ödendi • {childPayments.length} Kayıt
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Chip 
                            label={paymentStatusInfo.text} 
                            color={paymentStatusInfo.color as any} 
                            size="medium" 
                            variant={paymentStatusInfo.text === 'Ödendi' ? 'filled' : 'outlined'}
                            sx={{ 
                              borderRadius: 1,
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              height: 28,
                              minWidth: 85
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ width: '14%' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
                            {isPending && (
                              <Button
                                variant="contained"
                                size="small"
                                color="info"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkPaymentPaid(payment.id);
                                }}
                                sx={{ textTransform: 'none', minWidth: 80, px: 1.5 }}
                              >
                                Öde
                              </Button>
                            )}
                            <IconButton size="small" sx={{ p: 0, ml: 'auto' }}>
                              <ExpandMoreIcon 
                                sx={{ 
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.3s'
                                }} 
                              />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {/* CHILD PAYMENT DETAYLARI */}
                      {isExpanded && childPayments.map((childPayment) => {
                        const childStatusInfo = getPaymentStatusInfo(childPayment.status);
                        return (
                          <TableRow 
                            key={childPayment.id}
                            sx={{ 
                              bgcolor: 'rgba(0, 0, 0, 0.02)',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' }
                            }}
                          >
                            <TableCell sx={{ pl: 6, width: '14%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">↳</Typography>
                                <Typography variant="body2">{formatDate(childPayment.date)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ width: '12%' }}>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {childPayment.amount.toLocaleString('tr-TR')} ₺
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: '12%' }}>
                              <Typography variant="body2">{getPaymentMethodText(childPayment.method)}</Typography>
                            </TableCell>
                            <TableCell sx={{ width: '14%' }}>
                              <Chip 
                                label="ÖDEME" 
                                size="small" 
                                color="success"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: 1 }}
                              />
                            </TableCell>
                            <TableCell sx={{ width: '22%' }}>
                              <Typography variant="body2" color="text.secondary">
                                {childPayment.description || 'Kısmi Ödeme'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: '14%' }}>
                              <Chip 
                                label={childStatusInfo.text} 
                                color={childStatusInfo.color as any} 
                                size="small" 
                                sx={{ borderRadius: 1 }} 
                              />
                            </TableCell>
                            <TableCell sx={{ width: '14%' }}>
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
