import React from 'react';
import { Paper, Typography, Box, Button, Grid, IconButton, Alert } from '@mui/material';
import { AccountBalance as AccountBalanceIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Iban {
  id: string;
  iban: string;
  bankName: string;
  accountHolder: string;
  description: string;
}

interface CompanyIbansCardProps {
  ibans?: Iban[];
  onAdd: () => void;
  onEdit: (iban: Iban) => void;
  onDelete: (id: string) => void;
}

const CompanyIbansCard: React.FC<CompanyIbansCardProps> = ({ ibans, onAdd, onEdit, onDelete }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: 3
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            IBAN Bilgileri
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ borderRadius: 2 }}
        >
          Ekle
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {ibans && ibans.length > 0 ? (
          <Grid container spacing={2}>
            {ibans.map((iban) => (
              <Grid item xs={12} key={iban.id}>
                <Box
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
                      {iban.bankName}
                    </Typography>
                    <Box 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'white', 
                        p: 1.5, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1
                      }}
                    >
                      <Typography variant="body1" fontWeight={500}>
                        {iban.iban.replace(/(.{2})(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{2})/, '$1$2 $3 $4 $5 $6 $7 $8')}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Hesap Sahibi
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {iban.accountHolder}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Açıklama
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {iban.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(iban)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(iban.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Henüz IBAN bilgisi eklenmemiş.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default CompanyIbansCard;
