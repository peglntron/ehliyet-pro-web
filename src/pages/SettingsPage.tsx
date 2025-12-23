import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tab, Tabs, TextField, Button, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  Chip, Divider, Alert, CircularProgress, Switch, FormControlLabel
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
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  
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

  const studentTemplates = templates.filter(t => t.targetType === 'COMPANY_STUDENT');
  const instructorTemplates = templates.filter(t => t.targetType === 'INSTRUCTOR');

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc', p: 3 }}>
      <Typography variant="h4" gutterBottom>Ayarlar</Typography>
      <Paper sx={{ p: 0, mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Bildirim Şablonları" />
          <Tab label="Bildirim Ayarları" />
          <Tab label="Genel Parametreler" />
          {user?.role === 'COMPANY_ADMIN' && <Tab label="Kullanıcı Yetkileri" />}
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6">Bildirim Şablonları</Typography>
              <Typography variant="body2" color="text.secondary">
                Öğrenci ve eğitmenlere gönderilecek bildirim mesajlarının şablonlarını buradan yönetebilirsiniz.
              </Typography>
            </Box>
            {templates.length === 0 && !loading && (
              <Button variant="contained" onClick={() => createDefaultTemplates().then(() => {
                showSnackbar('Varsayılan şablonlar oluşturuldu', 'success');
              }).catch(() => {
                showSnackbar('Hata oluştu', 'error');
              })}>
                Varsayılan Şablonları Oluştur
              </Button>
            )}
          </Box>
          {loading ? <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box> : error ? (
            <Alert severity="error">{error}</Alert>
          ) : templates.length === 0 ? (
            <Alert severity="info">Henüz şablon oluşturulmamış.</Alert>
          ) : (
            <Box display="flex" gap={4} mt={3}>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>Öğrenci Şablonları ({studentTemplates.length})</Typography>
                  <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => {
                    setEditingTemplate({ targetType: 'COMPANY_STUDENT', name: '', title: '', content: '', triggerType: 'MANUAL' });
                    setEditModalOpen(true);
                  }}>Yeni</Button>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {studentTemplates.map((t) => (
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
                              showSnackbar(`Şablon ${!t.isActive ? 'aktif' : 'pasif'} hale getirildi`);
                              showSnackbar('success');
                              ;
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
                              onClick={() => {
                                if (confirm('Silmek istediğinizden emin misiniz?')) deleteTemplate(t.id).then(() => {
                                  showSnackbar('Silindi');
                                  showSnackbar('success');
                                  ;
                                });
                              }}
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
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>Eğitmen Şablonları ({instructorTemplates.length})</Typography>
                  <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => {
                    setEditingTemplate({ targetType: 'INSTRUCTOR', name: '', title: '', content: '', triggerType: 'MANUAL' });
                    setEditModalOpen(true);
                  }}>Yeni</Button>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {instructorTemplates.map((t) => (
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
                              showSnackbar(`Şablon ${!t.isActive ? 'aktif' : 'pasif'} hale getirildi`);
                              showSnackbar('success');
                              ;
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
                              onClick={() => {
                                if (confirm('Silmek istediğinizden emin misiniz?')) deleteTemplate(t.id).then(() => {
                                  showSnackbar('Silindi');
                                  showSnackbar('success');
                                  ;
                                });
                              }}
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
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>Bildirim Ayarları</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Otomatik bildirim gönderimlerini ve bildirim kanallarını buradan yönetebilirsiniz.
            </Typography>

            {settingsLoading ? (
              <Box display="flex" justifyContent="center" p={5}>
                <CircularProgress />
              </Box>
            ) : settingsError ? (
              <Alert severity="error">{settingsError}</Alert>
            ) : settings ? (
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Genel Ayarlar */}
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
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
                        checked={settings.autoNotificationsEnabled}
                        onChange={(e) => updateSettings({ autoNotificationsEnabled: e.target.checked }).then(() => {
                          showSnackbar('Otomatik bildirimler ' + (e.target.checked ? 'aktif' : 'pasif') + ' edildi');
                          showSnackbar('success');
                          ;
                        })}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Otomatik Bildirimler */}
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Sınav Hatırlatmaları
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Yaklaşan sınavlar için otomatik hatırlatma ayarları
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Sınav Hatırlatması</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Öğrencilere sınav öncesi hatırlatma gönder
                          </Typography>
                        </Box>
                        <Switch 
                          checked={settings.examReminderEnabled}
                          onChange={(e) => updateSettings({ examReminderEnabled: e.target.checked }).then(() => {
                            showSnackbar('Sınav hatırlatması ' + (e.target.checked ? 'aktif' : 'pasif') + ' edildi');
                            showSnackbar('success');
                            ;
                          })}
                        />
                      </Box>
                      {settings.examReminderEnabled && (
                        <Box display="flex" flexDirection="column" gap={2} ml={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="number"
                              size="small"
                              label="Gün önce"
                              value={settings.examReminderDaysBefore}
                              onChange={(e) => {
                                const days = parseInt(e.target.value);
                                if (days >= 0) {
                                  updateSettings({ examReminderDaysBefore: days }).then(() => {
                                    showSnackbar('Hatırlatma süresi güncellendi');
                                    showSnackbar('success');
                                    ;
                                  });
                                }
                              }}
                              sx={{ width: 100 }}
                              inputProps={{ min: 0, max: 30 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              gün önce hatırlat
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <FormControlLabel 
                              control={
                                <Switch 
                                  checked={settings.examReminderOnDay}
                                  onChange={(e) => updateSettings({ examReminderOnDay: e.target.checked }).then(() => {
                                    showSnackbar('Sınav günü hatırlatması güncellendi');
                                    showSnackbar('success');
                                    ;
                                  })}
                                />
                              }
                              label="Sınav günü de hatırlat"
                            />
                            {settings.examReminderOnDay && (
                              <TextField
                                type="time"
                                size="small"
                                label="Saat"
                                value={settings.examReminderTime}
                                onChange={(e) => updateSettings({ examReminderTime: e.target.value }).then(() => {
                                  showSnackbar('Hatırlatma saati güncellendi');
                                  showSnackbar('success');
                                  ;
                                })}
                                sx={{ width: 140 }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Ödeme Hatırlatmaları
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Bekleyen ödemeler için otomatik hatırlatma ayarları
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Ödeme Hatırlatması</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Öğrencilere ödeme hatırlatması gönder
                          </Typography>
                        </Box>
                        <Switch 
                          checked={settings.paymentReminderEnabled}
                          onChange={(e) => updateSettings({ paymentReminderEnabled: e.target.checked }).then(() => {
                            showSnackbar('Ödeme hatırlatması ' + (e.target.checked ? 'aktif' : 'pasif') + ' edildi');
                            showSnackbar('success');
                            ;
                          })}
                        />
                      </Box>
                      {settings.paymentReminderEnabled && (
                        <Box display="flex" flexDirection="column" gap={2} ml={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="number"
                              size="small"
                              label="Gün önce"
                              value={settings.paymentReminderDaysBefore}
                              onChange={(e) => {
                                const days = parseInt(e.target.value);
                                if (days >= 0) {
                                  updateSettings({ paymentReminderDaysBefore: days }).then(() => {
                                    showSnackbar('Hatırlatma süresi güncellendi');
                                    showSnackbar('success');
                                    ;
                                  });
                                }
                              }}
                              sx={{ width: 100 }}
                              inputProps={{ min: 0, max: 30 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              gün önce hatırlat
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <FormControlLabel 
                              control={
                                <Switch 
                                  checked={settings.paymentReminderOnDay}
                                  onChange={(e) => updateSettings({ paymentReminderOnDay: e.target.checked }).then(() => {
                                    showSnackbar('Ödeme günü hatırlatması güncellendi');
                                    showSnackbar('success');
                                    ;
                                  })}
                                />
                              }
                              label="Ödeme günü de hatırlat"
                            />
                            {settings.paymentReminderOnDay && (
                              <TextField
                                type="time"
                                size="small"
                                label="Saat"
                                value={settings.paymentReminderTime}
                                onChange={(e) => updateSettings({ paymentReminderTime: e.target.value }).then(() => {
                                  showSnackbar('Hatırlatma saati güncellendi');
                                  showSnackbar('success');
                                  ;
                                })}
                                sx={{ width: 140 }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Ders Hatırlatmaları
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Yaklaşan dersler için otomatik hatırlatma ayarları
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Ders Hatırlatması</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Öğrencilere ders öncesi hatırlatma gönder
                          </Typography>
                        </Box>
                        <Switch 
                          checked={settings.lessonReminderEnabled}
                          onChange={(e) => updateSettings({ lessonReminderEnabled: e.target.checked }).then(() => {
                            showSnackbar('Ders hatırlatması ' + (e.target.checked ? 'aktif' : 'pasif') + ' edildi');
                            showSnackbar('success');
                            ;
                          })}
                        />
                      </Box>
                      {settings.lessonReminderEnabled && (
                        <Box display="flex" flexDirection="column" gap={2} ml={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="number"
                              size="small"
                              label="Saat önce"
                              value={settings.lessonReminderHoursBefore}
                              onChange={(e) => {
                                const hours = parseInt(e.target.value);
                                if (hours >= 0) {
                                  updateSettings({ lessonReminderHoursBefore: hours }).then(() => {
                                    showSnackbar('Hatırlatma süresi güncellendi');
                                    showSnackbar('success');
                                    ;
                                  });
                                }
                              }}
                              sx={{ width: 100 }}
                              inputProps={{ min: 0, max: 72 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              saat önce hatırlat
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="time"
                              size="small"
                              label="Hatırlatma Saati"
                              value={settings.lessonReminderTime}
                              onChange={(e) => updateSettings({ lessonReminderTime: e.target.value }).then(() => {
                                showSnackbar('Hatırlatma saati güncellendi');
                                showSnackbar('success');
                                ;
                              })}
                              sx={{ width: 140 }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : null}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
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

        {/* Tab 3: Kullanıcı Yetkileri (Sadece COMPANY_ADMIN) */}
        {user?.role === 'COMPANY_ADMIN' && (
          <TabPanel value={tabValue} index={3}>
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
    </Box>
  );
};

export default SettingsPage;
