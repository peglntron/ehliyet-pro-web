import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import type { EligibleStudent } from '../../types/drivingLesson';

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, studentIds: string[]) => Promise<void>;
  eligibleStudents: EligibleStudent[];
  loading?: boolean;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  open,
  onClose,
  onConfirm,
  eligibleStudents,
  loading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal açıldığında yarının tarihini varsayılan yap
  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      setSelectedStudents([]);
      setError('');
    }
  }, [open]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents.map(s => s.id));
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError('Lütfen tarih seçin');
      return;
    }

    if (selectedStudents.length === 0) {
      setError('Lütfen en az bir öğrenci seçin');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Tarihi local saat diliminde YYYY-MM-DD formatına çevir
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      await onConfirm(dateString, selectedStudents);
      onClose();
    } catch (err) {
      setError('Plan oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Plan Oluştur</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <DatePicker
              label="Tarih"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 3 }
                }
              }}
            />
          </LocalizationProvider>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : eligibleStudents.length === 0 ? (
            <Alert severity="warning">
              Planlanacak öğrenci bulunamadı
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Öğrenciler ({selectedStudents.length}/{eligibleStudents.length})
                </Typography>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedStudents.length === eligibleStudents.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </Button>
              </Box>

              <List sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {eligibleStudents.map((student) => (
                  <ListItem
                    key={student.id}
                    button
                    onClick={() => handleToggleStudent(student.id)}
                    dense
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={`${student.lessonsRemaining} ders kaldı`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

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
          disabled={submitting || loading || eligibleStudents.length === 0}
        >
          {submitting ? <CircularProgress size={24} /> : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlanModal;
