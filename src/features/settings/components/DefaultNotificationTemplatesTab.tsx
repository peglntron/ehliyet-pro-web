import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, TextField, Alert, CircularProgress, Button
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useSnackbar } from '../../../contexts/SnackbarContext';

interface DefaultTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  isDefault: boolean;
  isActive: boolean;
  reminderDaysBefore: number | null;
  reminderOnExamDay: boolean;
  reminderTime: string | null;
}

const DefaultNotificationTemplatesTab: React.FC = () => {
  const [defaultTemplates, setDefaultTemplates] = useState<DefaultTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoNotificationsEnabled, setAutoNotificationsEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDefaultTemplates();
  }, []);

  const fetchDefaultTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/notification-templates/default', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Şablonlar getirilemedi');

      const result = await response.json();
      if (result.success) {
        setDefaultTemplates(result.data.templates || []);
        setAutoNotificationsEnabled(result.data.autoNotificationsEnabled ?? true);
      }
    } catch (error) {
      showSnackbar('Şablonlar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = (id: string) => {
    setDefaultTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    setHasChanges(true);
  };

  const handleReminderDaysChange = (id: string, days: number) => {
    setDefaultTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, reminderDaysBefore: days } : t
    ));
    setHasChanges(true);
  };

  const handleReminderTimeChange = (id: string, time: string) => {
    setDefaultTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, reminderTime: time } : t
    ));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/notification-templates/default/bulk-update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templates: defaultTemplates,
          autoNotificationsEnabled
        })
      });

      if (!response.ok) throw new Error('Kayıt başarısız');

      const result = await response.json();
      if (result.success) {
        showSnackbar('Ayarlar başarıyla kaydedildi', 'success');
        setHasChanges(false);
      }
    } catch (error) {
      showSnackbar('Kayıt sırasında hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom>Varsayılan Bildirim Şablonları</Typography>
          <Typography variant="body2" color="text.secondary">
            Sistem tarafından otomatik oluşturulan bildirim şablonları. Sadece aktif/pasif durumu ve hatırlatma ayarları değiştirilebilir.
          </Typography>
        </Box>
        {hasChanges && (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveChanges}
          >
            Değişiklikleri Kaydet
          </Button>
        )}
      </Box>

      {defaultTemplates.length === 0 ? (
        <Alert severity="info">Henüz varsayılan şablon oluşturulmamış.</Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Şablon Adı</strong></TableCell>
                <TableCell align="center"><strong>Hatırlatma (Gün Önce)</strong></TableCell>
                <TableCell align="center"><strong>Sınav Günü Hatırlat (Saat)</strong></TableCell>
                <TableCell align="center"><strong>Durum</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defaultTemplates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {template.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={template.reminderDaysBefore ?? ''}
                      onChange={(e) => handleReminderDaysChange(template.id, parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 30, style: { textAlign: 'center' } }}
                      sx={{ width: 80 }}
                      placeholder="-"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      size="small"
                      value={template.reminderTime || ''}
                      onChange={(e) => handleReminderTimeChange(template.id, e.target.value)}
                      inputProps={{ style: { textAlign: 'center' } }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Switch
                        checked={template.isActive}
                        onChange={() => handleToggleActive(template.id)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {template.isActive ? 'Aktif' : 'Pasif'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Genel Bildirim Ayarları */}
      <Paper elevation={0} sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Genel Bildirim Ayarları
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Tüm otomatik bildirimleri açıp kapatabilirsiniz
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2}
          sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Otomatik Bildirimler</Typography>
            <Typography variant="caption" color="text.secondary">
              Tüm otomatik bildirimleri aktif/pasif et
            </Typography>
          </Box>
          <Switch
            checked={autoNotificationsEnabled}
            onChange={(e) => {
              setAutoNotificationsEnabled(e.target.checked);
              setHasChanges(true);
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DefaultNotificationTemplatesTab;
