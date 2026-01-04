import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Divider, Grid,
  Chip, Snackbar, Alert, Tabs, Tab, Avatar,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { getStudentById } from './api/useStudentsReal';
import { studentAPI } from '../../api/students';
import type { Student, Payment } from './types/types';
import NotificationModal from './components/NotificationModal';
import EditPersonalInfoModal from './components/EditPersonalInfoModal';
import EditExamInfoModal from './components/EditExamInfoModal';
import AddPaymentModal from './components/AddPaymentModal';
import { ReceivePaymentModal } from './components/ReceivePaymentModal';
import StudentPersonalInfoCard from './components/detail/StudentPersonalInfoCard';
import StudentExamInfoCard from './components/detail/StudentExamInfoCard';
import StudentPaymentInfoCard from './components/detail/StudentPaymentInfoCard';
import StudentDocumentsCard from './components/detail/StudentDocumentsCard';
import StudentAddressCard from './components/detail/StudentAddressCard';

const StudentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  
  // State tanımlamaları
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal durumları
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [examInfoModalOpen, setExamInfoModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<'payment' | 'debt'>('payment'); // YENİ
  const [installmentPaymentModalOpen, setInstallmentPaymentModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [receivePaymentModalOpen, setReceivePaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Payment | null>(null);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Snackbar durumları
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Kursiyer verilerini yükle
  useEffect(() => {
    if (id) {
      setLoading(true);
      getStudentById(id)
        .then(data => {
          setStudent(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Kursiyer yüklenirken hata:', error);
          setSnackbarMessage('Kursiyer bilgileri yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id]);
  
  // Bildirim gönderme işlemi başarılı olduğunda
  const handleNotificationSent = () => {
    setSnackbarMessage('Bildirim başarıyla gönderildi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Kursiyer durumunu değiştir (aktif/pasif)
  const handleToggleStatus = async () => {
    if (!student) return;
    
    try {
      const newStatus = student.status === 'active' ? 'INACTIVE' : 'ACTIVE';
      
      // Backend API çağrısı
      await studentAPI.update(student.id, { status: newStatus });
      
      // Başarılı işlemden sonra bildiri göster
      setSnackbarMessage(`Kursiyer ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} hale getirildi!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // State'i güncelle
      setStudent(prev => prev ? { ...prev, status: newStatus === 'ACTIVE' ? 'active' : 'inactive' } : null);
      
      // Dialog'u kapat
      setConfirmStatusDialogOpen(false);
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setSnackbarMessage('Kursiyer durumu değiştirilirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Kişisel bilgileri güncelleme işlemi başarılı olduğunda
  const handlePersonalInfoUpdated = async (updatedStudent: Partial<Student>) => {
    if (!student || !id) return;
    
    // API'den güncel student verisini çek (adapter'dan geçmiş haliyle)
    try {
      const freshStudent = await getStudentById(id);
      setStudent(freshStudent);
      setSnackbarMessage('Kişisel bilgiler başarıyla güncellendi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Student yenileme hatası:', error);
      // Hata olursa en azından gelen veriyi kullan
      setStudent(updatedStudent as Student);
      setSnackbarMessage('Kişisel bilgiler başarıyla güncellendi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };
  
  // Helper: Ödenen toplam tutar
  // Sınav bilgilerini güncelleme işlemi başarılı olduğunda
  const handleExamInfoUpdated = async (updatedStudent: Partial<Student>) => {
    if (!student || !id) return;
    
    // API'den güncel student verisini çek (adapter'dan geçmiş haliyle)
    try {
      const freshStudent = await getStudentById(id);
      setStudent(freshStudent);
      setSnackbarMessage('Sınav bilgileri başarıyla güncellendi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Student yenileme hatası:', error);
      // Hata olursa en azından gelen veriyi kullan
      setStudent(updatedStudent as Student);
      setSnackbarMessage('Sınav bilgileri başarıyla güncellendi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };
  
  // Ödeme ekleme işlemi başarılı olduğunda
  const handlePaymentAdded = async (payment: any) => {
    if (!student || !id) return;
    
    // API'den güncel student verisini çek (adapter'dan geçmiş haliyle)
    try {
      const freshStudent = await getStudentById(id);
      setStudent(freshStudent);
      
      // Mesajı payment tipine göre belirle
      if (payment.status === 'PENDING') {
        setSnackbarMessage('Borç başarıyla eklendi!');
      } else {
        setSnackbarMessage('Ödeme başarıyla eklendi!');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Student yenileme hatası:', error);
      
      // Hata olursa manuel güncelleme yap
      const newPayments = [...(student.payments || []), payment];
      
      if (payment.status === 'PENDING') {
        const updatedStudent = {
          ...student,
          payments: newPayments,
          totalPayment: (Number(student.totalPayment) || 0) + Number(payment.amount)
        };
        setStudent(updatedStudent);
        setSnackbarMessage('Borç başarıyla eklendi!');
      } else {
        const updatedStudent = {
          ...student,
          payments: newPayments
        };
        setStudent(updatedStudent);
        setSnackbarMessage('Ödeme başarıyla eklendi!');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  // Formatlı tarih
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Durum bilgisine göre renk ve metin belirleme (StudentListItem ile uyumlu)
  const getStatusInfo = (status: string) => {
    if (status === 'driving-passed' || status === 'both-passed') {
      return { color: 'success', text: 'Direksiyon Sınavını Geçti' };
    } else if (status === 'written-passed') {
      return { color: 'info', text: 'Yazılı Sınavı Geçti' };
    } else {
      // active, inactive veya diğer durumlar
      return { color: 'default', text: 'Yeni Kayıt' };
    }
  };
  
  // Ödeme durumuna göre renk ve metin belirleme
  const getPaymentStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return { color: 'success', text: 'Ödendi' };
      case 'PENDING':
        return { color: 'warning', text: 'Beklemede' };
      case 'CANCELLED':
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
      case 'pos':
        return 'POS';
      default:
        return method;
    }
  };

  // Taksit durumu için metin belirleme
  const getInstallmentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'paid':
        return 'Ödendi';
      case 'overdue':
        return 'Gecikmiş';
      default:
        return status;
    }
  };

  // Taksit durumu için renk belirleme
  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Taksit ödeme modalını açma işlemi
  const handleInstallmentPayment = (installment: any) => {
    // Taksit sırası kontrolü - önceki taksitler ödenmemiş mi?
    if (installment.installmentNumber > 1) {
      const previousInstallments = student?.payments?.filter(p => 
        p.type === 'INSTALLMENT' &&
        p.relatedDebtId === installment.relatedDebtId &&
        p.installmentNumber < installment.installmentNumber &&
        p.status === 'PENDING'
      ) || [];

      if (previousInstallments.length > 0) {
        const unpaidNumbers = previousInstallments.map(p => p.installmentNumber).join(', ');
        setSnackbarMessage(`${installment.installmentNumber}. taksiti ödemeden önce ${unpaidNumbers}. taksitleri ödemelisiniz.`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }
    }

    setSelectedInstallment(installment);
    setInstallmentPaymentModalOpen(true);
  };

  // Gerçek taksit ödeme işlemi
  const processInstallmentPayment = async (installment: any, paymentMethod: 'cash' | 'credit' | 'bank' | 'pos') => {
    if (!student || !id) return;
    
    try {
      // Backend'e taksit durumunu PAID olarak güncelle
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // PaymentMethod enum değerlerini backend formatına çevir
      const methodMap: Record<string, string> = {
        'cash': 'CASH',
        'credit': 'CREDIT_CARD',
        'bank': 'BANK_TRANSFER',
        'pos': 'POS'
      };
      
      const response = await fetch(`${API_URL}/api/payments/${installment.id}/mark-paid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method: methodMap[paymentMethod],
          paymentDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Taksit ödemesi güncellenemedi');
      }

      // Başarılı - öğrenci verisini yeniden yükle
      const updatedStudent = await getStudentById(id);
      setStudent(updatedStudent);
      
      setSnackbarMessage(`${installment.installmentNumber}. taksit başarıyla ödendi!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setInstallmentPaymentModalOpen(false);
    } catch (error) {
      console.error('Taksit ödeme hatası:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Taksit ödemesi alınırken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Ödemeyi gerçekleşti olarak işaretle - Modal aç
  const handleMarkPaymentPaid = async (paymentId: string) => {
    // Borç bilgisini bul
    const debt = student?.payments?.find(p => p.id === paymentId);
    if (!debt) {
      setSnackbarMessage('Borç bulunamadı');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Bu borca yapılan ödemeleri bul
    const relatedPayments = student?.payments?.filter(p => p.relatedDebtId === paymentId) || [];
    const totalPaid = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingDebt = debt.amount - totalPaid;
    
    console.log('Debt amount:', debt.amount);
    console.log('Already paid:', totalPaid);
    console.log('Remaining:', remainingDebt);
    
    // Kalan borcu hesapla ve modal'a gönder
    setSelectedDebt({
      ...debt,
      amount: remainingDebt > 0 ? remainingDebt : debt.amount
    });
    setReceivePaymentModalOpen(true);
  };
  
  const handleReceivePaymentSuccess = async () => {
    // Başarılı - öğrenci verisini yenile
    if (id) {
      const updatedStudent = await getStudentById(id);
      setStudent(updatedStudent);
    }
    
    setSnackbarMessage('Ödeme başarıyla kaydedildi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Ödeme kaydını sil modal aç
  const handleDeletePayment = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeletePaymentDialogOpen(true);
  };
  
  // Ödeme silmeyi onayla
  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/payments/${paymentToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ödeme kaydı silinemedi');
      }
      
      // Başarılı - öğrenci verisini yenile
      if (id) {
        const updatedStudent = await getStudentById(id);
        setStudent(updatedStudent);
      }
      
      setSnackbarMessage('Ödeme kaydı başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setDeletePaymentDialogOpen(false);
      setPaymentToDelete(null);
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Ödeme kaydı silinirken hata oluştu');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setDeletePaymentDialogOpen(false);
      setPaymentToDelete(null);
    }
  };
  
  if (!student && !loading) {
    return (
      <Box sx={{ 
        height: '100%',
        width: '100%',
        overflow: 'auto',
        bgcolor: '#f8fafc',
        boxSizing: 'border-box',
        p: { xs: 2, md: 3 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" gutterBottom color="error">
            Kursiyer Bulunamadı
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Aradığınız kursiyer bilgisi bulunamadı veya silinmiş olabilir.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2
            }}
          >
            Geri
          </Button>
        </Paper>
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ 
        height: '100%',
        width: '100%',
        overflow: 'auto',
        bgcolor: '#f8fafc',
        boxSizing: 'border-box',
        p: { xs: 2, md: 3 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }
  
  // Hesaplanan değerler - Backend'den geliyor
  const statusInfo = getStatusInfo(student?.status || '');
  const paidAmount = student?.paidAmount ?? 0;
  const totalDebt = student?.totalDebt ?? 0;
  const remainingAmount = student?.remainingDebt ?? 0;

  return (
    <Box sx={{
      height: '100vh',
      width: '100%',
      bgcolor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: { xs: 2, md: 3 }
      }}>
      {/* Başlık ve Geri Butonu */}
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Profil Resmi */}
              <Avatar
                src={student?.photoUrl ? `${API_URL}${student.photoUrl}` : undefined}
                alt={`${student?.name} ${student?.surname}`}
                sx={{
                  width: 80,
                  height: 80,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3
                }}
              >
                {!student?.photoUrl && student?.name && student?.surname && `${student.name[0]}${student.surname[0]}`}
              </Avatar>
              
              {/* İsim ve Durum */}
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'primary.main'
                    }}
                  >
                    {student?.name} {student?.surname}
                  </Typography>
                  <Chip 
                    label={statusInfo.text} 
                    color={statusInfo.color as any} 
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {student?.licenseType ? `${student.licenseType} Sınıfı Ehliyet Adayı` : 'Ehliyet Adayı'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<NotificationsIcon />}
              onClick={() => setNotificationModalOpen(true)}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Bildirim Gönder
            </Button>
            
            <Button
              variant="outlined"
              color={student?.status === 'active' ? 'error' : 'success'}
              startIcon={student?.status === 'active' ? <LockIcon /> : <LockOpenIcon />}
              onClick={() => setConfirmStatusDialogOpen(true)}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              {student?.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Geri
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* İçerik - İki Sütunlu Layout */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 3,
          minHeight: 0,
          flex: 1
        }}
      >
        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_e, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Kişisel ve Sınav Bilgileri" />
            <Tab icon={<PaymentIcon />} iconPosition="start" label="Ödeme Bilgileri" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StudentPersonalInfoCard
                  student={student}
                  onEdit={() => setPersonalInfoModalOpen(true)}
                  formatDate={formatDate}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StudentExamInfoCard
                  student={student}
                  onEdit={() => setExamInfoModalOpen(true)}
                  formatDate={formatDate}
                />
              </Grid>
            </Grid>
            
            {/* Evrak Durumu */}
            <Box mt={3}>
              <StudentDocumentsCard 
                student={student} 
                onUpdate={() => {
                  // Evrak güncellendiğinde öğrenciyi yeniden yükle
                  if (id) {
                    getStudentById(id).then(setStudent);
                  }
                }}
              />
            </Box>

            {/* Adres Bilgileri */}
            <Box mt={3}>
              <StudentAddressCard 
                student={student} 
                onEdit={() => setPersonalInfoModalOpen(true)}
              />
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <Box sx={{ minWidth: 0 }}>
            <StudentPaymentInfoCard
              student={student}
              totalDebt={totalDebt}
              paidAmount={paidAmount}
              remainingAmount={remainingAmount}
              onAddPayment={() => {
                setPaymentModalMode('payment');
                setAddPaymentModalOpen(true);
              }}
              onAddDebt={() => {
                setPaymentModalMode('debt');
                setAddPaymentModalOpen(true);
              }}
              onInstallmentPayment={handleInstallmentPayment}
              onMarkPaymentPaid={handleMarkPaymentPaid}
              onDeletePayment={handleDeletePayment}
              formatDate={formatDate}
              getInstallmentStatusText={getInstallmentStatusText}
              getInstallmentStatusColor={getInstallmentStatusColor}
              getPaymentStatusInfo={getPaymentStatusInfo}
              getPaymentMethodText={getPaymentMethodText}
            />
          </Box>
        )}
      </Box>
      
      {/* Bildirim Gönderme Modalı */}
      <NotificationModal 
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        onSuccess={handleNotificationSent}
        student={student}
      />
      
      {/* Kişisel Bilgiler Düzenleme Modalı */}
      <EditPersonalInfoModal
        open={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        onSuccess={handlePersonalInfoUpdated}
        student={student}
      />
      
      {/* Sınav Bilgileri Düzenleme Modalı */}
      <EditExamInfoModal
        open={examInfoModalOpen}
        onClose={() => setExamInfoModalOpen(false)}
        onSuccess={handleExamInfoUpdated}
        student={student}
      />
      
      {/* Ödeme/Borç Ekleme Modalı */}
      <AddPaymentModal
        open={addPaymentModalOpen}
        onClose={() => setAddPaymentModalOpen(false)}
        onSuccess={handlePaymentAdded}
        student={student}
        remainingAmount={remainingAmount}
        mode={paymentModalMode}
      />
      
      {/* Taksit Ödeme Modalı */}
      {selectedInstallment && (
        <Dialog 
          open={installmentPaymentModalOpen} 
          onClose={() => setInstallmentPaymentModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {selectedInstallment.installmentNumber}. Taksit Ödemesi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tutar: {selectedInstallment.amount?.toLocaleString('tr-TR')} ₺
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Ödeme Yöntemini Seçin:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => processInstallmentPayment(selectedInstallment, 'cash')}
                sx={{ 
                  justifyContent: 'flex-start', 
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                💵 Nakit
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => processInstallmentPayment(selectedInstallment, 'credit')}
                sx={{ 
                  justifyContent: 'flex-start', 
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                💳 Kredi Kartı
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => processInstallmentPayment(selectedInstallment, 'pos')}
                sx={{ 
                  justifyContent: 'flex-start', 
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                🏪 POS
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => processInstallmentPayment(selectedInstallment, 'bank')}
                sx={{ 
                  justifyContent: 'flex-start', 
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                🏦 Havale/EFT
              </Button>
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => setInstallmentPaymentModalOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              İptal
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Ödeme Al Modal */}
      {selectedDebt && (
        <ReceivePaymentModal
          open={receivePaymentModalOpen}
          onClose={() => {
            setReceivePaymentModalOpen(false);
            setSelectedDebt(null);
          }}
          debtId={selectedDebt.id}
          debtAmount={selectedDebt.amount}
          debtDescription={selectedDebt.description || 'Borç'}
          onSuccess={handleReceivePaymentSuccess}
        />
      )}
      
      {/* Durum Değiştirme Onay Dialog */}
      <Dialog
        open={confirmStatusDialogOpen}
        onClose={() => setConfirmStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {student?.status === 'active' ? 'Kursiyeri Pasif Yap' : 'Kursiyeri Aktif Yap'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {student?.status === 'active' 
              ? 'Kursiyeri pasif yapmak istediğinizden emin misiniz? Pasif kursiyerler sisteme giriş yapamaz.'
              : 'Kursiyeri aktif yapmak istediğinizden emin misiniz?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmStatusDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleToggleStatus}
            variant="contained"
            color={student?.status === 'active' ? 'error' : 'success'}
            sx={{ textTransform: 'none' }}
          >
            {student?.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ödeme Silme Onay Dialog */}
      <Dialog
        open={deletePaymentDialogOpen}
        onClose={() => {
          setDeletePaymentDialogOpen(false);
          setPaymentToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Ödeme Kaydını Sil
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bu ödeme kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeletePaymentDialogOpen(false);
              setPaymentToDelete(null);
            }}
            sx={{ textTransform: 'none' }}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmDeletePayment}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default StudentDetail;
