import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  type SelectChangeEvent
} from '@mui/material';
import { SwapHoriz, Person, School } from '@mui/icons-material';
import type { MatchingResult } from '../types/types';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

interface StudentSwapModalProps {
  open: boolean;
  onClose: () => void;
  matchingResults: MatchingResult[];
  students: Student[];
  instructors: Instructor[];
  selectedStudentId?: string; // Seçili öğrenci ID'si
  selectedInstructorId?: string; // Seçili öğrencinin mevcut eğitmen ID'si
  onSwap: (sourceInstructorId: string, targetInstructorId: string, studentId: string) => void;
  matchingLicenseTypes?: string[]; // Eşleştirmenin licenseTypes array'i
}

const StudentSwapModal: React.FC<StudentSwapModalProps> = ({
  open,
  onClose,
  matchingResults,
  students,
  instructors,
  selectedStudentId,
  selectedInstructorId,
  onSwap,
  matchingLicenseTypes
}) => {
  const [targetInstructorId, setTargetInstructorId] = useState<string>('');

  // Seçili öğrenci bilgilerini al
  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;
  const sourceInstructor = selectedInstructorId ? instructors.find(i => i.id === selectedInstructorId) : null;

  // Eğitmen gruplama - her eğitmen için öğrenci sayısını hesapla
  const getInstructorsWithCounts = () => {
    const instructorMap = new Map<string, number>();
    matchingResults.forEach(result => {
      const count = instructorMap.get(result.instructorId) || 0;
      instructorMap.set(result.instructorId, count + 1);
    });

    // Öğrencinin license type'ına uygun eğitmenleri filtrele
    const studentLicenseType = selectedStudent?.licenseType;
    
    return instructors
      .filter(instructor => {
        // Mevcut eğitmen hariç
        if (instructor.id === selectedInstructorId) return false;
        
        // License type kontrolü: Öğrencinin license type'ı eğitmenin licenseTypes array'inde olmalı
        if (studentLicenseType && instructor.licenseTypes) {
          return instructor.licenseTypes.includes(studentLicenseType);
        }
        
        return true; // licenseType bilgisi yoksa göster
      })
      .map(instructor => {
        const assignedCount = instructorMap.get(instructor.id) || 0;
        const maxStudents = instructor.maxStudentsPerPeriod || 10;
        const isFull = assignedCount >= maxStudents;
        
        return {
          ...instructor,
          assignedCount,
          maxStudents,
          isFull
        };
      });
  };

  const handleTargetInstructorChange = (event: SelectChangeEvent<string>) => {
    setTargetInstructorId(event.target.value);
  };

  const handleSwap = () => {
    if (selectedInstructorId && targetInstructorId && selectedStudentId && targetInstructorId !== selectedInstructorId) {
      onSwap(selectedInstructorId, targetInstructorId, selectedStudentId);
      setTargetInstructorId('');
      onClose();
    }
  };

  const handleClose = () => {
    setTargetInstructorId('');
    onClose();
  };

  const isSwapValid = targetInstructorId && selectedInstructorId && selectedStudentId &&
                      selectedInstructorId !== targetInstructorId;

  const instructorsWithCounts = getInstructorsWithCounts();
  const targetInstructor = instructorsWithCounts.find(i => i.id === targetInstructorId);
  const targetInstructorCount = targetInstructor?.assignedCount || 0;
  const sourceInstructorCount = instructorsWithCounts.find(i => i.id === selectedInstructorId)?.assignedCount || 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SwapHoriz color="primary" />
          <Typography variant="h6">Öğrenci Değiştir</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Değiştirilecek Öğrenci:
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Person color="primary" />
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {selectedStudent ? `${selectedStudent.name} ${selectedStudent.surname}` : 'Seçili öğrenci bulunamadı'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ehliyet: {selectedStudent?.licenseType || 'Belirtilmemiş'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mevcut Eğitmen: {sourceInstructor ? `${sourceInstructor.firstName} ${sourceInstructor.lastName}` : 'Bilinmiyor'}
                {sourceInstructor && ` (${sourceInstructorCount} öğrenci)`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Hedef Eğitmen Seçiniz</InputLabel>
          <Select
            value={targetInstructorId}
            onChange={handleTargetInstructorChange}
            label="Hedef Eğitmen Seçiniz"
          >
            {instructorsWithCounts.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent?.licenseType} sınıfı için uygun eğitmen bulunamadı
                </Typography>
              </MenuItem>
            ) : (
              instructorsWithCounts.map(instructor => (
                <MenuItem 
                  key={instructor.id} 
                  value={instructor.id}
                  disabled={instructor.isFull}
                >
                  <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
                    <School fontSize="small" color={instructor.isFull ? 'disabled' : 'primary'} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {instructor.firstName} {instructor.lastName}
                        {instructor.isFull && ' (Dolu)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {instructor.assignedCount}/{instructor.maxStudents} öğrenci • Yetki: {instructor.licenseTypes?.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {targetInstructor && targetInstructor.isFull && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Uyarı:</strong> {targetInstructor.firstName} {targetInstructor.lastName} eğitmeni maksimum öğrenci sayısına ({targetInstructor.maxStudents}) ulaştı. Bu eğitmen seçilemez.
            </Typography>
          </Alert>
        )}
        
        {isSwapValid && targetInstructor && !targetInstructor.isFull && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Değişim Özeti:</strong><br/>
              • {sourceInstructor?.firstName} {sourceInstructor?.lastName} ({sourceInstructorCount} → {sourceInstructorCount - 1} öğrenci)<br/>
              • {targetInstructor.firstName} {targetInstructor.lastName} ({targetInstructorCount} → {targetInstructorCount + 1}/{targetInstructor.maxStudents} öğrenci)
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          İptal
        </Button>
        <Button 
          onClick={handleSwap} 
          variant="contained" 
          disabled={!isSwapValid}
          startIcon={<SwapHoriz />}
        >
          Değiştir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentSwapModal;