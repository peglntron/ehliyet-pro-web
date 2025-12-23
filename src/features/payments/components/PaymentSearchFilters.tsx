import React from 'react';
import { Box, Paper, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { PaymentFilters } from '../types/types';

interface PaymentSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: PaymentFilters['status'];
  onStatusFilterChange: (status: PaymentFilters['status']) => void;
}

const PaymentSearchFilters: React.FC<PaymentSearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <TextField
          placeholder="Öğrenci adı, soyadı veya telefon ile ara..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ 
            maxWidth: { xs: '100%', sm: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label="Tümü" 
            color={statusFilter === 'all' ? 'primary' : 'default'}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => onStatusFilterChange('all')}
            sx={{ borderRadius: 2, fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip 
            label="Geciken" 
            color={statusFilter === 'overdue' ? 'primary' : 'default'}
            variant={statusFilter === 'overdue' ? 'filled' : 'outlined'}
            onClick={() => onStatusFilterChange('overdue')}
            sx={{ borderRadius: 2, cursor: 'pointer' }}
          />
          <Chip 
            label="Yaklaşan" 
            color={statusFilter === 'upcoming' ? 'primary' : 'default'}
            variant={statusFilter === 'upcoming' ? 'filled' : 'outlined'}
            onClick={() => onStatusFilterChange('upcoming')}
            sx={{ borderRadius: 2, cursor: 'pointer' }}
          />
          <Chip 
            label="Kısmi" 
            color={statusFilter === 'partial' ? 'primary' : 'default'}
            variant={statusFilter === 'partial' ? 'filled' : 'outlined'}
            onClick={() => onStatusFilterChange('partial')}
            sx={{ borderRadius: 2, cursor: 'pointer' }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default PaymentSearchFilters;
