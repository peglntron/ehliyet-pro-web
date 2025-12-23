import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, FormControlLabel,
  Switch, Divider, CircularProgress, Snackbar, Alert,
  Card, CardMedia, IconButton, Tooltip,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  InsertLink as InsertLinkIcon,
  TextFields as TextFieldsIcon,
  ShortText as ShortTextIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Title as TitleIcon,
  FormatQuote as FormatQuoteIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import DOMPurify from 'dompurify';
import { useLessons, getUnitById, getLessonById } from './api/useLessons';
import UnitPreviewDialog from './components/UnitPreviewDialog';
import LoadingIndicator from '../../components/LoadingIndicator';
import ColorMenu from '../../components/ColorMenu';

const AddEditUnit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    lessonId: '',
    lessonName: '',
    unitNumber: 1,
    title: '',
    content: '',
    isActive: true,
    images: [] as { id: string; url: string }[]
  });
  
  // Lessons
  const lessons = useLessons();
  
  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Metin rengi state'i
  const [textColor, setTextColor] = useState('#1976d2');
  
  // Düzenleme modunda üniteyi yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getUnitById(id)
        .then(unit => {
          // Önce ders bilgisini alalım
          getLessonById(unit.lessonId)
            .then(lesson => {
              setFormData({
                lessonId: unit.lessonId,
                lessonName: lesson.name,
                unitNumber: unit.unitNumber,
                title: unit.title,
                content: unit.content,
                isActive: unit.isActive,
                images: [] // Gerçek uygulamada burada resimler yüklenecek
              });
              setLoading(false);
            })
            .catch(error => {
              console.error('Error loading lesson:', error);
              setSnackbarMessage('Ders bilgisi yüklenirken hata oluştu!');
              setSnackbarSeverity('error');
              setSnackbarOpen(true);
              setLoading(false);
            });
        })
        .catch(error => {
          console.error('Error loading unit:', error);
          setSnackbarMessage('Ünite yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Metin rengini güncelleme fonksiyonu
  const handleColorChange = (color: string) => {
    setTextColor(color);
    formatText('color', color);
  };
  
  // Text editor toolbar actions
  const formatText = (format: string, value?: string) => {
    // Basic formatting
    const textarea = document.getElementById('unit-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        formattedText = `<ul>\n<li>${selectedText}</li>\n</ul>`;
        break;
        
      case 'roman-list':
        // Roma rakamları ile numaralandırılmış liste
        const lines = selectedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length <= 1) {
          formattedText = `<ol class="roman-list" style="list-style-type: upper-roman; padding-left: 1.8rem;">\n<li>${selectedText}</li>\n</ol>`;
        } else {
          const listItems = lines.map(line => `<li>${line}</li>`).join('\n');
          formattedText = `<ol class="roman-list" style="list-style-type: upper-roman; padding-left: 1.8rem;">\n${listItems}\n</ol>`;
        }
        break;
        
      case 'link':
        formattedText = `<a href="#">${selectedText}</a>`;
        break;
      case 'paragraph':
        formattedText = `<p>${selectedText}</p>`;
        break;
      case 'linebreak':
        formattedText = `${selectedText}<br>`;
        break;
      case 'h1':
        formattedText = `<h1 style="display:inline-block;margin-right:8px">${selectedText}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2 style="display:inline-block;margin-right:8px">${selectedText}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3 style="display:inline-block;margin-right:8px">${selectedText}</h3>`;
        break;
      case 'color':
        formattedText = `<span style="color:${value || textColor};">${selectedText}</span>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        break;
      case 'code':
        formattedText = `<code>${selectedText}</code>`;
        break;
      case 'image':
        // Resim ekleme işlemi için dosya seçiciyi açıyoruz
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      default:
        formattedText = selectedText;
    }
    
    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setFormData({...formData, content: newText});
  };
  
  // Handle form changes için daha spesifik işleyiciler tanımlayalım
  // Metin alanları için işleyici
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
  };

  // Select bileşeni için özel işleyici - tip değişikliğiyle
  const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }> | React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    
    if (name === 'lessonId') {
      // Ders değiştiğinde ders adını da güncelle
      const selectedLesson = lessons.find(l => l.id === value);
      setFormData(prev => ({
        ...prev,
        [name as string]: value,
        lessonName: selectedLesson?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as string]: value
      }));
    }
  };

  // Switch bileşeni için özel işleyici
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Resim yükleme işlemi
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImageUploading(true);
    
    // Her bir dosya için
    Array.from(files).forEach(file => {
      // FileReader ile dosyayı okuyoruz
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // Resmi unique bir ID ile kaydet
          const newImageId = Date.now().toString();
          const imageUrl = event.target.result.toString();
          
          // Formdata'ya resmi ekle
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, { id: newImageId, url: imageUrl }]
          }));
          
          // İçeriğe resim ekle
          const textarea = document.getElementById('unit-content') as HTMLTextAreaElement;
          if (textarea) {
            const imageTag = `<img src="${imageUrl}" alt="Ünite görseli" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            
            // İçeriği güncelle
            const newContent = textBefore + imageTag + textAfter;
            setFormData(prev => ({
              ...prev,
              content: newContent
            }));
          }
        }
      };
      
      // Dosyayı Data URL olarak oku
      reader.readAsDataURL(file);
    });
    
    // Yükleme işlemi tamamlandı
    setImageUploading(false);
    
    // Input'u temizle
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Resim silme işlemi
  const handleDeleteImage = (imageId: string) => {
    // İçerikten resmi kaldır
    const imageToDelete = formData.images.find(img => img.id === imageId);
    if (imageToDelete) {
      const newContent = formData.content.replace(
        new RegExp(`<img[^>]*src\\s*=\\s*["']${imageToDelete.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g'),
        ''
      );
      
      // Formdata'yı güncelle
      setFormData(prev => ({
        ...prev,
        content: newContent,
        images: prev.images.filter(img => img.id !== imageId)
      }));
    }
  };
  
  // Preview modal için HTML'i temizleme
  const prepareSanitizedHtml = () => {
    const clean = DOMPurify.sanitize(formData.content);
    setSanitizedHtml(clean);
  };

  // Handle form preview
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    prepareSanitizedHtml();
    setPreviewOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    console.log('Form Data:', formData);
    // TODO: API ile form verilerini kaydet veya güncelle
    
    // Başarılı kayıttan sonra snackbar göster ve ünite listesine dön
    const message = isEditMode ? 'Ünite başarıyla güncellendi!' : 'Ünite başarıyla kaydedildi!';
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Kısa bir gecikme ile navigate işlemini gerçekleştir
    setTimeout(() => {
      navigate('/lessons');
    }, 1500);
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      overflow: 'auto',
      bgcolor: '#f8fafc',
      boxSizing: 'border-box',
      p: { xs: 2, md: 3 }
    }}>
      <Box mb={3}>
        <PageBreadcrumb />
        
        <Box 
          mt={2} 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                mb: 1
              }}
            >
              {isEditMode ? 'Ünite Düzenle' : 'Yeni Ünite Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut üniteyi düzenleyin ve güncelleyin' 
                : 'Yeni bir ders ünitesi ekleyin'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/lessons')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Ünite Listesine Dön
          </Button>
        </Box>
      </Box>
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <LoadingIndicator 
          text="Ünite bilgileri yükleniyor..." 
          size="medium" 
          showBackground={true} 
        />
      ) : (
        /* Form */
        <form onSubmit={handlePreview}>
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Ünite Bilgileri
            </Typography>
            
            {/* Ders ve Ünite Numarası */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',              
                  sm: '2fr 1fr'    
                },
                gap: 3,
                mb: 4
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Ders</InputLabel>
                <Select
                  name="lessonId"
                  value={formData.lessonId}
                  label="Ders"
                  onChange={handleSelectChange as any} // Type assertion ile değişiklik
                  sx={{ 
                    borderRadius: 2,
                    height: 56
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 300 }
                    }
                  }}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {lessons.map(lesson => (
                    <MenuItem key={lesson.id} value={lesson.id}>{lesson.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                name="unitNumber"
                label="Ünite Numarası"
                type="number"
                value={formData.unitNumber}
                onChange={handleTextChange} // Metin işleyici
                required
                InputProps={{
                  inputProps: { min: 1 },
                  sx: {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Box>
            
            {/* Ünite Başlığı */}
            <Box mb={4}>
              <Typography fontWeight={500} mb={1}>
                Ünite Başlığı
              </Typography>
              <TextField
                name="title"
                value={formData.title}
                onChange={handleTextChange} // Metin işleyici
                fullWidth
                placeholder="Ünite başlığını girin..."
                required
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    height: 56
                  }
                }}
              />
            </Box>
            
            {/* Ünite İçeriği - Rich Text Editor */}
            <Box mb={4}>
              <Box mb={1}>
                <Typography fontWeight={500} mb={1}>
                  Ünite İçeriği
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    mb: 1, 
                    borderRadius: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5
                  }}
                >
                  {/* İlk satır butonları */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%', mb: 0.5 }}>
                    <ToggleButtonGroup size="small">
                      <ToggleButton value="bold" onClick={() => formatText('bold')}>
                        <Tooltip title="Kalın">
                          <FormatBoldIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="italic" onClick={() => formatText('italic')}>
                        <Tooltip title="İtalik">
                          <FormatItalicIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="underline" onClick={() => formatText('underline')}>
                        <Tooltip title="Altı Çizili">
                          <FormatUnderlinedIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="color">
                        <ColorMenu onColorSelect={handleColorChange} />
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
                    <ToggleButtonGroup size="small">
                      <ToggleButton value="h1" onClick={() => formatText('h1')}>
                        <Tooltip title="Başlık 1">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TitleIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>1</Typography>
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="h2" onClick={() => formatText('h2')}>
                        <Tooltip title="Başlık 2">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TitleIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>2</Typography>
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="h3" onClick={() => formatText('h3')}>
                        <Tooltip title="Başlık 3">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TitleIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>3</Typography>
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
                    <ToggleButtonGroup size="small">
                      <ToggleButton value="quote" onClick={() => formatText('quote')}>
                        <Tooltip title="Alıntı">
                          <FormatQuoteIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="code" onClick={() => formatText('code')}>
                        <Tooltip title="Kod">
                          <CodeIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  
                  {/* İkinci satır butonları */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%' }}>
                    <ToggleButtonGroup size="small">
                      <ToggleButton value="paragraph" onClick={() => formatText('paragraph')}>
                        <Tooltip title="Paragraf">
                          <TextFieldsIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="linebreak" onClick={() => formatText('linebreak')}>
                        <Tooltip title="Satır Sonu">
                          <ShortTextIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="list" onClick={() => formatText('list')}>
                        <Tooltip title="Liste">
                          <FormatListBulletedIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="roman-list" onClick={() => formatText('roman-list')}>
                        <Tooltip title="Roma Rakamlı Liste">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormatListBulletedIcon fontSize="small" />
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>I, II</Typography>
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
                    <ToggleButtonGroup size="small">
                      <ToggleButton value="link" onClick={() => formatText('link')}>
                        <Tooltip title="Link">
                          <InsertLinkIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="image" onClick={() => formatText('image')}>
                        <Tooltip title="Resim Ekle">
                          <ImageIcon fontSize="small" />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Paper>
              </Box>
              <TextField
                id="unit-content"
                name="content"
                value={formData.content}
                onChange={handleTextChange} // Metin işleyici
                multiline
                rows={8}
                fullWidth
                placeholder="Ünite içeriğini buraya yazın..."
                required
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    width: '100%'
                  }
                }}
              />
              
              {/* Canlı önizleme */}
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Canlı Önizleme:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: '#f9f9f9'
                  }}
                >
                  <div 
                    className="unit-content-preview"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} 
                    style={{ lineHeight: 1.6 }}
                  />
                  <style dangerouslySetInnerHTML={{ __html: `
                    .unit-content-preview strong, .unit-content-preview b { 
                      font-weight: bold; 
                      font-size: 1.1em;
                    }
                    .unit-content-preview em, .unit-content-preview i { 
                      font-style: italic; 
                    }
                    .unit-content-preview u { 
                      text-decoration: underline; 
                    }
                    .unit-content-preview p { 
                      margin: 0; 
                      margin-bottom: 0.75em; 
                      padding: 0; 
                      line-height: 1.6; 
                    }
                    .unit-content-preview h1, .unit-content-preview h2, .unit-content-preview h3, .unit-content-preview h4 { 
                      display: inline-block;
                      margin-right: 8px;
                      margin-top: 0;
                      margin-bottom: 0;
                    }
                    .unit-content-preview h1 { font-size: 1.8em; }
                    .unit-content-preview h2 { font-size: 1.5em; }
                    .unit-content-preview h3 { font-size: 1.3em; }
                    .unit-content-preview h4 { font-size: 1.1em; }
                    .unit-content-preview ul, .unit-content-preview ol { 
                      padding-left: 1.5rem; 
                      margin-bottom: 0.75em; 
                    }
                    .unit-content-preview li { 
                      margin-bottom: 0.25em; 
                    }
                    .unit-content-preview br { 
                      display: block; 
                      content: ""; 
                      margin-top: 0.75em; 
                    }
                    .unit-content-preview img { 
                      max-width: 100%; 
                      height: auto; 
                      border-radius: 8px; 
                      margin: 1em 0; 
                    }
                    .unit-content-preview a {
                      text-decoration: underline;
                      font-weight: 500;
                    }
                    .unit-content-preview blockquote {
                      border-left: 4px solid #bbdefb;
                      margin: 1em 0;
                      padding: 0.5em 1em;
                      background: #e3f2fd;
                      font-style: italic;
                    }
                    .unit-content-preview code {
                      background: #f5f5f5;
                      padding: 2px 4px;
                      border-radius: 4px;
                      font-family: monospace;
                    }
                    /* Özelleştirilmiş renk stillerini koru */
                    .unit-content-preview span[style*="color"] {
                      display: inline !important;
                    }
                    .unit-content-preview ol.roman-list {
                      list-style-type: upper-roman;
                      padding-left: 1.8rem;
                      margin-bottom: 0.75em;
                    }
                    
                    .unit-content-preview ol.roman-list li {
                      margin-bottom: 0.5em;
                      padding-left: 0.5em;
                    }
                  `}} />
                </Paper>
              </Box>
              
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                HTML formatı kullanabilirsiniz. Yukarıdaki butonları kullanarak metni biçimlendirebilirsiniz.
                Ayrıca özel metin rengi, başlıklar, alıntılar ve kod blokları ekleyebilirsiniz.
              </Typography>
            </Box>
            
            {/* Eklenen Resimler */}
            {formData.images.length > 0 && (
              <Box mb={4}>
                <Typography fontWeight={500} mb={2}>
                  Eklenen Resimler
                </Typography>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr', 
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr'
                    },
                    gap: 2
                  }}
                >
                  {formData.images.map(image => (
                    <Card key={image.id} sx={{ position: 'relative', borderRadius: 2 }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={image.url}
                        alt="Ünite görseli"
                        sx={{ objectFit: 'cover' }}
                      />
                      <Tooltip title="Resmi Sil">
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 0, 0, 0.7)',
                            }
                          }}
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Card>
                  ))}
                  
                  {/* Yeni resim ekleme kartı */}
                  <Card 
                    sx={{ 
                      height: 160, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <AddPhotoAlternateIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography>Resim Ekle</Typography>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 4 }} />
            
            {/* Ünite Özellikleri */}
            <Box mb={3}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Ünite Özellikleri
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleSwitchChange} // Switch işleyici
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/lessons')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isEditMode ? 'Üniteyi Güncelle' : 'Üniteyi Kaydet'}
            </Button>
          </Box>
        </form>
      )}

      {/* Resim yükleme göstergesi */}
      {imageUploading && (
        <LoadingIndicator 
          text="Resim yükleniyor..." 
          size="small" 
          fullScreen={true} 
          showBackground={false} 
        />
      )}

      {/* Önizleme Modalı */}
      <UnitPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        formData={formData}
        sanitizedHtml={sanitizedHtml}
      />
      
      {/* Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEditUnit;
