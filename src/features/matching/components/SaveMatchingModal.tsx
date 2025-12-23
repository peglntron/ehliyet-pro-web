import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import type { MatchingResult } from '../types/types';
import { saveMatching } from '../api/savedMatchingApi';

interface SaveMatchingModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  matches: MatchingResult[];
  licenseTypes: string[]; // Çoklu ehliyet türü
}

const SaveMatchingModal: React.FC<SaveMatchingModalProps> = ({
  open,
  onClose,
  onSaved,
  matches,
  licenseTypes
}) => {
  const [formData, setFormData] = useState({
    name: `${licenseTypes.join(', ')} Sınıfları Eşleştirme - ${new Date().toLocaleDateString('tr-TR')}`,
    description: '',
    status: 'active' as 'active' | 'draft' | 'archived'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Modal açıldığında licenseTypes'a göre default name oluştur
  useEffect(() => {
    if (open) {
      setFormData({
        name: `${licenseTypes.join(', ')} Sınıfları Eşleştirme - ${new Date().toLocaleDateString('tr-TR')}`,
        description: '',
        status: 'active'
      });
      setError('');
    }
  }, [open, licenseTypes]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      if (!formData.name.trim()) {
        setError('Eşleştirme adı gereklidir');
        return;
      }

      if (matches.length === 0) {
        setError('Kaydedilecek eşleştirme bulunamadı');
        return;
      }

      const totalInstructors = new Set(matches.map(m => m.instructorId)).size;

      const matchesWithTimestamp = matches.map(match => ({
        ...match,
        matchedAt: new Date().toISOString()
      }));

      await saveMatching({
        name: formData.name.trim(),
        description: formData.description.trim(),
        licenseTypes, // Çoklu ehliyet türü
        createdDate: new Date().toISOString(),
        createdBy: 'Mevcut Kullanıcı', // Bu gerçek kullanıcı bilgisiyle değiştirilecek
        totalStudents: matches.length,
        totalInstructors,
        matches: matchesWithTimestamp,
        status: formData.status
      });

      onSaved();
      onClose();
    } catch (err) {
      setError('Eşleştirme kaydedilirken hata oluştu');
      console.error('Save matching error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({
        name: `${licenseTypes.join(', ')} Sınıfları Eşleştirme - ${new Date().toLocaleDateString('tr-TR')}`,
        description: '',
        status: 'active'
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eşleştirmeyi Kaydet</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Eşleştirme Adı *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
            disabled={saving}
          />

          <TextField
            fullWidth
            label="Açıklama"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Bu eşleştirme hakkında notlar..."
            disabled={saving}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={formData.status}
              label="Durum"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              disabled={saving}
            >
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="draft">Taslak</MenuItem>
              <MenuItem value="archived">Arşiv</MenuItem>
            </Select>
          </FormControl>

          {/* Özet Bilgiler */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Eşleştirme Özeti:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Ehliyet Türleri: {licenseTypes.join(', ')} Sınıfları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Toplam Öğrenci: {matches.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Toplam Eğitmen: {new Set(matches.map(m => m.instructorId)).size}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          İptal
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={saving || !formData.name.trim()}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveMatchingModal;