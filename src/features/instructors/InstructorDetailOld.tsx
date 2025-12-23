import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Divider, Grid,
  Chip, Snackbar, Alert, Avatar, CircularProgress, Tabs, Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Work as WorkIcon,
  Notes as NotesIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useInstructor } from './api/useInstructors';
import type { Instructor } from '../../types/instructor';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog';
import EditPersonalInfoModal from './components/EditPersonalInfoModal';
import EditEducationInfoModal from './components/EditEducationInfoModal';
import EditAddressInfoModal from './components/EditAddressInfoModal';
import AssignedVehicles from './components/AssignedVehicles';
import InstructorPersonalInfoCard from './components/detail/InstructorPersonalInfoCard';
import InstructorAddressInfoCard from './components/detail/InstructorAddressInfoCard';
import InstructorEducationInfoCard from './components/detail/InstructorEducationInfoCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const InstructorDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { instructor, loading, error, refetch } = useInstructor(id || '');
  
  // URL'den gelen bir düzenleme parametresi varsa otomatik düzenleme modunu açalım
  const urlParams = new URLSearchParams(location.search);
  const autoOpenEdit = urlParams.get('edit');
  
  // State tanımlamaları
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [educationInfoModalOpen, setEducationInfoModalOpen] = useState(false);
  const [addressInfoModalOpen, setAddressInfoModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [activeTab, setActiveTab] = useState(0);
  
  // Listeden düzenle butonuna tıklanarak gelindiyse ilgili modalı aç
  useEffect(() => {
    if (autoOpenEdit === 'personal') {
      setPersonalInfoModalOpen(true);
    } else if (autoOpenEdit === 'education') {
      setEducationInfoModalOpen(true);
    } else if (autoOpenEdit === 'address') {
      setAddressInfoModalOpen(true);
    } else if (autoOpenEdit === 'notes') {
      setNotesModalOpen(true);
    }
  }, [autoOpenEdit]);
  
  // Durum bilgisine göre renk ve metin belirleme
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'success', text: 'Aktif' };
      case 'INACTIVE':
        return { color: 'error', text: 'Pasif' };
      case 'PENDING':
        return { color: 'warning', text: 'Onay Bekliyor' };
      default:
        return { color: 'default', text: status };
    }
  };
  
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
  
  // Eğitmen durumunu değiştir (aktif/pasif)
  const handleToggleStatus = async () => {
    if (!instructor) return;
    
    try {
      // Burada API çağrısı yapılacak
      const newStatus = instructor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      // Başarılı işlemden sonra bildiri göster
      setSnackbarMessage(`Eğitmen ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} hale getirildi!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setSnackbarMessage('Eğitmen durumu değiştirilirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Eğitmen silme işlemi
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      // Burada API çağrısı yapılacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbarMessage('Eğitmen başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Kısa bir gecikme ile listeye dön
      setTimeout(() => {
        navigate('/instructors');
      }, 1500);
    } catch (error) {
      console.error('Silme hatası:', error);
      setSnackbarMessage('Eğitmen silinirken hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Kişisel bilgileri güncelleme
  const handlePersonalInfoUpdated = (updatedInfo: any) => {
    setSnackbarMessage('Kişisel bilgiler başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setPersonalInfoModalOpen(false);
    refetch(); // Instructor'ı yeniden yükle
    
    // URL'deki edit parametresini temizleyelim
    if (autoOpenEdit) {
      navigate(`/instructors/${id}`, { replace: true });
    }
  };
  
  // Eğitim bilgilerini güncelleme
  const handleEducationInfoUpdated = (updatedInfo: any) => {
    setSnackbarMessage('Eğitim bilgileri başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setEducationInfoModalOpen(false);
    refetch(); // Instructor'ı yeniden yükle
    
    // URL'deki edit parametresini temizleyelim
    if (autoOpenEdit) {
      navigate(`/instructors/${id}`, { replace: true });
    }
  };
  
  // Adres bilgilerini güncelleme
  const handleAddressInfoUpdated = (updatedInfo: any) => {
    setSnackbarMessage('Adres bilgileri başarıyla güncellendi!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setAddressInfoModalOpen(false);
    refetch(); // Instructor'ı yeniden yükle
    
    // URL'deki edit parametresini temizleyelim
    if (autoOpenEdit) {
      navigate(`/instructors/${id}`, { replace: true });
    }
  };
  
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          p: 3
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !instructor) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          p: 3
        }}
      >
        <PageBreadcrumb />
        <Paper
          elevation={0}
          sx={{ 
            p: 3,
            mt: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            color: 'error.main'
          }}
        >
          <Typography variant="h6" gutterBottom>{error || 'Eğitmen bulunamadı'}</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/instructors')}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Eğitmen Listesine Dön
          </Button>
        </Paper>
      </Box>
    );
  }
  
  const statusInfo = getStatusInfo(instructor.status);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'auto',
        bgcolor: '#f8fafc',
        p: { xs: 2, md: 3 }
      }}
    >
      {/* Üst Kısım - Breadcrumb, Başlık */}
      <Box>
            <Box sx={{flexDirection: { xs: 'column', sm: 'row' }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2}}>
        
                <PageBreadcrumb />

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/instructors')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              py: 1
            }}
          >
            Eğitmen Listesine Dön
          </Button>
      </Box>
        
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            mt: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar
              src={instructor.profilePhoto ? `${API_URL}${instructor.profilePhoto}` : undefined}
              alt={`${instructor.firstName} ${instructor.lastName}`}
              sx={{ 
                width: 80, 
                height: 80,
                border: '4px solid',
                borderColor: 'primary.main',
                boxShadow: 3
              }}
            >
              {!instructor.profilePhoto && `${instructor.firstName[0]}${instructor.lastName[0]}`}
            </Avatar>
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'primary.main'
                  }}
                >
                  {instructor.firstName} {instructor.lastName}
                </Typography>
                <Chip 
                  label={statusInfo.text} 
                  color={statusInfo.color as any} 
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {instructor.specialization || 'Eğitmen'}
              </Typography>
            </Box>
          </Box>
          
        </Box>
      </Box>
      
      {/* İçerik - Bilgi Kartları */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 3,
          mb: 3
        }}
      >
        {/* Sol Kolon */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* Kişisel Bilgiler */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Kişisel Bilgiler
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setPersonalInfoModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Düzenle
              </Button>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <PersonIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>TC Kimlik No</Typography>
                    <Typography variant="body2">{instructor.tcNo}</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <PhoneIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Telefon</Typography>
                    <Typography variant="body2">+90 {instructor.phone}</Typography>
                  </Box>
                </Box>
                
                {instructor.email && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start'
                    }}
                  >
                    <EmailIcon color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>E-posta</Typography>
                      <Typography variant="body2">{instructor.email}</Typography>
                    </Box>
                  </Box>
                )}
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <CalendarTodayIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>İşe Başlama Tarihi</Typography>
                    <Typography variant="body2">{formatDate(instructor.startDate)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Adres Bilgileri */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Adres Bilgileri
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setAddressInfoModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Düzenle
              </Button>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>İl</Typography>
                    <Typography variant="body2">{instructor.province || '-'}</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>İlçe</Typography>
                    <Typography variant="body2">{instructor.district || '-'}</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Adres</Typography>
                    <Typography variant="body2">{instructor.address || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Notlar */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotesIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Notlar
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setNotesModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Düzenle
              </Button>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start'
                }}
              >
                <NotesIcon color="primary" sx={{ mt: 0.5 }} />
                <Typography variant="body2">{instructor.notes || 'Henüz not eklenmemiş.'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        {/* Sağ Kolon */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {/* Eğitim Bilgileri */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Eğitim ve Yeterlilik Bilgileri
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEducationInfoModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Düzenle
              </Button>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <WorkIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Uzmanlık Alanı</Typography>
                    <Typography variant="body2">{instructor.specialization || '-'}</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <SchoolIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Deneyim</Typography>
                    <Typography variant="body2">{instructor.experience ? `${instructor.experience} yıl` : '-'}</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <DriveEtaIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Ehliyet Sınıfları</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        mt: 0.5
                      }}
                    >
                      {instructor.licenseTypes?.map(type => (
                        <Chip 
                          key={type}
                          label={type}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      )) || '-'}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Zimmetli Araçlar */}
          <AssignedVehicles 
            instructorId={instructor.id}
            instructorName={`${instructor.firstName} ${instructor.lastName}`}
          />
          
          {/* İşlemler */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                İşlemler
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Button
                  variant="outlined"
                  color={instructor.status === 'ACTIVE' ? 'error' : 'success'}
                  startIcon={instructor.status === 'ACTIVE' ? <LockIcon /> : <LockOpenIcon />}
                  onClick={handleToggleStatus}
                  fullWidth
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: 'none',
                    justifyContent: 'flex-start'
                  }}
                >
                  {instructor.status === 'ACTIVE' ? 'Pasif Yap' : 'Aktif Yap'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  fullWidth
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: 'none',
                    justifyContent: 'flex-start'
                  }}
                >
                  Eğitmeni Sil
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* Modallar ve Dialog'lar */}
      <EditPersonalInfoModal
        open={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        onSuccess={handlePersonalInfoUpdated}
        instructor={instructor}
      />
      
      <EditEducationInfoModal
        open={educationInfoModalOpen}
        onClose={() => setEducationInfoModalOpen(false)}
        onSuccess={handleEducationInfoUpdated}
        instructor={instructor}
      />
      
      <EditAddressInfoModal
        open={addressInfoModalOpen}
        onClose={() => setAddressInfoModalOpen(false)}
        onSuccess={handleAddressInfoUpdated}
        instructor={instructor}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eğitmeni Sil"
        content={`${instructor.firstName} ${instructor.lastName} isimli eğitmeni silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        loading={deleteLoading}
      />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
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

export default InstructorDetail;
