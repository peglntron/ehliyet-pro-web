import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Paper, Chip
} from '@mui/material';
import { Save as SaveIcon, MenuBook as MenuBookIcon } from '@mui/icons-material';

interface UnitPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditMode: boolean;
  formData: {
    lessonId: string;
    lessonName: string;
    unitNumber: number;
    title: string;
    content: string;
    isActive: boolean;
    images: { id: string; url: string }[];
  };
  sanitizedHtml: string;
}

const UnitPreviewDialog: React.FC<UnitPreviewDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isEditMode,
  formData,
  sanitizedHtml
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
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <MenuBookIcon color="primary" />
        {formData.title}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box mb={3}>
          <Box display="flex" alignItems="center" mb={2} gap={1} flexWrap="wrap">
            <Chip 
              label={formData.lessonName} 
              sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 500 }}
            />
            <Chip 
              label={`Ünite ${formData.unitNumber}`} 
              sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 500 }}
            />
            {formData.isActive ? (
              <Chip 
                label="Aktif" 
                sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 500 }}
              />
            ) : (
              <Chip 
                label="Pasif" 
                sx={{ bgcolor: 'text.disabled', color: 'white', fontWeight: 500 }}
              />
            )}
          </Box>
          
          <Paper 
            variant="outlined"
            sx={{ 
              p: 3, 
              borderRadius: 2,
              backgroundColor: '#f9f9f9',
              mt: 2
            }}
          >
            <div 
              className="unit-content"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
              style={{ 
                lineHeight: 1.6
              }}
            />
            <style dangerouslySetInnerHTML={{ __html: `
              .unit-content strong, .unit-content b { 
                font-weight: bold; 
                color: #1976d2; /* Mavi renk */
                font-size: 1.1em; /* Biraz daha büyük boyut */
              }
              .unit-content em, .unit-content i { 
                font-style: italic; 
                color: #d32f2f; /* Kırmızı renk */
              }
              .unit-content u { 
                text-decoration: underline; 
                color: #388e3c; /* Yeşil renk */
              }
              .unit-content p { 
                margin: 0; 
                margin-bottom: 0.75em; 
                padding: 0; 
                line-height: 1.6; 
              }
              .unit-content h1, .unit-content h2, .unit-content h3, .unit-content h4 { 
                color: #673ab7; /* Mor renk */
                display: inline-block;
                margin-right: 8px;
                margin-top: 0;
                margin-bottom: 0;
              }
              .unit-content h1 { font-size: 1.8em; }
              .unit-content h2 { font-size: 1.5em; }
              .unit-content h3 { font-size: 1.3em; }
              .unit-content h4 { font-size: 1.1em; }
              .unit-content ul, .unit-content ol { 
                padding-left: 1.5rem; 
                margin-bottom: 0.75em; 
              }
              .unit-content li { 
                margin-bottom: 0.25em; 
              }
              .unit-content br { 
                display: block; 
                content: ""; 
                margin-top: 0.75em; 
              }
              .unit-content img { 
                max-width: 100%; 
                height: auto; 
                border-radius: 8px; 
                margin: 1em 0; 
              }
              .unit-content a {
                text-decoration: underline;
                font-weight: 500;
              }
              .unit-content blockquote {
                border-left: 4px solid #bbdefb;
                margin: 1em 0;
                padding: 0.5em 1em;
                background: #e3f2fd;
                font-style: italic;
              }
              .unit-content code {
                background: #f5f5f5;
                padding: 2px 4px;
                border-radius: 4px;
                font-family: monospace;
              }
              /* Özelleştirilmiş renk stillerini koru */
              .unit-content span[style*="color"] {
                display: inline !important;
              }
              .unit-content ol.roman-list {
                list-style-type: upper-roman;
                padding-left: 1.8rem;
                margin-bottom: 0.75em;
              }
              
              .unit-content ol.roman-list li {
                margin-bottom: 0.5em;
                padding-left: 0.5em;
              }
            `}} />
          </Paper>
        </Box>
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

export default UnitPreviewDialog;