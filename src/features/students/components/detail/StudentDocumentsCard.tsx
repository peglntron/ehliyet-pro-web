import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import type { Student, StudentDocument } from '../../types/types';
import { useStudentDocuments } from '../../api/useStudentDocuments';

interface StudentDocumentsCardProps {
  student: Student | null;
  onUpdate?: () => void;
}

const documentTypeLabels = {
  CRIMINAL_RECORD: 'Sabıka Kaydı',
  DIPLOMA: 'Diploma',
  HEALTH_REPORT: 'Sağlık Raporu',
  PHOTO: 'Fotoğraf',
  ID_CARD: 'Kimlik'
};

const allDocumentTypes = Object.keys(documentTypeLabels) as Array<keyof typeof documentTypeLabels>;

const StudentDocumentsCard: React.FC<StudentDocumentsCardProps> = ({ student, onUpdate }) => {
  const { loading, getDocuments, createDocument, updateDocument, deleteDocument } = useStudentDocuments();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // Evrakları yükle
  useEffect(() => {
    if (student?.id) {
      loadDocuments();
    }
  }, [student?.id]);

  const loadDocuments = async () => {
    if (!student?.id) return;
    setLoadingDocuments(true);
    try {
      const data = await getDocuments(student.id);
      setDocuments(data);
    } catch (error) {
      console.error('Evraklar yüklenirken hata:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleToggleDocument = async (type: keyof typeof documentTypeLabels, checked: boolean) => {
    if (!student?.id) return;

    const existingDoc = documents.find(doc => doc.type === type);

    try {
      if (checked) {
        // Checkbox işaretlendi - evrak oluştur veya güncelle
        if (existingDoc) {
          // Varsa durumunu SUBMITTED yap
          await updateDocument(existingDoc.id, { status: 'SUBMITTED' });
        } else {
          // Yoksa yeni oluştur
          await createDocument(student.id, {
            type: type as any,
            status: 'SUBMITTED'
          });
        }
      } else {
        // Checkbox kaldırıldı - evrakı sil veya PENDING yap
        if (existingDoc) {
          await deleteDocument(existingDoc.id);
        }
      }
      
      await loadDocuments();
      onUpdate?.();
    } catch (error) {
      console.error('Evrak güncellenirken hata:', error);
    }
  };

  const getDocumentStatus = (type: keyof typeof documentTypeLabels) => {
    return documents.find(doc => doc.type === type);
  };

  const isDocumentChecked = (type: keyof typeof documentTypeLabels) => {
    const doc = getDocumentStatus(type);
    return doc && (doc.status === 'SUBMITTED' || doc.status === 'APPROVED');
  };

  const getStatusIcon = (type: keyof typeof documentTypeLabels) => {
    const doc = getDocumentStatus(type);
    if (!doc) return null;

    switch (doc.status) {
      case 'APPROVED':
        return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} titleAccess="Onaylandı" />;
      case 'SUBMITTED':
        return <CloudUploadIcon fontSize="small" sx={{ color: 'info.main' }} titleAccess="Teslim Edildi" />;
      case 'REJECTED':
        return <CancelIcon fontSize="small" sx={{ color: 'error.main' }} titleAccess="Reddedildi" />;
      case 'PENDING':
        return <HourglassEmptyIcon fontSize="small" sx={{ color: 'warning.main' }} titleAccess="Bekleniyor" />;
      default:
        return null;
    }
  };

  const getCardStyle = (type: keyof typeof documentTypeLabels) => {
    const doc = getDocumentStatus(type);
    const isChecked = isDocumentChecked(type);

    if (!doc || !isChecked) {
      return {
        borderColor: 'divider',
        bgcolor: 'transparent'
      };
    }

    switch (doc.status) {
      case 'APPROVED':
        return {
          borderColor: 'success.light',
          bgcolor: 'success.lighter'
        };
      case 'SUBMITTED':
        return {
          borderColor: 'info.light',
          bgcolor: 'info.lighter'
        };
      case 'REJECTED':
        return {
          borderColor: 'error.light',
          bgcolor: 'error.lighter'
        };
      default:
        return {
          borderColor: 'warning.light',
          bgcolor: 'warning.lighter'
        };
    }
  };

  if (loadingDocuments) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6" fontWeight={600} color="primary.main">
          Evrak Durumu
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {allDocumentTypes.map((type) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={type}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDocumentChecked(type)}
                  onChange={(e) => handleToggleDocument(type, e.target.checked)}
                  disabled={loading}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    }
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {documentTypeLabels[type]}
                  </Typography>
                  {getStatusIcon(type)}
                </Box>
              }
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                width: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: isDocumentChecked(type) ? undefined : 'action.hover'
                },
                ...getCardStyle(type)
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default StudentDocumentsCard;
