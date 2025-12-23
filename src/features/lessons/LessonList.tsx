import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, InputAdornment,
  Fab, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UnitCard from './components/UnitCard';
import { useLessons, useUnits } from './api/useLessons';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import LoadingIndicator from '../../components/LoadingIndicator';

const LessonList: React.FC = () => {
  const navigate = useNavigate();
  const { lessons, loading: lessonsLoading } = useLessons();
  const { units: allUnits, loading: unitsLoading } = useUnits();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLesson, setFilterLesson] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loading = lessonsLoading || unitsLoading;

  // Yeni ünite ekleme sayfasına yönlendirme
  const handleAddUnit = () => {
    navigate('/lessons/add');
  };

  // Filtreleme işlemi
  const filteredUnits = allUnits.filter((unit) => {
    const matchesSearch = 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLesson = !filterLesson || unit.lessonId === filterLesson;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && unit.isActive) ||
      (filterStatus === 'inactive' && !unit.isActive);
    
    return matchesSearch && matchesLesson && matchesStatus;
  });

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }} 
          gap={{ xs: 2, md: 0 }}
          width="100%"
        >
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Ders ve Ünite Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ehliyet dersleri ve ünitelerini yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddUnit}
            sx={{ 
              minWidth: 180,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' }
            }}
          >
            Yeni Ünite Ekle
          </Button>
        </Box>
      </Box>

      {/* Arama ve Filtreleme */}
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Stack 
          direction={{ xs: 'column', lg: 'row' }} 
          spacing={2}
          width="100%"
        >
          <TextField
            placeholder="Üniteleri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            variant="outlined"
            size="medium"
            fullWidth
          />
          
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>Ders Seçin</InputLabel>
            <Select
              value={filterLesson}
              label="Ders Seçin"
              onChange={(e) => setFilterLesson(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Tüm Dersler</MenuItem>
              {lessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1, minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus}
              label="Durum"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Ünite listesi */}
      <Box sx={{ width: '100%' }}>
        {loading ? (
          <LoadingIndicator 
            text="Üniteler yükleniyor..." 
            size="medium" 
            showBackground={true}
          />
        ) : filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => {
            const lesson = lessons.find(l => l.id === unit.lessonId);
            return (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                lessonName={lesson?.name || 'Bilinmeyen Ders'} 
              />
            );
          })
        ) : (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 3,
            mb: 3 
          }}>
            <MenuBookIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ünite bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir ünite ekleyin
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button - Mobile için */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddUnit}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          width: 64,
          height: 64,
          display: { xs: 'flex', md: 'none' },
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  );
};

export default LessonList;