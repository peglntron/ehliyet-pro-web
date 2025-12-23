import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  PhotoSizeSelectLarge as ResizeIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface MediaUploadProps {
  value: string; // Current media URL
  onChange: (url: string) => void;
  mediaType: 'image' | 'video';
  questionId?: string;
  label?: string;
  helperText?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  value,
  onChange,
  mediaType,
  questionId,
  label = 'Medya',
  helperText
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [imageWidth, setImageWidth] = useState<string>('');
  const [imageHeight, setImageHeight] = useState<string>('');
  const [currentDimensions, setCurrentDimensions] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (mediaType === 'image' && !isImage) {
      setError('Lütfen bir resim dosyası seçin');
      return;
    }

    if (mediaType === 'video' && !isVideo) {
      setError('Lütfen bir video dosyası seçin');
      return;
    }

    // Dosya boyutu kontrolü (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Dosya boyutu 50MB\'dan büyük olamaz');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('media', file);
      if (questionId && questionId !== 'new') {
        formData.append('questionId', questionId);
      }

      // Token'ı al
      const token = localStorage.getItem('token');

      // Upload isteği
      const response = await axios.post(
        `${API_URL}/api/questions/upload-media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const mediaUrl = `${API_URL}${response.data.data.mediaUrl}`;
        setPreviewUrl(mediaUrl);
        onChange(response.data.data.mediaUrl); // Sadece path'i kaydet, tam URL değil
      } else {
        setError('Dosya yüklenirken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    setPreviewUrl('');
    onChange('');
    setError(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleResizeClick = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      setCurrentDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageWidth(img.width.toString());
      setImageHeight(img.height.toString());
      setResizeDialogOpen(true);
    }
  };

  const handleApplyResize = () => {
    if (imageRef.current && imageWidth && imageHeight) {
      imageRef.current.width = parseInt(imageWidth);
      imageRef.current.height = parseInt(imageHeight);
      setResizeDialogOpen(false);
    }
  };

  return (
    <Box>
      {label && (
        <Typography fontWeight={500} mb={1}>
          {label}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Preview veya Upload Button */}
      {previewUrl ? (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            position: 'relative'
          }}
        >
          {/* Delete Button */}
          <IconButton
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark'
              },
              zIndex: 1
            }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>

          {/* Resize Button - Sadece resimler için */}
          {mediaType === 'image' && (
            <IconButton
              onClick={handleResizeClick}
              sx={{
                position: 'absolute',
                top: 8,
                right: 56,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                zIndex: 1
              }}
              size="small"
            >
              <ResizeIcon />
            </IconButton>
          )}

          {/* Media Preview */}
          {mediaType === 'image' ? (
            <Box
              component="img"
              ref={imageRef}
              src={previewUrl.startsWith('http') ? previewUrl : `${API_URL}${previewUrl}`}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 1
              }}
            />
          ) : (
            <Box
              component="video"
              controls
              src={previewUrl.startsWith('http') ? previewUrl : `${API_URL}${previewUrl}`}
              sx={{
                width: '100%',
                maxHeight: 300,
                borderRadius: 1
              }}
            />
          )}
        </Paper>
      ) : (
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : (mediaType === 'image' ? <ImageIcon /> : <VideoIcon />)}
          sx={{
            height: 120,
            width: '100%',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: 2
            }
          }}
        >
          <Box textAlign="center">
            <UploadIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body1">
              {uploading ? 'Yükleniyor...' : `${mediaType === 'image' ? 'Resim' : 'Video'} Yükle`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dosya seçmek için tıklayın
            </Typography>
          </Box>
        </Button>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          {helperText}
        </Typography>
      )}

      {/* Resim Boyutlandırma Dialog */}
      {mediaType === 'image' && (
        <Dialog open={resizeDialogOpen} onClose={() => setResizeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Resim Boyutunu Ayarla</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Orijinal Boyut: {currentDimensions.width} x {currentDimensions.height} px
              </Typography>
              <TextField
                label="Genişlik (px)"
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
                fullWidth
                inputProps={{ min: 50, max: 2000 }}
              />
              <TextField
                label="Yükseklik (px)"
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(e.target.value)}
                fullWidth
                inputProps={{ min: 50, max: 2000 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResizeDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleApplyResize} variant="contained">
              Uygula
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
