import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MatchingService } from '../features/matching/api/matchingService';
import PageBreadcrumb from '../components/PageBreadcrumb';

const MatchingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [matchings, setMatchings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchings();
  }, []);

  const loadMatchings = async () => {
    try {
      const data = await MatchingService.getMatchingHistory();
      setMatchings(data);
    } catch (error) {
      console.error('Error loading matchings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'Uygulandı';
      case 'PENDING':
        return 'Beklemede';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageBreadcrumb />
      
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mt: 2, mb: 3 }}>
        Eşleştirme Geçmişi
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Ehliyet Sınıfı</TableCell>
              <TableCell align="center">Toplam Öğrenci</TableCell>
              <TableCell align="center">Eşleştirilen</TableCell>
              <TableCell align="center">Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matchings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    Henüz eşleştirme kaydı bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              matchings.map((matching) => (
                <TableRow key={matching.id}>
                  <TableCell>
                    {new Date(matching.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      if (matching.licenseTypes && Array.isArray(matching.licenseTypes) && matching.licenseTypes.length > 0) {
                        return matching.licenseTypes.join(', ');
                      }
                      if (matching.licenseType) {
                        return matching.licenseType;
                      }
                      return 'Belirtilmemiş';
                    })()}
                  </TableCell>
                  <TableCell align="center">{matching.totalStudents}</TableCell>
                  <TableCell align="center">{matching.matchedCount}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(matching.status)}
                      color={getStatusColor(matching.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/matching/saved/${matching.id}`)}
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MatchingHistory;
