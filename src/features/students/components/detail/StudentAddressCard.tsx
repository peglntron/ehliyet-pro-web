import React from 'react';
import {
  Box, Typography, Paper, Grid, Button
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import type { Student } from '../../types/types';

interface StudentAddressCardProps {
  student: Student | null;
  onEdit?: () => void;
}

const StudentAddressCard: React.FC<StudentAddressCardProps> = ({ student, onEdit }) => {
  const hasAddressInfo = student?.province || student?.district || student?.address;

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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Adres Bilgileri
          </Typography>
        </Box>
        {onEdit && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onEdit}
            size="small"
          >
            Düzenle
          </Button>
        )}
      </Box>
      
      {!hasAddressInfo ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
          Adres bilgisi bulunmamaktadır.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {student?.province && (
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default'
                }}
              >
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  İl
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {student.province}
                </Typography>
              </Box>
            </Grid>
          )}

          {student?.district && (
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default'
                }}
              >
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  İlçe
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {student.district}
                </Typography>
              </Box>
            </Grid>
          )}

          {student?.address && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'start',
                  gap: 2
                }}
              >
                <HomeIcon color="action" sx={{ mt: 0.5 }} />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Açık Adres
                  </Typography>
                  <Typography variant="body1">
                    {student.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Paper>
  );
};

export default StudentAddressCard;
