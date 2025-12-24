import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, FormLabel, IconButton, Tooltip, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  PhotoSizeSelectLarge,
  FormatQuote
} from '@mui/icons-material';
import DOMPurify from 'dompurify';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  rows?: number;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  label = 'İçerik',
  required = false,
  rows = 15,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');

  // İlk yüklemede ve value değiştiğinde (dışarıdan) HTML'i editöre yükle
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const sanitizedHtml = DOMPurify.sanitize(value);
      if (editorRef.current.innerHTML !== sanitizedHtml) {
        editorRef.current.innerHTML = sanitizedHtml;
      }
    }
  }, [value]);

  // Kullanıcı yazarken HTML'i state'e kaydet
  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const htmlContent = editorRef.current.innerHTML;
      onChange(htmlContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  // Format butonları için - document.execCommand kullan
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Paste olayını yakalayıp sadece düz metin olarak yapıştır
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Toolbar buton handlers
  const handleBold = () => applyFormat('bold');
  const handleItalic = () => applyFormat('italic');
  const handleUnderline = () => applyFormat('underline');
  const handleH1 = () => applyFormat('formatBlock', 'h1');
  const handleH2 = () => applyFormat('formatBlock', 'h2');
  const handleH3 = () => applyFormat('formatBlock', 'h3');
  const handleBulletList = () => applyFormat('insertUnorderedList');
  const handleNumberList = () => applyFormat('insertOrderedList');
  const handleRomanList = () => {
    // Roma rakamı listesi için özel kod
    if (editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      // Liste oluştur
      applyFormat('insertOrderedList');
      
      // Listeyi bul ve Roma rakamı stil ekle
      setTimeout(() => {
        const lists = editorRef.current?.querySelectorAll('ol');
        if (lists && lists.length > 0) {
          const lastList = lists[lists.length - 1];
          lastList.style.listStyleType = 'upper-roman';
        }
      }, 10);
    }
  };
  const handleLink = () => {
    const url = prompt('URL girin:');
    if (url) applyFormat('createLink', url);
  };
  
  const handleQuote = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const selectedText = selection.toString();
    if (!selectedText) return;
    
    // Seçili metni blockquote içine al
    const blockquoteHtml = `<blockquote>${selectedText}</blockquote>`;
    document.execCommand('insertHTML', false, blockquoteHtml);
    
    editorRef.current?.focus();
    handleInput(); // HTML'i güncelle
  };
  
  const handleImage = () => {
    // Dosya seçici oluştur
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Dosya boyut kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu 5MB\'dan küçük olmalıdır!');
        return;
      }
      
      try {
        // FormData oluştur
        const formData = new FormData();
        formData.append('image', file);
        
        // Backend'e upload
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/units/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload error:', errorData);
          throw new Error('Resim yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        console.log('Upload response:', data);
        const imageUrl = data.data?.url || data.url;
        console.log('Image URL:', imageUrl);
        
        if (imageUrl) {
          // Tam URL oluştur
          const fullImageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${imageUrl}`;
          console.log('Full Image URL:', fullImageUrl);
          
          // Resmi editöre ekle - boyutlandırılabilir olsun
          const img = document.createElement('img');
          img.src = fullImageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.cursor = 'pointer';
          img.setAttribute('contenteditable', 'false');
          
          // Resimleri resize edilebilir yap
          img.style.resize = 'both';
          img.style.overflow = 'auto';
          img.style.display = 'inline-block';
          
          // İmleç konumuna ekle
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // İmleci resmin sonrasına taşı
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            editorRef.current?.appendChild(img);
          }
          
          editorRef.current?.focus();
          handleInput(); // HTML'i güncelle
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Resim yüklenirken hata oluştu!');
      }
    };
    
    input.click();
  };

  // Resim click handler - boyutlandırma dialog'u aç
  const handleImageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setSelectedImage(img);
      setImageWidth(img.width.toString());
      setImageHeight(img.height.toString());
      setResizeDialogOpen(true);
    }
  };

  // Resim boyutunu değiştir
  const handleResizeImage = () => {
    if (selectedImage && imageWidth && imageHeight) {
      selectedImage.width = parseInt(imageWidth);
      selectedImage.height = parseInt(imageHeight);
      handleInput(); // HTML'i güncelle
      setResizeDialogOpen(false);
    }
  };

  return (
    <>
      {label && (
        <FormLabel required={required} sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
          {label}
        </FormLabel>
      )}
      
      {/* Toolbar - Icon Buttons */}
      <Box 
        sx={{ 
          p: 1, 
          mb: 2, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0.5,
          borderRadius: 2,
          bgcolor: '#f5f5f5',
          border: '1px solid #e0e0e0'
        }}
      >
        <Tooltip title="Kalın (Ctrl+B)">
          <IconButton size="small" onClick={handleBold} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatBold fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="İtalik (Ctrl+I)">
          <IconButton size="small" onClick={handleItalic} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatItalic fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Altı Çizili (Ctrl+U)">
          <IconButton size="small" onClick={handleUnderline} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatUnderlined fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <Tooltip title="Başlık 1">
          <IconButton size="small" onClick={handleH1} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <Typography variant="caption" fontWeight="bold">H1</Typography>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Başlık 2">
          <IconButton size="small" onClick={handleH2} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <Typography variant="caption" fontWeight="bold">H2</Typography>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Başlık 3">
          <IconButton size="small" onClick={handleH3} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <Typography variant="caption" fontWeight="bold">H3</Typography>
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <Tooltip title="Madde İşaretli Liste">
          <IconButton size="small" onClick={handleBulletList} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Numaralı Liste">
          <IconButton size="small" onClick={handleNumberList} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Roma Rakamı Liste (I, II, III)">
          <IconButton size="small" onClick={handleRomanList} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <Typography variant="caption" fontWeight="bold" fontSize="0.7rem">I. II.</Typography>
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <Tooltip title="Alıntı (Blockquote)">
          <IconButton size="small" onClick={handleQuote} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <FormatQuote fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <Tooltip title="Link Ekle">
          <IconButton size="small" onClick={handleLink} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Resim Ekle">
          <IconButton size="small" onClick={handleImage} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Editör Alanı - contentEditable */}
      <div
        onClick={() => editorRef.current?.focus()}
        style={{
          position: 'relative',
          padding: '16px',
          minHeight: `${rows * 24}px`,
          maxHeight: '600px',
          overflow: 'auto',
          backgroundColor: '#fff',
          cursor: 'text',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          outline: 'none',
          boxShadow: 'none',
          transition: 'border-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.querySelector('div:focus')) {
            e.currentTarget.style.borderColor = '#9e9e9e';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.querySelector('div:focus')) {
            e.currentTarget.style.borderColor = '#e0e0e0';
          }
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onClick={handleImageClick}
          onFocus={(e) => {
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.borderColor = '#1976d2';
              parent.style.outline = 'none';
              parent.style.boxShadow = 'none';
            }
          }}
          onBlur={(e) => {
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.borderColor = '#e0e0e0';
              parent.style.outline = 'none';
              parent.style.boxShadow = 'none';
            }
          }}
          suppressContentEditableWarning
          style={{
            minHeight: `${rows * 20}px`,
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
            lineHeight: '1.6',
            color: '#333',
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
        />
        
        {!value && (
          <Typography 
            color="text.secondary" 
            fontStyle="italic"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              pointerEvents: 'none'
            }}
          >
            İçerik yazın veya yukarıdaki araç çubuğunu kullanın...
          </Typography>
        )}
      </div>

      {/* WYSIWYG editor için CSS stilleri */}
      <style>
        {`
          div[contenteditable] {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          div[contenteditable]:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          div[contenteditable] h1 { 
            font-size: 2em; 
            font-weight: bold; 
            margin: 0.67em 0; 
            color: #1a1a1a;
          }
          div[contenteditable] h2 { 
            font-size: 1.5em; 
            font-weight: bold; 
            margin: 0.75em 0; 
            color: #1a1a1a;
          }
          div[contenteditable] h3 { 
            font-size: 1.17em; 
            font-weight: bold; 
            margin: 0.83em 0; 
            color: #1a1a1a;
          }
          div[contenteditable] p { 
            margin: 0.5em 0; 
          }
          div[contenteditable] ul, div[contenteditable] ol { 
            margin: 1em 0; 
            padding-left: 2em; 
          }
          div[contenteditable] li { 
            margin: 0.5em 0; 
          }
          div[contenteditable] strong, div[contenteditable] b { 
            font-weight: bold; 
          }
          div[contenteditable] em, div[contenteditable] i { 
            font-style: italic; 
          }
          div[contenteditable] u {
            text-decoration: underline;
          }
          div[contenteditable] code { 
            background-color: #f5f5f5; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: monospace;
            color: #c7254e;
          }
          div[contenteditable] pre { 
            background-color: #f5f5f5; 
            padding: 1em; 
            border-radius: 4px; 
            overflow-x: auto;
            font-family: monospace;
          }
          div[contenteditable] a { 
            color: #1976d2; 
            text-decoration: underline; 
          }
          div[contenteditable] img { 
            max-width: 100%; 
            height: auto; 
            margin: 1em 0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          div[contenteditable] img:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          div[contenteditable] img.selected {
            outline: 2px solid #1976d2;
            outline-offset: 2px;
          }
        `}
      </style>

      {/* Resim Boyutlandırma Dialog */}
      <Dialog open={resizeDialogOpen} onClose={() => setResizeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resim Boyutunu Ayarla</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Genişlik (px)"
              type="number"
              value={imageWidth}
              onChange={(e) => setImageWidth(e.target.value)}
              fullWidth
            />
            <TextField
              label="Yükseklik (px)"
              type="number"
              value={imageHeight}
              onChange={(e) => setImageHeight(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeDialogOpen(false)}>İptal</Button>
          <Button onClick={handleResizeImage} variant="contained">Uygula</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WysiwygEditor;
