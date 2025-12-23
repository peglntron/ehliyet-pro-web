import React from 'react';
import {
  Paper, Typography, Box, Button, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, Accordion, AccordionSummary, AccordionDetails, CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  DirectionsCar as DirectionsCarIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import type { MatchingResult, MatchingError } from '../types/types';
import { getExamStatusDisplay } from '../../students/utils/examUtils';

interface MatchingResultsProps {
  matches: MatchingResult[];
  errors: MatchingError[];
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  onOpenSwapModal?: () => void;
  showActions?: boolean; // Kaydet/Reset butonlarını göster/gizle
}

const MatchingResults: React.FC<MatchingResultsProps> = ({
  matches,
  errors,
  onSave,
  onReset,
  saving,
  onOpenSwapModal,
  showActions = true
}) => {
  return (
    <Box>
      {/* Başarılı Eşleştirmeler */}
      {matches.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" fontWeight={600} color="success.main">
              <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Başarılı Eşleştirmeler ({matches.length})
            </Typography>
            
            {showActions && (
              <Box display="flex" gap={2}>
                <Button
                  variant="text"
                  onClick={onOpenSwapModal}
                  startIcon={<SwapHorizIcon />}
                  disabled={saving}
                  color="info"
                >
                  Öğrenci Değiş Tokuş
                </Button>
                <Button
                  variant="outlined"
                  onClick={onReset}
                  startIcon={<RefreshIcon />}
                  disabled={saving}
                >
                  Yeniden Eşleştir
                </Button>
                <Button
                  variant="contained"
                  onClick={onSave}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving || matches.length === 0}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet & Onayla'}
                </Button>
              </Box>
            )}
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Öğrenci</strong></TableCell>
                  <TableCell><strong>Eğitmen</strong></TableCell>
                  <TableCell><strong>Öğrenci Cinsiyeti</strong></TableCell>
                  <TableCell><strong>Sınav Durumu</strong></TableCell>
                  <TableCell><strong>Ehliyet</strong></TableCell>
                  <TableCell><strong>Araç</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match, index) => (
                  <TableRow key={`${match.studentId}-${index}`}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1,
                            bgcolor: match.studentGender === 'male' ? 'primary.main' : 'secondary.main',
                            fontSize: '0.7rem'
                          }}
                        >
                          {match.studentName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        {match.studentName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            mr: 1,
                            bgcolor: match.instructorGender === 'male' ? 'primary.main' : 'secondary.main',
                            fontSize: '0.7rem'
                          }}
                        >
                          {match.instructorName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        {match.instructorName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={match.studentGender === 'male' ? 'Erkek' : 'Kadın'}
                        size="small"
                        color={match.studentGender === 'male' ? 'primary' : 'secondary'}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        {/* Yazılı Sınav Durumu */}
                        <Chip
                          label={`Y: ${match.writtenExamAttempts || 0}/${match.writtenExamMaxAttempts || 4}`}
                          size="small"
                          color={match.writtenExamStatus === 'passed' ? 'success' : 
                                 match.writtenExamStatus === 'failed' ? 'error' : 'default'}
                          variant="filled"
                          sx={{ minWidth: 60, borderRadius: 2 }}
                        />
                        {/* Direksiyon Sınav Durumu */}
                        <Chip
                          label={`D: ${match.drivingExamAttempts || 0}/${match.drivingExamMaxAttempts || 4}`}
                          size="small"
                          color={match.drivingExamStatus === 'passed' ? 'success' : 
                                 match.drivingExamStatus === 'failed' ? 'error' : 'default'}
                          variant="filled"
                          sx={{ minWidth: 60, borderRadius: 2 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={match.licenseType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {match.vehiclePlate && match.vehicleModel ? (
                        <Box display="flex" alignItems="center">
                          <DirectionsCarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {match.vehiclePlate} - {match.vehicleModel}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Belirtilmemiş
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Eşleştirilemeyenler */}
      {errors.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={600} color="error.main">
                <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Eşleştirilemeyen Öğrenciler ({errors.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {errors.map((error, index) => (
                  <Box key={`${error.studentId}-${index}`} mb={2}>
                    <Alert 
                      severity="warning" 
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {error.studentName}
                      </Typography>
                      <Typography variant="body2">
                        {error.details}
                      </Typography>
                    </Alert>
                    {index < errors.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}
    </Box>
  );
};

export default MatchingResults;