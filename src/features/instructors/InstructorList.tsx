import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField, 
  InputAdornment, Chip, Avatar,
  CircularProgress,
  Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, IconButton, FormHelperText
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Close as CloseIcon,
  CameraAlt as CameraAltIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { useInstructors, createInstructor, updateInstructor } from './api/useInstructors';
import type { Instructor } from '../../types/instructor';
import { useLocations } from '../../api/useLocations';
import { INSTRUCTOR_SPECIALIZATIONS, LICENSE_TYPES } from '../../types/instructor';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const InstructorList: React.FC = () => {
  const navigate = useNavigate();
  const { instructors, loading, error, refetch } = useInstructors();
  const { cities, fetchCities, fetchDistricts } = useLocations();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    email: '',
    gender: 'MALE',
    province: '',
    district: '',
    address: '',
    specialization: '',
    experience: 0,
    maxStudentsPerPeriod: 10,
    licenseTypes: [] as string[],
    status: 'ACTIVE',
    startDate: '',
    notes: '',
    profilePhoto: ''
  });
  
  // İlleri yükle
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  
  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (formData.province) {
      const selectedCity = cities.find(city => city.name === formData.province);
      if (selectedCity) {
        fetchDistricts(selectedCity.id).then(setDistricts);
      }
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.province, cities, fetchDistricts]);
  
  // Modal açma
  const handleOpenModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        tcNo: instructor.tcNo,
        phone: instructor.phone,
        email: instructor.email || '',
        gender: instructor.gender || 'MALE',
        province: instructor.province || '',
        district: instructor.district || '',
        address: instructor.address || '',
        specialization: instructor.specialization || '',
        experience: instructor.experience || 0,
        maxStudentsPerPeriod: instructor.maxStudentsPerPeriod || 10,
        licenseTypes: instructor.licenseTypes || [],
        status: instructor.status || 'ACTIVE',
        startDate: instructor.startDate || '',
        notes: instructor.notes || '',
        profilePhoto: instructor.profilePhoto || ''
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        firstName: '',
        lastName: '',
        tcNo: '',
        phone: '',
        email: '',
        gender: 'MALE',
        province: '',
        district: '',
        address: '',
        specialization: '',
        experience: 0,
        maxStudentsPerPeriod: 10,
        licenseTypes: [],
        status: 'ACTIVE',
        startDate: '',
        notes: '',
        profilePhoto: ''
      });
    }
    setOpenModal(true);
  };
  
  // Modal kapatma
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingInstructor(null);
  };
  
  // Form submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const companyId = user?.companyId || undefined;
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tcNo: formData.tcNo,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        province: formData.province,
        district: formData.district,
        address: formData.address,
        specialization: formData.specialization,
        experience: formData.experience,
        maxStudentsPerPeriod: formData.maxStudentsPerPeriod,
        licenseTypes: formData.licenseTypes,
        status: formData.status,
        startDate: formData.startDate,
        notes: formData.notes,
        profilePhoto: formData.profilePhoto
      };
      
      if (editingInstructor) {
        await updateInstructor(editingInstructor.id, payload, companyId);
        setSnackbar({
          open: true,
          message: 'Eğitmen başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        await createInstructor(payload, companyId);
        setSnackbar({
          open: true,
          message: 'Eğitmen başarıyla eklendi',
          severity: 'success'
        });
      }
      
      handleCloseModal();
      refetch();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
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
            startIcon={<AddIcon />}
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
                      src={instructor.profilePhoto ? `${API_URL}${instructor.profilePhoto}` : undefined}
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
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              {editingInstructor ? 'Eğitmen Düzenle' : 'Yeni Eğitmen Ekle'}
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            {/* Profil Fotoğrafı */}
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
              <Avatar 
                src={formData.profilePhoto}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<CameraAltIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Fotoğraf Yükle
              </Button>
            </Grid>
            
            {/* Ad */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            
            {/* Soyad */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            
            {/* TC Kimlik No */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="TC Kimlik No"
                required
                value={formData.tcNo}
                onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                inputProps={{ maxLength: 11 }}
              />
            </Grid>
            
            {/* Telefon */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                required
                placeholder="5XX XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                      +90
                    </Box>
                  ),
                }}
              />
            </Grid>
            
            {/* E-posta */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            
            {/* Cinsiyet */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.gender}
                  label="Cinsiyet"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="MALE">Erkek</MenuItem>
                  <MenuItem value="FEMALE">Kadın</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* İşe Başlama Tarihi */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="İşe Başlama Tarihi"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Uzmanlık Alanı */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Uzmanlık Alanı</InputLabel>
                <Select
                  value={formData.specialization}
                  label="Uzmanlık Alanı"
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  {INSTRUCTOR_SPECIALIZATIONS.map(spec => (
                    <MenuItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Tecrübe (Yıl) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tecrübe (Yıl)"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
              />
            </Grid>
            
            {/* Max Öğrenci/Dönem */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Öğrenci/Dönem"
                type="number"
                value={formData.maxStudentsPerPeriod}
                onChange={(e) => setFormData({ ...formData, maxStudentsPerPeriod: parseInt(e.target.value) || 10 })}
                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                inputProps={{ min: 1, max: 100 }}
                helperText="Bir dönemde alabileceği max öğrenci sayısı"
              />
            </Grid>
            
            {/* Durum */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={formData.status}
                  label="Durum"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ACTIVE">Aktif</MenuItem>
                  <MenuItem value="INACTIVE">Pasif</MenuItem>
                  <MenuItem value="PENDING">Onay Bekliyor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Ehliyet Sınıfları */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ehliyet Sınıfları</InputLabel>
                <Select
                  multiple
                  value={formData.licenseTypes}
                  label="Ehliyet Sınıfları"
                  onChange={(e) => setFormData({ ...formData, licenseTypes: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {LICENSE_TYPES.map(license => (
                    <MenuItem key={license.value} value={license.value}>
                      {license.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Birden fazla seçim yapabilirsiniz</FormHelperText>
              </FormControl>
            </Grid>
            
            {/* İl */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>İl</InputLabel>
                <Select
                  value={formData.province}
                  label="İl"
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                >
                  {cities.map(city => (
                    <MenuItem key={city.id} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* İlçe */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.province}>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.district}
                  label="İlçe"
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  {districts.map(district => (
                    <MenuItem key={district.id} value={district.name}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Adres */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            
            {/* Notlar */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Eğitmen hakkında notlar..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !formData.firstName || !formData.lastName || !formData.tcNo || !formData.phone}
          >
            {submitting ? <CircularProgress size={24} /> : (editingInstructor ? 'Güncelle' : 'Kaydet')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InstructorList;
