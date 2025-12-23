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
} from '@mui/material';

interface UnassignVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onUnassign: (data: { returnedKm?: number; returnedNotes?: string }) => Promise<void>;
  currentKm: number;
  currentInstructor?: {
    firstName: string;
    lastName: string;
  };
}

const UnassignVehicleModal: React.FC<UnassignVehicleModalProps> = ({
  open,
  onClose,
  onUnassign,
  currentKm,
  currentInstructor,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    returnedKm: '',
    returnedNotes: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        returnedKm: currentKm.toString(),
        returnedNotes: '',
      });
    }
  }, [open, currentKm]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onUnassign({
        returnedKm: formData.returnedKm ? parseInt(formData.returnedKm) : undefined,
        returnedNotes: formData.returnedNotes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Zimmet kaldırma hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Zimmeti Kaldır</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {currentInstructor && (
            <Typography variant="body2" color="text.secondary">
              <strong>Zimmetli Eğitmen:</strong> {currentInstructor.firstName} {currentInstructor.lastName}
            </Typography>
          )}

          <TextField
            label="İade KM"
            type="number"
            value={formData.returnedKm}
            onChange={(e) => setFormData({ ...formData, returnedKm: e.target.value })}
            helperText={`Güncel KM: ${currentKm.toLocaleString('tr-TR')} (Boş bırakılırsa güncel km kullanılır)`}
          />

          <TextField
            label="İade Notları"
            multiline
            rows={3}
            value={formData.returnedNotes}
            onChange={(e) => setFormData({ ...formData, returnedNotes: e.target.value })}
            placeholder="Araç durumu, hasarlar, eksikler vb..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={submitting}
        >
          {submitting ? 'İşleniyor...' : 'Zimmeti Kaldır'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnassignVehicleModal;
