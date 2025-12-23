import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tab, Tabs, FormControlLabel, Checkbox,
  Button, Chip, Alert, Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';

interface StudentSelectionTabProps {
  students: Student[];
  selectedStudentIds: Set<string>;
  onStudentToggle: (studentId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  licenseTypes: string[]; // Çoklu ehliyet türü
}

interface InstructorSelectionTabProps {
  instructors: Instructor[];
  selectedInstructorIds: Set<string>;
  onInstructorToggle: (instructorId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  licenseTypes: string[]; // Çoklu ehliyet türü
}

interface SelectionTabsProps {
  students: Student[];
  instructors: Instructor[];
  selectedStudentIds: Set<string>;
  selectedInstructorIds: Set<string>;
  onStudentToggle: (studentId: string) => void;
  onInstructorToggle: (instructorId: string) => void;
  onSelectAllStudents: () => void;
  onDeselectAllStudents: () => void;
  onSelectAllInstructors: () => void;
  onDeselectAllInstructors: () => void;
  licenseTypes: string[]; // Çoklu ehliyet türü
}

const StudentSelectionTab: React.FC<StudentSelectionTabProps> = ({
  students,
  selectedStudentIds,
  onStudentToggle,
  onSelectAll,
  onDeselectAll,
  licenseTypes
}) => {
  // Seçilen ehliyet sınıfları için yazılı sınavı geçmiş öğrencileri göster
  const eligibleStudents = students.filter(student => {
    // Backend'den flat field olarak gelir (writtenExamStatus) veya nested object olabilir (writtenExam.status)
    const writtenStatus = (student.writtenExamStatus || student.writtenExam?.status)?.toLowerCase();
    const drivingStatus = (student.drivingExamStatus || student.drivingExam?.status)?.toLowerCase();
    const studentStatus = student.status?.toLowerCase();
    
    // Aktif eğitmen ataması varsa bu öğrenci uygun değil
    const hasActiveInstructor = student.instructorAssignments && 
                                 student.instructorAssignments.length > 0 && 
                                 student.instructorAssignments.some(a => a.isActive);
    
    return (
      licenseTypes.includes(student.licenseType) && // Çoklu ehliyet türü desteği
      writtenStatus === 'passed' &&
      drivingStatus !== 'passed' &&
      studentStatus === 'active' &&
      !hasActiveInstructor // Aktif eğitmeni olmayanlar
    );
  });

  console.log('SelectionTabs DEBUG:', {
    totalStudents: students.length,
    licenseTypes,
    eligibleStudents: eligibleStudents.length,
    filteredOutDueToInstructor: students.filter(s => 
      licenseTypes.includes(s.licenseType) && 
      s.instructorAssignments && 
      s.instructorAssignments.some(a => a.isActive)
    ).length,
    studentsPreview: students.slice(0, 2).map(s => ({
      id: s.id,
      name: s.firstName || s.name,
      lastName: s.lastName || s.surname,
      licenseType: s.licenseType,
      writtenExamStatus: s.writtenExamStatus || s.writtenExam?.status,
      drivingExamStatus: s.drivingExamStatus || s.drivingExam?.status,
      status: s.status,
      hasActiveInstructor: s.instructorAssignments?.some(a => a.isActive)
    }))
  });

  return (
    <Box>
      {/* Üst Kontroller */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Uygun Öğrenciler ({eligibleStudents.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckIcon />}
            onClick={onSelectAll}
          >
            Tümünü Seç
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={onDeselectAll}
          >
            Tümünü Kaldır
          </Button>
        </Box>
      </Box>

      {/* Seçili Öğrenci Sayısı */}
      <Alert severity="info" sx={{ mb: 2 }}>
        {selectedStudentIds.size} öğrenci seçildi ({licenseTypes.join(', ')} sınıfları, yazılı sınav geçmiş)
      </Alert>

      {/* Öğrenci Listesi */}
      <Box>
        {eligibleStudents.map(student => (
          <Paper
            key={student.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              border: '1px solid',
              borderColor: selectedStudentIds.has(student.id) ? 'primary.main' : 'divider',
              backgroundColor: selectedStudentIds.has(student.id) ? 'primary.50' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: selectedStudentIds.has(student.id) ? 'primary.100' : 'grey.50'
              }
            }}
            onClick={() => onStudentToggle(student.id)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2">
                  {student.firstName || student.name} {student.lastName || student.surname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.phone} • {student.licenseType} Sınıfı
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={`Y: ${student.writtenExamAttempts ?? student.writtenExam?.attempts ?? 0}/4`}
                    size="small"
                    color={(student.writtenExamStatus || student.writtenExam?.status)?.toLowerCase() === 'passed' ? 'success' : 'default'}
                    variant="filled"
                  />
                  <Chip
                    label={`D: ${student.drivingExamAttempts ?? student.drivingExam?.attempts ?? 0}/4`}
                    size="small"
                    color={student.drivingExam?.status?.toLowerCase() === 'passed' ? 'success' : 
                           student.drivingExam?.status?.toLowerCase() === 'failed' ? 'error' : 'default'}
                    variant="filled"
                  />
                  <Chip
                    label={student.gender?.toLowerCase() === 'male' ? 'Erkek' : 'Kadın'}
                    size="small"
                    color={student.gender?.toLowerCase() === 'male' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStudentIds.has(student.id)}
                    onChange={() => onStudentToggle(student.id)}
                  />
                }
                label=""
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const InstructorSelectionTab: React.FC<InstructorSelectionTabProps> = ({
  instructors,
  selectedInstructorIds,
  onInstructorToggle,
  onSelectAll,
  onDeselectAll,
  licenseTypes
}) => {
  // Seçilen ehliyet sınıflarından en az birine sahip aktif eğitmenleri göster
  const eligibleInstructors = instructors.filter(instructor => {
    const instructorStatus = instructor.status?.toLowerCase();
    return (
      instructorStatus === 'active' &&
      instructor.licenseTypes?.some(lt => licenseTypes.includes(lt)) // Çoklu ehliyet türü desteği
    );
  });

  return (
    <Box>
      {/* Üst Kontroller */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Uygun Eğitmenler ({eligibleInstructors.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckIcon />}
            onClick={onSelectAll}
          >
            Tümünü Seç
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={onDeselectAll}
          >
            Tümünü Kaldır
          </Button>
        </Box>
      </Box>

      {/* Seçili Eğitmen Sayısı */}
      <Alert severity="info" sx={{ mb: 2 }}>
        {selectedInstructorIds.size} eğitmen seçildi ({licenseTypes.join(', ')} sınıfları, aktif)
      </Alert>

      {/* Eğitmen Listesi */}
      <Box>
        {eligibleInstructors.map(instructor => (
          <Paper
            key={instructor.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              border: '1px solid',
              borderColor: selectedInstructorIds.has(instructor.id) ? 'primary.main' : 'divider',
              backgroundColor: selectedInstructorIds.has(instructor.id) ? 'primary.50' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: selectedInstructorIds.has(instructor.id) ? 'primary.100' : 'grey.50'
              }
            }}
            onClick={() => onInstructorToggle(instructor.id)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2">
                  {instructor.firstName} {instructor.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {instructor.phone}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={instructor.licenseTypes?.join(', ') || 'Belirtilmemiş'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={instructor.gender?.toLowerCase() === 'male' ? 'Erkek' : 'Kadın'}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  {instructor.vehicleId && (
                    <Chip
                      label={`Araç Atanmış`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedInstructorIds.has(instructor.id)}
                    onChange={() => onInstructorToggle(instructor.id)}
                  />
                }
                label=""
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const SelectionTabs: React.FC<SelectionTabsProps> = ({
  students,
  instructors,
  selectedStudentIds,
  selectedInstructorIds,
  onStudentToggle,
  onInstructorToggle,
  onSelectAllStudents,
  onDeselectAllStudents,
  onSelectAllInstructors,
  onDeselectAllInstructors,
  licenseTypes
}) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon />
                Öğrenci Seçimi ({selectedStudentIds.size})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon />
                Eğitmen Seçimi ({selectedInstructorIds.size})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <StudentSelectionTab
            students={students}
            selectedStudentIds={selectedStudentIds}
            onStudentToggle={onStudentToggle}
            onSelectAll={onSelectAllStudents}
            onDeselectAll={onDeselectAllStudents}
            licenseTypes={licenseTypes}
          />
        )}
        {activeTab === 1 && (
          <InstructorSelectionTab
            instructors={instructors}
            selectedInstructorIds={selectedInstructorIds}
            onInstructorToggle={onInstructorToggle}
            onSelectAll={onSelectAllInstructors}
            onDeselectAll={onDeselectAllInstructors}
            licenseTypes={licenseTypes}
          />
        )}
      </Box>
    </Paper>
  );
};

export default SelectionTabs;