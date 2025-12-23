import React from 'react';
import { Paper, Typography, Box, Button, Grid, IconButton, Alert } from '@mui/material';
import { Phone as PhoneIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Phone {
  id: string;
  number: string;
  description: string;
}

interface CompanyPhonesCardProps {
  phones?: Phone[];
  onAdd: () => void;
  onEdit: (phone: Phone) => void;
  onDelete: (id: string) => void;
}

const CompanyPhonesCard: React.FC<CompanyPhonesCardProps> = ({ phones, onAdd, onEdit, onDelete }) => {
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
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PhoneIcon color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            Telefon Numaraları
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
        {phones && phones.length > 0 ? (
          <Grid container spacing={2}>
            {phones.map((phone) => (
              <Grid item xs={12} key={phone.id}>
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
                    <Box 
                      sx={{ 
                        fontFamily: 'monospace', 
                        bgcolor: 'white', 
                        p: 1.5, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1.5,
                        display: 'inline-block'
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {phone.number}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Açıklama
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {phone.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(phone)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(phone.id)}
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
            Henüz telefon numarası eklenmemiş.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default CompanyPhonesCard;
