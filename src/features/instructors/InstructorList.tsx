import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, 
  InputAdornment, Chip, Avatar,
  CircularProgress,
  Card, CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useInstructors } from './api/useInstructors';
import type { Instructor } from '../../types/instructor';
import { useAuth } from '../../contexts/AuthContext';
import InstructorCreateModal from '../company/components/InstructorCreateModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const InstructorList: React.FC = () => {
  const navigate = useNavigate();
  const { instructors, loading, error, refetch } = useInstructors();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  
  // Modal açma/kapatma
  const handleOpenModal = (instructor?: Instructor) => {
    setEditingInstructor(instructor || null);
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingInstructor(null);
  };
  
  const handleInstructorCreated = () => {
    refetch();
  };

  // Eğitmenleri arama ve filtreleme
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.tcNo.includes(searchTerm) ||
      instructor.phone.includes(searchTerm) ||
      (instructor.email && instructor.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = instructor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Eğitmen ekleme sayfasına yönlendirme
  const handleAddInstructor = () => {
    handleOpenModal();
  };

  // Eğitmen detay sayfasına yönlendirme
  const handleViewInstructor = (id: string) => {
    navigate(`/instructors/${id}`);
  };

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
      <Box>
             <Box sx={{flexDirection: { xs: 'column', sm: 'row' }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2}}>
        
                <PageBreadcrumb />

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddInstructor}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Yeni Eğitmen Ekle
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
            mt: 1
          }}
        >
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0, mb: 0 }}>
                     <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              Eğitmenler
            </Typography>
         
          </Box>
             <Typography variant="body1" color="text.secondary">
              Sürücü kursu eğitmenlerini yönetin
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
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}
        >
          <TextField
            placeholder="Eğitmen Ara (Ad, Soyad, TC No, Telefon)"
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
          
          <Box display="flex" gap={1}>
            <Chip 
              label="Aktif" 
              color={statusFilter === 'ACTIVE' ? 'primary' : 'default'}
              variant={statusFilter === 'ACTIVE' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('ACTIVE')}
              sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer' }}
            />
            <Chip 
              label="Pasif" 
              color={statusFilter === 'INACTIVE' ? 'primary' : 'default'}
              variant={statusFilter === 'INACTIVE' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('INACTIVE')}
              sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Eğitmen Kartları */}
      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300 
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{ 
            p: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            color: 'error.main'
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      ) : filteredInstructors.length === 0 ? (
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
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Eğitmen Bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Arama kriterlerinizi değiştirin veya yeni bir eğitmen ekleyin.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddInstructor}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Yeni Eğitmen Ekle
          </Button>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: 'flex-start'
        }}>
          {filteredInstructors.map(instructor => {
            const statusInfo = getStatusInfo(instructor.status);
            return (
              <Box
                key={instructor.id}
                sx={{
                  flex: '0 0 calc(25% - 18px)', // Her bir kart row'un 1/4'ünü alır
                  minWidth: 280,
                  maxWidth: 'calc(25% - 18px)',
                  '@media (max-width: 1200px)': {
                    flex: '0 0 calc(33.333% - 16px)',
                    maxWidth: 'calc(33.333% - 16px)'
                  },
                  '@media (max-width: 900px)': {
                    flex: '0 0 calc(50% - 12px)',
                    maxWidth: 'calc(50% - 12px)'
                  },
                  '@media (max-width: 600px)': {
                    flex: '0 0 100%',
                    maxWidth: '100%'
                  }
                }}
              >
                <Card 
                  elevation={0}
                  onClick={() => handleViewInstructor(instructor.id)}
                  sx={{ 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: 380,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Avatar 
                      src={instructor.profileImage ? `${API_URL}${instructor.profileImage}` : undefined}
                      alt={`${instructor.firstName} ${instructor.lastName}`}
                      sx={{ 
                        width: 56, 
                        height: 56,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {instructor.firstName} {instructor.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {instructor.specialization || 'Eğitmen'}
                      </Typography>
                      <Box mt={0.5}>
                        <Chip 
                          label={statusInfo.text}
                          color={statusInfo.color as any}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    py: 2, 
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box 
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5 // Daha az boşluk
                      }}
                    >
                      {/* İletişim Bilgileri - Daha kompakt */}
                      <Box 
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        {/* TC No */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BadgeIcon fontSize="small" color="primary" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">TC No</Typography>
                            <Typography variant="body2" noWrap>{instructor.tcNo}</Typography>
                          </Box>
                        </Box>
                        
                        {/* Telefon */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="primary" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Telefon</Typography>
                            <Typography variant="body2" noWrap>+90 {instructor.phone}</Typography>
                          </Box>
                        </Box>
                        
                        {/* Adres Bilgisi */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="primary" sx={{ mt: 0.3, flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Adres</Typography>
                            <Typography variant="body2" noWrap>
                              {instructor.province ? `${instructor.province} / ${instructor.district || ''}` : '-'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Ehliyet Sınıfları */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <DriveEtaIcon fontSize="small" color="primary" sx={{ mt: 0.3, flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Ehliyet Sınıfları</Typography>
                            <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                              {instructor.licenseTypes && instructor.licenseTypes.length > 0 ? 
                                instructor.licenseTypes.map(type => ( // Tüm ehliyet tiplerini göster
                                  <Chip 
                                    key={type}
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderRadius: 1,
                                      height: 22,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                ))
                                : 
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              }
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Max Öğrenci/Dönem */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="primary" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">Max Öğrenci/Dönem</Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {instructor.maxStudentsPerPeriod || 10} öğrenci
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
      
      {/* Eğitmen Ekleme/Düzenleme Modal */}
      <InstructorCreateModal
        open={openModal}
        onClose={handleCloseModal}
        onInstructorCreated={handleInstructorCreated}
        companyId={user?.companyId || undefined}
        editingInstructor={editingInstructor}
      />
    </Box>
  );
};

export default InstructorList;
