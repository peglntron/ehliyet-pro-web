import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tab, Tabs, TextField, Button, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  Chip, Divider, Alert, CircularProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Save as SaveIcon, Close as CloseIcon, PlayArrow as AutoIcon,
  TouchApp as ManualIcon
} from '@mui/icons-material';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useNotificationTemplates } from '../api/useNotificationTemplates';
import { useNotificationSettings } from '../api/useNotificationSettings';
import { useCompanySettings } from '../api/useCompanySettings';
import UserPermissionsTab from '../features/settings/components/UserPermissionsTab';
import { useAuth } from '../contexts/AuthContext';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface EditingTemplate {
  id?: string;
  targetType: 'COMPANY_STUDENT' | 'INSTRUCTOR';
  name: string;
  title: string;
  content: string;
  triggerType: 'MANUAL' | 'AUTO';
}

const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  // Varsayılan şablonlar için state
  const [defaultTemplateStates, setDefaultTemplateStates] = useState<{ [key: string]: any }>({});
  
  // Genel Parametreler için local state
  const [localCompanySettings, setLocalCompanySettings] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    templates, loading, error, fetchTemplates, createTemplate,
    updateTemplate, toggleActive, deleteTemplate, createDefaultTemplates
  } = useNotificationTemplates();

  const {
    settings, loading: settingsLoading, error: settingsError,
    fetchSettings, updateSettings
  } = useNotificationSettings();

  const {
    settings: companySettings, loading: companySettingsLoading, error: companySettingsError,
    fetchSettings: fetchCompanySettings, updateSettings: updateCompanySettings
  } = useCompanySettings();

  useEffect(() => {
    fetchTemplates().catch(console.error);
    fetchSettings().catch(console.error);
    fetchCompanySettings().catch(console.error);
  }, []);

  // companySettings yüklendiğinde localCompanySettings'i güncelle
  useEffect(() => {
    if (companySettings) {
      setLocalCompanySettings(companySettings);
      setHasUnsavedChanges(false);
    }
  }, [companySettings]);

  // Varsayılan şablonları yüklendiğinde state'i başlat
  useEffect(() => {
    if (templates.length > 0) {
      const states: { [key: string]: any } = {};
      templates.filter(t => t.isDefault).forEach(template => {
        states[template.id] = {
          reminderDaysBefore: template.reminderDaysBefore,
          reminderTime: template.reminderTime,
          enableReminderOnDay: template.enableReminderOnDay || false,
          isActive: template.isActive,
          hasChanges: false
        };
      });
      setDefaultTemplateStates(states);
    }
  }, [templates]);

  const handleCompanySettingChange = (field: string, value: any) => {
    setLocalCompanySettings((prev: any) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveCompanySettings = async () => {
    try {
      await updateCompanySettings(localCompanySettings);
      showSnackbar('Ayarlar başarıyla kaydedildi', 'success');
      setHasUnsavedChanges(false);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu', 'error');
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name.trim() || !editingTemplate?.title.trim() || !editingTemplate?.content.trim()) return;
    try {
      if (editingTemplate.id) {
        await updateTemplate(editingTemplate.id, {
          name: editingTemplate.name, title: editingTemplate.title,
          content: editingTemplate.content, triggerType: editingTemplate.triggerType
        });
      } else {
        await createTemplate({
          targetType: editingTemplate.targetType, name: editingTemplate.name,
          title: editingTemplate.title, content: editingTemplate.content,
          triggerType: editingTemplate.triggerType
        });
      }
      showSnackbar(editingTemplate.id ? 'Şablon güncellendi' : 'Şablon oluşturuldu', 'success');
      setEditModalOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Hata oluştu', 'error');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setTemplateToDelete({ id, name });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      showSnackbar('Şablon silindi', 'success');
      setConfirmDeleteOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Silme işlemi başarısız', 'error');
    }
  };

  // Varsayılan şablon state güncelleme
  const updateDefaultTemplateState = (id: string, field: string, value: any) => {
    setDefaultTemplateStates(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, hasChanges: true }
    }));
  };

  // Varsayılan şablon backend'e kaydet
  const saveDefaultTemplate = async (id: string) => {
    const state = defaultTemplateStates[id];
    if (!state) return;

    try {
      await updateTemplate(id, {
        reminderDaysBefore: state.reminderDaysBefore || null,
        reminderTime: state.enableReminderOnDay ? state.reminderTime : null,
        enableReminderOnDay: state.enableReminderOnDay,
        isActive: state.isActive
      });
      showSnackbar('Şablon güncellendi', 'success');
      // Değişiklik bayrağını temizle
      setDefaultTemplateStates(prev => ({
        ...prev,
        [id]: { ...prev[id], hasChanges: false }
      }));
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Güncelleme başarısız', 'error');
    }
  };

  // Şablonları ayır
  const defaultTemplates = templates.filter(t => t.isDefault === true);
  const customStudentTemplates = templates.filter(t => t.targetType === 'COMPANY_STUDENT' && t.isDefault !== true);
  const customInstructorTemplates = templates.filter(t => t.targetType === 'INSTRUCTOR' && t.isDefault !== true);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc', p: 3 }}>
      <Typography variant="h4" gutterBottom>Ayarlar</Typography>
      <Paper sx={{ p: 0, mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Bildirim Şablonları" />
          <Tab label="Genel Parametreler" />
          {user?.role === 'COMPANY_ADMIN' && <Tab label="Kullanıcı Yetkileri" />}
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box>
              {/* Özel Şablonlar - Üstte */}
              {(customStudentTemplates.length > 0 || customInstructorTemplates.length > 0) && (
                <Box mb={4}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h6">Tanımlı Özel Şablonlar</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kurumunuz tarafından oluşturulan özel bildirim şablonları.
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        onClick={() => {
                          setEditingTemplate({ targetType: 'COMPANY_STUDENT', name: '', title: '', content: '', triggerType: 'MANUAL' });
                          setEditModalOpen(true);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Öğrenci Şablonu Ekle
                      </Button>
                      <Button 
                        startIcon={<AddIcon />} 
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          setEditingTemplate({ targetType: 'INSTRUCTOR', name: '', title: '', content: '', triggerType: 'MANUAL' });
                          setEditModalOpen(true);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Eğitmen Şablonu Ekle
                      </Button>
                    </Box>
                  </Box>
                  <Box display="flex" gap={4}>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>Öğrenci Şablonları ({customStudentTemplates.length})</Typography>
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        {customStudentTemplates.map((t) => (
                          <Card key={t.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="body1" fontWeight={600}>{t.name}</Typography>
                                <Chip
                                  icon={t.triggerType === 'AUTO' ? <AutoIcon fontSize="small" /> : <ManualIcon fontSize="small" />}
                                  label={t.triggerType === 'AUTO' ? 'Otomatik' : 'Manuel'}
                                  size="small"
                                  color={t.triggerType === 'AUTO' ? 'info' : 'default'}
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5
                              }}>
                                {t.content}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Switch checked={t.isActive} size="small" onChange={() => toggleActive(t.id).then(() => {
                                    showSnackbar(`Şablon ${!t.isActive ? 'aktif' : 'pasif'} hale getirildi`, 'success');
                                  })} />
                                  <Typography variant="caption" color="text.secondary">
                                    {t.isActive ? 'Aktif' : 'Pasif'}
                                  </Typography>
                                </Box>
                                <Box display="flex" gap={0.5}>
                                  <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                      setEditingTemplate({ id: t.id, targetType: t.targetType, name: t.name, title: t.title, content: t.content, triggerType: t.triggerType });
                                      setEditModalOpen(true);
                                    }}
                                  >
                                    Düzenle
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteClick(t.id, t.name)}
                                  >
                                    Sil
                                  </Button>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>Eğitmen Şablonları ({customInstructorTemplates.length})</Typography>
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        {customInstructorTemplates.map((t) => (
                          <Card key={t.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="body1" fontWeight={600}>{t.name}</Typography>
                                <Chip
                                  icon={t.triggerType === 'AUTO' ? <AutoIcon fontSize="small" /> : <ManualIcon fontSize="small" />}
                                  label={t.triggerType === 'AUTO' ? 'Otomatik' : 'Manuel'}
                                  size="small"
                                  color={t.triggerType === 'AUTO' ? 'info' : 'default'}
                                  sx={{ height: 22, fontSize: '0.75rem' }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5
                              }}>
                                {t.content}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Switch checked={t.isActive} size="small" onChange={() => toggleActive(t.id).then(() => {
                                    showSnackbar(`Şablon ${!t.isActive ? 'aktif' : 'pasif'} hale getirildi`, 'success');
                                  })} />
                                  <Typography variant="caption" color="text.secondary">
                                    {t.isActive ? 'Aktif' : 'Pasif'}
                                  </Typography>
                                </Box>
                                <Box display="flex" gap={0.5}>
                                  <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                      setEditingTemplate({ id: t.id, targetType: t.targetType, name: t.name, title: t.title, content: t.content, triggerType: t.triggerType });
                                      setEditModalOpen(true);
                                    }}
                                  >
                                    Düzenle
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteClick(t.id, t.name)}
                                  >
                                    Sil
                                  </Button>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 4 }} />
                </Box>
              )}

              {/* Yeni Şablon Ekleme Butonu - Şablon yoksa */}
              {customStudentTemplates.length === 0 && customInstructorTemplates.length === 0 && (
                <Box mb={4} textAlign="center" py={3}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Henüz özel şablon eklenmemiş. Yeni şablon eklemek için aşağıdaki butonları kullanabilirsiniz.
                  </Typography>
                  <Box display="flex" gap={2} justifyContent="center">
                    <Button 
                      startIcon={<AddIcon />} 
                      variant="contained" 
                      onClick={() => {
                        setEditingTemplate({ targetType: 'COMPANY_STUDENT', name: '', title: '', content: '', triggerType: 'MANUAL' });
                        setEditModalOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Öğrenci Şablonu Ekle
                    </Button>
                    <Button 
                      startIcon={<AddIcon />} 
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setEditingTemplate({ targetType: 'INSTRUCTOR', name: '', title: '', content: '', triggerType: 'MANUAL' });
                        setEditModalOpen(true);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Eğitmen Şablonu Ekle
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Varsayılan Şablonlar Tablosu */}
              {defaultTemplates.length > 0 && (
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>Varsayılan Bildirim Şablonları</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Sistem tarafından otomatik oluşturulan şablonlar. Sadece aktif/pasif durumu ve hatırlatma ayarları değiştirilebilir.
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontSize: '0.95rem' }}><strong>Hedef</strong></TableCell>
                          <TableCell sx={{ fontSize: '0.95rem' }}><strong>Şablon Adı</strong></TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.95rem' }}><strong>Kaç Gün Önce</strong></TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.95rem', minWidth: 220 }}><strong>Sınav Gününde Hatırlat</strong></TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.95rem' }}><strong>Bildirim Durumu</strong></TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.95rem' }}><strong>İşlem</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {defaultTemplates.map((template) => {
                          const state = defaultTemplateStates[template.id] || {
                            reminderDaysBefore: template.reminderDaysBefore,
                            reminderTime: template.reminderTime,
                            enableReminderOnDay: template.enableReminderOnDay || false,
                            isActive: template.isActive,
                            hasChanges: false
                          };
                          
                          return (
                            <TableRow key={template.id} hover>
                              <TableCell>
                                <Chip 
                                  label={template.targetType === 'COMPANY_STUDENT' ? 'Öğrenci' : 'Eğitmen'}
                                  size="small"
                                  color={template.targetType === 'COMPANY_STUDENT' ? 'primary' : 'secondary'}
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>{template.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{template.title}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  type="number"
                                  size="medium"
                                  value={state.reminderDaysBefore ?? ''}
                                  onChange={(e) => updateDefaultTemplateState(template.id, 'reminderDaysBefore', parseInt(e.target.value) || null)}
                                  inputProps={{ min: 0, max: 30, style: { textAlign: 'center', fontSize: '0.95rem' } }}
                                  sx={{ width: 100 }}
                                  placeholder="-"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1.5}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={state.enableReminderOnDay}
                                        onChange={(e) => updateDefaultTemplateState(template.id, 'enableReminderOnDay', e.target.checked)}
                                      />
                                    }
                                    label={<Typography variant="body2">{state.enableReminderOnDay ? 'Saat:' : 'Kapalı'}</Typography>}
                                  />
                                  <TextField
                                    type="time"
                                    size="medium"
                                    value={state.reminderTime || ''}
                                    onChange={(e) => updateDefaultTemplateState(template.id, 'reminderTime', e.target.value)}
                                    disabled={!state.enableReminderOnDay}
                                    inputProps={{ style: { textAlign: 'center', fontSize: '0.95rem' } }}
                                    sx={{ width: 140 }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                  <Switch
                                    checked={state.isActive}
                                    onChange={(e) => updateDefaultTemplateState(template.id, 'isActive', e.target.checked)}
                                    size="small"
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {state.isActive ? 'Aktif' : 'Pasif'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                {state.hasChanges && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => saveDefaultTemplate(template.id)}
                                    startIcon={<SaveIcon />}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Kaydet
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Genel Bildirim Ayarları */}
                  {settings && (
                    <Paper elevation={0} sx={{ mt: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Genel Otomatik Bildirimler
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
                          checked={settings.autoNotificationsEnabled}
                          onChange={(e) => updateSettings({ autoNotificationsEnabled: e.target.checked }).then(() => {
                            showSnackbar('Otomatik bildirimler ' + (e.target.checked ? 'aktif' : 'pasif') + ' edildi', 'success');
                          })}
                        />
                      </Box>
                    </Paper>
                  )}
                </Box>
              )}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h6" gutterBottom>Genel Parametreler</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sürücü kursu işletme parametrelerini buradan yönetebilirsiniz.
                </Typography>
              </Box>
              {hasUnsavedChanges && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveCompanySettings}
                >
                  Değişiklikleri Kaydet
                </Button>
              )}
            </Box>
            
            {companySettingsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : companySettingsError ? (
              <Alert severity="error">{companySettingsError}</Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Sınav Ayarları</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" gap={2}>
                        <TextField
                          type="number"
                          label="Yazılı Sınav Maksimum Deneme Hakkı"
                          value={localCompanySettings?.writtenExamMaxAttempts || 4}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 10) {
                              handleCompanySettingChange('writtenExamMaxAttempts', value);
                            }
                          }}
                          fullWidth
                          InputProps={{ inputProps: { min: 1, max: 10 } }}
                        />
                        <TextField
                          type="number"
                          label="Direksiyon Sınavı Maksimum Deneme Hakkı"
                          value={localCompanySettings?.drivingExamMaxAttempts || 4}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 10) {
                              handleCompanySettingChange('drivingExamMaxAttempts', value);
                            }
                          }}
                          fullWidth
                          InputProps={{ inputProps: { min: 1, max: 10 } }}
                        />
                      </Box>
                      <TextField
                        type="number"
                        label="Varsayılan Yazılı Sınav Ücreti (TL)"
                        value={localCompanySettings?.defaultWrittenExamPrice || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            handleCompanySettingChange('defaultWrittenExamPrice', value);
                          }
                        }}
                        fullWidth
                        placeholder="0.00"
                      />
                      <Box display="flex" gap={2}>
                        <TextField
                          type="number"
                          label="Direksiyondan Kalınca Sınav Ücreti (TL)"
                          value={localCompanySettings?.defaultDrivingExamPrice || 4500}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleCompanySettingChange('defaultDrivingExamPrice', value);
                            }
                          }}
                          fullWidth
                          placeholder="4500"
                          helperText="Direksiyon sınavından kalırsa uygulanacak ücret"
                        />
                        <TextField
                          type="number"
                          label="Sınavdan Kalınca Ders Sayısı"
                          value={localCompanySettings?.drivingExamFailLessonCount || 4}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1) {
                              handleCompanySettingChange('drivingExamFailLessonCount', value);
                            }
                          }}
                          fullWidth
                          InputProps={{ inputProps: { min: 1 } }}
                          helperText="Sınavdan kalınca alınacak ek ders sayısı"
                        />
                      </Box>
                      <TextField
                        label="Direksiyon Sınavı Google Map Linki"
                        value={localCompanySettings?.drivingExamGoogleMapLink || ''}
                        onChange={(e) => {
                          handleCompanySettingChange('drivingExamGoogleMapLink', e.target.value);
                        }}
                        fullWidth
                        placeholder="https://maps.google.com/..."
                        helperText="Öğrencilerin direksiyon sınavına gidecekleri konum"
                      />
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Ders ve Ödeme Ayarları</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" gap={2}>
                        <TextField
                          type="number"
                          label="Minimum Direksiyon Dersi Sayısı"
                          value={localCompanySettings?.minDrivingLessons || 12}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1) {
                              handleCompanySettingChange('minDrivingLessons', value);
                            }
                          }}
                          fullWidth
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                        <TextField
                          type="number"
                          label="Varsayılan Kurs Ücreti (TL)"
                          value={localCompanySettings?.defaultCoursePrice || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleCompanySettingChange('defaultCoursePrice', value);
                            }
                          }}
                          fullWidth
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localCompanySettings?.enableInstallmentPayments ?? true}
                            onChange={(e) => {
                              handleCompanySettingChange('enableInstallmentPayments', e.target.checked);
                            }}
                          />
                        }
                        label="Taksitli Ödeme İzni"
                      />
                      {localCompanySettings?.enableInstallmentPayments && (
                        <TextField
                          type="number"
                          label="Maksimum Taksit Sayısı"
                          value={localCompanySettings?.maxInstallmentCount || 12}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 24) {
                              handleCompanySettingChange('maxInstallmentCount', value);
                            }
                          }}
                          fullWidth
                          InputProps={{ inputProps: { min: 1, max: 24 } }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>Öğrenci ve Eğitmen Ayarları</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localCompanySettings?.autoCreateUserForStudent ?? true}
                            onChange={(e) => {
                              handleCompanySettingChange('autoCreateUserForStudent', e.target.checked);
                            }}
                          />
                        }
                        label="Öğrenci kaydında otomatik kullanıcı oluştur"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localCompanySettings?.allowInstructorTransfer ?? true}
                            onChange={(e) => {
                              handleCompanySettingChange('allowInstructorTransfer', e.target.checked);
                            }}
                          />
                        }
                        label="Eğitmen değişikliğine izin ver"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2: Kullanıcı Yetkileri (Sadece COMPANY_ADMIN) */}
        {user?.role === 'COMPANY_ADMIN' && (
          <TabPanel value={tabValue} index={2}>
            <UserPermissionsTab />
          </TabPanel>
        )}
      </Paper>
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingTemplate?.id ? 'Şablon Düzenle' : 'Yeni Şablon'}</Typography>
            <IconButton onClick={() => setEditModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <Chip label={editingTemplate?.targetType === 'COMPANY_STUDENT' ? 'Öğrenci Şablonu' : 'Eğitmen Şablonu'} color="primary" size="small" />
            <TextField fullWidth label="Şablon Adı" value={editingTemplate?.name || ''} 
              onChange={(e) => setEditingTemplate(p => p ? { ...p, name: e.target.value } : null)} placeholder="Örn: Sınav Hatırlatması" />
            <TextField fullWidth label="Bildirim Başlığı" value={editingTemplate?.title || ''}
              onChange={(e) => setEditingTemplate(p => p ? { ...p, title: e.target.value } : null)} 
              placeholder="Örn: Yaklaşan Sınavınız" helperText="Mobil bildirimde görünecek başlık" />
            <TextField fullWidth multiline rows={6} label="Mesaj İçeriği" value={editingTemplate?.content || ''}
              onChange={(e) => setEditingTemplate(p => p ? { ...p, content: e.target.value } : null)}
              placeholder="Bildirim mesajını yazın..." helperText="{name} kullanarak alıcının adını kişiselleştirebilirsiniz" />
            {/* Otomatik gönderim seçeneği kaldırıldı - condition sistemi olmadığı için */}
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <strong>Önizleme:</strong> {editingTemplate?.content.replace('{name}', 'Ahmet Yılmaz') || 'Mesaj yazın...'}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditModalOpen(false)}>İptal</Button>
          <Button onClick={handleSaveTemplate} variant="contained" startIcon={<SaveIcon />}
            disabled={!editingTemplate?.name.trim() || !editingTemplate?.title.trim() || !editingTemplate?.content.trim()}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog 
        open={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Şablonu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{templateToDelete?.name}</strong> şablonunu silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)}>İptal</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
