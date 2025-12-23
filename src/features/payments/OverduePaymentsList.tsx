import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Pagination, CircularProgress
} from '@mui/material';
import {
  MoneyOff as MoneyOffIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { getOverduePayments, getPaymentSummary } from './api/usePayments';
import type { StudentPaymentStatus, PaymentSummary, PaymentFilters } from './types/types';
import OverdueSummaryCards from './components/OverdueSummaryCards';
import PaymentSearchFilters from './components/PaymentSearchFilters';
import OverduePaymentCard from './components/OverduePaymentCard';

const OverduePaymentsList: React.FC = () => {
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentFilters['status']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentStatuses, setPaymentStatuses] = useState<StudentPaymentStatus[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  
  const itemsPerPage = 20;

  // Verileri yükle
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        const [overduePayments, summary] = await Promise.all([
          getOverduePayments(),
          getPaymentSummary()
        ]);
        setPaymentStatuses(overduePayments);
        setPaymentSummary(summary);
      } catch (error) {
        console.error('Ödeme verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, []);

  // Öğrencileri filtrele
  const filteredPayments = paymentStatuses.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone.includes(searchTerm);
    
    const matchesStatus = paymentStatusFilter === 'all' || payment.paymentStatus === paymentStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Sayfa değiştiğinde
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter]);

  // Tarih formatlama
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Öğrenci detayına git
  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Standardized Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderBottomColor: 'divider'
      }}>
        <Box sx={{ flex: 1 }}>
          <PageBreadcrumb />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 2 }}>
            <MoneyOffIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main'
              }}
            >
              Ödemesi Gecikenler
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            Borcu olan öğrencilerin ödeme durumlarını takip edin
          </Typography>
        </Box>
      </Box>

      {/* Özet Kartları */}
      {paymentSummary && <OverdueSummaryCards summary={paymentSummary} />}
      
      {/* Arama ve Filtre Alanı */}
      <PaymentSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={paymentStatusFilter}
        onStatusFilterChange={setPaymentStatusFilter}
      />
      
      {/* Ödeme Listesi */}
      {filteredPayments.length === 0 ? (
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
          <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Ödeme Kaydı Bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arama kriterlerinizi değiştirin veya farklı filtreler deneyin.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {paginatedPayments.map(payment => (
            <OverduePaymentCard
              key={payment.studentId}
              payment={payment}
              onClick={() => handleStudentClick(payment.studentId)}
              formatDate={formatDate}
            />
          ))}
        </Box>
      )}
      
      {/* Pagination */}
      {filteredPayments.length > 0 && (
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
                Sayfa {currentPage} / {totalPages} 
                ({filteredPayments.length} öğrenciden {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} arası)
              </Typography>
              <Pagination 
                count={totalPages}
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
    </Box>
  );
};

export default OverduePaymentsList;