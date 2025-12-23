import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import DOMPurify from 'dompurify';

interface UnitContent {
  id: string;
  title: string;
  content: string;
  displayOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unit: {
    id: string;
    name: string;
    lesson: {
      id: string;
      name: string;
    };
  };
}

const ViewUnitContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<UnitContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/units/contents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('İçerik yüklenemedi');
      }

      const result = await response.json();
      setContent(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (content) {
      navigate(`/units/${content.unit.id}/contents/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/lessons');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !content) {
    return (
      <Box>
        <Alert severity="error">{error || 'İçerik bulunamadı'}</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          İçerik Görüntüle
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Geri
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Düzenle
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {/* Header Info */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {content.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ders: {content.unit.lesson.name} → Ünite: {content.unit.name}
                </Typography>
              </Box>
              <Chip
                label={content.isActive ? 'Aktif' : 'Pasif'}
                color={content.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>

            {content.displayOrder && (
              <Typography variant="body2" color="text.secondary">
                Sıra Numarası: {content.displayOrder}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Content */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              İçerik
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 3,
                bgcolor: '#f9f9f9',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2
                },
                '& h1': {
                  fontSize: '2em',
                  fontWeight: 'bold',
                  my: 2
                },
                '& h2': {
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  my: 1.5
                },
                '& h3': {
                  fontSize: '1.17em',
                  fontWeight: 'bold',
                  my: 1
                },
                '& p': {
                  my: 1
                },
                '& ul, & ol': {
                  my: 1,
                  pl: 4
                },
                '& li': {
                  my: 0.5
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content.content)
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Meta Info */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Oluşturulma: {new Date(content.createdAt).toLocaleString('tr-TR')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Son Güncelleme: {new Date(content.updatedAt).toLocaleString('tr-TR')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewUnitContent;
