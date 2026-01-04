import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import type { MatchingResult } from '../types/types';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

interface InstructorStudentListModalProps {
  open: boolean;
  onClose: () => void;
  instructor: Instructor | null;
  matchingResults: MatchingResult[];
  students: Student[];
}

const InstructorStudentListModal: React.FC<InstructorStudentListModalProps> = ({
  open,
  onClose,
  instructor,
  matchingResults,
  students
}) => {
  if (!instructor) return null;

  // Bu eğitmene atanan öğrencileri bul
  const assignedStudents = matchingResults
    .filter(match => match.instructorId === instructor.id)
    .map(match => {
      const student = students.find(s => s.id === match.studentId);
      return { ...match, student };
    })
    .filter(item => item.student);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="div" fontWeight={600}>
              {instructor.firstName} {instructor.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atanan Öğrenciler ({assignedStudents.length})
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1 }}
            color="inherit"
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Eğitmen Bilgileri */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: instructor.gender === 'male' ? 'primary.main' : 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {instructor.firstName} {instructor.lastName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {instructor.phone}
                </Typography>
              </Box>
            </Box>
          </Box>

          {instructor.vehiclePlate && instructor.vehicleModel && (
            <Box display="flex" alignItems="center" gap={1}>
              <DirectionsCarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {instructor.vehiclePlate} - {instructor.vehicleModel}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Öğrenci Listesi */}
        {assignedStudents.length > 0 ? (
          <List>
            {assignedStudents.map((item) => (
              <ListItem key={item.studentId} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: item.studentGender === 'male' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {(item.student?.firstName || item.student?.name)?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.student?.firstName || item.student?.name} {item.student?.lastName || item.student?.surname}
                      </Typography>
                      <Chip
                        label={item.studentGender === 'male' ? 'Erkek' : 'Kadın'}
                        size="small"
                        color={item.studentGender === 'male' ? 'primary' : 'secondary'}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    `📞 ${item.student?.phone || 'Telefon belirtilmemiş'}`
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Bu eğitmene henüz öğrenci atanmamış
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ px: 3 }}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstructorStudentListModal;