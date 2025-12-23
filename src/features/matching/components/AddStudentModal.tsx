import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemText,
  ListItemButton,
  Avatar,
  Box,
  Typography,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { Student } from '../../students/types/types';

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
  onAddStudent: (studentId: string, instructorId: string) => void;
  availableStudents: Student[];
  instructorId: string;
  instructorName: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  open,
  onClose,
  onAddStudent,
  availableStudents,
  instructorId,
  instructorName
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const handleAddStudent = () => {
    if (selectedStudentId && instructorId) {
      onAddStudent(selectedStudentId, instructorId);
      setSelectedStudentId('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStudentId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Öğrenci Ekle</Typography>
            <Typography variant="body2" color="text.secondary">
              {instructorName}'e öğrenci atayın
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ minHeight: 300, p: 0 }}>
        {availableStudents.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              Şu anda eşleştirmede bulunmayan aktif öğrenci bulunmamaktadır.
            </Alert>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>
                Mevcut Öğrenciler ({availableStudents.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Eşleştirmede bulunmayan aktif öğrenciler
              </Typography>
            </Box>
            
            <List sx={{ p: 0 }}>
              {availableStudents.map((student, index) => (
                <React.Fragment key={student.id}>
                  <ListItemButton
                    selected={selectedStudentId === student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    sx={{
                      py: 2,
                      px: 3,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <Avatar sx={{ 
                      mr: 2, 
                      bgcolor: selectedStudentId === student.id ? 'primary.main' : 'secondary.main',
                      width: 40,
                      height: 40
                    }}>
                      <PersonIcon />
                    </Avatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body1" fontWeight={500}>
                            {student.name} {student.surname}
                          </Typography>
                          <Chip 
                            label={student.gender === 'male' ? 'Erkek' : 'Kadın'} 
                            size="small" 
                            color="default"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Telefon: {student.phone || 'Belirtilmemiş'}
                          </Typography>
                          {student.email && (
                            <Typography variant="body2" color="text.secondary">
                              E-posta: {student.email}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {index < availableStudents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleAddStudent}
          variant="contained"
          disabled={!selectedStudentId || availableStudents.length === 0}
          sx={{ minWidth: 120 }}
        >
          Öğrenci Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentModal;