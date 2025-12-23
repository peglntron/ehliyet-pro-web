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
  Alert
} from '@mui/material';
import type { DrivingLesson } from '../../types/drivingLesson';

interface EditTimeModalProps {
  open: boolean;
  lesson: DrivingLesson | null;
  onClose: () => void;
  onConfirm: (lessonId: string, time: string) => Promise<void>;
}

const EditTimeModal: React.FC<EditTimeModalProps> = ({
  open,
  lesson,
  onClose,
  onConfirm
}) => {
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && lesson) {
      setTime(lesson.scheduledTime || '');
      setError('');
    }
  }, [open, lesson]);

  const handleSubmit = async () => {
    if (!time) {
      setError('Lütfen saat girin');
      return;
    }

    if (!lesson) return;

    setSubmitting(true);
    setError('');

    try {
      await onConfirm(lesson.id, time);
      onClose();
    } catch (err) {
      setError('Saat güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Ders Saati Düzenle</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{lesson.student.firstName} {lesson.student.lastName}</strong>
            <br />
            Ders {lesson.lessonNumber} / {lesson.student.totalLessonsEntitled}
          </Typography>

          <TextField
            fullWidth
            type="time"
            label="Saat"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            autoFocus
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTimeModal;
