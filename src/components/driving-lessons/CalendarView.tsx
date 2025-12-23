import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { DrivingLesson } from '../../types/drivingLesson';

interface CalendarViewProps {
  lessons: DrivingLesson[];
  selectedDate: string;
  onEditTime: (lesson: DrivingLesson) => void;
  onMarkDone: (lessonId: string) => void;
  onCancel: (lessonId: string) => void;
  canManage: boolean;
  selectedInstructorId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  lessons,
  selectedDate,
  onEditTime,
  onMarkDone,
  onCancel,
  canManage,
  selectedInstructorId
}) => {

  // Saat aralıkları (08:00 - 20:00, yarım saat aralıklarla)
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Seçili eğitmenin derslerini filtrele
  const filteredLessons = lessons.filter(lesson => lesson.instructorId === selectedInstructorId);
  
  // Eğitmen bilgisini lessons'tan al
  const selectedInstructorData = filteredLessons[0]?.instructor;

  // Saat aralığına göre ders bul
  const getLessonAtTime = (time: string) => {
    return filteredLessons.find(lesson => lesson.scheduledTime === time);
  };

  const getStatusColor = (status: DrivingLesson['status']) => {
    switch (status) {
      case 'PLANNED': return { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' };
      case 'SCHEDULED': return { bg: '#e3f2fd', text: '#0d47a1', border: '#64b5f6' };
      case 'INSTRUCTOR_DONE': return { bg: '#fff3e0', text: '#e65100', border: '#ffb74d' };
      case 'COMPLETED': return { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784' };
      case 'CANCELLED': return { bg: '#ffebee', text: '#c62828', border: '#e57373' };
      default: return { bg: '#f5f5f5', text: '#616161', border: '#bdbdbd' };
    }
  };

  const getStatusLabel = (status: DrivingLesson['status']) => {
    const labels = {
      PLANNED: 'Planlanacak',
      SCHEDULED: 'Planlandı',
      INSTRUCTOR_DONE: 'Eğitmen Tamamladı',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal',
      NO_SHOW: 'Gelmedi'
    };
    return labels[status];
  };

  return (
    <Box>
      {/* Takvim Başlığı */}
      {selectedInstructorData && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PersonIcon />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedInstructorData.firstName} {selectedInstructorData.lastName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={`${filteredLessons.length} Ders`} 
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
              />
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Takvim - Dikey Saat Görünümü */}
      <Paper>
        <Box>
          {timeSlots.map((time, index) => {
            const lesson = getLessonAtTime(time);
            const isHalfHour = time.endsWith(':30');

            return (
              <Box key={time}>
                {!isHalfHour && index > 0 && <Divider />}
                
                <Box
                  sx={{
                    display: 'flex',
                    minHeight: isHalfHour ? 60 : 80,
                    borderLeft: isHalfHour ? '2px dashed #e0e0e0' : 'none',
                    ml: isHalfHour ? 2 : 0,
                    '&:hover': { bgcolor: '#fafafa' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* Saat Kolonu */}
                  <Box
                    sx={{
                      width: 100,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isHalfHour ? 'transparent' : '#f5f5f5',
                      borderRight: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography 
                        variant={isHalfHour ? "body2" : "h6"} 
                        fontWeight={isHalfHour ? 400 : 600}
                        color={isHalfHour ? 'text.secondary' : 'text.primary'}
                      >
                        {time}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Ders Kartı */}
                  <Box sx={{ flex: 1, p: 2 }}>
                    {lesson ? (
                      <Card
                        sx={{
                          cursor: canManage ? 'pointer' : 'default',
                          bgcolor: getStatusColor(lesson.status).bg,
                          border: 2,
                          borderColor: getStatusColor(lesson.status).border,
                          '&:hover': canManage ? {
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                          } : {},
                          height: '100%'
                        }}
                        onClick={() => canManage && onEditTime(lesson)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack spacing={1}>
                            {/* Öğrenci Bilgisi */}
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              color={getStatusColor(lesson.status).text}
                            >
                              {lesson.student.firstName} {lesson.student.lastName}
                            </Typography>

                            {/* Ders Bilgisi */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`Ders ${lesson.lessonNumber}/${lesson.student.totalLessonsEntitled}`}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                              <Chip 
                                label={`${lesson.student.lessonsRemaining} ders kaldı`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip 
                                label={getStatusLabel(lesson.status)}
                                size="small"
                                sx={{ 
                                  bgcolor: getStatusColor(lesson.status).bg,
                                  color: getStatusColor(lesson.status).text,
                                  borderColor: getStatusColor(lesson.status).border,
                                  border: 1
                                }}
                              />
                            </Box>

                            {/* Aksiyonlar */}
                            {canManage && lesson.status === 'SCHEDULED' && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Tooltip title="Tamamlandı">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      bgcolor: '#4caf50',
                                      color: 'white',
                                      '&:hover': { bgcolor: '#45a049' }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMarkDone(lesson.id);
                                    }}
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="İptal">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      bgcolor: '#f44336',
                                      color: 'white',
                                      '&:hover': { bgcolor: '#da190b' }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCancel(lesson.id);
                                    }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ) : (
                      <Box 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'text.disabled',
                          fontSize: '0.875rem'
                        }}
                      >
                        Boş
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default CalendarView;
