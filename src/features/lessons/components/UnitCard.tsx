import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemButton, CircularProgress } from '@mui/material';
import { 
  Edit as EditIcon, 
  Visibility as VisibilityIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Unit } from '../api/useLessons';

interface UnitCardProps {
  unit: Unit;
  lessonName: string;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, lessonName }) => {
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [contents, setContents] = useState<any[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  
  // İçerikleri yükle
  useEffect(() => {
    if (viewDialogOpen) {
      fetchContents();
    }
  }, [viewDialogOpen]);

  const fetchContents = async () => {
    try {
      setLoadingContents(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/units/${unit.id}/contents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contents fetched:', result.data);
        setContents(result.data || []);
      } else {
        console.error('Failed to fetch contents, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoadingContents(false);
    }
  };
  
  // Ünite düzenleme sayfasına yönlendirme
  const handleEdit = () => {
    navigate(`/lessons/edit/${unit.id}`);
  };
  
  // Üniteyi görüntüleme işlevi
  const handleView = () => {
    setViewDialogOpen(true);
  };

  // İçerik görüntüleme
  const handleViewContent = (contentId: string) => {
    navigate(`/units/contents/view/${contentId}`);
    setViewDialogOpen(false);
  };
  
  return (
    <>
      <Paper
        elevation={0}
        sx={{ 
          mb: 2, 
          p: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          {/* Sol kısım - Ünite bilgileri */}
          <Box flex={1}>
            <Box display="flex" alignItems="center" mb={1}>
              <Chip 
                icon={<SchoolIcon fontSize="small" />}
                label={lessonName} 
                size="small"
                sx={{ bgcolor: 'primary.light', color: 'white', fontWeight: 500, mr: 1 }}
              />
              <Chip 
                icon={<MenuBookIcon fontSize="small" />}
                label={`Ünite ${unit.displayOrder}`} 
                size="small"
                sx={{ bgcolor: 'secondary.light', color: 'white', fontWeight: 500 }}
              />
            </Box>
            
            <Typography 
              variant="h6"
              component="div"
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {unit.name}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2, 
                lineHeight: 1.5
              }}
            >
              {unit._count?.contents || 0} içerik mevcut
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {unit.isActive ? (
                <Chip 
                  size="small" 
                  label="Aktif" 
                  sx={{ bgcolor: 'success.light', color: 'white', fontWeight: 500 }}
                />
              ) : (
                <Chip 
                  size="small" 
                  label="Pasif" 
                  sx={{ bgcolor: 'text.disabled', color: 'white', fontWeight: 500 }}
                />
              )}
            </Stack>
          </Box>
          
          {/* Sağ kısım - İşlem butonları */}
          <Box 
            display="flex" 
            flexDirection="column"
            gap={1} 
            alignItems="stretch"
            justifyContent="center"
            minWidth={140}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleView}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1
              }}
            >
              Görüntüle
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1
              }}
            >
              Düzenle
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Ünite Görüntüleme Modalı */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MenuBookIcon color="primary" />
          {unit.name}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={2} gap={1} flexWrap="wrap">
              <Chip 
                icon={<SchoolIcon fontSize="small" />}
                label={lessonName} 
                sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 500 }}
              />
              <Chip 
                icon={<MenuBookIcon fontSize="small" />}
                label={`Ünite ${unit.displayOrder}`} 
                sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 500 }}
              />
              {unit.isActive ? (
                <Chip 
                  size="small" 
                  label="Aktif" 
                  sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 500 }}
                />
              ) : (
                <Chip 
                  size="small" 
                  label="Pasif" 
                  sx={{ bgcolor: 'text.disabled', color: 'white', fontWeight: 500 }}
                />
              )}
            </Box>
            
            <Paper 
              variant="outlined"
              sx={{ 
                p: 0, 
                borderRadius: 2,
                mt: 2,
                maxHeight: 400,
                overflow: 'auto'
              }}
            >
              {loadingContents ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : contents.length === 0 ? (
                <Box p={3} textAlign="center">
                  <ArticleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Bu üniteye henüz içerik eklenmemiş.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {contents.map((content, index) => (
                    <ListItem
                      key={content.id}
                      divider={index < contents.length - 1}
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewContent(content.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Görüntüle
                          </Button>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <ArticleIcon fontSize="small" color="primary" />
                            <Typography variant="body1" fontWeight={500}>
                              {content.title}
                            </Typography>
                            {content.displayOrder && (
                              <Chip label={`Sıra: ${content.displayOrder}`} size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Chip
                            size="small"
                            label={content.isActive ? 'Aktif' : 'Pasif'}
                            color={content.isActive ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider'
        }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Kapat
          </Button>
          <Button 
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit();
            }}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Üniteyi Düzenle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnitCard;
