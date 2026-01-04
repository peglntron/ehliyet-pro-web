import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, 
  Button, Chip, CircularProgress, Snackbar, Alert, Pagination, Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { getActiveStudents, getCompletedStudents, getInactiveStudents } from './api/useStudentsReal';
import { updateWrittenExamStatus, updateDrivingExamStatus, resetExamStatus } from './api/examService';
import { studentAPI } from '../../api/students';
import type { Student, Notification } from './types/types';
import { getExamStatusDisplay, getStudentOverallStatus } from './utils/examUtils';
import StudentListItem from './components/StudentListItem';
import StudentDetailModal from './components/StudentDetailModal';
import NotificationModal from './components/NotificationModal';
import NewExamStatusModal from './components/NewExamStatusModal';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useNavigate } from 'react-router-dom';

const StudentList: React.FC = () => {
  const navigate = useNavigate(); // navigate fonksiyonu eklendi
  
  // State tanımlamaları
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);
  const [examStatusModalOpen, setExamStatusModalOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  // Kursiyerleri yükle
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        let data: Student[];
        
        if (filterStatus === 'completed') {
          // Tamamlananlar sekmesi için ayrı API
          data = await getCompletedStudents();
        } else if (filterStatus === 'inactive') {
          // Pasifler sekmesi için ayrı API
          data = await getInactiveStudents();
        } else {
          // Tümü, Yazılı Sınav, Direksiyon Sınavı için aynı API (aktif öğrenciler)
          data = await getActiveStudents();
        }
        
        setStudents(data);
      } catch (error) {
        console.error('Kursiyerler yüklenirken hata oluştu:', error);
        setSnackbarMessage('Kursiyerler yüklenirken hata oluştu!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [filterStatus]); // filterStatus değiştiğinde yeniden yükle

  // Arama fonksiyonu
    // Filtreleme fonksiyonu
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Arama filtresi
      const searchMatch = 
        student.tcNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Durum filtresi
      let statusMatch = true;
      if (filterStatus === 'all') {
        // Tümü - Tüm aktif öğrenciler
        statusMatch = true;
      } else if (filterStatus === 'written') {
        // Yazılı Sınav - Yazılı sınav bekleyenler (henüz yazılıyı geçmemiş)
        statusMatch = student.writtenExam.status !== 'passed';
      } else if (filterStatus === 'driving') {
        // Direksiyon Sınavı - Direksiyon sınav bekleyenler (yazılı geçmiş, direksiyon bekliyor)
        statusMatch = student.writtenExam.status === 'passed' && student.drivingExam.status !== 'passed';
      } else if (filterStatus === 'completed') {
        // Tamamlananlar (API'de zaten tamamlanmış öğrenciler geldi - her iki sınavı da geçmiş)
        statusMatch = true;
      } else if (filterStatus === 'inactive') {
        // Pasifler (API'de zaten pasif öğrenciler geldi)
        statusMatch = true;
      }
      
      return searchMatch && statusMatch;
    });
  }, [students, searchTerm, filterStatus]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Sayfa değiştiğinde
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Sayfanın üstüne scroll yap
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Kursiyer seçme ve detay sayfasına yönlendirme
  const handleStudentClick = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  // Bildirim modalını açma
  const handleOpenNotification = (student: Student) => {
    setSelectedStudent(student);
    setNotificationModalOpen(true);
  };





  // Sınav durumu modalını açma
  const handleExamStatusClick = (student: Student) => {
    setSelectedStudent(student);
    setExamStatusModalOpen(true);
  };

  // Sınav durumu güncelleme
  const handleUpdateExamStatus = async (updatedStudent: Student) => {
    // Sınav durumu değiştiğinde listeyi yeniden yükle
    // Çünkü status 'COMPLETED' olmuşsa aktif listeden çıkmalı
    try {
      setLoading(true);
      let data: Student[];
      
      if (filterStatus === 'completed') {
        data = await getCompletedStudents();
      } else if (filterStatus === 'inactive') {
        data = await getInactiveStudents();
      } else {
        data = await getActiveStudents();
      }
      
      setStudents(data);
    } catch (error) {
      console.error('Liste yenilenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bildirim gönder işlemi
  const handleSendNotification = (student: Student) => {
    setSelectedStudent(student);
    setNotificationModalOpen(true);
  };

  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Başlık ve Üst Kısım */}
      <Box mb={3}>
        
        <Box sx={{flexDirection: { xs: 'column', sm: 'row' }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2}}>

        <PageBreadcrumb />
                 <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/students/add')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Yeni Kursiyer Ekle
          </Button>
        </Box>
        
        <Box 
          mt={1} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0, mb: 0 }}>
            <GroupIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              Kursiyer Listesi
            </Typography>
          </Box>

            <Typography variant="body1" color="text.secondary">
              Sistemdeki tüm kursiyerleri görüntüleyin ve yönetin
            </Typography>
            </Box>
          
     
        </Box>
      </Box>
      
      {/* Arama ve Filtre Alanı */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <TextField
            placeholder="Kursiyer Ara (Ad, Soyad, TC No, Telefon)"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ 
              maxWidth: { xs: '100%', sm: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label="Tümü" 
              color={filterStatus === 'all' ? "primary" : "default"}
              variant={filterStatus === 'all' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => setFilterStatus('all')}
              clickable
            />
            <Chip 
              label="Yazılı Sınav" 
              color={filterStatus === 'written' ? "info" : "default"}
              variant={filterStatus === 'written' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => setFilterStatus('written')}
              clickable
            />
            <Chip 
              label="Direksiyon Sınavı" 
              color={filterStatus === 'driving' ? "warning" : "default"}
              variant={filterStatus === 'driving' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => setFilterStatus('driving')}
              clickable
            />
            <Chip 
              label="Tamamlananlar" 
              color={filterStatus === 'completed' ? "success" : "default"}
              variant={filterStatus === 'completed' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => setFilterStatus('completed')}
              clickable
            />
            <Chip 
              label="Pasifler" 
              color={filterStatus === 'inactive' ? "error" : "default"}
              variant={filterStatus === 'inactive' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => setFilterStatus('inactive')}
              clickable
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Kursiyer Listesi */}
      <Paper
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          mb: 3
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : filteredStudents.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography color="text.secondary">
              {searchTerm ? 'Arama kriterlerine uygun kursiyer bulunamadı' : 'Henüz kursiyer bulunmamaktadır'}
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Liste Başlığı */}
            <Box 
              sx={{ 
                display: 'flex', 
                bgcolor: 'grey.50', 
                p: 2,
                pl: 3,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ width: 50, mr: 1 }}></Box> {/* Avatar alanı */}
              <Box sx={{ width: '22%', fontWeight: 600, pr: 2 }}>Ad Soyad / TC No</Box>
              <Box sx={{ width: '13%', fontWeight: 600, pr: 2 }}>Telefon</Box>
              <Box sx={{ width: '8%', fontWeight: 600, pr: 2 }}>Ehliyet</Box>
              <Box sx={{ width: '13%', fontWeight: 600, pr: 2 }}>Sınav Tarihi</Box>
              <Box sx={{ width: '14%', fontWeight: 600, pr: 1 }}>Durum</Box>
              <Box sx={{ width: '10%', fontWeight: 600, pr: 1, textAlign: 'right' }}>Ödeme Planı</Box>
              <Box sx={{ width: '20%', fontWeight: 600, textAlign: 'right' }}>İşlemler</Box>
            </Box>
            
            {/* Kursiyer Listesi */}
            <Box>
              {paginatedStudents.map((student, index) => (
                <React.Fragment key={student.id}>
                  <StudentListItem 
                    student={student} 
                    onClick={() => handleStudentClick(student)} 
                    onSendNotification={handleSendNotification}
                    onExamStatusClick={handleExamStatusClick}
                  />
                  {/* Son öğe değilse divider ekle */}
                  {index < paginatedStudents.length - 1 && (
                    <Divider sx={{ borderColor: 'grey.200' }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Detay Modalı */}
      <StudentDetailModal 
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedStudent}
        onNotificationClick={handleOpenNotification}
      />
      
      {/* Bildirim Gönderme Modalı */}
      <NotificationModal 
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        student={selectedStudent}
        onSuccess={() => {
          setSnackbarMessage('Bildirim başarıyla gönderildi!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }}
      />
      
      {/* Sınav Durumu Modalı */}
      <NewExamStatusModal 
        key={selectedStudent?.id || 'no-student'}
        open={examStatusModalOpen}
        onClose={() => setExamStatusModalOpen(false)}
        student={selectedStudent}
        onUpdateExamStatus={handleUpdateExamStatus}
      />
      
      {/* Pagination - Sadece öğrenci varsa göster */}
      {filteredStudents.length > 0 && (
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
                ({filteredStudents.length} öğrenciden {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} arası)
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
  );
};

export default StudentList;
