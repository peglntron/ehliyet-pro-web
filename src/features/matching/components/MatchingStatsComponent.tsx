import React, { useState } from 'react';
import {
  Paper, Typography, Box, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { MatchingStats } from '../types/types';
import type { MatchingResult } from '../types/types';
import type { Student } from '../../students/types/types';
import type { Instructor } from '../../instructors/types/types';
import InstructorStudentListModal from './InstructorStudentListModal';

interface MatchingStatsComponentProps {
  stats: MatchingStats;
  matchingResults: MatchingResult[];
  students: Student[];
  instructors: Instructor[];
}

const MatchingStatsComponent: React.FC<MatchingStatsComponentProps> = ({ 
  stats, 
  matchingResults, 
  students, 
  instructors
}) => {
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const successRate = Math.round((stats.matchedStudents / stats.totalStudents) * 100);
  
  const handleViewStudents = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
      setSelectedInstructor(instructor);
      setModalOpen(true);
    }
  };
  
  return (
    <Box mb={3}>
      {/* Ana İstatistikler */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Eşleştirme İstatistikleri
        </Typography>
        
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200',
              minWidth: 200,
              flex: 1
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1 }}>
                <PeopleIcon fontSize="small" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {stats.totalStudents}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Toplam Öğrenci
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: 'success.200',
              minWidth: 200,
              flex: 1
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, mr: 1 }}>
                <CheckCircleIcon fontSize="small" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.matchedStudents}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Eşleştirilen
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'error.50',
              border: '1px solid',
              borderColor: 'error.200',
              minWidth: 200,
              flex: 1
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32, mr: 1 }}>
                <ErrorIcon fontSize="small" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {stats.unmatchedStudents}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Eşleştirilemedi
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'info.50',
              border: '1px solid',
              borderColor: 'info.200',
              minWidth: 200,
              flex: 1
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32, mr: 1 }}>
                <TrendingUpIcon fontSize="small" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="info.main">
                %{successRate}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Başarı Oranı
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Eğitmen Kullanım Durumu */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
          Eğitmen Kullanım Durumu
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Eğitmen</strong></TableCell>
                <TableCell><strong>Cinsiyet</strong></TableCell>
                <TableCell><strong>Mevcut</strong></TableCell>
                <TableCell><strong>Yeni Atama</strong></TableCell>
                <TableCell><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.instructorUtilization.map((instructor) => (
                <TableRow key={instructor.instructorId}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1,
                          bgcolor: instructor.gender === 'male' ? 'primary.main' : 'secondary.main',
                          fontSize: '0.7rem'
                        }}
                      >
                        {instructor.instructorName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      {instructor.instructorName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={instructor.gender === 'male' ? 'Erkek' : 'Kadın'}
                      size="small"
                      color={instructor.gender === 'male' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{instructor.currentStudents}</TableCell>
                  <TableCell>
                    {instructor.newAssignments > 0 ? (
                      <Chip
                        label={`+${instructor.newAssignments}`}
                        size="small"
                        color="success"
                        variant="filled"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewStudents(instructor.instructorId)}
                      disabled={instructor.newAssignments === 0}
                    >
                      Öğrencileri Gör
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Eğitmen Öğrenci Listesi Modal */}
      <InstructorStudentListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        instructor={selectedInstructor}
        matchingResults={matchingResults}
        students={students}
      />
    </Box>
  );
};

export default MatchingStatsComponent;