import React, { useState } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { HtmlEditorToolbar, useHtmlFormatter } from './HtmlEditor';
import DOMPurify from 'dompurify';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  id?: string;
  rows?: number;
  showPreview?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'Metin',
  placeholder = 'Metninizi buraya yazın...',
  required = false,
  helperText = 'HTML formatı kullanabilirsiniz. Metin seçip yukarıdaki butonları kullanarak biçimlendirebilirsiniz.',
  id = 'rich-text-editor',
  rows = 4,
  showPreview = true
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const { formatText } = useHtmlFormatter(id, value, onChange);
  
  // Sanitized HTML for preview
  const sanitizedHtml = DOMPurify.sanitize(value);

  return (
    <Box>
      {label && (
        <Typography fontWeight={500} mb={1}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      
      {/* Toolbar */}
      <HtmlEditorToolbar textareaId={id} onFormat={formatText} />
      
      {/* Tab Switcher for Edit/Preview */}
      {showPreview && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              fontWeight: activeTab === 'edit' ? 600 : 400,
              color: activeTab === 'edit' ? 'primary.main' : 'text.secondary',
              pb: 0.5,
              borderBottom: activeTab === 'edit' ? '2px solid' : 'none',
              borderColor: 'primary.main'
            }}
            onClick={() => setActiveTab('edit')}
          >
            Düzenle
          </Typography>
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              fontWeight: activeTab === 'preview' ? 600 : 400,
              color: activeTab === 'preview' ? 'primary.main' : 'text.secondary',
              pb: 0.5,
              borderBottom: activeTab === 'preview' ? '2px solid' : 'none',
              borderColor: 'primary.main'
            }}
            onClick={() => setActiveTab('preview')}
          >
            Önizleme
          </Typography>
        </Box>
      )}
      
      {/* Edit Mode */}
      {activeTab === 'edit' ? (
        <TextField
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          multiline
          rows={rows}
          fullWidth
          placeholder={placeholder}
          required={required}
          InputProps={{
            sx: {
              borderRadius: 2,
              fontFamily: 'monospace',
              width: '100%'
            }
          }}
        />
      ) : (
        /* Preview Mode */
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: rows * 24,
            borderRadius: 2,
            bgcolor: 'grey.50',
            '& h1': { fontSize: '2rem', fontWeight: 700, mb: 2 },
            '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5 },
            '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& blockquote': { 
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              py: 1,
              my: 2,
              fontStyle: 'italic',
              bgcolor: 'grey.100'
            },
            '& code': {
              bgcolor: 'grey.200',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace'
            },
            '& pre': {
              bgcolor: 'grey.900',
              color: 'white',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': {
                bgcolor: 'transparent',
                color: 'white'
              }
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline'
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 2
            },
            '& .roman-list': {
              listStyleType: 'upper-roman'
            }
          }}
        >
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              Önizleme için metin girin...
            </Typography>
          )}
        </Paper>
      )}
      
      {helperText && (
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;
