import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import { getInstructors } from '../../instructors/api/useInstructors';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
}

interface AssignVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (data: { instructorId: string; assignedKm?: number; assignedNotes?: string }) => Promise<void>;
  currentKm: number;
}

const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  open,
  onClose,
  onAssign,
  currentKm,
}) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instructorId: '',
    assignedKm: '',
    assignedNotes: '',
  });

  useEffect(() => {
    if (open) {
      loadInstructors();
      // Reset form when modal opens
      setFormData({
        instructorId: '',
        assignedKm: currentKm.toString(),
        assignedNotes: '',
      });
    }
  }, [open, currentKm]);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await getInstructors();
      // Sadece aktif eğitmenleri filtrele
      const activeInstructors = data.filter(i => i.status === 'ACTIVE');
      setInstructors(activeInstructors);
    } catch (error) {
      console.error('Eğitmenler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.instructorId) {
      alert('Lütfen eğitmen seçin');
      return;
    }

    // KM kontrolü
    const assignedKmValue = formData.assignedKm ? parseInt(formData.assignedKm) : currentKm;
    if (assignedKmValue < currentKm) {
      alert(`Zimmet KM'si (${assignedKmValue.toLocaleString('tr-TR')}) aracın mevcut KM'sinden (${currentKm.toLocaleString('tr-TR')}) düşük olamaz!`);
      return;
    }

    try {
      setSubmitting(true);
      await onAssign({
        instructorId: formData.instructorId,
        assignedKm: assignedKmValue,
        assignedNotes: formData.assignedNotes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Zimmet hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Araç Zimmetle</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Eğitmen Seçin</InputLabel>
              <Select
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                label="Eğitmen Seçin"
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName} - {instructor.phone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Teslim KM"
              type="number"
              value={formData.assignedKm}
              onChange={(e) => setFormData({ ...formData, assignedKm: e.target.value })}
              helperText={`Güncel KM: ${currentKm.toLocaleString('tr-TR')} (Boş bırakılırsa güncel km kullanılır)`}
            />

            <TextField
              label="Notlar"
              multiline
              rows={3}
              value={formData.assignedNotes}
              onChange={(e) => setFormData({ ...formData, assignedNotes: e.target.value })}
              placeholder="Zimmet ile ilgili notlar..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading || !formData.instructorId}
        >
          {submitting ? 'Kaydediliyor...' : 'Zimmetle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignVehicleModal;
