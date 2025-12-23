import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { SavedMatching } from '../types/savedMatchingTypes';
import { fetchSavedMatchings, deleteMatching, fetchArchivedMatchings } from '../api/savedMatchingApi';
import PageBreadcrumb from '../../../components/PageBreadcrumb';

const SavedMatchingsList: React.FC = () => {
  const [matchings, setMatchings] = useState<SavedMatching[]>([]);
  const [filteredMatchings, setFilteredMatchings] = useState<SavedMatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatching, setSelectedMatching] = useState<SavedMatching | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadMatchings();
  }, [statusFilter]);

  const loadMatchings = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: SavedMatching[];
      
      // Arşiv filtresine göre farklı endpoint kullan
      if (statusFilter === 'archived') {
        const archivedData = await fetchArchivedMatchings(100, 0);
        data = archivedData.matchings;
      } else {
        data = await fetchSavedMatchings();
      }
      
      const sortedData = data.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      setMatchings(sortedData);
      filterMatchings(sortedData, statusFilter, searchTerm);
    } catch (err) {
      setError('Eşleştirme kayıtları yüklenirken hata oluştu');
      console.error('Error loading matchings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMatchings = (allMatchings: SavedMatching[], filter: 'active' | 'archived', search: string) => {
    let filtered = allMatchings;
    
    // Durum filtresi - Aktif veya Arşiv
    if (filter === 'active') {
      filtered = filtered.filter(m => m.status === 'active' || m.status === 'draft');
    } else if (filter === 'archived') {
      filtered = filtered.filter(m => m.status === 'archived');
    }
    
    // Arama filtresi
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        (m.licenseTypes ? m.licenseTypes.join(', ').toLowerCase().includes(searchLower) : m.licenseType?.toLowerCase().includes(searchLower)) ||
        m.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredMatchings(filtered);
  };

  const handleFilterChange = (newFilter: 'active' | 'archived') => {
    setStatusFilter(newFilter);
    filterMatchings(matchings, newFilter, searchTerm);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
    filterMatchings(matchings, statusFilter, newSearch);
  };

  const handleDelete = async () => {
    if (!selectedMatching) return;
    
    try {
      setDeleting(true);
      await deleteMatching(selectedMatching.id);
      await loadMatchings(); // Listeyi yenile
      setDeleteDialogOpen(false);
      setSelectedMatching(null);
    } catch (err) {
      setError('Eşleştirme silinirken hata oluştu');
      console.error('Error deleting matching:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'archived': return 'Arşiv';
      case 'draft': return 'Taslak';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const;
      case 'archived': return 'default' as const;
      case 'draft': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Standardized Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        pb: 2,
        mt:1,
        borderBottom: '1px solid',
        borderBottomColor: 'divider'
      }}>
        <Box sx={{ flex: 1 }}>
          <PageBreadcrumb />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,justifyContent:'flex-start',flexDirection:'row' }}>
            <AutoAwesome color="primary" sx={{ fontSize: 32 }} />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mt: 1,
              mb: 1
            }}
          >
            Kayıtlı Eşleştirmeler
          </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Kaydedilmiş öğrenci-eğitmen eşleştirmelerini görüntüleyin ve yönetin
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/matching')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Yeni Eşleştirme
          </Button>
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
            placeholder="Eşleştirme Ara (Ad, Açıklama, Ehliyet Türü, Oluşturan)"
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
            onChange={(e) => handleSearchChange(e.target.value)}
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
              color={statusFilter === 'active' ? "success" : "default"}
              variant={statusFilter === 'active' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => handleFilterChange('active')}
              clickable
            />
            <Chip 
              label="Arşiv" 
              color={statusFilter === 'archived' ? "primary" : "default"}
              variant={statusFilter === 'archived' ? "filled" : "outlined"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              onClick={() => handleFilterChange('archived')}
              clickable
            />
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Ad</strong></TableCell>
              <TableCell><strong>Ehliyet Türü</strong></TableCell>
              <TableCell><strong>Öğrenci Sayısı</strong></TableCell>
              <TableCell><strong>Eğitmen Sayısı</strong></TableCell>
              <TableCell><strong>Oluşturma Tarihi</strong></TableCell>
              <TableCell><strong>Durum</strong></TableCell>
              <TableCell><strong>Kilit Durumu</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMatchings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {statusFilter === 'active' 
                      ? 'Henüz aktif eşleştirme bulunamadı.' 
                      : 'Arşivlenmiş eşleştirme bulunamadı.'
                    }
                  </Typography>
                  {statusFilter === 'active' && (
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/matching')}
                      sx={{ mt: 2 }}
                    >
                      İlk Eşleştirmeyi Oluştur
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredMatchings.map((matching) => (
                <TableRow 
                  key={matching.id} 
                  hover
                  onClick={() => navigate(`/matching/saved/${matching.id}`)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {matching.name}
                      </Typography>
                      {matching.description && (
                        <Typography variant="caption" color="text.secondary">
                          {matching.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={(() => {
                        console.log('Matching licenseTypes:', matching.licenseTypes, 'licenseType:', matching.licenseType);
                        if (matching.licenseTypes && matching.licenseTypes.length > 0) {
                          return `${matching.licenseTypes.join(', ')} Sınıfları`;
                        } else if (matching.licenseType) {
                          return `${matching.licenseType} Sınıfı`;
                        } else {
                          return 'Bilinmiyor';
                        }
                      })()}
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{matching.totalStudents}</TableCell>
                  <TableCell>{matching.totalInstructors}</TableCell>
                  <TableCell>
                    {new Date(matching.createdDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(matching.status)} 
                      size="small" 
                      color={getStatusColor(matching.status)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={matching.isLocked ? "Kilitli" : "Açık"} 
                      size="small" 
                      color={matching.isLocked ? "error" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eşleştirmeyi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedMatching?.name}" eşleştirmesini silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedMatchingsList;