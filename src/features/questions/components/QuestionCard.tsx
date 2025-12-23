import React, { useState } from 'react';
import {
  Typography,
  Chip,
  Button,
  Stack,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  ButtonGroup
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  History as HistoryIcon,
  Animation as AnimationIcon,
  Image as ImageIcon,
  PlayCircle as VideoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../types/types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Soru düzenleme sayfasına yönlendirme
  const handleEdit = () => {
    navigate(`/questions/edit/${question.id}`);
  };
  
  // Soruyu görüntüleme işlevi
  const handleView = () => {
    setViewDialogOpen(true);
  };

  // Medya türünü belirle
  const hasMedia = Boolean(question.mediaUrl);
  const mediaIsVideo = hasMedia && question.mediaUrl?.includes('.mp4');

  return (
    <>
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderLeft: 4,
          borderColor: question.isActive ? 'success.main' : 'warning.main'
        }}
      >
        <CardHeader
          sx={{ 
            bgcolor: 'grey.50',
            py: 1.5,
            px: 2
          }}
          action={
            <ButtonGroup variant="outlined" size="small">
              <Button
                color="info"
                variant="outlined"
                startIcon={<VisibilityIcon />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: '4px 0 0 4px',
                  fontSize: '0.8rem',
                  py: 0.5,
                  px: 1.5
                }}
                onClick={handleView}
              >
                Görüntüle
              </Button>
              <Button
                color="primary"
                variant="contained" // outline yerine contained olarak değiştirildi
                startIcon={<EditIcon />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: '0 4px 4px 0',
                  fontSize: '0.8rem',
                  py: 0.5,
                  px: 1.5
                }}
                onClick={handleEdit}
              >
                Düzenle
              </Button>
            </ButtonGroup>
          }
          title={
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Tooltip title={question.isActive ? "Aktif Soru" : "Pasif Soru"}>
                <Chip
                  icon={question.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  label={question.isActive ? "Aktif" : "Pasif"}
                  color={question.isActive ? "success" : "warning"}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
              
              {question.cikmis && (
                <Tooltip title="Sınavda Çıkmış">
                  <Chip
                    icon={<HistoryIcon />}
                    label="Çıkmış"
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
              
              {question.animasyonlu && (
                <Tooltip title="Animasyonlu Soru">
                  <Chip
                    icon={<AnimationIcon />}
                    label="Animasyonlu"
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
              
              {hasMedia && (
                <Tooltip title={mediaIsVideo ? "Video İçerir" : "Resim İçerir"}>
                  <Chip
                    icon={mediaIsVideo ? <VideoIcon /> : <ImageIcon />}
                    label={mediaIsVideo ? "Video" : "Resim"}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Stack>
          }
        />
        
        <Divider />
        
        <CardContent sx={{ p: 2 }}>
          {/* Soru metnini HTML olarak render etmek için dangerouslySetInnerHTML kullanıyoruz */}
          <Box 
            className="question-content-preview"
            dangerouslySetInnerHTML={{ __html: question.text }}
            sx={{ 
              fontWeight: 500, 
              mb: 2, 
              color: 'text.primary',
            }}
          />



          {/* Soru ID */}
          <Box sx={{ mt: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>ID:</strong> {question.id}
            </Typography>
          </Box>

          {/* Media URL ve diğer bilgiler */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              mt: 2,
              fontSize: '0.875rem'
            }}
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              <Chip 
                icon={<SchoolIcon />}
                label={question.lessonName || "Ders Belirtilmemiş"}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip 
                icon={<MenuBookIcon />}
                label={question.unitName || "Ünite Belirtilmemiş"}
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            </Stack>

            {question.mediaUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mediaIsVideo ? <VideoIcon fontSize="small" color="secondary" /> : <ImageIcon fontSize="small" color="secondary" />}
                <Typography variant="body2" color="text.secondary">
                  <strong>Medya:</strong> {mediaIsVideo ? 'Video' : 'Resim'}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Soru Görüntüleme Modalı */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Soruyu Görüntüle
        </DialogTitle>
        
        <DialogContent>
          {/* Modalda soru metni için de HTML formatlamasını koruyoruz */}
          <Box 
            className="question-content-preview"
            dangerouslySetInnerHTML={{ __html: question.text }} 
            sx={{ 
              mb: 3, 
              color: 'text.primary',
              fontWeight: 500,
            }}
          />

          {/* Seçenekleri modalda da göster */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Seçenekler
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: question.correctAnswer === 'A' ? 'success.light' : 'transparent',
                border: question.correctAnswer === 'A' ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === 'A' ? 'success.main' : 'divider'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: question.correctAnswer === 'A' ? 'success.dark' : 'text.primary',
                    minWidth: '30px'
                  }}
                >
                  A)
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: question.correctAnswer === 'A' ? 'bold' : 'normal',
                    color: question.correctAnswer === 'A' ? 'success.dark' : 'text.primary'
                  }}
                >
                  {question.optionA}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: question.correctAnswer === 'B' ? 'success.light' : 'transparent',
                border: question.correctAnswer === 'B' ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === 'B' ? 'success.main' : 'divider'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: question.correctAnswer === 'B' ? 'success.dark' : 'text.primary',
                    minWidth: '30px'
                  }}
                >
                  B)
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: question.correctAnswer === 'B' ? 'bold' : 'normal',
                    color: question.correctAnswer === 'B' ? 'success.dark' : 'text.primary'
                  }}
                >
                  {question.optionB}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: question.correctAnswer === 'C' ? 'success.light' : 'transparent',
                border: question.correctAnswer === 'C' ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === 'C' ? 'success.main' : 'divider'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: question.correctAnswer === 'C' ? 'success.dark' : 'text.primary',
                    minWidth: '30px'
                  }}
                >
                  C)
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: question.correctAnswer === 'C' ? 'bold' : 'normal',
                    color: question.correctAnswer === 'C' ? 'success.dark' : 'text.primary'
                  }}
                >
                  {question.optionC}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 1,
                borderRadius: 1,
                bgcolor: question.correctAnswer === 'D' ? 'success.light' : 'transparent',
                border: question.correctAnswer === 'D' ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === 'D' ? 'success.main' : 'divider'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: question.correctAnswer === 'D' ? 'success.dark' : 'text.primary',
                    minWidth: '30px'
                  }}
                >
                  D)
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: question.correctAnswer === 'D' ? 'bold' : 'normal',
                    color: question.correctAnswer === 'D' ? 'success.dark' : 'text.primary'
                  }}
                >
                  {question.optionD}
                </Typography>
              </Box>
            </Stack>
          </Paper>
          
          {hasMedia && (
            <Paper
              elevation={1}
              sx={{ 
                p: 2,
                borderRadius: 2,
                mb: 3,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" color="primary.main" gutterBottom>
                Soru Medyası
              </Typography>
              
              {mediaIsVideo ? (
                <video
                  src={question.mediaUrl ?? undefined}
                  controls
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <img
                  src={question.mediaUrl ?? undefined}
                  alt="Soru Medyası"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px'
                  }}
                />
              )}
            </Paper>
          )}

          {/* Soru bilgileri */}
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Soru Bilgileri
            </Typography>
            
            {/* Soru ID */}
            <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Soru ID:</strong> {question.id}
              </Typography>
            </Box>

            {/* Temel Bilgiler - Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<SchoolIcon />}
                label={question.lessonName || "Ders Belirtilmemiş"}
                variant="outlined"
                color="primary"
                size="small"
              />
              <Chip 
                icon={<MenuBookIcon />}
                label={question.unitName || "Ünite Belirtilmemiş"}
                variant="outlined"
                color="secondary"
                size="small"
              />
            </Stack>
            
            <Stack spacing={2} sx={{ mb: 3 }}>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <strong>Doğru Cevap:</strong>
                </Typography>
                <Chip 
                  label={`Seçenek ${question.correctAnswer}`} 
                  color="success" 
                  variant="filled" 
                  size="small"
                />
              </Box>
            </Stack>

            {/* Özellikler - Yan yana chip'ler */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <strong>Özellikler:</strong>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip 
                  label={question.cikmis ? "Sınavda Çıkmış" : "Sınavda Çıkmamış"} 
                  color={question.cikmis ? "info" : "default"} 
                  variant={question.cikmis ? "filled" : "outlined"}
                  size="small"
                />
                <Chip 
                  label={question.animasyonlu ? "Animasyonlu" : "Animasyonsuz"} 
                  color={question.animasyonlu ? "secondary" : "default"} 
                  variant={question.animasyonlu ? "filled" : "outlined"}
                  size="small"
                />
                <Chip 
                  label={question.isActive ? "Aktif" : "Pasif"} 
                  color={question.isActive ? "success" : "warning"} 
                  variant="filled" 
                  size="small"
                />
              </Stack>
            </Box>

            {/* Medya URL - Tam gösterim */}
            {question.mediaUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <strong>Medya URL:</strong>
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    wordBreak: 'break-all'
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {question.mediaUrl}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setViewDialogOpen(false)} 
            color="primary"
            variant="contained"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionCard;