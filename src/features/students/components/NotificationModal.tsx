import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, TextField,
  Divider, IconButton, CircularProgress, Alert,
  Select, MenuItem, InputLabel, Chip, FormControl
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Description as DescriptionIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import type { Student, Notification } from '../types/types';
import { sendNotification } from '../api/useStudents';
import { useNotificationTemplates } from '../../../api/useNotificationTemplates';
import { useCompanySettings } from '../../../api/useCompanySettings';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: (notificationData?: {title: string, message: string, type: string}) => void;
  customTitle?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onClose,
  student,
  onSuccess,
  customTitle
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [notificationType, setNotificationType] = useState<'exam' | 'payment' | 'general' | 'warning' | 'lesson'>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Şablonları çek
  const { templates, fetchTemplates } = useNotificationTemplates();
  
  // Şirket ayarlarını çek
  const { settings, fetchSettings } = useCompanySettings();
  
  // Modalı açtığında şablonları ve ayarları yükle
  useEffect(() => {
    if (open) {
      fetchTemplates().catch(console.error);
      fetchSettings().catch(console.error);
    }
  }, [open]);
  
  // Öğrenci şablonlarını filtrele ve sadece aktif olanları al
  const studentTemplates = templates.filter(t => t.targetType === 'COMPANY_STUDENT' && t.isActive);
  
  // Bildirimi gönder
  const handleSend = async () => {
    if (!student) return;
    
    // Form doğrulama
    if (!title.trim()) {
      setError('Bildirim başlığı gereklidir');
      return;
    }
    
    if (!message.trim()) {
      setError('Bildirim mesajı gereklidir');
      return;
    }
    
    const notification: Notification = {
      title,
      message,
      type: notificationType,
      studentName: `${student.name} ${student.surname}` // Öğrenci adını ekle
    };
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await sendNotification(student.id, notification);
      
      if (result) {
        // onSuccess'e bildirim verisini gönder
        onSuccess({
          title,
          message,
          type: notificationType
        });
        resetForm();
        onClose();
      } else {
        setError('Bildirim gönderilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Bildirim gönderme hatası:', err);
      setError('Bildirim gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Formu sıfırla
  const resetForm = () => {
    setNotificationType('general');
    setTitle('');
    setMessage('');
    setError(null);
    setUseTemplate(false);
    setSelectedTemplateId('');
  };
  
  // Şablon seçildiğinde
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = studentTemplates.find(t => t.id === templateId);
    if (template && student) {
      // Tüm placeholder'ları değiştir
      let personalizedTitle = template.title;
      let personalizedContent = template.content;
      
      // {name} - Öğrenci adı
      personalizedTitle = personalizedTitle.replace(/{name}/g, `${student.name} ${student.surname}`);
      personalizedContent = personalizedContent.replace(/{name}/g, `${student.name} ${student.surname}`);
      
      // {examDate} ve {examTime} - Öğrencinin durumuna göre doğru sınav bilgilerini kullan
      let examDate = 'Belirtilmemiş';
      let examTime = 'Belirtilmemiş';
      
      // Yazılı sınav geçmemişse → Yazılı sınav bilgilerini kullan
      if (student.writtenExam?.status !== 'passed') {
        if (student.writtenExamDate) {
          examDate = new Date(student.writtenExamDate).toLocaleDateString('tr-TR');
          examTime = student.writtenExamTime || 'Belirtilmemiş';
        }
      } 
      // Yazılı geçmiş, direksiyon geçmemişse → Direksiyon sınav bilgilerini kullan
      else if (student.drivingExam?.status !== 'passed') {
        if (student.drivingExamDate) {
          examDate = new Date(student.drivingExamDate).toLocaleDateString('tr-TR');
          examTime = student.drivingExamTime || 'Belirtilmemiş';
        }
      }
      
      personalizedContent = personalizedContent.replace(/{examDate}/g, examDate);
      personalizedTitle = personalizedTitle.replace(/{examDate}/g, examDate);
      personalizedContent = personalizedContent.replace(/{examTime}/g, examTime);
      personalizedTitle = personalizedTitle.replace(/{examTime}/g, examTime);
      
      // {location} - Sınav yeri (şirket ayarlarından veya varsayılan)
      const location = settings?.drivingExamGoogleMapLink || 'Trafik Sınav Merkezi';
      personalizedContent = personalizedContent.replace(/{location}/g, location);
      personalizedTitle = personalizedTitle.replace(/{location}/g, location);
      
      // {dueDate} - En yakın vade tarihi (ödenmemiş borç/taksit)
      let dueDate = 'Belirtilmemiş';
      if (student.payments && student.payments.length > 0) {
        // PENDING durumundaki DEBT ve INSTALLMENT kayıtlarını bul
        const pendingDebts = student.payments
          .filter(p => (p.type === 'DEBT' || p.type === 'INSTALLMENT') && p.status === 'PENDING')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (pendingDebts.length > 0) {
          // En yakın vade tarihini al (kayıt kendi vade tarihini kullanıyor)
          const nearestDue = pendingDebts[0];
          dueDate = new Date(nearestDue.date).toLocaleDateString('tr-TR');
        }
      }
      personalizedContent = personalizedContent.replace(/{dueDate}/g, dueDate);
      personalizedTitle = personalizedTitle.replace(/{dueDate}/g, dueDate);
      
      // {amount} - Bildirim tipine göre tutar
      let amount = '0';
      if (template.notificationType === 'PAYMENT') {
        // Ödeme bildirimi ise: Kalan borç tutarını kullan
        // remainingDebt backend'den hesaplanarak gelir
        amount = student.remainingDebt?.toFixed(2) || student.totalPayment?.toFixed(2) || '0';
      } else {
        // Diğer bildirimler için: Kalan borç
        amount = student.remainingDebt?.toFixed(2) || student.totalPayment?.toFixed(2) || '0';
      }
      
      personalizedContent = personalizedContent.replace(/{amount}/g, amount);
      personalizedTitle = personalizedTitle.replace(/{amount}/g, amount);
      
      // Şablonun notificationType'ını kullan
      const typeMapping: Record<string, 'exam' | 'payment' | 'general' | 'lesson'> = {
        'EXAM': 'exam',
        'PAYMENT': 'payment',
        'GENERAL': 'general',
        'LESSON': 'lesson'
      };
      
      const mappedType = typeMapping[template.notificationType] || 'general';
      setNotificationType(mappedType);
      
      setTitle(personalizedTitle);
      setMessage(personalizedContent);
      setUseTemplate(true);
    }
  };
  
  // Manuel mod
  const handleManualMode = () => {
    setUseTemplate(false);
    setSelectedTemplateId('');
    setTitle('');
    setMessage('');
  };
  
  // Modalı kapat ve formu sıfırla
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  if (!student) return null;
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6" fontWeight={600}>
          {customTitle || `Bildirim Gönder: ${student.name} ${student.surname}`}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Şablon veya Manuel Seçimi */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={!useTemplate ? 'contained' : 'outlined'}
              startIcon={<EditIcon />}
              onClick={handleManualMode}
              sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}
            >
              Manuel Bildirim
            </Button>
            <Button
              variant={useTemplate ? 'contained' : 'outlined'}
              startIcon={<DescriptionIcon />}
              onClick={() => setUseTemplate(true)}
              sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}
            >
              Şablondan Seç
            </Button>
          </Box>
          
          {/* Şablon Seçimi */}
          {useTemplate && (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Bildirim Şablonu Seçin</InputLabel>
                <Select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  label="Bildirim Şablonu Seçin"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Şablon Seçin</em>
                  </MenuItem>
                  {studentTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography sx={{ flex: 1 }}>{template.name}</Typography>
                        <Chip 
                          label={template.triggerType === 'AUTO' ? 'Otomatik' : 'Manuel'} 
                          size="small" 
                          color={template.triggerType === 'AUTO' ? 'info' : 'default'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {studentTemplates.length === 0 && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  Henüz aktif şablon bulunmuyor. Ayarlar sayfasından şablon oluşturabilirsiniz.
                </Alert>
              )}
            </Box>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Bildirim Başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Bildirim Mesajı"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            multiline
            rows={4}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          onClick={handleSend}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          {loading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationModal;
