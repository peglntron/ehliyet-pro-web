import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Paper
} from '@mui/material';

import { Save as SaveIcon } from '@mui/icons-material';

interface QuestionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditMode: boolean;
  formData: {
    secenek_a: string;
    secenek_b: string;
    secenek_c: string;
    secenek_d: string;
    dogru_cevap: string;
    medya_url: string;
    aciklama: string;
  };
  sanitizedHtml: string;
  selectedFormat: string;
}

const QuestionPreviewDialog: React.FC<QuestionPreviewDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isEditMode,
  formData,
  sanitizedHtml,
  selectedFormat
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        fontWeight: 600
      }}>
        Soru {isEditMode ? 'Güncelleme' : 'Ekleme'} Önizleme
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Soru Metni:
          </Typography>
          <Paper 
            variant="outlined"
            sx={{ 
              p: 2, 
              borderRadius: 2,
              backgroundColor: '#f5f5f5'
            }}
          >
            <div 
              className="question-content-preview"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
            />
          </Paper>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Şıklar:
          </Typography>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography>
                  <strong>A)</strong> {formData.secenek_a}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography>
                  <strong>B)</strong> {formData.secenek_b}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography>
                  <strong>C)</strong> {formData.secenek_c}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}>
                <Typography>
                  <strong>D)</strong> {formData.secenek_d}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Doğru Cevap: <Box component="span" sx={{ color: 'success.main' }}>{formData.dogru_cevap}</Box>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Medya:
          </Typography>
          {formData.medya_url ? (
            selectedFormat === 'image' ? (
              <Box sx={{ 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)',
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <img 
                  src={formData.medya_url} 
                  alt="Soru görseli" 
                  style={{ 
                    maxWidth: '100%', 
                    minWidth: '320px',
                    maxHeight: '500px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)',
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <video
                  src={formData.medya_url}
                  controls
                  style={{ 
                    maxWidth: '100%',
                    minWidth: '320px',
                    maxHeight: '500px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Medya eklenmemiş
            </Typography>
          )}
        </Box>

        {formData.aciklama && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Açıklama:
            </Typography>
            <Paper 
              variant="outlined"
              sx={{ 
                p: 2, 
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography>{formData.aciklama}</Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'divider'
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Geri Dön
        </Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Onayla ve {isEditMode ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionPreviewDialog;
