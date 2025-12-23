import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Paper, FormControlLabel,
  Switch, Radio, RadioGroup, FormLabel, Divider,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import DOMPurify from 'dompurify';
import QuestionPreviewDialog from './components/QuestionPreviewDialog';
import WysiwygEditor from '../../components/WysiwygEditor';
import { MediaUpload } from '../../components/MediaUpload';

import { useLessons, useUnits, getQuestionById } from './api/useQuestions';
import { questionApi } from '../../utils/api';

// Mevcut soruyu ID'ye göre getirme fonksiyonu


const AddQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    text: '',
    lesson: '',
    unit: '',
    secenek_a: '',
    secenek_b: '',
    secenek_c: '',
    secenek_d: '',
    dogru_cevap: 'A',
    isAnimasyonlu: false,
    cikmis: false,
    isActive: true,
    medya_url: '',
    aciklama: ''
  });
  
  const [selectedFormat, setSelectedFormat] = useState<'image' | 'video'>('image');
  
  // Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Yükleniyor durumu
  const [loading, setLoading] = useState(isEditMode);
  
  // isAnimasyonlu değiştiğinde otomatik olarak medya türünü güncelle
  useEffect(() => {
    setSelectedFormat(formData.isAnimasyonlu ? 'video' : 'image');
  }, [formData.isAnimasyonlu]);
  
  // API Hooks
  const { lessons } = useLessons();
  const { units } = useUnits(formData.lesson);
  
  // Units değiştiğinde mevcut unit'in geçerli olup olmadığını kontrol et
  // Sadece create mode'da ve units yüklendikten sonra kontrol yap
  useEffect(() => {
    if (!isEditMode && formData.unit && units.length > 0 && formData.lesson) {
      const unitExists = units.find(u => u.id === formData.unit);
      if (!unitExists) {
        console.log('Unit not found in current lesson, clearing unit:', formData.unit);
        setFormData(prev => ({
          ...prev,
          unit: ''
        }));
      }
    }
  }, [units, formData.unit, formData.lesson, isEditMode]);
  
  // Düzenleme modunda soruyu yükle
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getQuestionById(id)
        .then(question => {
          console.log('Loaded question:', question);
          setFormData({
            text: question.text,
            lesson: question.lessonId || '',
            unit: question.unit?.id || '',
            secenek_a: question.optionA,
            secenek_b: question.optionB,
            secenek_c: question.optionC,
            secenek_d: question.optionD,
            dogru_cevap: question.correctAnswer,
            isAnimasyonlu: question.animasyonlu,
            cikmis: question.cikmis,
            isActive: question.isActive,
            medya_url: question.mediaUrl || '',
            aciklama: '' // aciklama alanı Question type'ında yok
          });
          // Animasyonlu durumuna göre medya formatını ayarla
          setSelectedFormat(question.animasyonlu ? 'video' : 'image');
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading question:', error);
          setSnackbarMessage('Soru yüklenirken hata oluştu!');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name === 'isAnimasyonlu') {
      // isAnimasyonlu değiştiğinde, medya türünü otomatik olarak güncelle
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'lesson') {
      // Ders değiştiğinde unit'i temizle
      setFormData(prev => ({
        ...prev,
        lesson: value as string,
        unit: '' // Unit'i temizle
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as string]: (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') ? checked : value
      }));
    }
  };
  
  // Preview modal için HTML'i temizleme
  const prepareSanitizedHtml = () => {
    const clean = DOMPurify.sanitize(formData.text);
    setSanitizedHtml(clean);
  };

  // Handle form preview
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    prepareSanitizedHtml();
    setPreviewOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    console.log('Form Data:', formData);
    
    try {
      setLoading(true);
      
      // API verisi hazırla - Question type'ına uygun format
      const questionData = {
        text: formData.text,
        lessonId: formData.lesson,
        unitId: formData.unit || undefined,
        optionA: formData.secenek_a,
        optionB: formData.secenek_b,
        optionC: formData.secenek_c,
        optionD: formData.secenek_d,
        correctAnswer: formData.dogru_cevap as 'A' | 'B' | 'C' | 'D',
        mediaUrl: formData.medya_url || undefined,
        cikmis: formData.cikmis,
        animasyonlu: formData.isAnimasyonlu,
        isActive: formData.isActive
      };

      if (isEditMode && id) {
        // Güncelleme API çağrısı
        await questionApi.update(id, questionData);
      } else {
        // Yeni oluşturma API çağrısı
        await questionApi.create(questionData);
      }

      // Navigate ile success mesajı gönder
      const successMessage = isEditMode ? 'updated' : 'created';
      navigate(`/questions?success=${successMessage}`);
      
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      navigate(`/questions?error=${encodeURIComponent(errorMessage)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (_?: React.SyntheticEvent | Event, reason?: string) => {
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
              {isEditMode ? 'Soru Düzenle' : 'Yeni Soru Ekle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEditMode 
                ? 'Mevcut soruyu düzenleyin ve güncelleyin' 
                : 'Sistemde kullanılacak yeni soru oluşturun'}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/questions')}
            sx={{
              py: 1.2,
              px: 2.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Soru Listesine Dön
          </Button>
        </Box>
      </Box>
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <CircularProgress />
        </Box>
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
              Soru Bilgileri
            </Typography>
            
            {/* Soru Metni - WYSIWYG Editor */}
            <Box mb={4}>
              <WysiwygEditor
                value={formData.text}
                onChange={(value) => setFormData({...formData, text: value})}
                label="Soru Metni"
                required
                rows={15}
              />
            </Box>
            
            {/* Ders ve Ünite */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ders</InputLabel>
                  <Select
                    name="lesson"
                    value={formData.lesson || ''}
                    label="Ders"
                    onChange={handleChange as any}
                    sx={{ 
                      borderRadius: 2,
                      height: 56
                    }}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {formData.lesson && lessons.length === 0 && (
                      <MenuItem key={formData.lesson} value={formData.lesson}>Yükleniyor...</MenuItem>
                    )}
                    {lessons.map(lesson => (
                      <MenuItem key={lesson.id} value={lesson.id}>{lesson.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ünite</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit || ''}
                    label="Ünite"
                    onChange={handleChange as any}
                    disabled={!formData.lesson}
                    sx={{ 
                      borderRadius: 2,
                      height: 56
                    }}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {formData.unit && units.length === 0 && (
                      <MenuItem key={formData.unit} value={formData.unit}>Yükleniyor...</MenuItem>
                    )}
                    {units.map(unit => (
                      <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Seçenekler - Alt alta düzenlendi */}
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Şıklar
            </Typography>
            <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }} mb={4}>
              <Grid item xs={12}>
                <TextField
                  name="secenek_a"
                  label="A Şıkkı"
                  value={formData.secenek_a}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      fontSize: '1rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="secenek_b"
                  label="B Şıkkı"
                  value={formData.secenek_b}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      fontSize: '1rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="secenek_c"
                  label="C Şıkkı"
                  value={formData.secenek_c}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      fontSize: '1rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="secenek_d"
                  label="D Şıkkı"
                  value={formData.secenek_d}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      fontSize: '1rem'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Doğru Cevap */}
            <Box mb={4}>
              <FormControl required>
                <FormLabel>Doğru Cevap</FormLabel>
                <RadioGroup
                  row
                  name="dogru_cevap"
                  value={formData.dogru_cevap}
                  onChange={handleChange}
                >
                  <FormControlLabel value="A" control={<Radio />} label="A" />
                  <FormControlLabel value="B" control={<Radio />} label="B" />
                  <FormControlLabel value="C" control={<Radio />} label="C" />
                  <FormControlLabel value="D" control={<Radio />} label="D" />
                </RadioGroup>
              </FormControl>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            {/* Soru Özellikleri */}
            <Typography variant="h6" fontWeight={600} mb={3}>
              Soru Özellikleri
            </Typography>
            
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isAnimasyonlu"
                      checked={formData.isAnimasyonlu}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Animasyonlu Soru"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      name="cikmis"
                      checked={formData.cikmis}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Sınavda Çıkmış Soru"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </Grid>
            </Grid>
            
            {/* Medya Yükleme */}
            <Box mb={4}>
              <MediaUpload
                value={formData.medya_url}
                onChange={(url) => setFormData({...formData, medya_url: url})}
                mediaType={selectedFormat}
                questionId={id}
                label={`${selectedFormat === 'image' ? 'Soru Görseli' : 'Soru Videosu'} (Opsiyonel)`}
                helperText={
                  formData.isAnimasyonlu
                    ? 'Animasyonlu soru olarak işaretlendiği için video yükleyebilirsiniz. Maksimum 50MB.'
                    : 'Soruya görsel eklemek isterseniz bir resim yükleyin. Maksimum 50MB.'
                }
              />
            </Box>
            
            {/* Açıklama */}
            <Box mb={3}>
              <Typography fontWeight={500} mb={1}>
                Cevap Açıklaması (Opsiyonel)
              </Typography>
              <TextField
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Doğru cevap için açıklama yazabilirsiniz..."
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    width: '100%' // Tam genişlik sağlanması için
                  }
                }}
              />
            </Box>
          </Paper>
          
          {/* Butonlar */}
          <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
            <Button
              variant="outlined"
              onClick={() => navigate('/questions')}
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
              {isEditMode ? 'Soruyu Güncelle' : 'Soruyu Kaydet'}
            </Button>
          </Box>
        </form>
      )}

      {/* Önizleme Modalı */}
      <QuestionPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        formData={formData}
        sanitizedHtml={sanitizedHtml}
        selectedFormat={selectedFormat}
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

export default AddQuestion;