import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { Student } from '../features/students/types/types';
import type { Instructor } from '../features/instructors/types/types';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  recipients: Student[] | Instructor[];
  recipientType: 'students' | 'instructors';
  title?: string;
  onSend: (message: string, templateId?: string) => Promise<void>;
}

// Şablonları localStorage'dan yükle
const getTemplatesFromStorage = (recipientType: 'students' | 'instructors') => {
  const savedTemplates = localStorage.getItem('notificationTemplates');
  if (savedTemplates) {
    const allTemplates = JSON.parse(savedTemplates);
    return allTemplates.filter((t: any) => t.recipientType === recipientType);
  }
  return [];
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onClose,
  recipients,
  recipientType,
  title,
  onSend
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Şablonları localStorage'dan yükle
  useEffect(() => {
    const loadedTemplates = getTemplatesFromStorage(recipientType);
    setTemplates(loadedTemplates);
  }, [recipientType]);

  // Şablon seçildiğinde mesajı güncelle
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setCustomMessage(template.message);
      }
    }
  }, [selectedTemplate, templates]);

  // Mesajı kişiselleştir
  const personalizeMessage = (message: string, recipient: Student | Instructor) => {
    let personalizedMessage = message;
    
    if ('name' in recipient) {
      // Student
      personalizedMessage = personalizedMessage.replace('{name}', `${recipient.name} ${recipient.surname}`);
    } else {
      // Instructor
      personalizedMessage = personalizedMessage.replace('{name}', `${recipient.firstName} ${recipient.lastName}`);
    }
    
    return personalizedMessage;
  };

  const handleSend = async () => {
    if (!customMessage.trim()) return;
    
    setSending(true);
    try {
      await onSend(customMessage, selectedTemplate || undefined);
      setCustomMessage('');
      setSelectedTemplate('');
      onClose();
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
    } finally {
      setSending(false);
    }
  };

  const recipientCount = recipients.length;
  const modalTitle = title || `${recipientCount} ${recipientType === 'students' ? 'Öğrenci' : 'Eğitmen'}e Bildirim Gönder`;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {modalTitle}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" gap={3}>
          {/* Sol taraf - Alıcılar */}
          <Box flex={1}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Alıcılar ({recipientCount})
            </Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}>
              {recipients.map((recipient) => (
                <ListItem key={recipient.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      'name' in recipient 
                        ? `${recipient.name} ${recipient.surname}` 
                        : `${recipient.firstName} ${recipient.lastName}`
                    }
                    secondary={recipient.phone || 'Telefon belirtilmemiş'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Sağ taraf - Mesaj */}
          <Box flex={1.5}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Bildirim Mesajı
            </Typography>

            {/* Şablon Seçimi */}
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Mesaj Şablonu Seç</InputLabel>
              <Select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                label="Mesaj Şablonu Seç"
              >
                <MenuItem value="">
                  <em>Özel mesaj yaz</em>
                </MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mesaj Alanı */}
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Mesaj İçeriği"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Bildirim mesajınızı yazın..."
              margin="normal"
              helperText={`{name} kullanarak kişiselleştirme yapabilirsiniz`}
            />

            {/* Önizleme */}
            {customMessage && recipients.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Önizleme (İlk alıcı için):
                </Typography>
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  {personalizeMessage(customMessage, recipients[0])}
                </Alert>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={sending}>
          İptal
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!customMessage.trim() || sending}
          startIcon={sending ? <RefreshIcon className="spin" /> : <SendIcon />}
          sx={{
            minWidth: 120,
            '& .spin': {
              animation: 'spin 1s linear infinite',
            },
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          }}
        >
          {sending ? 'Gönderiliyor...' : `${recipientCount} Kişiye Gönder`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationModal;